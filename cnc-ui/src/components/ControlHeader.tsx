import type { HmiIn, HmiOut, PlcConnectionState } from '../types/plc';

interface ControlHeaderProps {
  connection: PlcConnectionState;
  hmiOut: HmiOut;
  pulseField: (field: keyof HmiIn, durationMs?: number) => Promise<unknown>;
}

export default function ControlHeader({ connection, hmiOut, pulseField }: ControlHeaderProps) {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
      {/* Left: Branding */}
      <div className="flex items-center gap-2">
        <span className="text-cyan-500 font-black text-xl italic">CNC</span>
        <div className="h-4 w-[2px] bg-slate-700 mx-2" />
        <span className="text-slate-400 text-[14px] uppercase font-bold tracking-widest">Op-Panel v1.0</span>
      </div>

      {/* Center: CONTROL BUTTONS */}
      <div className="flex gap-2">

        <button
          onClick={() => pulseField('bAxisEnable')}
          className={`px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 active:border-b-0 active:translate-y-1 ${
            hmiOut.bAllAxesReady
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 shadow-[0_0_15px_rgba(34,197,94,0.35)]'
              : 'bg-slate-600 hover:bg-slate-500 text-white border-amber-800'
          }`}
        >
          Enable
        </button>

        <button
          onClick={() => pulseField('bReset')}
          className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          Reset
        </button>

        <button
          onClick={() => pulseField('bHold')}
          className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-amber-800 active:border-b-0 active:translate-y-1"
        >
          Hold
        </button>

        <button
          onClick={() => pulseField('bStop')}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-amber-800 active:border-b-0 active:translate-y-1"
        >
          Stop
        </button>

        <button
          onClick={() => pulseField('bStart')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase flex items-center gap-2 transition-colors border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Start
        </button>
      </div>

      {/* Right: Machine Status */}
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="text-[14px] text-slate-500 font-bold">TwinCAT RT</p>
          <p className="text-md font-mono text-cyan-400">
            {connection.connected ? hmiOut.sInterpreterState || 'CONNECTED' : 'DISCONNECTED'}
          </p>
        </div>
        <div className="h-8 min-w-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center px-2 text-slate-400 font-bold">
          {connection.connected ? 'RUN' : 'OFF'}
        </div>
      </div>
    </header>
  );
}
