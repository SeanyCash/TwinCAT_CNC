import React, { useEffect, useMemo, useRef } from 'react';

interface GCodeConsoleProps {
  lines: string[];
  activeLineIndex: number;
}

export default function GCodeConsole({ lines, activeLineIndex }: GCodeConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleWindow = useMemo(() => {
    const maxVisibleLines = 300;

    if (lines.length <= maxVisibleLines) {
      return { startIndex: 0, visibleLines: lines };
    }

    const halfWindow = Math.floor(maxVisibleLines / 2);
    const boundedActiveLine = Math.max(0, Math.min(activeLineIndex, lines.length - 1));
    const startIndex = Math.max(0, Math.min(boundedActiveLine - halfWindow, lines.length - maxVisibleLines));

    return {
      startIndex,
      visibleLines: lines.slice(startIndex, startIndex + maxVisibleLines),
    };
  }, [activeLineIndex, lines]);

  // Auto-scroll to the active line whenever it changes
  useEffect(() => {
    if (scrollRef.current) {
      const relativeIndex = activeLineIndex - visibleWindow.startIndex;
      const activeElement = scrollRef.current.children[relativeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        });
      }
    }
  }, [activeLineIndex, visibleWindow.startIndex]);

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
        {visibleWindow.visibleLines.map((line, index) => {
          const actualIndex = visibleWindow.startIndex + index;

          return (
          <div
            key={actualIndex}
            className={`px-2 py-0.5 rounded transition-all duration-200 flex gap-4 ${
              actualIndex === activeLineIndex
                ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <span className="w-12 opacity-50 text-right">{actualIndex + 1}</span>
            <span className={actualIndex === activeLineIndex ? 'font-bold' : ''}>{line}</span>
          </div>
          );
        })}
      </div>
    </div>
  );
}
