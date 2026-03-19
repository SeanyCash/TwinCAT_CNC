import type { AxisData } from '../components/LargeAxisCard';

export type PlcPrimitive = boolean | number | string | null;

export type HmiJogMode = 'SLOW' | 'CONTINUOUS' | 'FAST' | 'INCHING';
export interface PlcEnumValue {
  name: string;
  value: number;
}

export type MachineState =
  | 'RESETTING'
  | 'IDLE'
  | 'STARTING'
  | 'EXECUTE'
  | 'HELD'
  | 'COMPLETING'
  | 'COMPLETE'
  | 'STOPPED'
  | 'STOPPING'
  | 'ABORTING'
  | 'ABORTED';

export const MACHINE_STATE_VALUES: MachineState[] = [
  'RESETTING',
  'IDLE',
  'STARTING',
  'EXECUTE',
  'HELD',
  'COMPLETING',
  'COMPLETE',
  'STOPPED',
  'STOPPING',
  'ABORTING',
  'ABORTED',
];

export const PROGRAM_VALUES = {
  eNull: 0,
  eHomeAll: 1,
  eHomeY: 2,
  eHomeX: 3,
  eHomeZ: 4,
} as const;

export type HmiProgram = keyof typeof PROGRAM_VALUES;

export const JOG_MODE_VALUES = {
  SLOW: 'MC_JOGMODE_STANDARD_SLOW',
  FAST: 'MC_JOGMODE_STANDARD_FAST',
  CONTINUOUS: 'MC_JOGMODE_CONTINOUS',
  INCHING: 'MC_JOGMODE_INCHING',
  INCHING_MODULO: 'MC_JOGMODE_INCHING_MODULO',
} as const;

export type PlcJogModeValue = (typeof JOG_MODE_VALUES)[keyof typeof JOG_MODE_VALUES];

export interface HmiIn {
  bZeroX: boolean;
  bZeroY: boolean;
  bZeroZ: boolean;
  bZeroAllAxes: boolean;
  bAxisEnable: boolean;
  bSpindleEnable: boolean;
  bReset: boolean;
  bHold: boolean;
  bStop: boolean;
  bStart: boolean;
  bEnableDustCollectorPB: boolean;
  ProgramCall: number;
  bTriggerProgramCall: boolean;
  bInitiateNCProgramSelect: boolean;
  fChannelOverride: number;
  bManualSpindleOverride: boolean;
  nManualSpindleSetpoint: number;
  sPrgName: string;
  bJogEnable: boolean;
  bCoupleYAxes: boolean;
  bDecoupleAxes: boolean;
  bXJogPositive: boolean;
  bXJogNegative: boolean;
  bYJogPositive: boolean;
  bYJogNegative: boolean;
  bZJogPositive: boolean;
  bZJogNegative: boolean;
  eJogMode: PlcJogModeValue;
  fJogPosition: number;
  fJogVelocity: number;
  bSetPosExecute: boolean;
  fSetPosition: number;
  bExecuteZeroShift: boolean;
  bReadZeroShift: boolean;
  nZeroShiftNumber: number;
  fSpindleOverrideSpeed: number;
  bSpindleSpeedExecute: boolean;
  bResetSerialComm: boolean;
}

export interface AxisRefLike {
  [key: string]: unknown;
}

export interface HmiOut {
  sCurrentProgramSelected: string;
  fFeedRate: number;
  fRapidRate: number;
  sInterpreterState: string;
  fChannelOverrideSpeed: number;
  fToolpathVelocityIPM: number;
  stItpToPlc: Record<string, unknown>;
  ZeroShiftDesc: Record<string, unknown>;
  bY1HomeSwitch: boolean;
  bY2HomeSwitch: boolean;
  bYLimitSwitch: boolean;
  bXHomeSwitch: boolean;
  bXLimitSwitch: boolean;
  bZHomeSwitch: boolean;
  eCurrentState: MachineState | number | string | PlcEnumValue;
  bAllAxesReady: boolean;
  bYAxesCoupled: boolean;
  fActPosY: number;
  fActPosY2: number;
  fActPosX: number;
  fActPosZ: number;
  nYDriveTemp: number;
  nY2DriveTemp: number;
  nXDriveTemp: number;
  nZDriveTemp: number;
  stYRef: AxisRefLike;
  stY2Ref: AxisRefLike;
  stXRef: AxisRefLike;
  stZRef: AxisRefLike;
  sJogMode: string;
  nSpeedRefSetpoint: number;
  nRampControlTime: number;
  sErrorCode: string;
  bDriveRunning: boolean;
  bDriveFault: boolean;
  bStandbyMode: boolean;
  bDriveReady: boolean;
  nOutputFreq: number;
  nMotorCurrent: number;
  nMotorTorque: number;
  nMotorPower: number;
  bDigitalInput1: boolean;
  bDigitalInput2: boolean;
  bDigitalInput3: boolean;
  bDigitalInput4: boolean;
  bDriveEnabled: boolean;
  nDCBusVoltage: number;
  nDrivePowerStageTemp: number;
  bRelayOutputStatus: boolean;
  nKWHourMeter: number;
  nRuntimeHours: number;
  nRuntimeMinutes: number;
  nInternalDriveTemp: number;
  nOutputVoltage: number;
  nMaxSpeedLimit: number;
  nMinSpeedLimit: number;
  fAccelRampTime: number;
  nDecelRampTime: number;
  nStopMode: number;
  nMotorRatedVoltage: number;
  nMotorRatedCurrent: number;
  nMotorRatedFrequency: number;
  nMotorRatedSpeed: number;
  nApplicationMode: number;
  nRelayOutputFunction: number;
  nUserPGain: number;
  nUserIConstant: number;
  nMotorControlMode: number;
  nMaximumCurrentLimit: number;
  bSpindleAtRequestedSpeed: boolean;
  fScaledSpindleSpeedRef: number;
  sReadErrorID: string;
  bTxRequest: boolean;
  bRxAccepted: boolean;
  bInitRequest: boolean;
  bSendContinues: boolean;
  bTxAccepted: boolean;
  bRxRequest: boolean;
  bInitAccepted: boolean;
  bBufferFull: boolean;
  bParityError: boolean;
  bFramingError: boolean;
  bOverrunError: boolean;
  sReadNCLine: string;
  sReadNCName: string;
  nCurrentMCode: number;
}

