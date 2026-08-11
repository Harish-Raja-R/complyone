import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Upload, ExternalLink } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Tasks = () => {
  const { user, authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [assignFilter, setAssignFilter] = useState('');

  // Modal Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Form Fields
  const [requirementId, setRequirementId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('To Do');

  // Evidence Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchRequirements();
    fetchUsers();
  }, [statusFilter, assignFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let queryStr = '?';
      if (statusFilter) queryStr += `status=${statusFilter}&`;
      if (assignFilter) queryStr += `assigned_to=${assignFilter}&`;
      
      const res = await authFetch(`/api/tasks${queryStr}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      showNotice('Error loading tasks workspace', 'error');
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
    setActiveTaskId(null);
    setRequirementId(requirements[0]?.id || '');
    setAssignedTo(users[0]?.id || '');
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setStatus('To Do');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setIsEditMode(true);
    setActiveTaskId(t.id);
    setRequirementId(t.requirement_id);
    setAssignedTo(t.assigned_to || '');
    setTitle(t.title);
    setDescription(t.description || '');
    setPriority(t.priority);
    setDueDate(t.due_date || '');
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleOpenUpload = (id) => {
    setUploadTaskId(id);
    setUploadFile(null);
    setIsUploadOpen(true);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await authFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...task,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Task status updated successfully');
        fetchTasks();
      } else {
        showNotice(data.message || 'Status update failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!requirementId || !title) {
      showNotice('Please fill in all required fields (Requirement, Task Title)', 'warning');
      return;
    }

    const payload = {
      requirement_id: parseInt(requirementId),
      assigned_to: assignedTo ? parseInt(assignedTo) : null,
      title,
      description,
      priority,
      due_date: dueDate,
      status
    };

    try {
      let res;
      if (isEditMode) {
        res = await authFetch(`/api/tasks/${activeTaskId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isEditMode ? 'Task updated successfully' : 'Task assigned successfully');
        setIsModalOpen(false);
        fetchTasks();
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      showNotice('Please select a file to upload.', 'warning');
      return;
    }

    setUploadStatus(true);
    const formData = new FormData();
    formData.append('task_id', uploadTaskId);
    formData.append('file', uploadFile);

    try {
      const res = await authFetch('/api/evidence/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Evidence document uploaded successfully. Task status moved to Submitted.');
        setIsUploadOpen(false);
        fetchTasks();
      } else {
        showNotice(data.message || 'Evidence upload failed', 'error');
      }
    } catch (err) {
      showNotice('API error uploading file', 'error');
    } finally {
      setUploadStatus(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const res = await authFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Task deleted successfully');
        fetchTasks();
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const isEmployee = user && user.role === 'Employee';
  const canModify = user && ['Admin', 'Compliance Manager', 'Compliance Officer'].includes(user.role);

  const tableHeaders = ['ID', 'Task Name', 'Linked Requirement', 'Assigned To', 'Priority', 'Due Date', 'Status'];
  const tableColumns = ['id', 'title', 'requirement_title', 'assigned_to_name', 'priority', 'due_date', 'status'];

  const renderCell = (row, col) => {
    if (col === 'status') {
      let badgeStyle = 'badge-draft';
      if (row.status === 'Completed') badgeStyle = 'badge-compliant';
      if (row.status === 'Submitted') badgeStyle = 'badge-active';
      if (row.status === 'Under Review') badgeStyle = 'badge-active';
      if (row.status === 'In Progress') badgeStyle = 'badge-draft';
      if (row.status === 'Overdue') badgeStyle = 'badge-overdue';

      // Inline selector for rapid status adjustments for assignee
      if (isEmployee || canModify) {
        return (
          <select 
            value={row.status} 
            onChange={(e) => handleStatusChange(row, e.target.value)}
            className="form-input" 
            style={{ padding: '4px 8px', fontSize: '12px', width: '130px', fontWeight: 600 }}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        );
      }
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
      {row.status !== 'Completed' && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--color-compliant)' }} onClick={() => handleOpenUpload(row.id)} title="Upload Evidence">
          <Upload size={14} />
        </button>
      )}
      {canModify && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--primary)' }} onClick={() => handleOpenEdit(row)}>
          <Edit2 size={14} />
        </button>
      )}
      {canModify && (
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Task Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track individual action items mapped to compliance requirements and upload audit evidence.</p>
        </div>
        {canModify && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Create Task
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
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Status</span>
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        {!isEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '240px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Assigned Employee</span>
            <select className="form-input" value={assignFilter} onChange={(e) => setAssignFilter(e.target.value)}>
              <option value="">All Employees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlignment: 'center' }}>Loading tasks catalog...</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={tasks}
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
        title={isEditMode ? 'Edit Task Details' : 'Create New Compliance Task'}
        onSubmit={handleSubmit}
        submitText={isEditMode ? 'Save Changes' : 'Create Task'}
      >
        <div className="form-group">
          <label className="form-label">Linked Requirement *</label>
          <select className="form-input" value={requirementId} onChange={(e) => setRequirementId(e.target.value)}>
            {requirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Conduct password rotation verify test"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Task Description</label>
          <textarea
            className="form-input"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide clear steps for the assignee to gather evidence..."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select className="form-input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Select Assignee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Evidence Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Compliance Evidence"
        onSubmit={handleUploadSubmit}
        submitText={uploadStatus ? 'Uploading...' : 'Submit Evidence'}
      >
        <div className="form-group">
          <label className="form-label">Select Evidence File</label>
          <div 
            className="upload-dropzone" 
            onClick={() => document.getElementById('file-picker-input').click()}
          >
            <div className="upload-icon-circle">
              <Upload size={24} />
            </div>
            {uploadFile ? (
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)</span>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>Click to select a file</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supported: PDF, DOC, XLS, CSV, PNG, JPG, TXT (Max 10MB)</span>
              </>
            )}
            <input
              id="file-picker-input"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => setUploadFile(e.target.files[0])}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
