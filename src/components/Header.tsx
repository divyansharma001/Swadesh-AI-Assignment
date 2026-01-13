import { Search, Download } from 'lucide-react';

export const Header = ({ search, setSearch, onExtract, loading }: { search: string; setSearch: (value: string) => void; onExtract: () => void; loading: boolean }) => {
  return (
    <div className="h-16 bg-black border-b border-white/10 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex-1 max-w-sm relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Add Lead Button */}
      <button 
        onClick={onExtract} 
        disabled={loading} 
        className="ml-4 px-4 py-2 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        <Download size={16} />
        {loading ? 'Extracting...' : 'Add Lead'}
      </button>
    </div>
  );
};
