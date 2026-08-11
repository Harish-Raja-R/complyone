import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, ShieldAlert, Award, CheckCircle } from 'lucide-react';
import Notification from '../components/Notification';

const Reports = () => {
  const { authFetch } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [dist, setDist] = useState(null);
  const [dept, setDept] = useState([]);
  const [riskDist, setRiskDist] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await authFetch('/api/reports/dashboard-stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Fetch distribution
      const distRes = await authFetch('/api/reports/compliance-distribution');
      const distData = await distRes.json();
      if (distData.success) setDist(distData.distribution);

      // Fetch department compliance
      const deptRes = await authFetch('/api/reports/department-compliance');
      const deptData = await deptRes.json();
      if (deptData.success) setDept(deptData.departmentCompliance);

      // Fetch risk stats
      const riskRes = await authFetch('/api/reports/risk-distribution');
      const riskData = await riskRes.json();
      if (riskData.success) setRiskDist(riskData.distribution);
      
    } catch (err) {
      setNotification({ message: 'Error loading analytics reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger CSV download in browser
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRegulations = async () => {
    try {
      const res = await authFetch('/api/regulations');
      const data = await res.json();
      if (data.success) {
        const headers = ['ID', 'Regulation Name', 'Regulatory Body', 'Category', 'Description', 'Effective Date', 'Status', 'Reference URL'];
        const rows = data.regulations.map(r => [
          r.id, r.name, r.regulatory_body, r.category, r.description, r.effective_date, r.status, r.reference_url
        ]);
        downloadCSV('ComplyOne_Regulations_Report.csv', headers, rows);
        setNotification({ message: 'Regulations CSV report exported successfully', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to export regulations', type: 'error' });
    }
  };

  const handleExportRequirements = async () => {
    try {
      const res = await authFetch('/api/requirements');
      const data = await res.json();
      if (data.success) {
        const headers = ['ID', 'Regulation Name', 'Requirement Title', 'Description', 'Priority', 'Department', 'Due Date', 'Status'];
        const rows = data.requirements.map(r => [
          r.id, r.regulation_name, r.title, r.description, r.priority, r.department, r.due_date, r.status
        ]);
        downloadCSV('ComplyOne_Requirements_Compliance_Report.csv', headers, rows);
        setNotification({ message: 'Requirements CSV report exported successfully', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to export requirements', type: 'error' });
    }
  };

  const handleExportRisks = async () => {
    try {
      const res = await authFetch('/api/risks');
      const data = await res.json();
      if (data.success) {
        const headers = ['ID', 'Risk Name', 'Description', 'Probability', 'Impact', 'Risk Score', 'Owner', 'Mitigation', 'Status'];
        const rows = data.risks.map(r => [
          r.id, r.name, r.description, r.probability, r.impact, r.risk_score, r.owner_name, r.mitigation, r.status
        ]);
        downloadCSV('ComplyOne_Risks_Report.csv', headers, rows);
        setNotification({ message: 'Risk Register CSV report exported successfully', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to export risks', type: 'error' });
    }
  };

  const handleExportAudits = async () => {
    try {
      const res = await authFetch('/api/audits');
      const data = await res.json();
      if (data.success) {
        const headers = ['ID', 'Audit Campaign', 'Regulation', 'Lead Auditor', 'Start Date', 'End Date', 'Status'];
        const rows = data.audits.map(a => [
          a.id, a.name, a.regulation_name, a.auditor_name, a.start_date, a.end_date, a.status
        ]);
        downloadCSV('ComplyOne_Audit_Campaigns_Report.csv', headers, rows);
        setNotification({ message: 'Audit Campaigns CSV report exported successfully', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to export audits', type: 'error' });
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Generating compliance intelligence report...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Compliance Reporting & Exports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Download full audit trails, regulations status, and compliance reports in CSV format.</p>
      </div>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Analytics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Overall Compliance</span>
            <Award size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>{stats?.complianceScore}%</span>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Percent of requirements in Compliant status</p>
        </div>

        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>High & Critical Risks</span>
            <ShieldAlert size={20} style={{ color: 'var(--color-non-compliant)' }} />
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-non-compliant)' }}>
            {(riskDist?.Critical || 0) + (riskDist?.High || 0)}
          </span>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active risks requiring immediate mitigation</p>
        </div>

        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Compliant Requirements</span>
            <CheckCircle size={20} style={{ color: 'var(--color-compliant)' }} />
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-compliant)' }}>{dist?.Compliant || 0}</span>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Requirements fully signed off</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Export Reports Card */}
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download CSV Reports</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Regulations Catalog Report</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Details of registered global regulatory standards.</p>
              </div>
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }} onClick={handleExportRegulations}>
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Compliance Controls & Requirements</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Department-wise compliance scoring and due-dates.</p>
              </div>
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }} onClick={handleExportRequirements}>
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Operational Risk Matrix Register</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>List of evaluated risks, scores, and mitigations.</p>
              </div>
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }} onClick={handleExportRisks}>
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Audit Campaigns Tracker</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>History of scheduled audit results and key findings.</p>
              </div>
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }} onClick={handleExportAudits}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Department Compliance Stats */}
        <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department Breakdown</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {dept.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ fontWeight: 500 }}>{item.department} Department</span>
                  <span style={{ fontWeight: 600, color: item.score >= 85 ? 'var(--color-compliant)' : 'var(--color-part-compliant)' }}>{item.score}%</span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.score}%`, backgroundColor: item.score >= 85 ? 'var(--color-compliant)' : 'var(--color-part-compliant)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
