import React, { useState } from 'react';

export default function CncStatusPanel() {
  const [isWarmUp, setIsWarmUp] = useState(false);
  const [overrides] = useState({ feed: 100 });
  
  // Mock states - these would typically come from your CNC controller context
  const isAtSetpoint = false; 

  return (
    <div className="bg-cnc-bg border border-cnc-border rounded-lg p-4 font-mono text-cnc-text shadow-xl max-w-4xl">
      
      {/* UPPER SECTION: Interpretation & Path */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 font-bold">Block Number:</span>
            <span className="text-lg font-bold text-cnc-accent">N0000</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 font-bold">Override Speed:</span>
            <span className="text-lg font-bold text-cnc-text">{overrides.feed}%</span>
          </div>
          <div className="mt-4">
             <span className="text-2xl font-black text-cnc-success">M</span>
             <div className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">NC Interpreter State:</div>
             <div className={`text-sm mt-1 font-bold ${isWarmUp ? 'text-cnc-warning animate-slow-pulse' : 'text-cnc-success'}`}>
               {isWarmUp ? 'WARM-UP ACTIVE' : 'IDLE / READY'}
             </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Path Velocity:</span>
          <div className="text-3xl font-black text-white leading-none tabular-nums">0.00</div>
          <div className="text-xs text-slate-400">mm/sec</div>
          <div className="text-xs text-slate-600 italic">0.00 IPM</div>
        </div>
      </div>

      {/* LOWER SECTION: Focused Spindle Control */}
      <div className="grid grid-cols-1 border border-cnc-border rounded-md p-4 bg-cnc-panel/30">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] text-cnc-text uppercase font-black tracking-[0.2em]">
            Spindle Monitor
          </span>
          
          <div className="flex items-center gap-3">
             {/* RPM Gauge */}
             <div className="flex-1 bg-black/60 border border-cnc-border px-3 py-2 rounded shadow-inner flex flex-col">
               <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">RPM</span>
               <span className="text-xl text-cnc-accent font-bold tabular-nums">0.0</span>
             </div>
             
             {/* Hz Gauge */}
             <div className="flex-1 bg-black/60 border border-cnc-border px-3 py-2 rounded shadow-inner flex flex-col">
               <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Frequency</span>
               <span className="text-xl text-cnc-accent font-bold tabular-nums">0.0 <span className="text-xs font-normal">Hz</span></span>
             </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-cnc-border/50">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full border border-cnc-border transition-all duration-300 ${
                isAtSetpoint ? 'bg-cnc-success shadow-[0_0_10px_var(--color-cnc-success)]' : 'bg-slate-800'
              }`} />
              <span className="text-xs text-cnc-text uppercase font-bold tracking-tight">At Setpoint</span>
            </div>

            <button 
              onClick={() => setIsWarmUp(!isWarmUp)}
              className={`px-6 py-2 rounded text-[10px] font-black uppercase border transition-all active:scale-95 ${
                isWarmUp 
                  ? 'bg-cnc-warning text-black border-cnc-warning shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-cnc-bg border-cnc-border text-cnc-text hover:border-cnc-accent'
              }`}
            >
              {isWarmUp ? 'Running Warm-Up' : 'Start Warm-Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}