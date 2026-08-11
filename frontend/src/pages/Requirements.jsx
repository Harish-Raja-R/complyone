import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Requirements = () => {
  const { user, authFetch } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeReqId, setActiveReqId] = useState(null);

  // Form Fields
  const [regulationId, setRegulationId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Not Started');

  useEffect(() => {
    fetchRequirements();
    fetchRegulations();
    fetchUsers();
  }, [search, statusFilter, deptFilter]);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      let queryStr = `?search=${encodeURIComponent(search)}`;
      if (statusFilter) queryStr += `&status=${statusFilter}`;
      if (deptFilter) queryStr += `&department=${deptFilter}`;
      
      const res = await authFetch(`/api/requirements${queryStr}`);
      const data = await res.json();
      if (data.success) {
        setRequirements(data.requirements);
      }
    } catch (err) {
      showNotice('Error loading compliance requirements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegulations = async () => {
    try {
      const res = await authFetch('/api/regulations');
      const data = await res.json();
      if (data.success) {
        setRegulations(data.regulations);
      }
    } catch (err) {
      console.error('Error fetching regulations:', err);
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
    setActiveReqId(null);
    setRegulationId(regulations[0]?.id || '');
    setTitle('');
    setDescription('');
    setOwnerId(users[0]?.id || '');
    setDepartment('Engineering');
    setPriority('Medium');
    setDueDate('');
    setStatus('Not Started');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (req) => {
    setIsEditMode(true);
    setActiveReqId(req.id);
    setRegulationId(req.regulation_id);
    setTitle(req.title);
    setDescription(req.description || '');
    setOwnerId(req.owner_id || '');
    setDepartment(req.department);
    setPriority(req.priority);
    setDueDate(req.due_date || '');
    setStatus(req.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!regulationId || !title || !department) {
      showNotice('Please fill in all required fields (Regulation, Title, Department)', 'warning');
      return;
    }

    const payload = {
      regulation_id: parseInt(regulationId),
      title,
      description,
      owner_id: ownerId ? parseInt(ownerId) : null,
      department,
      priority,
      due_date: dueDate,
      status
    };

    try {
      let res;
      if (isEditMode) {
        res = await authFetch(`/api/requirements/${activeReqId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/requirements', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isEditMode ? 'Requirement updated successfully' : 'Requirement mapped successfully');
        setIsModalOpen(false);
        fetchRequirements();
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this requirement? All linked controls and tasks will also be deleted.')) {
      return;
    }

    try {
      const res = await authFetch(`/api/requirements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Requirement deleted successfully');
        fetchRequirements();
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const canModify = user && ['Admin', 'Compliance Manager', 'Compliance Officer'].includes(user.role);
  const isAdmin = user && user.role === 'Admin';

  const tableHeaders = ['ID', 'Requirement Title', 'Linked Regulation', 'Owner', 'Department', 'Priority', 'Due Date', 'Status'];
  const tableColumns = ['id', 'title', 'regulation_name', 'owner_name', 'department', 'priority', 'due_date', 'status'];

  const renderCell = (row, col) => {
    if (col === 'status') {
      let badgeStyle = 'badge-draft';
      if (row.status === 'Compliant') badgeStyle = 'badge-compliant';
      if (row.status === 'Partially Compliant') badgeStyle = 'badge-part-compliant';
      if (row.status === 'Non-Compliant') badgeStyle = 'badge-non-compliant';
      if (row.status === 'In Progress') badgeStyle = 'badge-active';
      return <span className={`badge ${badgeStyle}`}>{row.status}</span>;
    }
    if (col === 'priority') {
      let color = 'var(--text-secondary)';
      if (row.priority === 'Critical' || row.priority === 'High') color = 'var(--color-non-compliant)';
      if (row.priority === 'Medium') color = 'var(--color-part-compliant)';
      return <span style={{ fontWeight: 600, color }}>{row.priority}</span>;
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Compliance Requirements</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track individual obligations derived from regulations mapped to departments.</p>
        </div>
        {canModify && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Add Requirement
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

      {/* Filter bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Search Title/Desc</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</span>
          <select className="form-input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Engineering">Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Compliance">Compliance</option>
            <option value="Legal">Legal</option>
            <option value="Finance">Finance</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</span>
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Compliant">Compliant</option>
            <option value="Partially Compliant">Partially Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlignment: 'center' }}>Loading compliance requirements...</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={requirements}
            columns={tableColumns}
            renderCell={renderCell}
            actions={tableActions}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Requirement' : 'Map New Requirement'}
        onSubmit={handleSubmit}
        submitText={isEditMode ? 'Save Changes' : 'Map Requirement'}
      >
        <div className="form-group">
          <label className="form-label">Linked Regulation *</label>
          <select className="form-input" value={regulationId} onChange={(e) => setRegulationId(e.target.value)}>
            {regulations.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.regulatory_body})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Requirement Title *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Cryptographic Data Protection"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the exact requirements and target controls..."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Requirement Owner</label>
            <select className="form-input" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Select Owner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="Engineering">Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Compliance">Compliance</option>
              <option value="Legal">Legal</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Compliant">Compliant</option>
            <option value="Partially Compliant">Partially Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default Requirements;
