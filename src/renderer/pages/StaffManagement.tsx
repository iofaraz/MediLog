import React, { useState, useEffect, useCallback } from 'react';
import { UserCog, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'doctor'
  });
  const [formError, setFormError] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await window.api.users.getAll();
    if (result.success && result.data) {
      setUsers(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = (userToEdit: any = null) => {
    setFormError('');
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        username: userToEdit.username,
        password: '', // Blank by default when editing
        role: userToEdit.role
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', username: '', password: '', role: 'doctor' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.username || (!editingUser && !formData.password)) {
      setFormError('Please fill in all required fields.');
      return;
    }

    let result;
    if (editingUser) {
      result = await window.api.users.update(editingUser.id, formData, user?.id || '');
    } else {
      result = await window.api.users.create(formData, user?.id || '');
    }

    if (result.success) {
      setIsModalOpen(false);
      fetchUsers();
    } else {
      setFormError(result.error || 'An error occurred while saving.');
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === 'admin') {
      toast.error('The master admin account cannot be deleted.');
      return;
    }
    if (id === user?.id) {
      toast.error('You cannot delete your own account while logged in.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the user account for ${username}?`)) {
      const result = await window.api.users.delete(id, user?.id || '');
      if (result.success) {
        toast.success(`User ${username} deleted`);
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to delete user.');
      }
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <ShieldAlert size={64} style={{ marginBottom: '16px', color: 'var(--danger-color)' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Access Denied</h2>
        <p>Only administrators can manage staff accounts.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserCog color="var(--primary-color)" size={32} />
            Staff Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage clinic staff accounts and roles</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Username</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Created</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Loading staff accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }} className="table-row-hover">
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {u.name} {u.id === user?.id && <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderRadius: '12px', marginLeft: '8px' }}>You</span>}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.username}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.15)' :
                                    u.role === 'doctor' ? 'rgba(59, 130, 246, 0.15)' :
                                    'rgba(16, 185, 129, 0.15)',
                        color: u.role === 'admin' ? '#a78bfa' :
                               u.role === 'doctor' ? '#60a5fa' :
                               '#34d399',
                        textTransform: 'capitalize'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleOpenModal(u)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDelete(u.id, u.username)}
                          disabled={u.username === 'admin'}
                          title={u.username === 'admin' ? "Cannot delete master admin" : "Delete"}
                          style={{ opacity: u.username === 'admin' ? 0.3 : 1 }}
                        >
                          <Trash2 size={18} color={u.username !== 'admin' ? "var(--danger-color)" : "inherit"} />
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

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)', width: '100%', maxWidth: '450px',
            borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-strong)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', marginBottom: '24px' }}>
              {editingUser ? 'Edit Staff Account' : 'Add New Staff'}
            </h2>
            
            {formError && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.username}
                  disabled={!!editingUser}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  style={{ opacity: editingUser ? 0.6 : 1 }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Role</label>
                <select 
                  className="form-input" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  disabled={editingUser?.username === 'admin'}
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
