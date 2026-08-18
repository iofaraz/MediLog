import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Phone, MapPin, User as UserIcon, Activity, FileText, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VisitForm from '../components/visits/VisitForm';

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
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const patientRes = await window.api.patient.getById(id);
      if (patientRes.success && patientRes.data) {
        setPatient(patientRes.data);
      }

      const visitsRes = await window.api.visit.getByPatient(id);
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
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '24px' }}
      >
        <ArrowLeft size={18} />
        Back to Patients
      </button>

      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          <UserIcon size={48} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {patient.firstName} {patient.lastName}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '8px 0 0 0' }}>
                {calculateAge(patient.dob)} years old • {patient.gender}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsVisitFormOpen(true)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Plus size={18} />
                New Visit
              </button>
            </div>
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

      {/* Content Tabs / History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <Activity size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Visit History</h2>
          </div>

          {visits.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              No previous visits found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {visits.map((visit) => (
                <div key={visit.id} style={{ padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      {new Date(visit.date).toLocaleDateString()} at {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                      Dr. {visit.doctorName}
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
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                      {visit.notes}
                    </div>
                  )}

                  {visit.prescriptions && visit.prescriptions.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <FileText size={16} /> Prescriptions
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {visit.prescriptions.map((px: any) => (
                          <div key={px.id} style={{ padding: '6px 12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
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

      {isVisitFormOpen && id && user && (
        <VisitForm
          patientId={id}
          doctorId={user.id}
          onClose={() => setIsVisitFormOpen(false)}
          onSave={() => fetchProfile()}
        />
      )}
    </div>
  );
};

export default PatientProfile;
