import { Trash2 } from 'lucide-react';

export const TableRow = ({ avatar, title, subtitle, col2, col3, col4, onDelete }: any) => (
  <div className="group grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
    {/* Col 1: Name & Avatar (Span 4) */}
    <div className="col-span-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {avatar || title.charAt(0)}
      </div>
      <div className="min-w-0">
        <h4 className="text-[13px] font-semibold text-white truncate">{title}</h4>
        <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
    
    {/* Col 2: Property/Detail (Span 3) */}
    <div className="col-span-3 text-[12px] text-gray-300 font-medium truncate">
      {col2}
    </div>

    {/* Col 3: Stage/Badge (Span 3) */}
    <div className="col-span-3">
      <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-white/10 text-white">
        {col3}
      </span>
    </div>

    {/* Col 4: Value/Action (Span 2) */}
    <div className="col-span-2 text-right flex items-center justify-end gap-2">
      <span className="text-[12px] font-semibold text-white">{col4}</span>
      <button 
        onClick={onDelete} 
        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-white transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);
