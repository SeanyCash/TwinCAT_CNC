import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, Lock, Unlock } from 'lucide-react';
import { JOG_MODE_VALUES } from '../types/plc';
import type { HmiIn, HmiJogMode, HmiOut, PlcJogModeValue } from '../types/plc';

interface JogPanelProps {
  hmiIn: HmiIn;
  hmiOut: HmiOut;
  writeFields: (fields: Partial<HmiIn>) => Promise<unknown>;
  pulseField: (field: keyof HmiIn, durationMs?: number) => Promise<unknown>;
}

export default function JogPanel({ hmiIn, hmiOut, writeFields, pulseField }: JogPanelProps) {
  const [stepSize, setStepSize] = useState(hmiIn.fJogPosition || 1.0);
  const mode = getUiJogMode(hmiOut.sJogMode, hmiIn.eJogMode);
  const jogEnabled = hmiIn.bJogEnable;
  const yCoupled = hmiOut.bYAxesCoupled;

  const modes: HmiJogMode[] = ['SLOW', 'CONTINUOUS', 'FAST', 'INCHING'];

  useEffect(() => {
    setStepSize(hmiIn.fJogPosition || 1.0);
  }, [hmiIn.fJogPosition]);

  const handleJogModeChange = async (nextMode: HmiJogMode) => {
    await writeFields({ eJogMode: JOG_MODE_VALUES[nextMode] });
  };

  const handleMomentaryJog = async (
    field: keyof Pick<
      HmiIn,
      'bXJogPositive' | 'bXJogNegative' | 'bYJogPositive' | 'bYJogNegative' | 'bZJogPositive' | 'bZJogNegative'
    >,
    active: boolean,
  ) => {
    await writeFields({ [field]: active } as Partial<HmiIn>);
  };

  const handleSaveG54 = async () => {
    await writeFields({ nZeroShiftNumber: 54 });
    await pulseField('bExecuteZeroShift');
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl">
      
      {/* 1. Safety & Coupling Row */}
      <div className="flex gap-2">
        <button 
          onClick={() => writeFields({ bJogEnable: !jogEnabled })}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded font-black text-[10px] tracking-tighter transition-all border-b-4 ${
            jogEnabled 
            ? 'bg-amber-500 border-amber-700 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
            : 'bg-slate-800 border-slate-950 text-slate-500 opacity-50'
          }`}
        >
          {jogEnabled ? <Unlock size={14}/> : <Lock size={14}/>}
          {jogEnabled ? 'JOG ENABLED' : 'JOG LOCKED'}
        </button>

        <button 
          onClick={() => pulseField(yCoupled ? 'bDecoupleAxes' : 'bCoupleYAxes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded font-black text-[10px] tracking-tighter transition-all border-b-4 ${
            yCoupled 
            ? 'bg-green-600 border-green-800 text-white' 
            : 'bg-slate-800 border-slate-950 text-slate-500'
          }`}
        >
          COUPLE Y {yCoupled ? '(ON)' : '(OFF)'}
        </button>
      </div>

      <hr className="border-slate-800" />

      {/* 2. Jog Mode Toggles */}
      <div className="grid grid-cols-4 gap-1">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => handleJogModeChange(m)}
            className={`py-2 text-[9px] font-bold rounded transition-all border ${
              mode === m 
              ? 'bg-slate-100 border-white text-black' 
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 3. Main Movement Area */}
      <div className={`flex justify-between items-center gap-4 transition-opacity duration-300 ${!jogEnabled && 'opacity-20 pointer-events-none'}`}>
        {/* XY Pad */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/40 rounded-lg">
          <div />
          <JogBtn
            icon={<ChevronUp />}
            label="Y+"
            onPressChange={(active) => handleMomentaryJog('bYJogPositive', active)}
          />
          <div />
          <JogBtn
            icon={<ChevronLeft />}
            label="X-"
            onPressChange={(active) => handleMomentaryJog('bXJogNegative', active)}
          />
          <div className="flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /></div>
          <JogBtn
            icon={<ChevronRight />}
            label="X+"
            onPressChange={(active) => handleMomentaryJog('bXJogPositive', active)}
          />
          <div />
          <JogBtn
            icon={<ChevronDown />}
            label="Y-"
            onPressChange={(active) => handleMomentaryJog('bYJogNegative', active)}
          />
          <div />
        </div>

        {/* G54 Zero Shift */}
        <div className="flex items-center justify-center p-2 bg-black/40 rounded-lg">
          <button
            onClick={handleSaveG54}
            className="h-full min-h-[136px] w-20 bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-600 rounded shadow-lg flex flex-col items-center justify-center gap-2 active:translate-y-0.5"
          >
            <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase">Save</span>
            <span className="text-xl font-black text-white">G54</span>
            <span className="px-2 text-center text-[9px] font-bold uppercase text-emerald-200/80">
              Current Position
            </span>
          </button>
        </div>

        {/* Z Pad */}
        <div className="flex flex-col gap-1.5 p-2 bg-black/40 rounded-lg">
          <JogBtn
            icon={<Plus />}
            label="Z+"
            color="text-amber-500"
            onPressChange={(active) => handleMomentaryJog('bZJogPositive', active)}
          />
          <div className="h-10 w-10 flex items-center justify-center text-[10px] font-mono text-slate-600">Z</div>
          <JogBtn
            icon={<Minus />}
            label="Z-"
            color="text-amber-500"
            onPressChange={(active) => handleMomentaryJog('bZJogNegative', active)}
          />
        </div>
      </div>

      {/* 4. Inching Step Selector (Only visible if Inching is active) */}
      <div className={`transition-all ${mode === 'INCHING' ? 'opacity-100 h-10' : 'opacity-0 h-0 overflow-hidden'}`}>
        <div className="flex gap-1">
          {[0.01, 0.1, 1.0, 10.0].map((step) => (
            <button
              key={step}
              onClick={() => {
                setStepSize(step);
                writeFields({ fJogPosition: step });
              }}
              className={`flex-1 py-1 text-[10px] font-mono rounded border ${
                stepSize === step ? 'bg-cyan-900 border-cyan-500 text-cyan-100' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {step}mm
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getUiJogMode(jogModeLabel: string, plcJogMode: PlcJogModeValue): HmiJogMode {
  const normalized = `${jogModeLabel} ${plcJogMode}`.toUpperCase();

  if (normalized.includes('STANDARD_SLOW') || normalized.includes('SLOW')) {
    return 'SLOW';
  }

  if (normalized.includes('STANDARD_FAST') || normalized.includes('FAST')) {
    return 'FAST';
  }

  if (normalized.includes('INCHING')) {
    return 'INCHING';
  }

  return 'CONTINUOUS';
}

function JogBtn({
  icon,
  label,
  color = "text-cyan-400",
  onPressChange,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onPressChange: (active: boolean) => void;
}) {
  return (
    <button
      onMouseDown={() => onPressChange(true)}
      onMouseUp={() => onPressChange(false)}
      onMouseLeave={() => onPressChange(false)}
      onTouchStart={() => onPressChange(true)}
      onTouchEnd={() => onPressChange(false)}
      className="h-11 w-11 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded shadow-lg flex flex-col items-center justify-center active:translate-y-0.5 active:border-b-0"
    >
      <span className={color}>{icon}</span>
      <span className="text-[7px] font-bold text-slate-500 uppercase">{label}</span>
    </button>
  );
}
