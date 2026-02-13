// src/data/MockAxes.ts

export interface AxisStatus {
  ready: boolean;
  coupled: boolean;
  enabled: boolean;
  moving?: boolean;
  error?: boolean;
}

export interface AxisData {
  id: string;
  name: string;
  errorId: number;
  velocity: number;
  temp: number;
  lagDistance: number;
  status: AxisStatus;
}

export const MOCK_AXES: AxisData[] = [
  {
    id: "Y1",
    name: "Leader Drive",
    errorId: 0,
    velocity: 0.00,
    temp: 42.5,
    lagDistance: 0.001,
    status: { ready: true, coupled: true, enabled: true, moving: false, error: false }
  },
  {
    id: "Y2",
    name: "Follower Drive",
    errorId: 0,
    velocity: 0.00,
    temp: 38.2,
    lagDistance: 0.000,
    status: { ready: true, coupled: true, enabled: true, moving: false, error: false }
  },
  {
    id: "X",
    name: "Main Gantry",
    errorId: 0,
    velocity: 0.00,
    temp: 39.1,
    lagDistance: 0.000,
    status: { ready: true, coupled: true, enabled: true, moving: false, error: false }
  },
  {
    id: "Z",
    name: "Spindle Head",
    errorId: 0,
    velocity: 0.00,
    temp: 45.8,
    lagDistance: 0.002,
    status: { ready: true, coupled: false, enabled: true, moving: false, error: false }
  }
];