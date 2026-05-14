import React, { useEffect, useState } from 'react';
import { FolderOpen, FileCode, X, Trash2, Monitor, RefreshCw } from 'lucide-react';

interface GCodeLoaderProps {
  onFileSelect: (filePath: string, content: string) => void | Promise<void>;
  onClear: () => void | Promise<void>;
  activeFile: string | null;
}

interface GCodeFileEntry {
  name: string;
  path: string;
  relativePath: string;
}

const GCodeLoader: React.FC<GCodeLoaderProps> = ({ onFileSelect, onClear, activeFile }) => {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [files, setFiles] = useState<GCodeFileEntry[]>([]);
  const [rootPath, setRootPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gcode/files');
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
      setRootPath(typeof data.root === 'string' ? data.root : '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load TwinCAT NCI files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExplorerOpen) {
      loadFiles().catch(() => undefined);
    }
  }, [isExplorerOpen]);

  const handleSelectFile = async (filePath: string) => {
    setIsSelecting(true);
    setError(null);

    try {
      const response = await fetch(`/api/gcode/file?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      await onFileSelect(data.path, data.content);
      setIsExplorerOpen(false);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'Failed to load G-code file');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="w-full font-mono">
      <div className="flex items-center gap-2 p-1 bg-cnc-panel border border-cnc-border rounded-t-md">
        <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Current File:</span>
          <div className="flex-1 px-3 py-1 bg-black/60 border border-cnc-border/50 rounded text-cnc-accent font-mono text-xs truncate">
            {activeFile || 'NO FILE LOADED'}
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

      {isExplorerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsExplorerOpen(false)} />

          <div className="relative bg-cnc-bg border border-cnc-border w-full max-w-2xl rounded shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-cnc-border bg-cnc-panel/50">
              <span className="text-xs font-black text-cnc-text uppercase tracking-widest flex items-center gap-2">
                <Monitor size={16} className="text-cnc-accent" /> TwinCAT NCI
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadFiles().catch(() => undefined)}
                  className="p-1 text-slate-500 hover:text-white"
                  disabled={isLoading}
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setIsExplorerOpen(false)} className="text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-cnc-border bg-black/20">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">NCI Folder</p>
              <p className="text-xs text-cnc-accent break-all mt-1">{rootPath || 'Loading...'}</p>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {error && (
                <div className="m-4 px-3 py-2 border border-cnc-error/40 bg-cnc-error/10 text-cnc-error text-xs rounded">
                  {error}
                </div>
              )}

              {!error && isLoading && (
                <div className="p-8 text-center text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
                  Scanning NCI folder...
                </div>
              )}

              {!error && !isLoading && files.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
                  No .NC files found
                </div>
              )}

              {!isLoading && files.length > 0 && (
                <div className="p-3 space-y-2">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      disabled={isSelecting}
                      className="w-full text-left px-3 py-2 border border-cnc-border rounded bg-cnc-panel/30 hover:bg-cnc-accent/10 hover:border-cnc-accent transition-colors disabled:opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <FileCode size={16} className="text-cnc-accent mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-cnc-text truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1 break-all">{file.relativePath}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-cnc-panel/30 border-t border-cnc-border text-[9px] text-slate-600 text-center uppercase font-bold">
              Select A TwinCAT NC Program
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCodeLoader;
