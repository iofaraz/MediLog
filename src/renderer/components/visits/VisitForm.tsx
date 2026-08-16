import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';

interface VisitFormData {
  date: string;
  reason: string;
  diagnosis: string;
  notes: string;
}

interface VisitFormProps {
  patientId: string;
  doctorId: string;
  initialData?: any;
  onClose: () => void;
  onSave: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ patientId, doctorId, initialData, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormData>({
    defaultValues: initialData ? {
      date: new Date(initialData.date).toISOString().slice(0, 16),
      reason: initialData.reason || '',
      diagnosis: initialData.diagnosis || '',
      notes: initialData.notes || '',
    } : {
      date: new Date().toISOString().slice(0, 16),
      reason: '',
      diagnosis: '',
      notes: '',
    },
  });

  const onSubmit = async (data: VisitFormData) => {
    try {
      let result;
      if (initialData) {
        result = await window.api.visit.update(initialData.id, {
          reason: data.reason,
          diagnosis: data.diagnosis,
          notes: data.notes,
        });
      } else {
        result = await window.api.visit.create({
          patientId,
          doctorId,
          date: data.date,
          reason: data.reason,
          diagnosis: data.diagnosis,
          notes: data.notes,
        });
      }

      if (result.success) {
        onSave();
        onClose();
      } else {
        alert(result.error || 'Failed to save visit');
      }
    } catch (err) {
      console.error('Error saving visit:', err);
      alert('An unexpected error occurred');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 17, 23, 0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel" style={{
        width: '560px', padding: '32px', borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            {initialData ? 'Edit Visit' : 'New Visit'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date & Time *</label>
            <input
              type="datetime-local"
              {...register('date', { required: 'Date is required' })}
              disabled={!!initialData}
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', colorScheme: 'dark' }}
            />
            {errors.date && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.date.message}</span>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reason for Visit</label>
            <input
              {...register('reason')}
              placeholder="e.g. Routine checkup, Fever, Follow-up"
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Diagnosis</label>
            <input
              {...register('diagnosis')}
              placeholder="e.g. Upper respiratory infection"
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Clinical Notes</label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Detailed clinical observations, symptoms, examination findings..."
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? 'Saving...' : 'Save Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitForm;
