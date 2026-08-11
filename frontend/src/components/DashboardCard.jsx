import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'var(--primary)' }) => {
  return (
    <div className="card glass-panel">
      <div className="card-header">
        <span>{title}</span>
        {Icon && <Icon size={20} style={{ color }} />}
      </div>
      <div className="card-value">{value}</div>
    </div>
  );
};

export default DashboardCard;
