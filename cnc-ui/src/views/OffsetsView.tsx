import React from 'react';


interface OffsetsViewProps {
  currentPos: { x: number; y: number; z: number };
}

export default function OffsetsView({ currentPos }: OffsetsViewProps) {
  return (
    <div className="p-4 h-full animate-in fade-in duration-300">
      <h2 className="text-slate-400 text-xs font-bold uppercase mb-4">Tool Offsets</h2>
      {/* Add your grid and buttons here */}
    </div>
  );
}