export const StatCard = ({ label, value, subtext, icon: Icon }: { label: string, value: string, subtext: string, icon: any }) => {
  return (
    <div className="bg-black p-3 rounded-lg border border-white/10 flex flex-col justify-between h-24 group hover:border-white/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-1">
        <div className="p-1.5 bg-white/5 text-white rounded text-sm group-hover:bg-white/10 transition-colors duration-300">
          <Icon size={14} />
        </div>
        <span className="text-[9px] font-medium text-white/70 bg-white/5 px-1.5 py-0.25 rounded-full tracking-wide">
          {subtext}
        </span>
      </div>
      
      <div>
        <p className="text-gray-500 text-[9px] font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-white mt-0.5 font-['Poppins']">{value}</p>
      </div>
    </div>
  );
};
