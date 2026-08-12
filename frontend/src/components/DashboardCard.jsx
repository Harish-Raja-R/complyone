import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

const useCountUp = (value, duration = 900) => {
  const numericValue = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numericValue * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, duration]);

  return displayValue;
};

const DashboardCard = ({ title, value, icon: Icon, color = 'var(--primary)' }) => {
  const animatedValue = useCountUp(value);

  return (
    <div className="card glass-panel dashboard-kpi-card dashboard-motion-card dashboard-reveal" style={{ '--card-accent': color }}>
      <div className="card-header">
        <span>{title}</span>
        {Icon && (
          <span className="dashboard-card-icon" style={{ color, background: `${color}14` }}>
            <Icon size={19} />
          </span>
        )}
      </div>
      <div className="card-value dashboard-count-up">{animatedValue}</div>
      <div className="dashboard-card-trend">
        <TrendingUp size={14} />
        <span>Live compliance signal</span>
      </div>
    </div>
  );
};

export default DashboardCard;
