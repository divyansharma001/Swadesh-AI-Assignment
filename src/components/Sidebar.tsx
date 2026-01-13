import { LayoutDashboard, Users, BadgeDollarSign, CheckSquare, RefreshCw } from 'lucide-react';
import { SidebarItem } from './SidebarItem';

export const Sidebar = ({ activeTab, setActiveTab, onClearAll }: { activeTab: 'overview' | 'contacts' | 'opportunities' | 'tasks'; setActiveTab: (tab: 'overview' | 'contacts' | 'opportunities' | 'tasks') => void; onClearAll: () => void }) => {
  return (
    <div className="w-36 bg-black border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="h-16 px-3 flex items-center justify-center border-b border-white/10">
        <h1 className="text-white font-bold text-14 text-center">Close Extractor</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Overview" 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
        />
        <SidebarItem 
          icon={Users} 
          label="Contacts" 
          active={activeTab === 'contacts'} 
          onClick={() => setActiveTab('contacts')} 
        />
        <SidebarItem 
          icon={BadgeDollarSign} 
          label="Opportunities" 
          active={activeTab === 'opportunities'} 
          onClick={() => setActiveTab('opportunities')} 
        />
        <SidebarItem 
          icon={CheckSquare} 
          label="Tasks" 
          active={activeTab === 'tasks'} 
          onClick={() => setActiveTab('tasks')} 
        />
      </nav>

      {/* Footer - Clear All Button */}
      <div className="px-2 py-3 border-t border-white/10">
        <button 
          onClick={onClearAll} 
          className="w-full px-3 py-2 text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={12} />
          Clear All
        </button>
      </div>
    </div>
  );
};
