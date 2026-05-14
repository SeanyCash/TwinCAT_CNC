import React, { startTransition, useDeferredValue, useState } from 'react';
import AxisCard from '../components/AxisCard';
import GCodeVisualizer from '../components/GCodeVisualizer';
import JogPanel from '../components/JogPanel';
import CncStatusPanel from '../components/CncStatusPanel';
import GCodeConsole from '../components/GCodeConsole';
import GCodeLoader from '../components/GCodeLoader';
import type { HmiIn, HmiOut } from '../types/plc';

interface MainViewProps {
  currentPos: { x: number; y: number; z: number };
  hmiIn: HmiIn;
  hmiOut: HmiOut;
  writeFields: (fields: Partial<HmiIn>) => Promise<unknown>;
  pulseField: (field: keyof HmiIn, durationMs?: number) => Promise<unknown>;
}

export default function MainView({ currentPos, hmiIn, hmiOut, writeFields, pulseField }: MainViewProps) {
  // --- STATE ---
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState(0); 
  const [gcodeText, setGcodeText] = useState<string>("");
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const deferredGcodeText = useDeferredValue(gcodeText);
  const deferredConsoleLines = useDeferredValue(consoleLines);

  const handleFileSelect = async (filePath: string, content: string) => {
    setActiveFile(filePath);
    setCurrentLine(0);
    await writeFields({ sPrgName: filePath });
    await pulseField('bInitiateNCProgramSelect');

    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    startTransition(() => {
      setGcodeText(content);
      setConsoleLines(lines);
    });
  };

  const handleClear = async () => {
    setActiveFile(null);
    setGcodeText("");
    setConsoleLines([]);
    await writeFields({ sPrgName: '' });
  };

  // Connect live currentPos to your UI cards
  const axesData = [
    { label: 'Y1', value: hmiOut.fActPosY, isHomed: hmiOut.bY1HomeSwitch, status: currentPos.y !== 0 ? 'moving' : 'idle' },
    { label: 'Y2', value: hmiOut.fActPosY2, isHomed: hmiOut.bY2HomeSwitch, status: hmiOut.fActPosY2 !== 0 ? 'moving' : 'idle' },
    { label: 'X', value: hmiOut.fActPosX, isHomed: hmiOut.bXHomeSwitch, status: currentPos.x !== 0 ? 'moving' : 'idle' },
    { label: 'Z', value: hmiOut.fActPosZ, isHomed: hmiOut.bZHomeSwitch, status: currentPos.z !== 0 ? 'moving' : 'idle' },
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
            <JogPanel hmiIn={hmiIn} hmiOut={hmiOut} writeFields={writeFields} pulseField={pulseField} />
          </div>

          <CncStatusPanel hmiOut={hmiOut} />
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
              <GCodeVisualizer gcodeText={deferredGcodeText} currentPos={currentPos} />
            </div>

            {/* Console Ticker */}
            <div className="h-[220px] bg-black/60 overflow-hidden">
              <div className="bg-cnc-panel/80 px-3 py-1.5 border-b border-cnc-border flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Live G-Code Console</span>
                <span className="text-[10px] font-mono text-cnc-accent">Line: {currentLine}</span>
              </div>
              <GCodeConsole 
                lines={deferredConsoleLines.length > 0 ? deferredConsoleLines : ["SYSTEM READY - LOAD FILE"]} 
                activeLineIndex={currentLine} 
              />
            </div>
          </div>
        </div> 

      </div>
    </div>
  );
}