export interface PlcSnapshot {
  connected: boolean;
  lastUpdated: string | null;
  error: string | null;
  hmiIn: HmiIn;
  hmiOut: HmiOut;
}

export interface PlcConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface UiLiveData {
  currentPos: { x: number; y: number; z: number };
  axes: AxisData[];
  isMoving: boolean;
}

export const defaultHmiIn: HmiIn = {
  bZeroX: false,
  bZeroY: false,
  bZeroZ: false,
  bZeroAllAxes: false,
  bAxisEnable: false,
  bSpindleEnable: false,
  bReset: false,
  bHold: false,
  bStop: false,
  bStart: false,
  bEnableDustCollectorPB: false,
  ProgramCall: PROGRAM_VALUES.eNull,
  bTriggerProgramCall: false,
  bInitiateNCProgramSelect: false,
  fChannelOverride: 100,
  bManualSpindleOverride: false,
  nManualSpindleSetpoint: 0,
  sPrgName: '',
  bJogEnable: false,
  bCoupleYAxes: false,
  bDecoupleAxes: false,
  bXJogPositive: false,
  bXJogNegative: false,
  bYJogPositive: false,
  bYJogNegative: false,
  bZJogPositive: false,
  bZJogNegative: false,
  eJogMode: JOG_MODE_VALUES.CONTINUOUS,
  fJogPosition: 1,
  fJogVelocity: 25,
  bSetPosExecute: false,
  fSetPosition: 0,
  bExecuteZeroShift: false,
  bReadZeroShift: false,
  nZeroShiftNumber: 54,
  fSpindleOverrideSpeed: 0,
  bSpindleSpeedExecute: false,
  bResetSerialComm: false,
};

export const defaultHmiOut: HmiOut = {
  sCurrentProgramSelected: '',
  fFeedRate: 0,
  fRapidRate: 0,
  sInterpreterState: 'DISCONNECTED',
  fChannelOverrideSpeed: 0,
  fToolpathVelocityIPM: 0,
  stItpToPlc: {},
  ZeroShiftDesc: {},
  bY1HomeSwitch: false,
  bY2HomeSwitch: false,
  bYLimitSwitch: false,
  bXHomeSwitch: false,
  bXLimitSwitch: false,
  bZHomeSwitch: false,
  eCurrentState: 'IDLE',
  bAllAxesReady: false,
  bYAxesCoupled: false,
  fActPosY: 0,
  fActPosY2: 0,
  fActPosX: 0,
  fActPosZ: 0,
  nYDriveTemp: 0,
  nY2DriveTemp: 0,
  nXDriveTemp: 0,
  nZDriveTemp: 0,
  stYRef: {},
  stY2Ref: {},
  stXRef: {},
  stZRef: {},
  sJogMode: 'CONTINUOUS',
  nSpeedRefSetpoint: 0,
  nRampControlTime: 0,
  sErrorCode: '',
  bDriveRunning: false,
  bDriveFault: false,
  bStandbyMode: false,
  bDriveReady: false,
  nOutputFreq: 0,
  nMotorCurrent: 0,
  nMotorTorque: 0,
  nMotorPower: 0,
  bDigitalInput1: false,
  bDigitalInput2: false,
  bDigitalInput3: false,
  bDigitalInput4: false,
  bDriveEnabled: false,
  nDCBusVoltage: 0,
  nDrivePowerStageTemp: 0,
  bRelayOutputStatus: false,
  nKWHourMeter: 0,
  nRuntimeHours: 0,
  nRuntimeMinutes: 0,
  nInternalDriveTemp: 0,
  nOutputVoltage: 0,
  nMaxSpeedLimit: 0,
  nMinSpeedLimit: 0,
  fAccelRampTime: 0,
  nDecelRampTime: 0,
  nStopMode: 0,
  nMotorRatedVoltage: 0,
  nMotorRatedCurrent: 0,
  nMotorRatedFrequency: 0,
  nMotorRatedSpeed: 0,
  nApplicationMode: 0,
  nRelayOutputFunction: 0,
  nUserPGain: 0,
  nUserIConstant: 0,
  nMotorControlMode: 0,
  nMaximumCurrentLimit: 0,
  bSpindleAtRequestedSpeed: false,
  fScaledSpindleSpeedRef: 0,
  sReadErrorID: '',
  bTxRequest: false,
  bRxAccepted: false,
  bInitRequest: false,
  bSendContinues: false,
  bTxAccepted: false,
  bRxRequest: false,
  bInitAccepted: false,
  bBufferFull: false,
  bParityError: false,
  bFramingError: false,
  bOverrunError: false,
  sReadNCLine: '',
  sReadNCName: '',
  nCurrentMCode: 0,
};
