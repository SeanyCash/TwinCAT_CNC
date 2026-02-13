export default function ControlHeader() {
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

        <button className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-amber-800 active:border-b-0 active:translate-y-1">
          Enable
        </button>

        <button className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1">
          Reset
        </button>

        <button className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-amber-800 active:border-b-0 active:translate-y-1">
          Hold
        </button>

        <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase transition-colors border-b-4 border-amber-800 active:border-b-0 active:translate-y-1">
          Stop
        </button>

        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-1.5 rounded text-xs font-black uppercase flex items-center gap-2 transition-colors border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Start
        </button>
      </div>

      {/* Right: Machine Status */}
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="text-[14px] text-slate-500 font-bold">TwinCAT RT</p>
          <p className="text-md font-mono text-cyan-400">CONFIG</p>
        </div>
        <div className="h-8 w-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
          ?
        </div>
      </div>
    </header>
  );
}