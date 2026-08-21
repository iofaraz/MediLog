import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema } from '../../../shared/schemas';
import type { PatientFormData } from '../../../shared/schemas';
import { X, Save } from 'lucide-react';

interface PatientFormProps {
  initialData?: any;
  onClose: () => void;
  onSave: (data: PatientFormData) => Promise<void>;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData ? {
      ...initialData,
      dob: new Date(initialData.dob).toISOString().slice(0, 10) as any,
    } : {
      firstName: '',
      lastName: '',
      gender: 'Male',
      contactNumber: '',
      address: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    await onSave(data);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px'
    }}>
      <div style={{
        width: 'min(560px, 100%)', maxHeight: '90vh', overflowY: 'auto',
        background: '#fff', color: '#0f172a', borderRadius: '16px',
        border: '1px solid #e2e8f0', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
            {initialData ? 'Edit Patient' : 'New Patient'}
          </h2>
          <button type="button" onClick={onClose} style={{ color: '#334155', cursor: 'pointer', width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: 600 }}>First Name *</label>
              <input
                {...register('firstName')}
                style={{ width: '100%', minHeight: 44, padding: '10px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a' }}
              />
              {errors.firstName && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.firstName.message}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: 600 }}>Last Name *</label>
              <input
                {...register('lastName')}
                style={{ width: '100%', minHeight: 44, padding: '10px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a' }}
              />
              {errors.lastName && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: 600 }}>Date of Birth *</label>
              <input
                type="date"
                {...register('dob')}
                style={{ width: '100%', minHeight: 44, padding: '10px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a' }}
              />
              {errors.dob && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.dob.message}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: 600 }}>Gender *</label>
              <select
                {...register('gender')}
                style={{ width: '100%', minHeight: 44, padding: '10px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.gender.message}</span>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: 600 }}>Contact Number</label>
            <input
              {...register('contactNumber')}
              style={{ width: '100%', minHeight: 44, padding: '10px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: 600 }}>Address</label>
            <textarea
              {...register('address')}
              rows={3}
              style={{ width: '100%', padding: '12px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ minHeight: 44, padding: '0 16px', borderRadius: '12px', background: '#fff', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ minHeight: 44, padding: '0 18px', borderRadius: '12px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, opacity: isSubmitting ? 0.75 : 1 }}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
