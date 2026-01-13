import { Search, Download, Clock, FileJson, FileText } from 'lucide-react';
import type { StorageShape } from '../types/schema';
import { exportAsJSON, exportAsCSV } from '../utils/export';

export const Header = ({ search, setSearch, onExtract, loading, lastSync, data }: { search: string; setSearch: (value: string) => void; onExtract: () => void; loading: boolean; lastSync?: number; data?: StorageShape }) => {
  const formatLastSync = (timestamp: number | undefined) => {
    if (!timestamp || timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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

      {/* Last Sync Display */}
      <div className="mx-4 flex items-center gap-2 text-[11px] text-gray-400">
        <Clock size={14} />
        <span>Synced {formatLastSync(lastSync)}</span>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 mr-4">
        <button 
          onClick={() => data && exportAsJSON(data)}
          disabled={!data || Object.keys(data.contacts).length === 0}
          title="Export as JSON"
          className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FileJson size={16} />
        </button>
        <button 
          onClick={() => data && exportAsCSV(data)}
          disabled={!data || Object.keys(data.contacts).length === 0}
          title="Export as CSV"
          className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FileText size={16} />
        </button>
      </div>

      {/* Add Lead Button */}
      <button 
        onClick={onExtract} 
        disabled={loading} 
        className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        <Download size={16} />
        {loading ? 'Extracting...' : 'Add Lead'}
      </button>
    </div>
  );
};
