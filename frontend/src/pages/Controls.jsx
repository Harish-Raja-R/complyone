import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Controls = () => {
  const { user, authFetch } = useAuth();
  const [controls, setControls] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [reqFilter, setReqFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeControlId, setActiveControlId] = useState(null);

  // Form Fields
  const [requirementId, setRequirementId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [frequency, setFrequency] = useState('Continuous');
  const [effectiveness, setEffectiveness] = useState('Not Tested');
  const [status, setStatus] = useState('Active');
  const [lastReviewed, setLastReviewed] = useState('');
  const [nextReview, setNextReview] = useState('');

  useEffect(() => {
    fetchControls();
    fetchRequirements();
    fetchUsers();
  }, [statusFilter, reqFilter]);

  const fetchControls = async () => {
    setLoading(true);
    try {
      let queryStr = '?';
      if (statusFilter) queryStr += `status=${statusFilter}&`;
      if (reqFilter) queryStr += `requirement_id=${reqFilter}&`;
      
      const res = await authFetch(`/api/controls${queryStr}`);
      const data = await res.json();
      if (data.success) {
        setControls(data.controls);
      }
    } catch (err) {
      showNotice('Error loading compliance controls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async () => {
    try {
      const res = await authFetch('/api/requirements');
      const data = await res.json();
      if (data.success) {
        setRequirements(data.requirements);
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authFetch('/api/auth/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const showNotice = (msg, type = 'success') => {
    setNotification({ message: msg, type });
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setActiveControlId(null);
    setRequirementId(requirements[0]?.id || '');
    setName('');
    setDescription('');
    setOwnerId(users[0]?.id || '');
    setFrequency('Continuous');
    setEffectiveness('Not Tested');
    setStatus('Active');
    setLastReviewed('');
    setNextReview('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditMode(true);
    setActiveControlId(c.id);
    setRequirementId(c.requirement_id);
    setName(c.name);
    setDescription(c.description || '');
    setOwnerId(c.owner_id || '');
    setFrequency(c.frequency);
    setEffectiveness(c.effectiveness);
    setStatus(c.status);
    setLastReviewed(c.last_reviewed || '');
    setNextReview(c.next_review || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!requirementId || !name) {
      showNotice('Please fill in all required fields (Requirement, Control Name)', 'warning');
      return;
    }

    const payload = {
      requirement_id: parseInt(requirementId),
      name,
      description,
      owner_id: ownerId ? parseInt(ownerId) : null,
      frequency,
      effectiveness,
      status,
      last_reviewed: lastReviewed,
      next_review: nextReview
    };

    try {
      let res;
      if (isEditMode) {
        res = await authFetch(`/api/controls/${activeControlId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/controls', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isEditMode ? 'Control updated successfully' : 'Control registered successfully');
        setIsModalOpen(false);
        fetchControls();
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this control?')) {
      return;
    }

    try {
      const res = await authFetch(`/api/controls/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Control deleted successfully');
        fetchControls();
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const canModify = user && ['Admin', 'Compliance Manager', 'Compliance Officer'].includes(user.role);
  const isAdmin = user && user.role === 'Admin';

  const tableHeaders = ['ID', 'Control Name', 'Linked Requirement', 'Owner', 'Frequency', 'Effectiveness', 'Status'];
  const tableColumns = ['id', 'name', 'requirement_title', 'owner_name', 'frequency', 'effectiveness', 'status'];

  const renderCell = (row, col) => {
    if (col === 'status') {
      return (
        <span className={`badge ${row.status === 'Active' ? 'badge-active' : 'badge-draft'}`}>
          {row.status}
        </span>
      );
    }
    if (col === 'effectiveness') {
      let style = 'badge-draft';
      if (row.effectiveness === 'Effective') style = 'badge-compliant';
      if (row.effectiveness === 'Partially Effective') style = 'badge-part-compliant';
      if (row.effectiveness === 'Ineffective') style = 'badge-non-compliant';
      return <span className={`badge ${style}`}>{row.effectiveness}</span>;
    }
    return row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
  };

  const tableActions = (row) => (
    <>
      {canModify && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--primary)' }} onClick={() => handleOpenEdit(row)}>
          <Edit2 size={14} />
        </button>
      )}
      {isAdmin && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--color-non-compliant)' }} onClick={() => handleDelete(row.id)}>
          <Trash2 size={14} />
        </button>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Compliance Controls</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mechanism and policies constructed to satisfy mapped compliance requirements.</p>
        </div>
        {canModify && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Add Control
          </button>
        )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Requirement</span>
          <select className="form-input" value={reqFilter} onChange={(e) => setReqFilter(e.target.value)}>
            <option value="">All Requirements</option>
            {requirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.title}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</span>
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlignment: 'center' }}>Loading compliance controls...</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={controls}
            columns={tableColumns}
            renderCell={renderCell}
            actions={tableActions}
          />
        )}
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Control' : 'Register Control'}
        onSubmit={handleSubmit}
        submitText={isEditMode ? 'Save Changes' : 'Register'}
      >
        <div className="form-group">
          <label className="form-label">Associated Requirement *</label>
          <select className="form-input" value={requirementId} onChange={(e) => setRequirementId(e.target.value)}>
            {requirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Control Name *</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Identity & Access Management audits"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Actions matching this control..."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Control Owner</label>
            <select className="form-input" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Select Owner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select className="form-input" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semi-Annually">Semi-Annually</option>
              <option value="Annually">Annually</option>
              <option value="Continuous">Continuous</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Effectiveness</label>
            <select className="form-input" value={effectiveness} onChange={(e) => setEffectiveness(e.target.value)}>
              <option value="Not Tested">Not Tested</option>
              <option value="Effective">Effective</option>
              <option value="Partially Effective">Partially Effective</option>
              <option value="Ineffective">Ineffective</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Last Reviewed</label>
            <input
              type="date"
              className="form-input"
              value={lastReviewed}
              onChange={(e) => setLastReviewed(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Next Review</label>
            <input
              type="date"
              className="form-input"
              value={nextReview}
              onChange={(e) => setNextReview(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Controls;
