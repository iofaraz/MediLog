import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, User, Stethoscope, Filter, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Visit {
  id: string;
  patientId: string;
  date: Date;
  reason: string | null;
  diagnosis: string | null;
  isVoided: boolean;
  patientFirstName: string | null;
  patientLastName: string | null;
  doctorName: string | null;
}

const Visits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoided, setShowVoided] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    const result = await window.api.visit.getAll();
    if (result.success && result.data) {
      setVisits(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Client-side filtering
  const filtered = visits.filter((v) => {
    if (!showVoided && v.isVoided) return false;

    const patientName = `${v.patientFirstName ?? ''} ${v.patientLastName ?? ''}`.toLowerCase();
    const doctor = (v.doctorName ?? '').toLowerCase();
    const reason = (v.reason ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();

    if (q && !patientName.includes(q) && !doctor.includes(q) && !reason.includes(q)) {
      return false;
    }

    const visitDate = new Date(v.date);
    if (dateFrom && visitDate < new Date(dateFrom)) return false;
    if (dateTo && visitDate > new Date(dateTo + 'T23:59:59')) return false;

    return true;
  });

  return (
    <div className="page-container" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar color="var(--primary-color)" size={32} />
            All Visits
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} visit{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={async () => {
            const result = await window.api.export.visits();
            if (!result.success && result.error !== 'Export cancelled.') {
              alert(result.error || 'Failed to export visits');
            }
          }}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search patient, doctor, reason..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Date From */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-tertiary)" />
          <input
            type="date"
            className="form-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ width: '160px' }}
            title="From date"
          />
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>to</span>
          <input
            type="date"
            className="form-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ width: '160px' }}
            title="To date"
          />
        </div>

        {/* Show Voided toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={showVoided}
            onChange={(e) => setShowVoided(e.target.checked)}
            style={{ accentColor: 'var(--primary-color)', width: '16px', height: '16px' }}
          />
          Show voided
        </label>

        {/* Clear filters */}
        {(searchQuery || dateFrom || dateTo || showVoided) && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); setShowVoided(false); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Patient</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Doctor</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Reason</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Diagnosis</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    Loading visits...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}>
                    <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No visits found</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {searchQuery || dateFrom || dateTo ? 'Try adjusting your filters' : 'Visits will appear here once created from a patient profile'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((visit) => (
                  <tr
                    key={visit.id}
                    className="table-row-hover"
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      opacity: visit.isVoided ? 0.5 : 1,
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={18} color="#6366f1" />
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {visit.patientFirstName} {visit.patientLastName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {format(new Date(visit.date), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Stethoscope size={14} color="var(--primary-color)" />
                        {visit.doctorName ?? '—'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.reason ?? <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.diagnosis ?? <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {visit.isVoided ? (
                        <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Voided</span>
                      ) : (
                        <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>Active</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        className="btn-icon"
                        title="View Patient Profile"
                        onClick={() => navigate(`/patients/${visit.patientId}`)}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
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

export default Visits;
