import React from 'react';
import { TrendingUp } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, color = 'var(--primary)' }) => {
  return (
    <div className="card glass-panel">
      <div className="card-header">
        <span>{title}</span>
        {Icon && (
          <span className="dashboard-card-icon" style={{ color, background: `${color}14` }}>
            <Icon size={19} />
          </span>
        )}
      </div>
      <div className="card-value">{value}</div>
      <div className="dashboard-card-trend">
        <TrendingUp size={14} />
        Live compliance signal
      </div>
    </div>
  );
};

export default DashboardCard;
