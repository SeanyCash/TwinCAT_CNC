import type { AxisData } from '../components/LargeAxisCard';
import type { AxisRefLike, HmiOut, PlcSnapshot, UiLiveData } from '../types/plc';
import { defaultHmiIn, defaultHmiOut } from '../types/plc';

function readBool(ref: AxisRefLike, keys: string[]) {
  for (const key of keys) {
    const value = ref[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

function readNumber(ref: AxisRefLike, keys: string[]) {
  for (const key of keys) {
    const value = ref[key];
    if (typeof value === 'number') {
      return value;
    }
  }

  return 0;
}

function toAxisData(
  id: AxisData['id'],
  name: string,
  temperature: number,
  ref: AxisRefLike,
  coupled: boolean,
) {
  const moving = readBool(ref, ['bMoving', 'moving', 'bBusy', 'Busy']);
  const enabled = readBool(ref, ['bEnabled', 'enabled', 'bPowerOn', 'bAxisEnabled']);
  const ready = readBool(ref, ['bReady', 'ready', 'bOperational', 'bHomed']);
  const error = readBool(ref, ['bError', 'error', 'bHasError']);
  const errorId = readNumber(ref, ['nErrorId', 'errorId', 'dwErrorId']);
  const velocity = readNumber(ref, ['fActVelocity', 'fVelocity', 'velocity']);
  const lagDistance = readNumber(ref, ['fLagDistance', 'lagDistance', 'fPosDiff']);

  return {
    id,
    name,
    errorId,
    velocity,
    temp: temperature,
    lagDistance,
    status: {
      ready,
      coupled,
      enabled,
      moving,
      error,
    },
  };
}

export function mergeSnapshot(snapshot?: Partial<PlcSnapshot>): PlcSnapshot {
  return {
    connected: snapshot?.connected ?? false,
    lastUpdated: snapshot?.lastUpdated ?? null,
    error: snapshot?.error ?? null,
    hmiIn: {
      ...defaultHmiIn,
      ...snapshot?.hmiIn,
    },
    hmiOut: {
      ...defaultHmiOut,
      ...snapshot?.hmiOut,
    },
  };
}

export function mapHmiOutToLiveData(hmiOut: HmiOut): UiLiveData {
  const axes: AxisData[] = [
    toAxisData('Y1', 'Leader Drive', hmiOut.nYDriveTemp, hmiOut.stYRef, hmiOut.bYAxesCoupled),
    toAxisData('Y2', 'Follower Drive', hmiOut.nY2DriveTemp, hmiOut.stY2Ref, hmiOut.bYAxesCoupled),
    toAxisData('X', 'Main Gantry', hmiOut.nXDriveTemp, hmiOut.stXRef, false),
    toAxisData('Z', 'Spindle Head', hmiOut.nZDriveTemp, hmiOut.stZRef, false),
  ];

  return {
    currentPos: {
      x: hmiOut.fActPosX,
      y: hmiOut.fActPosY,
      z: hmiOut.fActPosZ,
    },
    axes,
    isMoving: axes.some((axis) => axis.status.moving),
  };
}

export const plcDefaults = mergeSnapshot();
