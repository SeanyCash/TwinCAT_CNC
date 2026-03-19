import React, { useEffect, useMemo, useRef, useState } from 'react';
import StateDiagram from '../components/StateDiagram';
import { MACHINE_STATE_VALUES } from '../types/plc';
import type { HmiOut, MachineState, PlcEnumValue } from '../types/plc';

interface StateDiagramsProps {
  hmiOut: HmiOut;
}

function mapMachineState(value: HmiOut['eCurrentState']): MachineState {
  if (typeof value === 'object' && value !== null) {
    const enumValue = value as PlcEnumValue;

    if (typeof enumValue.name === 'string') {
      const normalizedName = enumValue.name.toUpperCase().trim();
      return MACHINE_STATE_VALUES.find((state) => state === normalizedName) ?? 'IDLE';
    }

    if (typeof enumValue.value === 'number') {
      return MACHINE_STATE_VALUES[enumValue.value] ?? 'IDLE';
    }
  }

  if (typeof value === 'number') {
    return MACHINE_STATE_VALUES[value] ?? 'IDLE';
  }

  if (typeof value === 'string') {
    const normalized = value.toUpperCase().trim();
    return MACHINE_STATE_VALUES.find((state) => state === normalized) ?? 'IDLE';
  }

  return 'IDLE';
}

export default function StateDiagrams({ hmiOut }: StateDiagramsProps) {
  const activeState = useMemo(() => mapMachineState(hmiOut.eCurrentState), [hmiOut.eCurrentState]);
  const [previousState, setPreviousState] = useState<MachineState | null>(null);
  const lastStateRef = useRef<MachineState>(activeState);

  useEffect(() => {
    if (lastStateRef.current !== activeState) {
      setPreviousState(lastStateRef.current);
      lastStateRef.current = activeState;
    }
  }, [activeState]);

  return (
    <div className="flex h-full w-full overflow-auto bg-[var(--cnc-bg-main)] p-4 text-[var(--cnc-text-main)]">
      <div className="w-full">
        <StateDiagram activeState={activeState} previousState={previousState} />
      </div>
    </div>
  );
}
