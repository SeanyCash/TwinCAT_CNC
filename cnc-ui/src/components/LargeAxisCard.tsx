import React from 'react';

// 1. Unified Interfaces
export interface AxisStatus { // Added export
  ready: boolean;
  coupled: boolean;
  enabled: boolean;
  moving?: boolean;
  error?: boolean;
}

export interface AxisData { // Added export
  id: string;
  name: string;
  errorId: number;
  velocity: number;
  temp: number;
  lagDistance: number;
  status: AxisStatus;
}

// 2. Main Component
const LargeAxisCard: React.FC<{ axis: AxisData }> = ({ axis }) => {
  const hasError = axis.errorId !== 0 || axis.status.error;
  
  return (
    <div className="p-4 border-b border-[var(--cnc-border-main)] grid grid-cols-12 gap-4 items-center bg-[var(--cnc-bg-surface)] hover:bg-white/[0.02] transition-colors">
      
      {/* Icon & ID Label */}
      <div className="col-span-2 flex flex-col items-center">
        <div 
          className="w-10 h-10 rounded flex items-center justify-center border transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--cnc-bg-subtle)',
            borderColor: hasError ? 'var(--cnc-error)' : 'var(--cnc-border-main)',
            boxShadow: hasError ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
          }}
        >
          <span 
            className="font-bold font-mono text-lg"
            style={{ color: hasError ? 'var(--cnc-error)' : 'var(--cnc-accent)' }}
          >
            {axis.id}
          </span>
        </div>
        <span className="text-[9px] text-[var(--cnc-text-secondary)] mt-1 font-bold uppercase truncate w-full text-center px-1">
          {axis.name}
        </span>
      </div>

      {/* Data Table Section */}
      <div className="col-span-6 space-y-2">
        <DataRow 
          label="Error ID" 
          value={axis.errorId} 
          highlight={hasError} 
          highlightColor="var(--cnc-error)" 
        />
        <DataRow 
          label="Velocity" 
          value={`${axis.velocity.toFixed(2)} mm/s`} 
        />
        
        {/* Compact Status Led Row */}
        <div className="grid grid-cols-3 gap-1 pt-1">
          <StatusLed label="Ready" active={axis.status.ready} />
          <StatusLed label="Coupled" active={axis.status.coupled} />
          <StatusLed label="Enabled" active={axis.status.enabled} />
        </div>
      </div>

      {/* Drive Temp Gauge */}
      <div className="col-span-4 flex flex-col items-center">
          <div 
            className="relative w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all duration-500"
            style={{ 
                borderColor: 'var(--cnc-bg-subtle)', 
                borderTopColor: axis.temp > 60 ? 'var(--cnc-error)' : 'var(--cnc-accent)',
                transform: `rotate(${axis.temp > 60 ? '5deg' : '0deg'})` 
            }}
          >
             <span className="text-xs font-bold text-[var(--cnc-text-main)]">{axis.temp.toFixed(1)}°</span>
          </div>
          <span className="text-[9px] text-[var(--cnc-text-secondary)] mt-2 uppercase font-semibold">Drive Temp</span>
      </div>
    </div>
  );
};

// --- Helpers ---

const DataRow = ({ label, value, highlight, highlightColor }: any) => (
  <div className="flex justify-between text-[11px] border-b border-[var(--cnc-divider)] pb-1">
    <span className="text-[var(--cnc-text-secondary)] uppercase text-[9px] font-medium">{label}</span>
    <span 
      className="font-mono font-medium"
      style={{ color: highlight ? highlightColor : 'var(--cnc-text-main)' }}
    >
      {value}
    </span>
  </div>
);

const StatusLed = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center gap-1.5">
    <div 
      className="w-2 h-2 rounded-full transition-all duration-500" 
      style={{ 
        backgroundColor: active ? 'var(--cnc-success)' : 'var(--cnc-bg-inactive)',
        boxShadow: active ? '0 0 6px var(--cnc-success)' : 'none',
        opacity: active ? 1 : 0.4
      }}
    />
    <span className="text-[8px] text-[var(--cnc-text-secondary)] uppercase tracking-tight">{label}</span>
  </div>
);

export default LargeAxisCard;