import React, { useEffect, useState, useCallback } from 'react';
import { Pill, Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { SkeletonRow } from '../components/ui/Skeleton';

interface Medication {
  id: string;
  name: string;
  description?: string;
  defaultDosage?: string;
}

interface MedicationFormData {
  name: string;
  description: string;
  defaultDosage: string;
}

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MedicationFormData>();

  const fetchMedications = useCallback(async () => {
    setIsLoading(true);
    const result = await window.api.medication.getAll(searchQuery);
    if (result.success && result.data) {
      setMedications(result.data);
    }
    setIsLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedications();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMedications, searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormOpen) {
        handleCloseForm();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setEditingMed(undefined);
        setIsFormOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen]);

  const handleOpenForm = (med?: Medication) => {
    setEditingMed(med);
    if (med) {
      reset({
        name: med.name,
        description: med.description || '',
        defaultDosage: med.defaultDosage || '',
      });
    } else {
      reset({ name: '', description: '', defaultDosage: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMed(undefined);
  };

  const onSubmit = async (data: MedicationFormData) => {
    let result;
    if (editingMed) {
      result = await window.api.medication.update(editingMed.id, data);
    } else {
      result = await window.api.medication.create(data);
    }

    if (result.success) {
      toast.success(editingMed ? 'Medication updated' : 'Medication added');
      handleCloseForm();
      fetchMedications();
    } else {
      toast.error(result.error || 'Failed to save medication');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      const result = await window.api.medication.delete(id);
      if (result.success) {
        toast.success('Medication deleted');
        fetchMedications();
      } else {
        toast.error(result.error || 'Failed to delete medication');
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-secondary)' }}>
            <Pill size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Medications</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>Manage the clinic's medication catalog</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          style={{
            padding: '12px 24px',
            background: 'var(--accent-secondary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Add Medication
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                background: 'rgba(15, 17, 23, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Medication Name</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Description</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Default Dosage</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 0 }}>
                    <SkeletonRow count={5} />
                  </td>
                </tr>
              ) : medications.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px' }}>
                    <Pill size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No medications found</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {searchQuery ? 'Try adjusting your search filters' : 'Add a medication to your clinic inventory'}
                    </p>
                  </td>
                </tr>
              ) : (
                medications.map((med) => (
                  <tr key={med.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 150ms ease' }} className="hover-row">
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {med.name}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {med.description || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {med.defaultDosage || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenForm(med)}
                        style={{ padding: '8px', color: 'var(--accent-primary)', marginRight: '8px', borderRadius: 'var(--radius-sm)', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        style={{ padding: '8px', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', background: 'none', border: 'none', cursor: 'pointer' }}
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 17, 23, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{
            width: '500px', padding: '32px', borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                {editingMed ? 'Edit Medication' : 'New Medication'}
              </h2>
              <button onClick={handleCloseForm} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Medication Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
                />
                {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.name.message}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Default Dosage</label>
                <input
                  {...register('defaultDosage')}
                  placeholder="e.g. 500mg once daily"
                  style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description / Notes</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
                >
                  <Save size={18} />
                  {isSubmitting ? 'Saving...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};

export default Medications;
