import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from './StatCard';
import { TableRow } from './TableRow';
import { Users, BadgeDollarSign, TrendingUp } from 'lucide-react';

export const Dashboard = ({ data, onDeleteContact }: { data: any[]; onDeleteContact?: (id: string) => void }) => {
  // Calculate metrics
  const totalContacts = data.length;
  const totalValue = data.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
  const conversionRate = data.filter(d => d.stage === 'Won').length / Math.max(totalContacts, 1);

  // Chart data
  const revenueData = [
    { week: 'W1', value: 12000 },
    { week: 'W2', value: 18000 },
    { week: 'W3', value: 15000 },
    { week: 'W4', value: 22000 },
    { week: 'W5', value: 25000 }
  ];

  const stageData = [
    { stage: 'Prospect', count: data.filter(d => d.stage === 'Prospect').length },
    { stage: 'Qualified', count: data.filter(d => d.stage === 'Qualified').length },
    { stage: 'Negotiating', count: data.filter(d => d.stage === 'Negotiating').length },
    { stage: 'Won', count: data.filter(d => d.stage === 'Won').length }
  ];

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          icon={Users} 
          label="Total Contacts" 
          value={totalContacts.toString()} 
          subtext="Active leads" 
        />
        <StatCard 
          icon={BadgeDollarSign} 
          label="Pipeline Value" 
          value={formatter.format(totalValue)} 
          subtext="Total opportunity" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Conversion Rate" 
          value={`${(conversionRate * 100).toFixed(1)}%`} 
          subtext="Win rate" 
        />
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenue Trend */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[12px] font-semibold text-white mb-3">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="rgba(255,255,255,0.8)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Stage */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[12px] font-semibold text-white mb-3">Leads by Stage</h3>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="stage" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="count" fill="rgba(255,255,255,0.6)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-[12px] font-semibold text-white">Recent Leads</h3>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-3">Stage</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[150px] overflow-y-auto">
          {data.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-gray-500">No leads found</div>
          ) : (
            data.slice(0, 5).map(c => (
              <TableRow 
                key={c.id}
                avatar={c.name?.charAt(0) || '?'}
                title={c.name || 'Unknown'}
                subtitle={c.lead || ''}
                col2={c.emails?.[0] || 'No Email'}
                col3={c.stage || 'Prospect'}
                col4={c.value || '--'}
                onDelete={() => onDeleteContact?.(c.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
