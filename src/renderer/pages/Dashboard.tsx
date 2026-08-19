import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Calendar, Pill, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Metrics {
  totalPatients: number;
  totalVisits: number;
  totalMedications: number;
  demographics: { name: string; value: number }[];
  visitsByDate: { date: string; visits: number }[];
  recentActivity: any[];
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <div className="glass-panel" style={{
    padding: '24px', borderRadius: 'var(--radius-lg)',
    display: 'flex', alignItems: 'center', gap: '20px',
    borderLeft: `3px solid ${color}`
  }}>
    <div style={{ width: 52, height: 52, borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={26} color={color} />
    </div>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const result = await window.api.analytics.getDashboard();
      if (result.success && result.data) {
        setMetrics(result.data);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading dashboard...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard icon={Users} label="Total Patients" value={metrics.totalPatients} color="#6366f1" />
        <StatCard icon={Calendar} label="Total Visits" value={metrics.totalVisits} color="#10b981" />
        <StatCard icon={Pill} label="Medications" value={metrics.totalMedications} color="#f59e0b" />
      </div>

      {/* Visits Area Chart */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={22} color="#6366f1" />
          Visits — Last 14 Days
        </h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '24px' }}>Daily visit count across the clinic</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={metrics.visitsByDate} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={2} fill="url(#visitGradient)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Lower row: Demographics + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>

        {/* Demographics Pie Chart */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} color="#10b981" />
            Patient Demographics
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '16px' }}>Distribution by gender</p>
          {metrics.demographics.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No patient data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={metrics.demographics} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {metrics.demographics.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.85rem', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="#f59e0b" />
            Recent Activity
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '20px' }}>Latest 5 system events</p>
          {metrics.recentActivity.length === 0 ? (
            <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No activity yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics.recentActivity.map((log) => {
                const actionColors: Record<string, string> = {
                  CREATE: '#10b981', UPDATE: '#6366f1', DELETE: '#ef4444',
                  LOGIN: '#f59e0b', DEFAULT: '#64748b'
                };
                const color = actionColors[log.action] ?? actionColors.DEFAULT;
                return (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600, background: `${color}20`, color, flexShrink: 0 }}>
                      {log.action}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || `${log.entityType} ${log.entityId}`}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', flexShrink: 0 }}>
                      {format(new Date(log.timestamp), 'HH:mm')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
