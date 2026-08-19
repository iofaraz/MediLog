import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VisitFormData {
  date: string;
  reason: string;
  diagnosis: string;
  notes: string;
}

interface PrescriptionData {
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  defaultDosage?: string;
}

interface VisitFormProps {
  patientId: string;
  doctorId: string;
  initialData?: any;
  onClose: () => void;
  onSave: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ patientId, doctorId, initialData, onClose, onSave }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);

  useEffect(() => {
    // Load medications list
    window.api.medication.getAll().then((res: any) => {
      if (res.success && res.data) {
        setMedications(res.data);
      }
    });

    if (initialData && initialData.prescriptions) {
      setPrescriptions(initialData.prescriptions.map((p: any) => ({
        medicationId: p.medicationId,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        notes: p.notes || ''
      })));
    }
  }, [initialData]);

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
      let visitId = initialData?.id;
      let result;
      
      if (initialData) {
        result = await window.api.visit.update(visitId, {
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
        visitId = result.data?.id;
      }

      if (result.success && visitId) {
        if (!initialData && prescriptions.length > 0) {
          for (const px of prescriptions) {
            if (px.medicationId) {
              await window.api.prescription.create({
                visitId,
                ...px
              });
            }
          }
        }
        toast.success(initialData ? 'Visit updated successfully' : 'Visit created successfully');
        onSave();
        onClose();
      } else {
        toast.error(result.error || 'Failed to save visit');
      }
    } catch (err) {
      console.error('Error saving visit:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medicationId: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof PrescriptionData, value: string) => {
    const newPx = [...prescriptions];
    newPx[index] = { ...newPx[index], [field]: value };
    if (field === 'medicationId') {
      const med = medications.find(m => m.id === value);
      if (med && med.defaultDosage && !newPx[index].dosage) {
        newPx[index].dosage = med.defaultDosage;
      }
    }
    setPrescriptions(newPx);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 17, 23, 0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel" style={{
        width: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: 'var(--radius-lg)',
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                placeholder="e.g. Routine checkup"
                style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }}
              />
            </div>
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
              rows={3}
              placeholder="Detailed clinical observations, symptoms, examination findings..."
              style={{ width: '100%', padding: '10px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'none' }}
            />
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Prescriptions</h3>
              {!initialData && (
                <button
                  type="button"
                  onClick={addPrescription}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <Plus size={16} /> Add Medication
                </button>
              )}
            </div>

            {initialData && prescriptions.length > 0 && (
              <p style={{ color: 'var(--warning)', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                Note: Prescriptions cannot be edited after the visit is saved to preserve medical history.
              </p>
            )}

            {prescriptions.map((px, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ flex: 1.5 }}>
                  <select
                    value={px.medicationId}
                    onChange={(e) => updatePrescription(index, 'medicationId', e.target.value)}
                    disabled={!!initialData}
                    style={{ width: '100%', padding: '8px', background: 'rgba(15,17,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  >
                    <option value="">Select Medication...</option>
                    {medications.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    placeholder="Dosage"
                    value={px.dosage}
                    disabled={!!initialData}
                    onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'rgba(15,17,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    placeholder="Frequency"
                    value={px.frequency}
                    disabled={!!initialData}
                    onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'rgba(15,17,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    placeholder="Duration"
                    value={px.duration}
                    disabled={!!initialData}
                    onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'rgba(15,17,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
                {!initialData && (
                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    style={{ padding: '8px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {prescriptions.length === 0 && !initialData && (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                No prescriptions added to this visit.
              </div>
            )}
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

