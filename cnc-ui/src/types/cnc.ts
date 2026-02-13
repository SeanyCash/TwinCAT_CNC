export interface AxisState {
  id: string;
  errorId: number;
  // ... all your properties
}

export interface AxisProps {
  label: string;
  value: number;
  isHomed: boolean;
  status: AxisStatus;
}