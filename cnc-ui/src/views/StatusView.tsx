import React from 'react';
import LargeAxisCard, { AxisData } from '../components/LargeAxisCard';
import machineImage from '../assets/machineoverviewB&W.png';
import { MOCK_AXES } from '../data/MockAxes';

interface StatusViewProps {
  axes?: AxisData[];
}

export default function StatusView({ axes }: StatusViewProps) {
  // FIX: Ensure that if axes is undefined OR an empty array, we use MOCK_AXES
  const displayAxes = (axes && axes.length > 0) ? axes : MOCK_AXES;

  // Debug: Check your console (F12) to see if this triggers
  console.log("StatusView Data:", displayAxes);

  return (
    <div className="flex h-full w-full bg-[var(--cnc-bg-main)] text-[var(--cnc-text-main)] overflow-hidden font-sans">
      
      {/* 1. Left Axis Column (Diagnostics) */}
      <aside className="w-[450px] border-r border-[var(--cnc-border-main)] bg-[var(--cnc-bg-surface)]/80 backdrop-blur-xl z-10 overflow-y-auto custom-scrollbar flex flex-col gap-px">
        <div className="p-3 border-b border-[var(--cnc-border-main)] bg-black/20 sticky top-0 z-20 backdrop-blur-md">
          <h2 className="text-[10px] font-black uppercase text-[var(--cnc-text-secondary)] tracking-widest">
            Axis Diagnostics
          </h2>
        </div>

        {['Y1', 'Y2', 'X', 'Z'].map(id => {
          // We search displayAxes to ensure we have data
          const axisData = displayAxes.find(a => a.id.toUpperCase() === id.toUpperCase());
          
          return axisData ? (
            <LargeAxisCard key={id} axis={axisData} />
          ) : (
            <div key={id} className="p-8 border-b border-[var(--cnc-border-main)] bg-[var(--cnc-bg-subtle)]/20 animate-pulse text-center">
              <span className="text-[10px] text-[var(--cnc-text-secondary)] font-mono uppercase tracking-widest">
                Waiting for {id} ADS data...
              </span>
            </div>
          );
        })}
      </aside>

      {/* 2. Right Content Area (Machine Overview) */}
      <div className="flex-1 flex flex-col relative bg-black overflow-hidden">
        
        {/* Tab Header */}
        <div className="flex p-1 bg-[var(--cnc-bg-surface)] border-b border-[var(--cnc-border-main)] z-20">
          <button className="px-4 py-1 text-[10px] font-bold bg-[var(--cnc-accent)] text-black uppercase transition-all hover:brightness-110">
            Overview
          </button>
          <button className="px-4 py-1 text-[10px] font-bold text-[var(--cnc-text-secondary)] uppercase hover:text-[var(--cnc-text-main)] transition-colors">
            Spindle
          </button>
        </div>

        {/* IMAGE & HOTSPOT CONTAINER */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12 bg-radial-gradient">
          <img 
            src={machineImage} 
            className="max-w-[85%] max-h-[85%] object-contain opacity-30 mix-blend-lighten pointer-events-none select-none"
            alt="CNC Machine Structure"
          />

          {/* HOTSPOT OVERLAYS */}
          <Hotspot 
            label="Z-Axis" 
            top="25%" 
            left="62%" 
            status={displayAxes.find(a => a.id === 'Z')?.errorId === 0 ? 'nominal' : 'fault'} 
          />
          <Hotspot 
            label="X-Axis" 
            top="45%" 
            left="70%" 
            status={displayAxes.find(a => a.id === 'X')?.errorId === 0 ? 'nominal' : 'fault'} 
          />
          <Hotspot 
            label="Y-Master" 
            top="85%" 
            left="82%" 
            status={displayAxes.find(a => a.id === 'Y1')?.errorId === 0 ? 'nominal' : 'fault'} 
          />
          <Hotspot 
            label="Y-Slave" 
            top="50%" 
            left="38%" 
            status={displayAxes.find(a => a.id === 'Y2')?.errorId === 0 ? 'nominal' : 'fault'} 
          />
        </div>

        {/* HUD Overlay */}
        <div className="absolute bottom-4 right-6 text-right pointer-events-none">
            <p className="text-[9px] uppercase text-[var(--cnc-text-secondary)] leading-none">Perspective</p>
            <p className="text-lg font-black italic text-[var(--cnc-text-main)] uppercase tracking-tighter">Isometric View</p>
        </div>
      </div>
    </div>
  );
}

function Hotspot({ label, top, left, status }: { label: string, top: string, left: string, status: 'nominal' | 'fault' }) {
  const isNominal = status === 'nominal';
  const color = isNominal ? 'var(--cnc-info)' : 'var(--cnc-error)';

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-crosshair z-30" 
      style={{ top, left }}
    >
      <div className="relative">
        <div 
          className="w-3 h-3 rounded-full border border-white/50 transition-colors duration-500"
          style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
        />
        {!isNominal && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-[var(--cnc-error)] animate-ping" />
        )}
      </div>

      <span className="bg-black/90 border border-[var(--cnc-border-subtle)] px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[var(--cnc-text-main)] uppercase tracking-tighter shadow-xl group-hover:border-[var(--cnc-accent)] transition-colors">
        {label}
      </span>
    </div>
  );
}