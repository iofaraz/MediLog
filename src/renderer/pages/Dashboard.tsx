import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CalendarDays, Clock, Activity } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  todayVisits: number;
  pendingFollowUps: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayVisits: 0,
    pendingFollowUps: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!window.api?.dashboard?.getStats) {
        setError('Dashboard API not available.');
        setIsLoading(false);
        return;
      }

      try {
        const result = await window.api.dashboard.getStats();
        if (result.success && result.stats) {
          setStats(result.stats);
        } else {
          setError(result.error || 'Failed to load stats');
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('An unexpected error occurred while loading dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Welcome back, {user?.name || 'Doctor'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Here's what's happening at the clinic today.
          </p>
        </div>
        <div style={{ 
          padding: '12px', 
          background: 'var(--accent-glow)', 
          borderRadius: 'var(--radius-full)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <Activity size={20} />
          <span>System Online</span>
        </div>
      </div>
      
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--danger)',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', gap: '24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel" style={{ flex: 1, height: '140px', borderRadius: 'var(--radius-lg)', animation: 'pulse 2s infinite ease-in-out' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, transform: 'scale(2)' }}>
              <Users size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                <Users size={24} />
              </div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Total Patients</h3>
            </div>
            <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {stats.totalPatients}
            </p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, transform: 'scale(2)' }}>
              <CalendarDays size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
                <CalendarDays size={24} />
              </div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Today's Visits</h3>
            </div>
            <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {stats.todayVisits}
            </p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, transform: 'scale(2)' }}>
              <Clock size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Pending Follow-ups</h3>
            </div>
            <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {stats.pendingFollowUps}
            </p>
          </div>

        </div>
      )}

      {/* Add a keyframes style block for the pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
