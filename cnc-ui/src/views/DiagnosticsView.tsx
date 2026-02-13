import React from 'react';
import { AxisState } from '../types/cnc';

export default function DiagnosticsView({ axes }: { axes: AxisState[] }) {
  return (
    <div className="p-4 h-full animate-in fade-in duration-300">
      <h2 className="text-slate-400 text-xs font-bold uppercase mb-4">Diagnostics</h2>
      {/* Add your grid and buttons here */}
    </div>
  );
}