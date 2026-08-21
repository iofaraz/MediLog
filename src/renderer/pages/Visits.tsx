import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, User, Stethoscope, Filter, Eye, Download, Plus, PencilLine, Ban } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { SkeletonRow } from '../components/ui/Skeleton';
import VisitForm from '../components/visits/VisitForm';
import { unwrapIpcResult } from '../lib/ipc';

interface Visit {
  id: string;
  patientId: string;
  date: Date | string;
  reason: string | null;
  notes?: string | null;
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
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>(undefined);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const visitsResult = await window.api.visit.getAll();

      const normalizedVisits = unwrapIpcResult<Visit[]>(visitsResult);
      if (normalizedVisits.success && normalizedVisits.data) {
        setVisits(normalizedVisits.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const openCreateVisit = () => {
    setEditingVisit(undefined);
    setIsVisitFormOpen(true);
  };

  const handleSavedVisit = (visit?: Visit) => {
    if (visit) {
      setVisits((current) => {
        const next = current.filter((item) => item.id !== visit.id);
        return [visit, ...next];
      });
      return;
    }

    fetchVisits();
  };

  const handleVoidVisit = async (visit: Visit) => {
    const result = unwrapIpcResult<Visit>(await window.api.visit.void(visit.id));
    if (!result.success) {
      toast.error(result.error || 'Failed to void visit');
      return;
    }

    setVisits((current) => current.map((item) => (item.id === visit.id ? { ...item, isVoided: true } : item)));
    toast.success('Visit voided successfully');
  };

  const filtered = useMemo(() => {
    return visits.filter((visit) => {
      if (!showVoided && visit.isVoided) return false;

      const patientName = `${visit.patientFirstName ?? ''} ${visit.patientLastName ?? ''}`.toLowerCase();
      const doctor = (visit.doctorName ?? '').toLowerCase();
      const reason = (visit.reason ?? '').toLowerCase();
      const diagnosis = (visit.diagnosis ?? '').toLowerCase();
      const query = searchQuery.toLowerCase();

      if (query && !patientName.includes(query) && !doctor.includes(query) && !reason.includes(query) && !diagnosis.includes(query)) {
        return false;
      }

      const visitDate = new Date(visit.date);
      if (dateFrom && visitDate < new Date(dateFrom)) return false;
      if (dateTo && visitDate > new Date(`${dateTo}T23:59:59`)) return false;

      return true;
    });
  }, [dateFrom, dateTo, searchQuery, showVoided, visits]);

  return (
    <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar color="var(--accent-primary)" size={32} />
            Visits
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} visit{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={openCreateVisit}
            style={{
              minHeight: 44,
              padding: '0 18px',
              borderRadius: 12,
              border: '1px solid #1d4ed8',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Plus size={18} />
            Add Visit
          </button>
          <button
            onClick={async () => {
              const result = await window.api.export.visits();
              const normalized = unwrapIpcResult(result);
              if (normalized.success) {
                toast.success('Visits exported successfully');
              } else if (normalized.error !== 'Export cancelled.') {
                toast.error(normalized.error || 'Failed to export visits');
              }
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search patient, clinician, reason..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={showVoided}
            onChange={(e) => setShowVoided(e.target.checked)}
            style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
          />
          Show voided
        </label>

        {(searchQuery || dateFrom || dateTo || showVoided) && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            onClick={() => {
              setSearchQuery('');
              setDateFrom('');
              setDateTo('');
              setShowVoided(false);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Patient</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Clinician</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Reason</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Diagnosis</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <SkeletonRow count={5} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}>
                    <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No visits found</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {searchQuery || dateFrom || dateTo ? 'Try adjusting your filters' : 'Create a visit to start building the history'}
                    </p>
                    <button
                      onClick={openCreateVisit}
                      style={{
                        marginTop: 16,
                        minHeight: 42,
                        padding: '0 16px',
                        borderRadius: 12,
                        border: '1px solid #1d4ed8',
                        background: '#2563eb',
                        color: '#fff',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Plus size={16} />
                      Add Visit
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((visit) => (
                  <tr
                    key={visit.id}
                    className="table-row-hover"
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      opacity: visit.isVoided ? 0.6 : 1,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={18} color="#2563eb" />
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/patients/${visit.patientId}`)}
                          style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'left', background: 'none', padding: 0 }}
                        >
                          {visit.patientFirstName} {visit.patientLastName}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {format(new Date(visit.date), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Stethoscope size={14} color="var(--accent-primary)" />
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
                        <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                          Voided
                        </span>
                      ) : (
                        <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
                          Active
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn-icon"
                          title="View Patient Profile"
                          onClick={() => navigate(`/patients/${visit.patientId}`)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Visit"
                          onClick={() => {
                            setEditingVisit(visit);
                            setIsVisitFormOpen(true);
                          }}
                        >
                          <PencilLine size={18} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Void Visit"
                          onClick={() => handleVoidVisit(visit)}
                          disabled={visit.isVoided}
                        >
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isVisitFormOpen && (
        <VisitForm
          initialData={editingVisit}
          onClose={() => {
            setIsVisitFormOpen(false);
            setEditingVisit(undefined);
          }}
          onSave={handleSavedVisit}
        />
      )}

      <style>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};

export default Visits;
