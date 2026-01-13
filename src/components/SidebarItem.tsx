export const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-4 py-2 text-[11px] font-medium transition-all relative ${
      active 
        ? 'text-white bg-white/5 border-l-4 border-white' 
        : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
    }`}
  >
    <Icon size={14} className={active ? 'text-white' : 'text-gray-500'} />
    {label}
  </button>
);
