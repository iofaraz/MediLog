import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, User as UserIcon, Calendar, Edit2, Trash2, Download } from 'lucide-react';
import PatientForm from '../components/patients/PatientForm';
import toast from 'react-hot-toast';
import { SkeletonRow } from '../components/ui/Skeleton';
import type { PatientFormData } from '../../shared/schemas';
import { unwrapIpcResult } from '../lib/ipc';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactNumber?: string;
}

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState('All');

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    const result = unwrapIpcResult<Patient[]>(await window.api.patient.getAll({ searchQuery, gender: genderFilter }));
    if (result.success && result.data) {
      setPatients(result.data);
    }
    setIsLoading(false);
  }, [searchQuery, genderFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPatients, searchQuery, genderFilter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormOpen) {
        setIsFormOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setEditingPatient(undefined);
        setIsFormOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen]);

  const handleSavePatient = async (data: PatientFormData) => {
    const response = editingPatient
      ? await window.api.patient.update(editingPatient.id, data)
      : await window.api.patient.create(data);
    const result = unwrapIpcResult<Patient>(response);

    if (result.success) {
      const savedPatient = result.data;

      if (savedPatient) {
        setPatients((current) => {
          const next = current.filter((patient) => patient.id !== savedPatient.id);
          const indexed = [savedPatient, ...next];
          return indexed.sort((a, b) => {
            const left = new Date((b as any).updatedAt ?? (b as any).createdAt ?? 0).getTime();
            const right = new Date((a as any).updatedAt ?? (a as any).createdAt ?? 0).getTime();
            return left - right;
          });
        });
      }

      fetchPatients();

      toast.success(editingPatient ? 'Patient updated successfully' : 'Patient added successfully');
      setIsFormOpen(false);
      setEditingPatient(undefined);
    } else {
      toast.error(result.error || 'Failed to save patient');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      const result = await window.api.patient.delete(id);
      const normalized = unwrapIpcResult(result);
      if (normalized.success) {
        toast.success('Patient deleted successfully');
        setPatients((current) => current.filter((patient) => patient.id !== id));
      } else {
        toast.error(normalized.error || 'Failed to delete patient');
      }
    }
  };

  const handleExportCSV = async () => {
    const result = await window.api.export.patients();
    if (result.success) {
      toast.success('Patients exported successfully');
    } else if (result.error !== 'Export cancelled.') {
      toast.error(result.error || 'Failed to export patients');
    }
  };

  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
            <Users size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Patients</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>Manage patient records and details</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingPatient(undefined);
              setIsFormOpen(true);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'none' }}
          >
            <Plus size={20} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="form-input"
            style={{ width: '180px' }}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Patient Name</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Age / Gender</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Contact</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 0 }}>
                    <SkeletonRow count={5} />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px' }}>
                    <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No patients found</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {searchQuery ? 'Try adjusting your search filters' : 'Add your first patient to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 150ms ease' }} className="hover-row">
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => navigate(`/patients/${patient.id}`)}>{patient.firstName} {patient.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ID: {patient.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {calculateAge(patient.dob)} yrs • {patient.gender}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(patient.dob).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {patient.contactNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingPatient(patient);
                          setIsFormOpen(true);
                        }}
                        style={{ padding: '8px', color: 'var(--accent-primary)', marginRight: '8px', borderRadius: 'var(--radius-sm)' }}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        style={{ padding: '8px', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <PatientForm
          initialData={editingPatient}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPatient(undefined);
          }}
          onSave={handleSavePatient}
        />
      )}

      <style>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};

export default Patients;
