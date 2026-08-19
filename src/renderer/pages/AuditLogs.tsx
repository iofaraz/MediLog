import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { SkeletonRow } from '../components/ui/Skeleton';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  timestamp: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const result = await window.api.audit.getLogs({
      entityType: entityTypeFilter || undefined,
    });
    
    if (result.success && result.data) {
      let filteredLogs = result.data;
      if (actionFilter) {
        filteredLogs = filteredLogs.filter((log: AuditLog) => log.action === actionFilter);
      }
      setLogs(filteredLogs);
    }
    setIsLoading(false);
  }, [entityTypeFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="page-container" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity color="var(--primary-color)" size={32} />
            Audit Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>System activity and security trail</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              background: 'rgba(15, 17, 23, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="">All Entities</option>
            <option value="PATIENT">Patient</option>
            <option value="VISIT">Visit</option>
            <option value="MEDICATION">Medication</option>
            <option value="PRESCRIPTION">Prescription</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              background: 'rgba(15, 17, 23, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Timestamp</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Action</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Entity Type</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <SkeletonRow count={5} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px' }}>
                    <Shield size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No audit logs found</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      Try adjusting your search filters or date range
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }} className="table-row-hover">
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {format(new Date(log.timestamp), 'PPpp')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: log.action === 'CREATE' ? 'rgba(16, 185, 129, 0.15)' :
                                    log.action === 'DELETE' ? 'rgba(239, 68, 68, 0.15)' :
                                    log.action === 'UPDATE' ? 'rgba(245, 158, 11, 0.15)' :
                                    'rgba(59, 130, 246, 0.15)',
                        color: log.action === 'CREATE' ? '#34d399' :
                               log.action === 'DELETE' ? '#f87171' :
                               log.action === 'UPDATE' ? '#fbbf24' :
                               '#60a5fa'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)' }}>{log.entityType}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
