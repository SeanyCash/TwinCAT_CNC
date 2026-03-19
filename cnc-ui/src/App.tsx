import React, { useState } from 'react';
import MainView from './views/MainView';
import StatusView from './views/StatusView';
import EventsView from './views/EventsView';
import OffsetsView from './views/OffsetsView';
import DiagnosticsView from './views/DiagnosticsView';
import ControlHeader from './components/ControlHeader';
import Sidebar from './components/Sidebar';
import StateDiagrams from './views/StateDiagrams';
import type { TabID } from './types/tabs';
import { usePlcBridge } from './hooks/usePlcBridge';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabID>('MAIN');
  const { snapshot, liveData, connection, writeFields, pulseField } = usePlcBridge();

  const renderView = () => {
    switch (activeTab) {
      case 'MAIN':        
        return (
          <MainView
            currentPos={liveData.currentPos}
            hmiIn={snapshot.hmiIn}
            hmiOut={snapshot.hmiOut}
            writeFields={writeFields}
            pulseField={pulseField}
          />
        );
      case 'STATUS':      
        return <StatusView axes={liveData.axes} />;
      case 'EVENTS':      
        // Events usually need the error logs from the PLC
        return <EventsView />; 
      case 'OFFSETS':     
        // Offsets need currentPos to "Zero" an axis
        return <OffsetsView currentPos={liveData.currentPos} />; 
      case 'DIAGNOSTICS': 
        // Diagnostics often needs the full raw axes data
        return <DiagnosticsView axes={liveData.axes} />;
      case 'STATE_DIAGRAMS': 
        // State diagrams need the state machine data
        return <StateDiagrams hmiOut={snapshot.hmiOut} />;
      default:            
        return (
          <MainView
            currentPos={liveData.currentPos}
            hmiIn={snapshot.hmiIn}
            hmiOut={snapshot.hmiOut}
            writeFields={writeFields}
            pulseField={pulseField}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-cnc-bg flex flex-col p-4 box-border text-cnc-text font-sans">
      {/* 1. Static Top Header (Feedrate, Spindle Speed, E-Stop Status) */}
      <ControlHeader
        connection={connection}
        hmiOut={snapshot.hmiOut}
        pulseField={pulseField}
      />

      <div className="flex flex-1 overflow-hidden mt-4 gap-4">
        {/* 2. Side Navigation (Uses cnc-theme for icons/buttons) */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 3. Main Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden rounded-lg border border-cnc-border bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black shadow-2xl">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
