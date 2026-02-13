import React from 'react';

interface MachineViewProps {
  axes: any[];
}

const MachineModelView = ({ axes }: MachineViewProps) => {
  // Define coordinates (percent of image width/height) for motor locations
  // You can tweak these percentages to align exactly with your PNG
  const indicatorMap = [
    { id: 'Y1', top: '85%', left: '72%' },
    { id: 'Y2', top: '45%', left: '15%' },
    { id: 'X',  top: '35%', left: '60%' },
    { id: 'Z',  top: '25%', left: '62%' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* The Machine Image */}
      <img 
        src="/assets/machine_view.png" 
        alt="CNC Machine Overview" 
        className="max-w-full max-h-full object-contain select-none"
      />

      {/* Status Overlay Indicators */}
      <div className="absolute inset-0 pointer-events-none">
        {indicatorMap.map((loc) => {
          const axisData = axes.find(a => a.id === loc.id);
          const hasError = axisData?.errorId !== 0;

          return (
            <div 
              key={loc.id}
              className="absolute transition-all duration-500"
              style={{ top: loc.top, left: loc.left }}
            >
              <div className="flex flex-col items-center">
                {/* Status LED */}
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  hasError ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'
                }`} />
                
                {/* Label */}
                <div className="mt-1 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-slate-700 rounded text-[10px] font-bold text-white">
                  {loc.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Info Box */}
      <div className="absolute bottom-4 right-4 p-3 bg-slate-900/90 border border-cnc-border rounded shadow-xl pointer-events-none">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Machine Health</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[9px] text-slate-300">SYSTEM NOMINAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] text-slate-300">AXIS FAULT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineModelView;