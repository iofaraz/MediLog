import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientFormData } from '../../../shared/schemas';
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
      dob: new Date(initialData.dob),
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
            {initialData ? 'Edit Patient' : 'New Patient'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>First Name *</label>
              <input
                {...register('firstName')}
                style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
              />
              {errors.firstName && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.firstName.message}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Last Name *</label>
              <input
                {...register('lastName')}
                style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
              />
              {errors.lastName && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date of Birth *</label>
              <input
                type="date"
                {...register('dob')}
                style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', colorScheme: 'dark' }}
              />
              {errors.dob && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.dob.message}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gender *</label>
              <select
                {...register('gender')}
                style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.gender.message}</span>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact Number</label>
            <input
              {...register('contactNumber')}
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Address</label>
            <textarea
              {...register('address')}
              rows={3}
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
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
