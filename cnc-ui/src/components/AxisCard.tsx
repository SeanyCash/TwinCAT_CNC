import React from 'react';

type AxisStatus = 'idle' | 'moving' | 'error';

interface AxisProps {
  label: string;
  value: number;
  isHomed: boolean;
  status: AxisStatus;
}

const AxisCard: React.FC<AxisProps> = ({ label, value, isHomed, status }) => {
  
  // 1. Map your status to your custom CNC config keys
  const statusStyles = {
    idle: {
      border: 'border-l-cnc-accent',
      text: 'text-cnc-text'
    },
    moving: {
      border: 'border-l-cnc-moving',
      text: 'text-cnc-moving animate-pulse'
    },
    error: {
      border: 'border-l-cnc-danger',
      text: 'text-cnc-danger'
    }
  };

  return (
    <div className={`
      bg-cnc-panel 
      ${statusStyles[status].border} 
      border-y border-r border-cnc-border 
      h-14 flex items-center justify-between px-4 rounded-r-lg shadow-lg
    `}>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-cnc-text leading-none uppercase">
          {label} Axis
        </span>
        <span className={`text-[9px] font-mono mt-1 ${isHomed ? 'text-cnc-homed' : 'text-cnc-nothomed'}`}>
          {isHomed ? 'HOMED' : 'NO REF'}
        </span>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-mono font-bold tracking-tighter ${statusStyles[status].text}`}>
          {value.toFixed(3)}
        </span>
        <span className="text-[10px] text-cnc-text font-bold uppercase tracking-widest">mm</span>
      </div>
    </div>
  );
};

export default AxisCard;