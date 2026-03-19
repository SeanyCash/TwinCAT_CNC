import { useCallback, useEffect, useMemo, useState } from 'react';
import { mapHmiOutToLiveData, mergeSnapshot, plcDefaults } from '../lib/plc';
import type { HmiIn, PlcConnectionState, PlcSnapshot } from '../types/plc';

const WS_PATH = '/ws/plc';
const STATE_PATH = '/api/plc/state';
const WRITE_PATH = '/api/plc/write';
const PULSE_PATH = '/api/plc/pulse';

async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json();
}

function getWebSocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${WS_PATH}`;
}

export function usePlcBridge() {
  const [snapshot, setSnapshot] = useState<PlcSnapshot>(plcDefaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadInitialState = async () => {
      try {
        const response = await fetch(STATE_PATH);
        if (!response.ok) {
          throw new Error(`Initial PLC state request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setSnapshot(mergeSnapshot(data));
        }
      } catch (error) {
        if (!cancelled) {
          setSnapshot((current) => ({
            ...current,
            error: error instanceof Error ? error.message : 'Failed to load PLC state',
          }));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setSnapshot(mergeSnapshot(data));
      } catch (error) {
        setSnapshot((current) => ({
          ...current,
          error: error instanceof Error ? error.message : 'Invalid PLC websocket payload',
        }));
      }
    };

    ws.onerror = () => {
      setSnapshot((current) => ({
        ...current,
        connected: false,
        error: current.error ?? 'PLC bridge websocket error',
      }));
    };

    ws.onclose = () => {
      setSnapshot((current) => ({
        ...current,
        connected: false,
      }));
    };

    return () => {
      ws.close();
    };
  }, []);

  const writeFields = useCallback(async (fields: Partial<HmiIn>) => {
    await postJson(WRITE_PATH, { fields });
  }, []);

  const pulseField = useCallback(async (field: keyof HmiIn, durationMs = 150) => {
    await postJson(PULSE_PATH, { field, durationMs });
  }, []);

  const connection: PlcConnectionState = useMemo(
    () => ({
      connected: snapshot.connected,
      loading,
      error: snapshot.error,
      lastUpdated: snapshot.lastUpdated,
    }),
    [loading, snapshot.connected, snapshot.error, snapshot.lastUpdated],
  );

  return {
    snapshot,
    liveData: mapHmiOutToLiveData(snapshot.hmiOut),
    connection,
    writeFields,
    pulseField,
  };
}
