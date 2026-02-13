import React, { useState } from 'react';
import AxisCard from '../components/AxisCard';
import GCodeVisualizer from '../components/GCodeVisualizer';
import JogPanel from '../components/JogPanel';
import CncStatusPanel from '../components/CncStatusPanel';
import GCodeConsole from '../components/GCodeConsole';
import GCodeLoader from '../components/GCodeLoader';

interface MainViewProps {
  currentPos: { x: number; y: number; z: number };
}

export default function MainView({ currentPos }: MainViewProps) {
  // --- STATE ---
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState(0); 
  const [gcodeText, setGcodeText] = useState<string>("");
  const [consoleLines, setConsoleLines] = useState<string[]>([]);

  const handleFileSelect = (file: File) => {
    setActiveFile(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setGcodeText(text);
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      setConsoleLines(lines);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setActiveFile(null);
    setGcodeText("");
    setConsoleLines([]);
  };

  // Connect live currentPos to your UI cards
  const axesData = [
    { label: 'Y1',  value: currentPos.x, isHomed: true, status: currentPos.x !== 0 ? 'moving' : 'idle' },
    { label: 'Y2', value: currentPos.y, isHomed: true, status: currentPos.y !== 0 ? 'moving' : 'idle' },
    { label: 'X', value: currentPos.y, isHomed: true, status: currentPos.y !== 0 ? 'moving' : 'idle' },
    { label: 'Z',  value: currentPos.z, isHomed: false, status: currentPos.z !== 0 ? 'moving' : 'idle' },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4">
      <div className="grid grid-cols-12 gap-4 h-full">
        
        {/* LEFT COLUMN: DROs & Controls */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {axesData.map((axis) => (
              <AxisCard 
                key={axis.label}
                label={axis.label}
                value={axis.value}
                isHomed={axis.isHomed}
                status={axis.status as any}
              />
            ))}
          </div>

          <div className="bg-cnc-panel border border-cnc-border rounded-xl p-4 shadow-lg">
            <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-4 tracking-widest">Manual Jogging</h3>
            <JogPanel />
          </div>

          <CncStatusPanel />
        </div>

        {/* RIGHT COLUMN: Visualizer & Console */}
        <div className="col-span-8 flex flex-col overflow-hidden border border-cnc-border rounded-lg bg-black/20">
          
          <GCodeLoader 
            activeFile={activeFile} 
            onFileSelect={handleFileSelect} 
            onClear={handleClear} 
          />

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* 3D Visualizer */}
            <div className="relative flex-grow min-h-[200px] border-b border-cnc-border/30">
              <GCodeVisualizer gcodeText={gcodeText} currentPos={currentPos} />
              
              {!activeFile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                  <p className="text-slate-500 italic text-xs uppercase tracking-[0.2em] font-bold">Waiting for G-Code...</p>
                </div>
              )}
            </div>

            {/* Console Ticker */}
            <div className="h-[220px] bg-black/60 overflow-hidden">
              <div className="bg-cnc-panel/80 px-3 py-1.5 border-b border-cnc-border flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Live G-Code Console</span>
                <span className="text-[10px] font-mono text-cnc-accent">Line: {currentLine}</span>
              </div>
              <GCodeConsole 
                lines={consoleLines.length > 0 ? consoleLines : ["SYSTEM READY - LOAD FILE"]} 
                activeLineIndex={currentLine} 
              />
            </div>
          </div>
        </div> 

      </div>
    </div>
  );
}