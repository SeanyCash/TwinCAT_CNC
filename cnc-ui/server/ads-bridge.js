import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { Client } from 'ads-client';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const HTTP_PORT = Number(process.env.ADS_BRIDGE_PORT ?? 3001);
const POLL_MS = Number(process.env.ADS_POLL_MS ?? 100);
const TARGET_AMS_NET_ID = process.env.ADS_AMS_NET_ID ?? '192.168.0.99.1.1';
const TARGET_IP = process.env.ADS_TARGET_IP;
const TARGET_ADS_PORT = Number(process.env.ADS_PORT ?? 851);
const SYMBOL_HMI_IN = process.env.ADS_SYMBOL_HMI_IN ?? 'GVL.stHMI_In';
const SYMBOL_HMI_OUT = process.env.ADS_SYMBOL_HMI_OUT ?? 'GVL.stHMI_Out';
const GCODE_ROOT = path.resolve(process.env.TWINCAT_NCI_ROOT ?? 'C:\\ProgramData\\Beckhoff\\TwinCAT\\Mc\\Nci');

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

function isAllowedGCodeFile(filePath) {
  return ['.nc'].includes(path.extname(filePath).toLowerCase());
}

function resolveGCodePath(requestedPath = '') {
  const candidatePath = path.resolve(GCODE_ROOT, requestedPath);
  const relativePath = path.relative(GCODE_ROOT, candidatePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Requested path is outside the TwinCAT NCI root');
  }

  return candidatePath;
}

async function collectGCodeFiles(currentDir, rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectGCodeFiles(entryPath, rootDir));
      continue;
    }

    if (!entry.isFile() || !isAllowedGCodeFile(entryPath)) {
      continue;
    }

    files.push({
      name: entry.name,
      path: entryPath,
      relativePath: path.relative(rootDir, entryPath),
    });
  }

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function sanitizeUploadName(fileName = '') {
  const baseName = path.basename(fileName).trim();

  if (!baseName || baseName === '.' || baseName === '..') {
    throw new Error('A valid file name is required');
  }

  if (!isAllowedGCodeFile(baseName)) {
    throw new Error('Only .nc files are supported');
  }

  return baseName;
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

app.get('/api/gcode/files', async (_req, res) => {
  try {
    const files = await collectGCodeFiles(GCODE_ROOT, GCODE_ROOT);
    res.json({ root: GCODE_ROOT, files });
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'Failed to read TwinCAT NCI directory');
  }
});

app.get('/api/gcode/file', async (req, res) => {
  try {
    const requestedPath = typeof req.query.path === 'string' ? req.query.path : '';
    const resolvedPath = resolveGCodePath(requestedPath);
    const stats = await fs.stat(resolvedPath);

    if (!stats.isFile() || !isAllowedGCodeFile(resolvedPath)) {
      res.status(400).send('Requested file is not a supported G-code file');
      return;
    }

    const content = await fs.readFile(resolvedPath, 'utf8');
    res.json({ path: resolvedPath, name: path.basename(resolvedPath), content });
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'Failed to read G-code file');
  }
});

app.post('/api/gcode/upload', async (req, res) => {
  try {
    const fileName = sanitizeUploadName(req.body?.fileName);
    const content = typeof req.body?.content === 'string' ? req.body.content : '';
    const destinationPath = path.join(GCODE_ROOT, fileName);

    await fs.mkdir(GCODE_ROOT, { recursive: true });
    await fs.writeFile(destinationPath, content, 'utf8');

    res.json({
      ok: true,
      path: destinationPath,
      name: fileName,
      content,
    });
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'Failed to upload G-code file');
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
