import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Phone, MapPin, User as UserIcon, Activity, FileText, Plus } from 'lucide-react';
import VisitForm from '../components/visits/VisitForm';
import { unwrapIpcResult } from '../lib/ipc';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactNumber?: string;
  address?: string;
}

interface Visit {
  id: string;
  date: string;
  reason: string;
  diagnosis?: string;
  notes?: string;
  doctorName?: string;
  prescriptions: any[];
}

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const patientRes = unwrapIpcResult<Patient>(await window.api.patient.getById(id));
      if (patientRes.success && patientRes.data) {
        setPatient(patientRes.data);
      }

      const visitsRes = unwrapIpcResult<Visit[]>(await window.api.visit.getByPatient(id));
      if (visitsRes.success && visitsRes.data) {
        setVisits(visitsRes.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Loading profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Patient not found.
        <br />
        <button onClick={() => navigate('/patients')} style={{ marginTop: '16px', color: 'var(--accent-primary)', background: 'none' }}>
          Return to Patients
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <button
        onClick={() => navigate('/patients')}
        className="btn btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
      >
        <ArrowLeft size={18} />
        Back to Patients
      </button>

      <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'flex-start', background: '#ffffff' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0, border: '1px solid #dbeafe' }}>
          <UserIcon size={48} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {patient.firstName} {patient.lastName}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '8px 0 0 0' }}>
                {calculateAge(patient.dob)} years old • {patient.gender}
              </p>
            </div>

            <button
              onClick={() => setIsVisitFormOpen(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'none' }}
            >
              <Plus size={18} />
              Add Visit
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <Calendar size={18} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Date of Birth</div>
                <div>{new Date(patient.dob).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <Phone size={18} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Contact Number</div>
                <div>{patient.contactNumber || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <MapPin size={18} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Address</div>
                <div>{patient.address || 'Not provided'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <Activity size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Visit History</h2>
          </div>

          {visits.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', background: '#f8fafc' }}>
              <div>No previous visits found.</div>
              <button
                onClick={() => setIsVisitFormOpen(true)}
                className="btn btn-primary"
                style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'none' }}
              >
                <Plus size={16} />
                Add Visit
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {visits.map((visit) => (
                <div key={visit.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      {new Date(visit.date).toLocaleDateString()} at {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                      Clinician: {visit.doctorName || 'Primary Clinician'}
                    </div>
                  </div>

                  {visit.reason && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginRight: '8px' }}>Reason:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{visit.reason}</span>
                    </div>
                  )}

                  {visit.diagnosis && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginRight: '8px' }}>Diagnosis:</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{visit.diagnosis}</span>
                    </div>
                  )}

                  {visit.notes && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
                      {visit.notes}
                    </div>
                  )}

                  {visit.prescriptions && visit.prescriptions.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <FileText size={16} /> Prescriptions
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {visit.prescriptions.map((px: any) => (
                          <div key={px.id} style={{ padding: '6px 12px', background: '#fffbeb', color: '#b45309', borderRadius: '9999px', fontSize: '0.85rem', border: '1px solid #fde68a' }}>
                            <span style={{ fontWeight: 600 }}>{px.medicationName}</span>: {px.dosage} ({px.frequency} for {px.duration})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isVisitFormOpen && id && (
        <VisitForm
          patientId={id}
          onClose={() => setIsVisitFormOpen(false)}
          onSave={(visit) => {
            if (visit) {
              setVisits((current) => [visit, ...current.filter((item) => item.id !== visit.id)]);
            } else {
              fetchProfile();
            }
          }}
        />
      )}
    </div>
  );
};

export default PatientProfile;
