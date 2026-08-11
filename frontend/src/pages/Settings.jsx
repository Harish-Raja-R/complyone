import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Eye, ShieldAlert, Monitor, Moon, Sun, Clipboard } from 'lucide-react';
import Table from '../components/Table';
import Notification from '../components/Notification';

const Settings = () => {
  const { user, authFetch } = useAuth();
  
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('comply_theme') || 'light');
  
  // Logs state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Sync theme attribute with document state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('comply_theme', theme);
  }, [theme]);

  // Fetch Activity Logs (only if role is authorized)
  const canViewLogs = user && ['Admin', 'Compliance Manager', 'Executive', 'Compliance Officer'].includes(user.role);

  useEffect(() => {
    if (canViewLogs) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await authFetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setNotification({ message: `Theme switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, type: 'info' });
  };

  // Filter logs locally
  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.user_name?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.entity?.toLowerCase().includes(logSearch.toLowerCase()) ||
      String(l.entity_id).includes(logSearch);
    return matchesSearch;
  });

  const logHeaders = ['ID', 'User', 'Email', 'Action', 'Entity', 'Entity ID', 'IP Address', 'Timestamp'];
  const logColumns = ['id', 'user_name', 'user_email', 'action', 'entity', 'entity_id', 'ip_address', 'timestamp'];

  const renderLogCell = (row, col) => {
    if (col === 'timestamp') {
      return new Date(row.timestamp).toLocaleString();
    }
    if (col === 'action') {
      let badgeStyle = 'badge-active';
      if (row.action === 'Delete') badgeStyle = 'badge-non-compliant';
      if (row.action === 'Create') badgeStyle = 'badge-compliant';
      if (row.action === 'Login') badgeStyle = 'badge-draft';
      return <span className={`badge ${badgeStyle}`}>{row.action}</span>;
    }
    return row[col] !== null && row[col] !== undefined ? String(row[col]) : 'N/A';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>System Settings & Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage theme preferences, view user profile scopes, and inspect security audit logs.</p>
      </div>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Account Profile</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={30} />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600 }}>{user?.name}</h4>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {user?.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email Address</span>
              <span style={{ fontWeight: 500 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Department Scope</span>
              <span style={{ fontWeight: 500 }}>{user?.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Session Scope</span>
              <span style={{ fontWeight: 600, color: 'var(--color-compliant)' }}>Active Access Token</span>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Display Settings</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {theme === 'dark' ? <Moon size={22} style={{ color: 'var(--primary)' }} /> : <Sun size={22} style={{ color: 'var(--primary)' }} />}
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Application Theme Color</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Toggle between high-contrast dark and light modes.</p>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleToggleTheme}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Monitor size={22} />
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Integrations & Webhooks</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Send compliance alerts to Slack or Teams channels.</p>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>ENTERPRISE</span>
          </div>
        </div>
      </div>

      {/* Activity Logs (Role Protected) */}
      <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Activity Log Audit Trail</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Complete cryptographic audit trail of logins, task completions, and risk mitigations.</p>
          </div>
          {canViewLogs && (
            <input
              type="text"
              className="form-input"
              style={{ width: '250px' }}
              placeholder="Search logs by action, user..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
            />
          )}
        </div>

        {!canViewLogs ? (
          <div style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={40} style={{ color: 'var(--color-warning)' }} />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>Access Denied</span>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
              Security audit logs are restricted to Admins, Compliance Managers, Executives, and Compliance Officers. Your role ({user?.role}) does not have permission to view logs.
            </p>
          </div>
        ) : loadingLogs ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading system logs database...</div>
        ) : (
          <Table
            headers={logHeaders}
            data={filteredLogs}
            columns={logColumns}
            renderCell={renderLogCell}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
