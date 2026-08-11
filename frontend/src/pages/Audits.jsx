import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Eye, ShieldAlert, Check, X, FileText, AlertTriangle } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Audits = ({ globalSearch = '' }) => {
  const { user, authFetch } = useAuth();
  
  // Lists
  const [audits, setAudits] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [users, setUsers] = useState([]);
  const [findings, setFindings] = useState([]);
  
  // Selected state
  const [selectedAudit, setSelectedAudit] = useState(null);
  
  // Loading & alerts
  const [loading, setLoading] = useState(false);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Audit Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditEdit, setIsAuditEdit] = useState(false);
  const [activeAuditId, setActiveAuditId] = useState(null);
  const [auditName, setAuditName] = useState('');
  const [regulationId, setRegulationId] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [auditStatus, setAuditStatus] = useState('Planned');

  // Finding Modal
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [isFindingEdit, setIsFindingEdit] = useState(false);
  const [activeFindingId, setActiveFindingId] = useState(null);
  const [findingDesc, setFindingDesc] = useState('');
  const [findingSeverity, setFindingSeverity] = useState('Minor');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [findingDueDate, setFindingDueDate] = useState('');
  const [findingStatus, setFindingStatus] = useState('Open');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAudits();
    fetchRegulations();
    fetchUsers();
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/audits');
      const data = await res.json();
      if (data.success) {
        setAudits(data.audits);
      }
    } catch (err) {
      showNotice('Error loading audit list', 'error');
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

  const fetchFindings = async (auditId) => {
    setFindingsLoading(true);
    try {
      const res = await authFetch(`/api/audits/${auditId}/findings`);
      const data = await res.json();
      if (data.success) {
        setFindings(data.findings);
      }
    } catch (err) {
      showNotice('Error loading audit findings', 'error');
    } finally {
      setFindingsLoading(false);
    }
  };

  const showNotice = (msg, type = 'success') => {
    setNotification({ message: msg, type });
  };

  // --- Audit Modal Actions ---
  const handleOpenAuditCreate = () => {
    setIsAuditEdit(false);
    setActiveAuditId(null);
    setAuditName('');
    setRegulationId(regulations[0]?.id || '');
    setAuditorId(users.find(u => u.role === 'Auditor' || u.role === 'Compliance Officer')?.id || users[0]?.id || '');
    setStartDate('');
    setEndDate('');
    setAuditStatus('Planned');
    setIsAuditModalOpen(true);
  };

  const handleOpenAuditEdit = (audit) => {
    setIsAuditEdit(true);
    setActiveAuditId(audit.id);
    setAuditName(audit.name);
    setRegulationId(audit.regulation_id || '');
    setAuditorId(audit.auditor_id || '');
    setStartDate(audit.start_date || '');
    setEndDate(audit.end_date || '');
    setAuditStatus(audit.status);
    setIsAuditModalOpen(true);
  };

  const handleAuditSubmit = async () => {
    if (!auditName) {
      showNotice('Audit name cannot be empty', 'warning');
      return;
    }

    const payload = {
      name: auditName,
      regulation_id: regulationId ? parseInt(regulationId) : null,
      auditor_id: auditorId ? parseInt(auditorId) : null,
      start_date: startDate,
      end_date: endDate,
      status: auditStatus
    };

    try {
      let res;
      if (isAuditEdit) {
        res = await authFetch(`/api/audits/${activeAuditId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/audits', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isAuditEdit ? 'Audit campaign updated' : 'Audit campaign created');
        setIsAuditModalOpen(false);
        fetchAudits();
        if (selectedAudit && selectedAudit.id === activeAuditId) {
          setSelectedAudit({ ...selectedAudit, ...payload });
        }
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleAuditDelete = async (id) => {
    if (!window.confirm('Delete this audit campaign? All logged findings will also be deleted permanently.')) {
      return;
    }

    try {
      const res = await authFetch(`/api/audits/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Audit campaign deleted successfully');
        fetchAudits();
        if (selectedAudit && selectedAudit.id === id) {
          setSelectedAudit(null);
          setFindings([]);
        }
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleSelectAudit = (audit) => {
    setSelectedAudit(audit);
    fetchFindings(audit.id);
  };

  // --- Finding Modal Actions ---
  const handleOpenFindingCreate = () => {
    if (!selectedAudit) return;
    setIsFindingEdit(false);
    setActiveFindingId(null);
    setFindingDesc('');
    setFindingSeverity('Minor');
    setCorrectiveAction('');
    setFindingDueDate('');
    setFindingStatus('Open');
    setIsFindingModalOpen(true);
  };

  const handleOpenFindingEdit = (finding) => {
    setIsFindingEdit(true);
    setActiveFindingId(finding.id);
    setFindingDesc(finding.description);
    setFindingSeverity(finding.severity);
    setCorrectiveAction(finding.corrective_action || '');
    setFindingDueDate(finding.due_date || '');
    setFindingStatus(finding.status);
    setIsFindingModalOpen(true);
  };

  const handleFindingSubmit = async () => {
    if (!findingDesc) {
      showNotice('Finding description is required', 'warning');
      return;
    }

    const payload = {
      description: findingDesc,
      severity: findingSeverity,
      corrective_action: correctiveAction,
      due_date: findingDueDate,
      status: findingStatus
    };

    try {
      let res;
      if (isFindingEdit) {
        res = await authFetch(`/api/audits/findings/${activeFindingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch(`/api/audits/${selectedAudit.id}/findings`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isFindingEdit ? 'Audit finding updated' : 'Audit finding logged');
        setIsFindingModalOpen(false);
        fetchFindings(selectedAudit.id);
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleFindingDelete = async (findingId) => {
    if (!window.confirm('Delete this audit finding permanently?')) {
      return;
    }

    try {
      const res = await authFetch(`/api/audits/findings/${findingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Audit finding deleted');
        fetchFindings(selectedAudit.id);
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical': return 'badge-non-compliant';
      case 'Major': return 'badge-overdue';
      case 'Minor': return 'badge-active';
      case 'Observation': return 'badge-draft';
      default: return 'badge-draft';
    }
  };

  const getAuditStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'badge-compliant';
      case 'Closed': return 'badge-draft';
      case 'In Progress': return 'badge-active';
      case 'Planned': return 'badge-draft';
      default: return 'badge-draft';
    }
  };

  const isUserEditor = user && ['Admin', 'Compliance Manager', 'Auditor'].includes(user.role);

  // Table Configuration for Audits
  const auditHeaders = ['ID', 'Audit Name', 'Associated Regulation', 'Auditor', 'Start Date', 'End Date', 'Status'];
  const auditColumns = ['id', 'name', 'regulation_name', 'auditor_name', 'start_date', 'end_date', 'status'];

  const renderAuditCell = (row, col) => {
    if (col === 'status') {
      return <span className={`badge ${getAuditStatusBadge(row.status)}`}>{row.status}</span>;
    }
    if (col === 'start_date' || col === 'end_date') {
      return row[col] ? new Date(row[col]).toLocaleDateString() : 'N/A';
    }
    return row[col] !== null && row[col] !== undefined ? String(row[col]) : 'N/A';
  };

  const auditActions = (row) => (
    <>
      <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleSelectAudit(row)} title="View Findings">
        <Eye size={14} />
      </button>
      {isUserEditor && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleOpenAuditEdit(row)} title="Edit Campaign">
          <Edit2 size={14} />
        </button>
      )}
      {user?.role === 'Admin' && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--color-non-compliant)' }} onClick={() => handleAuditDelete(row.id)} title="Delete Campaign">
          <Trash2 size={14} />
        </button>
      )}
    </>
  );

  // Filter Audits
  const activeSearch = globalSearch || search;
  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      (a.regulation_name && a.regulation_name.toLowerCase().includes(activeSearch.toLowerCase())) ||
      (a.auditor_name && a.auditor_name.toLowerCase().includes(activeSearch.toLowerCase()));
    
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Audit Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage internal audit schedules, evaluate checklists, and track findings.</p>
        </div>
        {isUserEditor && (
          <button className="btn btn-primary" onClick={handleOpenAuditCreate}>
            <Plus size={18} style={{ marginRight: '6px' }} />
            New Audit Campaign
          </button>
        )}
      </div>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Search Campaigns</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, regulation, auditor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</span>
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Audits Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading campaigns...</div>
        ) : (
          <Table
            headers={auditHeaders}
            data={filteredAudits}
            columns={auditColumns}
            renderCell={renderAuditCell}
            actions={auditActions}
          />
        )}
      </div>

      {/* Findings Sub-Panel (Load dynamically when selected) */}
      {selectedAudit && (
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Findings: {selectedAudit.name}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Audit of <strong>{selectedAudit.regulation_name || 'No Regulation'}</strong> led by <strong>{selectedAudit.auditor_name || 'Unassigned'}</strong>
              </p>
            </div>
            {isUserEditor && (
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleOpenFindingCreate}>
                <Plus size={16} /> Log Finding
              </button>
            )}
          </div>

          {findingsLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading findings for this audit...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="comply-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Corrective Action</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    {isUserEditor && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {findings.length === 0 ? (
                    <tr>
                      <td colSpan={isUserEditor ? 7 : 6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No findings logged for this audit campaign.
                      </td>
                    </tr>
                  ) : (
                    findings.map((f) => (
                      <tr key={f.id}>
                        <td>{f.id}</td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{f.description}</td>
                        <td>
                          <span className={`badge ${getSeverityBadge(f.severity)}`}>{f.severity}</span>
                        </td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{f.corrective_action || 'N/A'}</td>
                        <td>{f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`badge ${f.status === 'Resolved' ? 'badge-compliant' : 'badge-overdue'}`}>{f.status}</span>
                        </td>
                        {isUserEditor && (
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleOpenFindingEdit(f)}>
                                <Edit2 size={12} />
                              </button>
                              {user?.role === 'Admin' && (
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'var(--color-non-compliant)' }} onClick={() => handleFindingDelete(f.id)}>
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Audit Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={isAuditEdit ? 'Edit Audit Campaign' : 'Schedule Audit Campaign'}
        onSubmit={handleAuditSubmit}
        submitText={isAuditEdit ? 'Save Changes' : 'Schedule Audit'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Audit Name*</label>
            <input
              type="text"
              className="form-input"
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
              placeholder="e.g. Q3 SOC2 Security Review"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Associated Regulation</label>
            <select className="form-input" value={regulationId} onChange={(e) => setRegulationId(e.target.value)}>
              <option value="">Select Regulation...</option>
              {regulations.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.regulatory_body})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lead Auditor</label>
            <select className="form-input" value={auditorId} onChange={(e) => setAuditorId(e.target.value)}>
              <option value="">Select Auditor...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={auditStatus} onChange={(e) => setAuditStatus(e.target.value)}>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Log/Edit Finding Modal */}
      <Modal
        isOpen={isFindingModalOpen}
        onClose={() => setIsFindingModalOpen(false)}
        title={isFindingEdit ? 'Edit Audit Finding' : 'Log Audit Finding'}
        onSubmit={handleFindingSubmit}
        submitText={isFindingEdit ? 'Save Finding' : 'Log Finding'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Description of Defect/Finding*</label>
            <textarea
              className="form-input"
              rows="3"
              value={findingDesc}
              onChange={(e) => setFindingDesc(e.target.value)}
              placeholder="Describe the non-conformance or observation..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <select className="form-input" value={findingSeverity} onChange={(e) => setFindingSeverity(e.target.value)}>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
              <option value="Observation">Observation</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Corrective Action Plan</label>
            <textarea
              className="form-input"
              rows="3"
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Proposed corrective actions to mitigate and resolve the finding..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Due Date</label>
            <input
              type="date"
              className="form-input"
              value={findingDueDate}
              onChange={(e) => setFindingDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={findingStatus} onChange={(e) => setFindingStatus(e.target.value)}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Audits;
