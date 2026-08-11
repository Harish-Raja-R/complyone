import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Download } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

const Evidence = () => {
  const { user, authFetch, API_BASE_URL } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Review Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [comments, setComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState('Approved');

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/evidence');
      const data = await res.json();
      if (data.success) {
        setEvidenceList(data.evidence);
      }
    } catch (err) {
      showNotice('Error loading evidence registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (msg, type = 'success') => {
    setNotification({ message: msg, type });
  };

  const handleOpenReview = (ev, status) => {
    setActiveEvidence(ev);
    setReviewStatus(status);
    setComments('');
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const res = await authFetch(`/api/evidence/${activeEvidence.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: reviewStatus,
          comments
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Evidence review submitted: ${reviewStatus}`);
        setIsReviewOpen(false);
        fetchEvidence();
      } else {
        showNotice(data.message || 'Review failed', 'error');
      }
    } catch (err) {
      showNotice('API connection error', 'error');
    }
  };

  const handleDownload = (id, fileName) => {
    const token = localStorage.getItem('comply_token');
    // Fetch file directly by opening download link in a new window with auth parameter or using fetch blob.
    // For absolute correctness, let's fetch with Auth headers and download as a blob:
    authFetch(`/api/evidence/${id}/download`)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => showNotice('Error downloading file', 'error'));
  };

  const canReview = user && ['Admin', 'Compliance Manager', 'Compliance Officer'].includes(user.role);

  const tableHeaders = ['ID', 'File Name', 'Associated Task', 'Uploaded By', 'Reviewed By', 'Upload Date', 'Status'];
  const tableColumns = ['id', 'file_name', 'task_title', 'uploaded_by_name', 'reviewed_by_name', 'uploaded_at', 'status'];

  const renderCell = (row, col) => {
    if (col === 'status') {
      let badgeStyle = 'badge-draft';
      if (row.status === 'Approved') badgeStyle = 'badge-compliant';
      if (row.status === 'Pending Review') badgeStyle = 'badge-active';
      if (row.status === 'Rejected') badgeStyle = 'badge-non-compliant';
      if (row.status === 'Expired') badgeStyle = 'badge-overdue';
      return <span className={`badge ${badgeStyle}`}>{row.status}</span>;
    }
    if (col === 'uploaded_at') {
      return new Date(row.uploaded_at).toLocaleDateString();
    }
    return row[col] !== null && row[col] !== undefined ? String(row[col]) : 'N/A';
  };

  const tableActions = (row) => (
    <>
      <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleDownload(row.id, row.file_name)} title="Download File">
        <Download size={14} />
      </button>
      {canReview && row.status === 'Pending Review' && (
        <>
          <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--color-compliant)' }} onClick={() => handleOpenReview(row, 'Approved')} title="Approve">
            <Check size={14} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'var(--color-non-compliant)' }} onClick={() => handleOpenReview(row, 'Rejected')} title="Reject">
            <X size={14} />
          </button>
        </>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Evidence Library</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review uploaded artifact logs, files, and verify audit-readiness.</p>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlignment: 'center' }}>Loading evidence list...</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={evidenceList}
            columns={tableColumns}
            renderCell={renderCell}
            actions={tableActions}
          />
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`Review Evidence: ${reviewStatus}`}
        onSubmit={handleReviewSubmit}
        submitText="Submit Review"
      >
        {activeEvidence && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <p><strong>File Name:</strong> {activeEvidence.file_name}</p>
            <p><strong>Task Title:</strong> {activeEvidence.task_title}</p>
            <p><strong>Uploaded By:</strong> {activeEvidence.uploaded_by_name}</p>
            <div className="form-group">
              <label className="form-label">Review Comments</label>
              <textarea
                className="form-input"
                rows="3"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Include explanation for approval or rejection reason..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Evidence;
