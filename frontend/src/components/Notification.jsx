import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    error: {
      background: 'var(--color-non-compliant-light)',
      color: 'var(--color-non-compliant)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    success: {
      background: 'var(--color-compliant-light)',
      color: 'var(--color-compliant)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    },
    info: {
      background: 'var(--color-info-light)',
      color: 'var(--color-info)',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    },
    warning: {
      background: 'var(--color-warning-light)',
      color: 'var(--color-warning)',
      border: '1px solid rgba(249, 115, 22, 0.2)'
    }
  };

  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertCircle size={20} />
  };

  if (!message) return null;

  return (
    <div 
      className="glass-panel" 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderRadius: '8px',
        width: '100%',
        ...styles[type]
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icons[type]}
        <span style={{ fontWeight: 500, fontSize: '15px' }}>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Notification;
