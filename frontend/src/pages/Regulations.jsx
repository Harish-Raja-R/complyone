import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Regulations = () => {
  const { user, authFetch } = useAuth();
  const [regulations, setRegulations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeRegId, setActiveRegId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [regulatoryBody, setRegulatoryBody] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [referenceUrl, setReferenceUrl] = useState('');

  // Detail Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    fetchRegulations();
  }, [search, statusFilter]);

  const fetchRegulations = async () => {
    setLoading(true);
    try {
      let queryStr = `?search=${encodeURIComponent(search)}`;
      if (statusFilter) queryStr += `&status=${statusFilter}`;
      
      const res = await authFetch(`/api/regulations${queryStr}`);
      const data = await res.json();
      if (data.success) {
        setRegulations(data.regulations);
      }
    } catch (err) {
      showNotice('Error loading regulations catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (msg, type = 'success') => {
    setNotification({ message: msg, type });
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setActiveRegId(null);
    setName('');
    setRegulatoryBody('');
    setCategory('');
    setDescription('');
    setEffectiveDate('');
    setStatus('Active');
    setReferenceUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reg) => {
    setIsEditMode(true);
    setActiveRegId(reg.id);
    setName(reg.name);
    setRegulatoryBody(reg.regulatory_body);
    setCategory(reg.category);
    setDescription(reg.description || '');
    setEffectiveDate(reg.effective_date || '');
    setStatus(reg.status);
    setReferenceUrl(reg.reference_url || '');
    setIsModalOpen(true);
  };

  const handleOpenDetail = (reg) => {
    setSelectedReg(reg);
    setIsDetailOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !regulatoryBody || !category) {
      showNotice('Required fields name, regulatory body and category cannot be empty.', 'warning');
      return;
    }

    const payload = {
      name,
      regulatory_body: regulatoryBody,
      category,
      description,
      effective_date: effectiveDate,
      status,
      reference_url: referenceUrl
    };

    try {
      let res;
      if (isEditMode) {
        res = await authFetch(`/api/regulations/${activeRegId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/regulations', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isEditMode ? 'Regulation updated successfully' : 'Regulation registered successfully');
        setIsModalOpen(false);
        fetchRegulations();
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this regulation? All associated requirements will also be deleted.')) {
      return;
    }

    try {
      const res = await authFetch(`/api/regulations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Regulation deleted successfully');
        fetchRegulations();
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  // Check if role is allowed to modify regulations
  const canModify = user && ['Admin', 'Compliance Manager', 'Compliance Officer'].includes(user.role);
  const isAdmin = user && user.role === 'Admin';

  const tableHeaders = ['ID', 'Regulation Name', 'Regulatory Body', 'Category', 'Effective Date', 'Status'];
  const tableColumns = ['id', 'name', 'regulatory_body', 'category', 'effective_date', 'status'];

  const renderCell = (row, col) => {
    if (col === 'status') {
      let badgeStyle = 'badge-active';
      if (row.status === 'Draft') badgeStyle = 'badge-draft';
      if (row.status === 'Archived') badgeStyle = 'badge-non-compliant';
      return <span className={`badge ${badgeStyle}`}>{row.status}</span>;
    }
    return row[col] !== null ? String(row[col]) : '';
  };

  const tableActions = (row) => (
    <>
      <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleOpenDetail(row)}>
        <Eye size={14} />
      </button>
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Regulatory Library</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Central repository of regulations mapping to organizational requirements.</p>
        </div>
        {canModify && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Add Regulation
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

      {/* Filter and Search actions bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Search Library</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search regulations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</span>
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlignment: 'center' }}>Loading regulation catalog...</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={regulations}
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
        title={isEditMode ? 'Edit Regulation' : 'Add New Regulation'}
        onSubmit={handleSubmit}
        submitText={isEditMode ? 'Save Changes' : 'Register'}
      >
        <div className="form-group">
          <label className="form-label">Regulation Name *</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. ISO 27001:2022"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Regulatory Body *</label>
            <input
              type="text"
              className="form-input"
              value={regulatoryBody}
              onChange={(e) => setRegulatoryBody(e.target.value)}
              required
              placeholder="e.g. ISO"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <input
              type="text"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. Information Security"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summary of the regulation..."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Effective Date</label>
            <input
              type="date"
              className="form-input"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Reference URL</label>
          <input
            type="url"
            className="form-input"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://example.com/spec"
          />
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Regulation Details"
        submitText="Close"
        onSubmit={() => setIsDetailOpen(false)}
      >
        {selectedReg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</span>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>{selectedReg.name}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Regulatory Body</span>
                <p style={{ fontWeight: 500 }}>{selectedReg.regulatory_body}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</span>
                <p style={{ fontWeight: 500 }}>{selectedReg.category}</p>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Description</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.4' }}>{selectedReg.description || 'No description provided.'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Effective Date</span>
                <p style={{ fontWeight: 500 }}>{selectedReg.effective_date || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</span>
                <div>
                  <span className={`badge ${selectedReg.status === 'Active' ? 'badge-active' : 'badge-draft'}`}>
                    {selectedReg.status}
                  </span>
                </div>
              </div>
            </div>
            {selectedReg.reference_url && (
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reference URL</span>
                <p>
                  <a href={selectedReg.reference_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 500 }}>
                    Official Standard Reference <ExternalLink size={14} />
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Regulations;
