import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, Clock, FileText, ChevronRight, UserCheck } from 'lucide-react';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const POLICIES_DATA = [
  {
    id: 'isp',
    title: 'Information Security Policy (ISP)',
    category: 'Security Operations',
    version: 'v3.2',
    lastReviewed: '2026-01-15',
    summary: 'Establishes technical controls protecting system environments. Outlines login rules, password parameters, and asset handling.',
    content: `1. Purpose
This policy defines the core security requirements for protecting ComplyOne's database systems, networks, and logical assets from unauthorized access or damage.

2. Access Controls & Passwords
- All user passwords must be at least 12 characters in length and contain a mix of uppercase, lowercase, numbers, and special symbols.
- Multi-Factor Authentication (MFA) is strictly required for all administrative access pathways.
- Passwords must be rotated every 90 days.

3. Encryption & Data Classification
- Data must be classified into four buckets: Public, Internal, Confidential, and Restricted.
- Any Restricted or Confidential records containing customer configurations must be encrypted in transit via TLS 1.3 and at rest using AES-256.

4. Auditing & Violations
- Device screens must auto-lock after 5 minutes of inactivity.
- Any security violations of this policy may trigger immediate account revocation and internal review.`
  },
  {
    id: 'acp',
    title: 'Access Control Policy (ACP)',
    category: 'Access Management',
    version: 'v2.1',
    lastReviewed: '2026-02-18',
    summary: 'Governs the "least privilege" protocol. Defines account provisioning, offboarding, and quarterly privilege reviews.',
    content: `1. Purpose
Enforces the principle of least privilege, ensuring employees only have access to information assets necessary to execute their role.

2. Access Request Process
- Role permissions are mapped dynamically based on departments. Any elevation requires a formal manager approval.
- Access to production databases is limited to Senior Devops engineers and Compliance auditors.

3. De-provisioning Accounts
- Standard employee accounts must be disabled immediately upon HR separation notification.
- High-privilege access keys must be rotated within 12 hours of administrative offboarding.

4. Periodic Audits
- Compliance Managers must conduct a comprehensive access control privilege review every quarter.`
  },
  {
    id: 'dpp',
    title: 'Data Protection & Privacy Policy',
    category: 'Regulatory Compliance',
    version: 'v4.0',
    lastReviewed: '2026-03-12',
    summary: 'Specifies processing of PII under GDPR/CCPA guidelines. Sets rules for storage limit, masking, and client consent.',
    content: `1. Purpose
Ensures organizational compliance with global privacy regulations (GDPR, CCPA, HIPAA) regarding the processing and storage of Personal Identifiable Information (PII).

2. Core Principles
- PII must only be collected for specified, explicit, and legitimate operational purposes.
- PII data must be anonymized or masked when utilized in test or staging environments.
- Customer records must be fully deleted from active archives upon request ("Right to be Forgotten").

3. Retention Policy
- Backup storage containing customer logs must be kept for exactly 7 years and securely destroyed thereafter using certified overwrite processes.`
  },
  {
    id: 'irp',
    title: 'Incident Response Plan (IRP)',
    category: 'Crisis Management',
    version: 'v3.0',
    lastReviewed: '2026-05-02',
    summary: 'Outlines standard operational procedures for incident detection, triage, containment, and post-incident root-cause analysis.',
    content: `1. Purpose
Establishes a rapid response structure to minimize downtime and mitigate damage during a cybersecurity breach or network compromise.

2. Severity Triage
- Severity 1 (Critical): Active data exfiltration, system-wide ransomware, or web server outage.
- Severity 2 (Major): Isolated malware infection or single employee credential leak.
- Severity 3 (Minor): Scans or probes detected on network firewalls.

3. Response Timeline
- Severity 1 incidents must be escalated to the Chief Information Security Officer (CISO) and logged in the incident tracker within 15 minutes of detection.
- Legal notification to affected clients must be completed within 72 hours of incident confirmation.`
  },
  {
    id: 'aup',
    title: 'Acceptable Use Policy (AUP)',
    category: 'Corporate Governance',
    version: 'v1.5',
    lastReviewed: '2026-06-30',
    summary: 'Rules for corporate assets, remote working connections, hardware use, and data transmission restrictions.',
    content: `1. Purpose
Defines acceptable behavior regarding the use of corporate networks, laptops, emails, and information systems.

2. Prohibited Uses
- Installing unsanctioned or cracked software onto work computers.
- Sending or storing harassment material, spam, or copyrighted media.
- Bypassing network security or firewalls utilizing proxy servers or unauthorized VPNs.

3. Remote Working Requirements
- Employees accessing the corporate network from public networks must connect via corporate VPN.
- Laptops must never be left unattended in public spaces.`
  }
];

const Policies = () => {
  const { user } = useAuth();
  const [acknowledged, setAcknowledged] = useState({});
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`comply_ack_policies_${user.id}`);
      if (stored) {
        setAcknowledged(JSON.parse(stored));
      }
    }
  }, [user]);

  const handleOpenPolicy = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleAcknowledge = () => {
    if (!selectedPolicy || !user) return;
    
    const updated = {
      ...acknowledged,
      [selectedPolicy.id]: {
        acknowledgedAt: new Date().toISOString(),
        userName: user.name
      }
    };
    
    setAcknowledged(updated);
    localStorage.setItem(`comply_ack_policies_${user.id}`, JSON.stringify(updated));
    
    // Simulate log activity entry
    console.log(`User ${user.name} acknowledged policy: ${selectedPolicy.title}`);
    
    setNotification({
      message: `Acknowledgment submitted for: ${selectedPolicy.title}`,
      type: 'success'
    });
    
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Policy & Governance Library</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and sign corporate compliance policies, security standards, and audit blueprints.</p>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {POLICIES_DATA.map((policy) => {
          const isAcked = !!acknowledged[policy.id];
          return (
            <div 
              key={policy.id} 
              className={`card glass-panel`} 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                position: 'relative',
                borderTop: isAcked ? '4px solid var(--color-compliant)' : '4px solid var(--border-color)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => handleOpenPolicy(policy)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-draft" style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 8px' }}>
                  {policy.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {policy.version}
                </span>
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {policy.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                  {policy.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Reviewed: {policy.lastReviewed}
                </span>
                {isAcked ? (
                  <span style={{ color: 'var(--color-compliant)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Signed
                  </span>
                ) : (
                  <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Read & Sign <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Viewer / Signature Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPolicy?.title}
        onSubmit={handleAcknowledge}
        submitText="Sign & Acknowledge"
      >
        {selectedPolicy && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <span>Version: <strong>{selectedPolicy.version}</strong></span>
              <span>Last Audit Review: <strong>{selectedPolicy.lastReviewed}</strong></span>
            </div>
            
            <div 
              style={{ 
                maxHeight: '350px', 
                overflowY: 'auto', 
                backgroundColor: 'var(--bg-tertiary)', 
                padding: '16px', 
                borderRadius: '8px', 
                fontFamily: 'monospace', 
                fontSize: '13px', 
                lineHeight: '1.6', 
                whiteSpace: 'pre-wrap', 
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)' 
              }}
            >
              {selectedPolicy.content}
            </div>

            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <UserCheck size={20} style={{ color: 'var(--primary)' }} />
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Logging signature for: <strong>{user?.name}</strong> ({user?.role}). Timestamp will be registered upon confirmation.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Policies;
