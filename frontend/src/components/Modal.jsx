import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, onSubmit, submitText = 'Submit' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>{title}</h3>
          <button className="notification-bell-btn" onClick={onClose} style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(); }}>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
