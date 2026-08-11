import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, ShieldAlert, X, RefreshCw } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Risks = ({ globalSearch = '' }) => {
  const { user, authFetch } = useAuth();
  const [risks, setRisks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [matrixFilter, setMatrixFilter] = useState(null); // { probability, impact }
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeRiskId, setActiveRiskId] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [ownerId, setOwnerId] = useState('');
  const [mitigation, setMitigation] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchRisks();
    fetchUsers();
  }, []);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/risks');
      const data = await res.json();
      if (data.success) {
        setRisks(data.risks);
      }
    } catch (err) {
      showNotice('Error fetching risks register', 'error');
    } finally {
      setLoading(false);
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
    setActiveRiskId(null);
    setName('');
    setDescription('');
    setProbability(3);
    setImpact(3);
    setOwnerId(users[0]?.id || '');
    setMitigation('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (risk) => {
    setIsEditMode(true);
    setActiveRiskId(risk.id);
    setName(risk.name);
    setDescription(risk.description || '');
    setProbability(risk.probability);
    setImpact(risk.impact);
    setOwnerId(risk.owner_id || '');
    setMitigation(risk.mitigation || '');
    setStatus(risk.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) {
      showNotice('Risk title is required', 'warning');
      return;
    }

    const payload = {
      name,
      description,
      probability,
      impact,
      owner_id: ownerId ? parseInt(ownerId) : null,
      mitigation,
      status
    };

    try {
      let res;
      if (isEditMode) {
        res = await authFetch(`/api/risks/${activeRiskId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/risks', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showNotice(isEditMode ? 'Risk updated successfully' : 'Risk logged successfully');
        setIsModalOpen(false);
        fetchRisks();
      } else {
        showNotice(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this risk record?')) {
      return;
    }

    try {
      const res = await authFetch(`/api/risks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('Risk record deleted successfully');
        fetchRisks();
      } else {
        showNotice(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 16) return { name: 'Critical', class: 'badge-non-compliant' };
    if (score >= 10) return { name: 'High', class: 'badge-overdue' };
    if (score >= 5) return { name: 'Medium', class: 'badge-active' };
    return { name: 'Low', class: 'badge-compliant' };
  };

  // Matrix and Stats calculations
  const totalCount = risks.length;
  const criticalCount = risks.filter(r => r.risk_score >= 16).length;
  const highCount = risks.filter(r => r.risk_score >= 10 && r.risk_score < 16).length;
  const medCount = risks.filter(r => r.risk_score >= 5 && r.risk_score < 10).length;

  // Filter logic
  const activeSearch = globalSearch || search;
  const filteredRisks = risks.filter(r => {
    // 1. Text search
    const matchesSearch = r.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
      (r.description && r.description.toLowerCase().includes(activeSearch.toLowerCase())) ||
      (r.owner_name && r.owner_name.toLowerCase().includes(activeSearch.toLowerCase()));
    
    // 2. Status dropdown
    const matchesStatus = !statusFilter || r.status === statusFilter;

    // 3. Risk Matrix click
    const matchesMatrix = !matrixFilter || 
      (r.probability === matrixFilter.probability && r.impact === matrixFilter.impact);

    return matchesSearch && matchesStatus && matchesMatrix;
  });

  // Calculate cell counts for the 5x5 heatmap
  const getCellCount = (imp, prob) => {
    return risks.filter(r => r.impact === imp && r.probability === prob).length;
  };

  const isUserManagement = user && ['Admin', 'Compliance Manager', 'Compliance Officer'].includes(user.role);

  const tableHeaders = ['ID', 'Risk Name', 'Probability', 'Impact', 'Score', 'Severity', 'Owner', 'Status'];
  const tableColumns = ['id', 'name', 'probability', 'impact', 'risk_score', 'severity', 'owner_name', 'status'];

  const renderCell = (row, col) => {
    if (col === 'status') {
      let badge = 'badge-active'; // Active
      if (row.status === 'Mitigated') badge = 'badge-compliant';
      if (row.status === 'Accepted') badge = 'badge-draft';
      return <span className={`badge ${badge}`}>{row.status}</span>;
    }
    if (col === 'severity') {
      const level = getRiskLevel(row.risk_score);
      return <span className={`badge ${level.class}`}>{level.name}</span>;
    }
    if (col === 'risk_score') {
      return <strong>{row.risk_score}</strong>;
    }
    return row[col] !== null && row[col] !== undefined ? String(row[col]) : 'N/A';
  };

  const tableActions = (row) => (
    <>
      <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleOpenEdit(row)} title="Edit Risk">
        <Edit2 size={14} />
      </button>
      {user?.role === 'Admin' && (
        <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--color-non-compliant)' }} onClick={() => handleDelete(row.id)} title="Delete Risk">
          <Trash2 size={14} />
        </button>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Risk Register</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Identify, evaluate, and mitigate regulatory and compliance risks.</p>
        </div>
        {isUserManagement && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} style={{ marginRight: '6px' }} />
            Log New Risk
          </button>
        )}
      </div>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Risks</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalCount}</div>
          </div>
        </div>
        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-non-compliant-light)', color: 'var(--color-non-compliant)' }}>
            <span style={{ fontWeight: 'bold' }}>C</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Critical Risks</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-non-compliant)' }}>{criticalCount}</div>
          </div>
        </div>
        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <span style={{ fontWeight: 'bold' }}>H</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>High Risks</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-warning)' }}>{highCount}</div>
          </div>
        </div>
        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-part-compliant-light)', color: 'var(--color-part-compliant)' }}>
            <span style={{ fontWeight: 'bold' }}>M</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Medium Risks</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-part-compliant)' }}>{medCount}</div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix Grid */}
      <div className="dashboard-metrics-container" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        {/* Heatmap */}
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interactive 5x5 Heatmap Matrix</h3>
            {matrixFilter && (
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setMatrixFilter(null)}>
                <X size={12} /> Clear Cell Filter ({matrixFilter.impact}x{matrixFilter.probability})
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            {/* Impact label rotated */}
            <div style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px' }}>
              IMPACT → (1 Low to 5 Critical)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              {Array.from({ length: 5 }).map((_, rIdx) => {
                const imp = 5 - rIdx; // impact rows go from 5 down to 1
                return (
                  <div key={imp} style={{ display: 'flex', gap: '4px' }}>
                    {/* Row Label */}
                    <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {imp}
                    </div>
                    {/* 5 Cells */}
                    {Array.from({ length: 5 }).map((_, cIdx) => {
                      const prob = cIdx + 1; // probability goes from 1 to 5
                      const score = imp * prob;
                      const cellCount = getCellCount(imp, prob);
                      
                      let cellClass = 'low';
                      if (score >= 16) cellClass = 'critical';
                      else if (score >= 10) cellClass = 'high';
                      else if (score >= 5) cellClass = 'medium';

                      const isSelected = matrixFilter && matrixFilter.impact === imp && matrixFilter.probability === prob;

                      return (
                        <div
                          key={prob}
                          className={`risk-cell ${cellClass} ${isSelected ? 'selected' : ''}`}
                          style={{
                            flex: 1,
                            aspectRatio: '1.8',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            border: isSelected ? '3px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            opacity: matrixFilter && !isSelected ? 0.4 : 1
                          }}
                          onClick={() => setMatrixFilter({ impact: imp, probability: prob })}
                          title={`Impact: ${imp}, Probability: ${prob} (Score: ${score})`}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>Score {score}</span>
                          {cellCount > 0 && (
                            <span style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', backgroundColor: 'rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: '10px', minWidth: '20px', textAlign: 'center' }}>
                              {cellCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* Bottom labels (Probability) */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <div style={{ width: '20px' }}></div> {/* spacer */}
                {Array.from({ length: 5 }).map((_, cIdx) => (
                  <div key={cIdx} style={{ flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    P {cIdx + 1}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                PROBABILITY → (1 Rare to 5 Almost Certain)
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter Register</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Search Title/Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Risk Status</label>
              <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { setSearch(''); setStatusFilter(''); setMatrixFilter(null); }}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading risk database...</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={filteredRisks}
            columns={tableColumns}
            renderCell={renderCell}
            actions={isUserManagement ? tableActions : null}
          />
        )}
      </div>

      {/* Log/Edit Risk Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Modify Risk Entry' : 'Log New Compliance Risk'}
        onSubmit={handleSubmit}
        submitText={isEditMode ? 'Update Entry' : 'Create Entry'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Risk Name/Title*</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Unauthorized access to server logs"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and scenarios..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Probability (1-5)</label>
              <select className="form-input" value={probability} onChange={(e) => setProbability(parseInt(e.target.value))}>
                <option value="1">1 - Rare</option>
                <option value="2">2 - Unlikely</option>
                <option value="3">3 - Possible</option>
                <option value="4">4 - Likely</option>
                <option value="5">5 - Almost Certain</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Impact (1-5)</label>
              <select className="form-input" value={impact} onChange={(e) => setImpact(parseInt(e.target.value))}>
                <option value="1">1 - Low</option>
                <option value="2">2 - Minor</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - Major</option>
                <option value="5">5 - Critical</option>
              </select>
            </div>
          </div>

          {/* Real-time score preview */}
          <div style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Calculated Risk Score:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{probability * impact}</span>
              <span className={`badge ${getRiskLevel(probability * impact).class}`}>
                {getRiskLevel(probability * impact).name}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Risk Owner</label>
            <select className="form-input" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Select Owner...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mitigation Plan</label>
            <textarea
              className="form-input"
              rows="3"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              placeholder="e.g. Implement dual factor authentication and weekly access checks..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Risks;
