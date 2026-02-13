import { 
  LayoutDashboard, 
  Activity, 
  List, // Note: Use 'List' or 'ClipboardList'
  Target, 
  Cpu, 
  Settings 
} from 'lucide-react';

type TabID = 'MAIN' | 'STATUS' | 'EVENTS' | 'OFFSETS' | 'DIAGNOSTICS';

interface SidebarProps {
  activeTab: TabID;
  setActiveTab: (tab: TabID) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'MAIN', icon: LayoutDashboard, label: 'Main Control' },
    { id: 'STATUS', icon: Activity, label: 'Machine Status' },
    { id: 'EVENTS', icon: List, label: 'Alarms & Logs' }, // Using 'List-bullet' logic
    { id: 'OFFSETS', icon: Target, label: 'Work Offsets' },
    { id: 'DIAGNOSTICS', icon: Cpu, label: 'ADS Diagnostics' },
  ];

  return (
    <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 shadow-xl">
      {menuItems.map((item) => {
        const Icon = item.icon; // Extract the component
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabID)}
            title={item.label}
            className={`
              relative group p-3 rounded-xl transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)]' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}
            `}
          >
            <Icon size={24} strokeWidth={2} />
            
            {/* Active Indicator Bar */}
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full" />
            )}
            
            {/* Custom Hover Tooltip (optional, browser 'title' also works) */}
            <span className="absolute left-20 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap z-50 border border-slate-700">
              {item.label}
            </span>
          </button>
        );
      })}
      
    </aside>
  );
}