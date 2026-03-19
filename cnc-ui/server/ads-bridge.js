import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { Client } from 'ads-client';

const HTTP_PORT = Number(process.env.ADS_BRIDGE_PORT ?? 3001);
const POLL_MS = Number(process.env.ADS_POLL_MS ?? 200);
const TARGET_AMS_NET_ID = process.env.ADS_AMS_NET_ID ?? '192.168.36.1.1.1';
const TARGET_IP = process.env.ADS_TARGET_IP;
const TARGET_ADS_PORT = Number(process.env.ADS_PORT ?? 851);
const SYMBOL_HMI_IN = process.env.ADS_SYMBOL_HMI_IN ?? 'GVL.stHMI_In';
const SYMBOL_HMI_OUT = process.env.ADS_SYMBOL_HMI_OUT ?? 'GVL.stHMI_Out';

const app = express();
app.use(express.json());

const clientSettings = {
  targetAmsNetId: TARGET_AMS_NET_ID,
  targetAdsPort: TARGET_ADS_PORT,
};

if (TARGET_IP) {
  clientSettings.routerAddress = TARGET_IP;
}

const client = new Client(clientSettings);

let snapshot = {
  connected: false,
  lastUpdated: null,
  error: null,
  hmiIn: {},
  hmiOut: {},
};

let pollTimer = null;

function broadcast(wss) {
  const payload = JSON.stringify(snapshot);

  for (const socket of wss.clients) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  }
}

async function refreshSnapshot(wss) {
  try {
    const [hmiIn, hmiOut] = await Promise.all([
      client.readValue(SYMBOL_HMI_IN),
      client.readValue(SYMBOL_HMI_OUT),
    ]);

    snapshot = {
      connected: true,
      lastUpdated: new Date().toISOString(),
      error: null,
      hmiIn: hmiIn?.value ?? {},
      hmiOut: hmiOut?.value ?? {},
    };
  } catch (error) {
    snapshot = {
      ...snapshot,
      connected: false,
      error: error instanceof Error ? error.message : 'ADS poll failed',
    };
  }

  broadcast(wss);
}

async function writeFields(fields) {
  const entries = Object.entries(fields ?? {});

  for (const [field, value] of entries) {
    await client.writeValue(`${SYMBOL_HMI_IN}.${field}`, value);
  }
}

app.get('/api/plc/state', (_req, res) => {
  res.json(snapshot);
});

app.post('/api/plc/write', async (req, res) => {
  try {
    await writeFields(req.body?.fields);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'ADS write failed');
  }
});

app.post('/api/plc/pulse', async (req, res) => {
  const field = req.body?.field;
  const durationMs = Number(req.body?.durationMs ?? 150);

  if (!field) {
    res.status(400).send('field is required');
    return;
  }

  try {
    await client.writeValue(`${SYMBOL_HMI_IN}.${field}`, true);
    setTimeout(() => {
      client.writeValue(`${SYMBOL_HMI_IN}.${field}`, false).catch(() => undefined);
    }, durationMs);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'ADS pulse failed');
  }
});

const server = app.listen(HTTP_PORT, async () => {
  console.log(`ADS bridge listening on http://localhost:${HTTP_PORT}`);
  console.log('ADS bridge settings:', {
    targetAmsNetId: TARGET_AMS_NET_ID,
    targetAdsPort: TARGET_ADS_PORT,
    routerAddress: TARGET_IP ?? '(using local ADS router)',
    hmiIn: SYMBOL_HMI_IN,
    hmiOut: SYMBOL_HMI_OUT,
  });
});

const wss = new WebSocketServer({ server, path: '/ws/plc' });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify(snapshot));
});

async function start() {
  try {
    await client.connect();
    snapshot.connected = true;
    snapshot.error = null;
    console.log('ADS connected');
  } catch (error) {
    snapshot.connected = false;
    snapshot.error = error instanceof Error ? error.message : 'ADS connect failed';
    console.error('ADS connect failed:', snapshot.error);
  }

  await refreshSnapshot(wss);
  pollTimer = setInterval(() => {
    refreshSnapshot(wss).catch(() => undefined);
  }, POLL_MS);
}

async function shutdown() {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  try {
    await client.disconnect();
  } finally {
    server.close();
    wss.close();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((error) => {
  console.error('ADS bridge failed to start', error);
});
