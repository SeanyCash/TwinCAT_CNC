import React, { useState, useRef } from 'react';
import { FolderOpen, FileCode, X, Trash2, FileUp, Monitor } from 'lucide-react';

interface GCodeLoaderProps {
  onFileSelect: (file: File) => void; 
  onClear: () => void;
  activeFile: string | null;
}

const GCodeLoader: React.FC<GCodeLoaderProps> = ({ onFileSelect, onClear, activeFile }) => {
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  
  // 1. Reference to a hidden native file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    // Trigger the hidden native file picker
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setIsExplorerOpen(false); // Close modal after selection
    }
  };

  return (
    <div className="w-full font-mono">
      {/* Hidden Native Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".nc,.gcode,.txt" 
        className="hidden" 
      />

      {/* Main Bar */}
      <div className="flex items-center gap-2 p-1 bg-cnc-panel border border-cnc-border rounded-t-md">
        <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Current File:</span>
          <div className="flex-1 px-3 py-1 bg-black/60 border border-cnc-border/50 rounded text-cnc-accent font-mono text-xs truncate">
            {activeFile || "NO FILE LOADED"}
          </div>
        </div>

        <div className="flex gap-1 pr-1">
          <button 
            onClick={() => setIsExplorerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-cnc-accent hover:bg-cnc-accent/80 text-black text-[11px] font-black rounded transition-all uppercase"
          >
            <FolderOpen size={14} /> EXPLORER
          </button>
          
          <button 
            onClick={onClear}
            className="p-1.5 bg-slate-800 hover:bg-cnc-error/20 text-slate-500 hover:text-cnc-error border border-cnc-border rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Explorer Modal */}
      {isExplorerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsExplorerOpen(false)} />
          
          <div className="relative bg-cnc-bg border border-cnc-border w-full max-w-md rounded shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-cnc-border bg-cnc-panel/50">
              <span className="text-xs font-black text-cnc-text uppercase tracking-widest flex items-center gap-2">
                <Monitor size={16} className="text-cnc-accent" /> File System
              </span>
              <button onClick={() => setIsExplorerOpen(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center">
              <button 
                onClick={handleBrowseClick}
                className="group w-full aspect-video border-2 border-dashed border-cnc-border hover:border-cnc-accent hover:bg-cnc-accent/5 flex flex-col items-center justify-center gap-4 transition-all rounded"
              >
                <div className="p-4 rounded-full bg-cnc-panel border border-cnc-border group-hover:scale-110 transition-transform">
                  <FileUp size={32} className="text-cnc-accent" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-cnc-text">Browse Local Machine</p>
                  <p className="text-[10px] text-slate-500 uppercase mt-1">Select .NC or .GCODE files</p>
                </div>
              </button>
            </div>

            <div className="p-3 bg-cnc-panel/30 border-t border-cnc-border text-[9px] text-slate-600 text-center uppercase font-bold">
              Industrial File Loader v1.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCodeLoader;