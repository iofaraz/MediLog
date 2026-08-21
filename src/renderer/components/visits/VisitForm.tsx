import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, unwrapIpcResult } from '../../lib/ipc';

interface VisitFormData {
  date: string;
  reason: string;
  diagnosis: string;
  notes: string;
}

interface PrescriptionData {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface VisitFormProps {
  patientId?: string;
  initialData?: any;
  onClose: () => void;
  onSave: (visit?: any) => void;
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '24px',
};

const modalSurface: React.CSSProperties = {
  width: 'min(1040px, 100%)',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#ffffff',
  color: '#0f172a',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)',
};

const blankPrescription = (): PrescriptionData => ({
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
});

const VisitForm: React.FC<VisitFormProps> = ({ patientId, initialData, onClose, onSave }) => {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [clinicianName, setClinicianName] = useState('Primary Clinician');
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || initialData?.patientId || '');
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  const isEditing = Boolean(initialData);
  const canChoosePatient = !patientId && !isEditing;

  const initialVisitValues = useMemo(
    () =>
      initialData
        ? {
            date: new Date(initialData.date).toISOString().slice(0, 16),
            reason: initialData.reason || '',
            diagnosis: initialData.diagnosis || '',
            notes: initialData.notes || '',
          }
        : {
            date: new Date().toISOString().slice(0, 16),
            reason: '',
            diagnosis: '',
            notes: '',
          },
    [initialData],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormData>({
    defaultValues: initialVisitValues,
  });

  useEffect(() => {
    reset(initialVisitValues);
  }, [initialVisitValues, reset]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingLookups(true);
      try {
        const [settingsRes, patientsRes] = await Promise.all([
          window.api.settings.getAll(),
          canChoosePatient ? window.api.patient.getAll() : Promise.resolve({ success: true, data: [] }),
        ]);

        const settingsResult = unwrapIpcResult<Record<string, string>>(settingsRes);
        if (settingsResult.success && settingsResult.data?.doctorName?.trim()) {
          setClinicianName(settingsResult.data.doctorName.trim());
        }

        const patientsResult = unwrapIpcResult<PatientOption[]>(patientsRes);
        if (patientsResult.success && patientsResult.data) {
          setPatients(patientsResult.data);
        }
      } catch (error) {
        console.error('Failed to load visit form data:', error);
      } finally {
        setIsLoadingLookups(false);
      }
    };

    loadData();

    if (initialData?.prescriptions) {
      setPrescriptions(
        initialData.prescriptions.map((p: any) => ({
          medicationName: p.medicationName || '',
          dosage: p.dosage || '',
          frequency: p.frequency || '',
          duration: p.duration || '',
          notes: p.notes || '',
        })),
      );
    } else {
      setPrescriptions([]);
    }
  }, [canChoosePatient, initialData]);

  const addPrescription = () => {
    setPrescriptions((current) => [...current, blankPrescription()]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions((current) => current.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof PrescriptionData, value: string) => {
    setPrescriptions((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validatePrescriptionRows = () => {
    const anyContent = prescriptions.some((item) => item.medicationName || item.dosage || item.frequency || item.duration || item.notes);
    if (!anyContent) {
      return [];
    }

    const invalidRow = prescriptions.find(
      (item) =>
        !item.medicationName.trim() ||
        !item.dosage.trim() ||
        !item.frequency.trim() ||
        !item.duration.trim(),
    );

    if (invalidRow) {
      throw new Error('Please complete every prescription row before saving');
    }

    return prescriptions.filter((item) => item.medicationName || item.dosage || item.frequency || item.duration || item.notes);
  };

  const onSubmit = async (data: VisitFormData) => {
    try {
      if (canChoosePatient && !selectedPatientId) {
        toast.error('Please select a patient for the visit');
        return;
      }

      const cleanedPrescriptions = validatePrescriptionRows();

      const payload = {
        patientId: patientId || selectedPatientId,
        doctorName: clinicianName,
        date: data.date,
        reason: data.reason,
        diagnosis: data.diagnosis,
        notes: data.notes,
        prescriptions: cleanedPrescriptions,
      };

      const response = isEditing
        ? await window.api.visit.update(initialData.id, {
            date: data.date,
            reason: data.reason,
            diagnosis: data.diagnosis,
            notes: data.notes,
            prescriptions: cleanedPrescriptions,
          })
        : await window.api.visit.create(payload);

      const result = unwrapIpcResult<any>(response);

      if (!result.success) {
        toast.error(result.error || 'Failed to save visit');
        return;
      }

      toast.success(isEditing ? 'Visit updated successfully' : 'Visit added successfully');
      onSave(result.data);
      onClose();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast.error(getErrorMessage(error, 'Failed to save visit'));
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalSurface}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {isEditing ? 'Edit Visit' : 'Add Visit'}
            </h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.92rem' }}>
              Clinician: {clinicianName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#334155' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            {canChoosePatient && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
                  Patient *
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    disabled={isLoadingLookups}
                    style={{
                      width: '100%',
                      minHeight: 44,
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="">{isLoadingLookups ? 'Loading patients...' : 'Select a patient'}</option>
                    {patients.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.firstName} {item.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
                Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register('date', { required: 'Date is required' })}
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: `1px solid ${errors.date ? '#ef4444' : '#cbd5e1'}`,
                  background: '#fff',
                  color: '#0f172a',
                }}
              />
              {errors.date && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 6 }}>{errors.date.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
                Reason
              </label>
              <input
                {...register('reason')}
                placeholder="e.g. Routine follow-up"
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
                Diagnosis
              </label>
              <input
                {...register('diagnosis')}
                placeholder="e.g. Hypertension"
                className="form-input"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
                Clinical Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Detailed clinical observations, symptoms, examination findings..."
                className="form-input"
                style={{ minHeight: 112, resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Prescriptions</h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Enter medications manually. You can add or edit prescription rows anytime.
                </p>
              </div>

              <button
                type="button"
                onClick={addPrescription}
                style={{
                  minHeight: 40,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                }}
              >
                <Plus size={16} />
                Add Prescription
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {prescriptions.map((px, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                    gap: 12,
                    alignItems: 'start',
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    background: '#fafafa',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontSize: '0.82rem', fontWeight: 600 }}>
                      Medication
                    </label>
                    <input
                      value={px.medicationName}
                      onChange={(e) => updatePrescription(index, 'medicationName', e.target.value)}
                      placeholder="e.g. Amoxicillin"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontSize: '0.82rem', fontWeight: 600 }}>
                      Dosage
                    </label>
                    <input
                      value={px.dosage}
                      onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                      placeholder="500mg"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontSize: '0.82rem', fontWeight: 600 }}>
                      Frequency
                    </label>
                    <input
                      value={px.frequency}
                      onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                      placeholder="Twice daily"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontSize: '0.82rem', fontWeight: 600 }}>
                      Duration
                    </label>
                    <input
                      value={px.duration}
                      onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                      placeholder="7 days"
                      className="form-input"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    style={{
                      marginTop: 22,
                      minHeight: 40,
                      width: 40,
                      borderRadius: 12,
                      border: '1px solid #fecaca',
                      background: '#fff1f2',
                      color: '#dc2626',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Remove prescription"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontSize: '0.82rem', fontWeight: 600 }}>
                      Notes
                    </label>
                    <input
                      value={px.notes}
                      onChange={(e) => updatePrescription(index, 'notes', e.target.value)}
                      placeholder="Optional notes"
                      className="form-input"
                    />
                  </div>
                </div>
              ))}

              {prescriptions.length === 0 && (
                <div
                  style={{
                    padding: '18px',
                    borderRadius: 14,
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    background: '#f8fafc',
                    textAlign: 'center',
                  }}
                >
                  No prescriptions added yet. Use the button above to add one.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                minHeight: 44,
                padding: '0 16px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingLookups}
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
                gap: 10,
                opacity: isSubmitting || isLoadingLookups ? 0.75 : 1,
              }}
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Visit' : 'Save Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitForm;
