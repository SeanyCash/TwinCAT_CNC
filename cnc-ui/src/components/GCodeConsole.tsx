import React, { useEffect, useRef } from 'react';

interface GCodeConsoleProps {
  lines: string[];
  activeLineIndex: number;
}

export default function GCodeConsole({ lines, activeLineIndex }: GCodeConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the active line whenever it changes
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[activeLineIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeLineIndex]);

  return (
    <div className="h-half flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Console Header */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live NC Terminal</span>
        <span className="text-[9px] font-mono text-cyan-600">AUTO-SCROLL ON</span>
      </div>

      {/* Scrolling Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs scrollbar-hide select-none"
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className={`px-2 py-0.5 rounded transition-all duration-200 flex gap-4 ${
              index === activeLineIndex
                ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <span className="w-12 opacity-50 text-right">{index * 10}</span>
            <span className={index === activeLineIndex ? 'font-bold' : ''}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}