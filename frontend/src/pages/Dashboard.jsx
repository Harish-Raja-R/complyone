import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, ShieldAlert, CheckSquare, 
  HelpCircle, BookOpen, AlertTriangle, Activity, Sparkles, Clock3
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const useCountUp = (value, duration = 1000) => {
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

      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, duration]);

  return displayValue;
};

const Dashboard = () => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({
    complianceScore: 0,
    totalRegulations: 0,
    activeRequirements: 0,
    completedTasks: 0,
    overdueTasks: 0,
    openRisks: 0,
    activeAudits: 0
  });
  
  const [distribution, setDistribution] = useState({});
  const [deptCompliance, setDeptCompliance] = useState([]);
  const [riskStats, setRiskStats] = useState({ Critical: 0, High: 0, Medium: 0, Low: 0 });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const animatedComplianceScore = useCountUp(stats.complianceScore, 1200);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const revealItems = [...document.querySelectorAll('.dashboard-reveal')];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty('--dashboard-reveal-delay', `${Math.min(index * 55, 380)}ms`);
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await authFetch('/api/reports/dashboard-stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch distribution
      const distRes = await authFetch('/api/reports/compliance-distribution');
      const distData = await distRes.json();
      if (distData.success) {
        setDistribution(distData.distribution);
      }

      // Fetch department compliance
      const deptRes = await authFetch('/api/reports/department-compliance');
      const deptData = await deptRes.json();
      if (deptData.success) {
        setDeptCompliance(deptData.departmentCompliance);
      }

      // Fetch risk stats
      const riskRes = await authFetch('/api/reports/risk-distribution');
      const riskData = await riskRes.json();
      if (riskData.success) {
        setRiskStats(riskData.distribution);
      }

      // Fetch upcoming tasks (from tasks list)
      const tasksRes = await authFetch('/api/tasks?status=To%20Do');
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setUpcomingTasks(tasksData.tasks.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard compliance stats...</div>;
  }

  // Circular gauge calculations
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (stats.complianceScore / 100) * circumference;
  const totalRegisteredItems = stats.activeRequirements + stats.completedTasks;
  const riskCellCounts = {
    critical: riskStats.Critical || 0,
    high: riskStats.High || 0,
    medium: riskStats.Medium || 0,
    low: riskStats.Low || 0
  };

  return (
    <div className="dashboard-motion-shell" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="dashboard-hero dashboard-reveal">
        <div>
          <span className="dashboard-title-eyebrow">Compliance command center</span>
          <h1 style={{ fontSize: '42px', fontWeight: 780, color: 'var(--text-primary)', marginTop: '6px' }}>Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', marginTop: '4px' }}>
            Welcome to ComplyOne. Your controls, risks, audits, and tasks are tuned into one live workspace.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <span className="premium-chip"><Activity size={16} /> Live posture</span>
          <span className="premium-chip"><Sparkles size={16} /> Premium workspace</span>
        </div>
      </div>

      <div className="premium-strip">
        <div className="premium-mini glass-panel dashboard-motion-card dashboard-reveal">
          <span className="dashboard-title-eyebrow">Assurance score</span>
          <strong>{animatedComplianceScore}% operationally ready</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Based on completed tasks, active requirements, and current risk movement.
          </p>
        </div>
        <div className="premium-mini glass-panel dashboard-motion-card dashboard-reveal">
          <span className="dashboard-title-eyebrow">Next review</span>
          <strong>Today</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            {upcomingTasks.length} task checkpoints need attention.
          </p>
        </div>
        <div className="premium-mini glass-panel dashboard-motion-card dashboard-reveal">
          <span className="dashboard-title-eyebrow">Risk pulse</span>
          <strong>{riskStats.Critical + riskStats.High} priority items</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Critical and high risks are surfaced first.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <DashboardCard title="Regulations" value={stats.totalRegulations} icon={BookOpen} color="var(--primary)" />
        <DashboardCard title="Active Req." value={stats.activeRequirements} icon={FileText} color="var(--accent)" />
        <DashboardCard title="Completed Tasks" value={stats.completedTasks} icon={CheckSquare} color="var(--color-compliant)" />
        <DashboardCard title="Overdue Tasks" value={stats.overdueTasks} icon={AlertTriangle} color="var(--color-non-compliant)" />
        <DashboardCard title="Active Risks" value={stats.openRisks} icon={ShieldAlert} color="var(--color-warning)" />
        <DashboardCard title="Active Audits" value={stats.activeAudits} icon={HelpCircle} color="var(--color-info)" />
      </div>

      {/* Compliance Gauge & Risks Matrix */}
      <div className="dashboard-metrics-container">
        {/* Compliance score circular gauge */}
        <div className="compliance-gauge-card glass-panel dashboard-motion-card dashboard-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="gauge-circle">
              <svg height={radius * 2} width={radius * 2} className="dashboard-progress-ring">
                <circle
                  className="dashboard-progress-track"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  className="dashboard-progress-value"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ '--dash-start': circumference, '--dash-offset': strokeDashoffset, strokeDashoffset }}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="gauge-percentage">{animatedComplianceScore}%</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Compliant</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Overall Compliance Health</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Calculated based on <strong>{stats.completedTasks}</strong> completed activities out of <strong>{totalRegisteredItems}</strong> registered items.
            </p>
            <div className="compliance-health-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', '--row-accent': 'var(--color-compliant)' }}>
                <span>Compliant Requirements</span>
                <span style={{ fontWeight: 600, color: 'var(--color-compliant)' }}>{distribution.Compliant || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', '--row-accent': 'var(--color-part-compliant)' }}>
                <span>Partially Compliant</span>
                <span style={{ fontWeight: 600, color: 'var(--color-part-compliant)' }}>{distribution['Partially Compliant'] || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', '--row-accent': 'var(--color-non-compliant)' }}>
                <span>Non-Compliant</span>
                <span style={{ fontWeight: 600, color: 'var(--color-non-compliant)' }}>{distribution['Non-Compliant'] || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Matrix widget */}
        <div className="card glass-panel dashboard-motion-card dashboard-reveal risk-heatmap-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interactive 5x5 Heatmap Matrix</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <span>Critical risks: <strong>{riskStats.Critical}</strong></span>
            <span>High: <strong>{riskStats.High}</strong></span>
            <span>Medium: <strong>{riskStats.Medium}</strong></span>
          </div>
          <div className="risk-matrix-shell">
            <span className="risk-axis risk-axis-y">Impact → (1 Low to 5 Critical)</span>
            <div className="risk-matrix" style={{ marginTop: '10px' }}>
            {/* Simple representation of 5x5 matrix cells */}
            {Array.from({ length: 25 }).map((_, i) => {
              const x = 5 - Math.floor(i / 5); // impact (1 to 5)
              const y = (i % 5) + 1; // probability (1 to 5)
              const score = x * y;
              let severity = 'low';
              if (score >= 16) severity = 'critical';
              else if (score >= 10) severity = 'high';
              else if (score >= 5) severity = 'medium';

              return (
                <div key={i} className={`risk-cell ${severity}`} title={`Score: ${score}`} style={{ '--risk-delay': `${i * 28}ms` }}>
                  <span>Score {score}</span>
                  {riskCellCounts[severity] > 0 && score >= 8 ? <strong>{riskCellCounts[severity]}</strong> : null}
                </div>
              );
            })}
            </div>
            <span className="risk-axis risk-axis-x">Probability → (1 Rare to 5 Almost Certain)</span>
          </div>
        </div>
      </div>

      {/* Department Score & Upcoming Tasks */}
      <div className="dashboard-two-column">
        {/* Department performance column chart */}
        <div className="card glass-panel dashboard-motion-card dashboard-reveal">
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department Compliance</h3>
          <div className="chart-container">
            {deptCompliance.map((item, index) => (
              <div key={index} className="chart-bar-wrapper" style={{ '--bar-delay': `${index * 120}ms` }}>
                <div className="chart-bar" style={{ '--bar-height': `${item.score}%`, height: `${item.score}%` }}>
                  <span className="chart-bar-value">{item.score}%</span>
                </div>
                <span className="chart-bar-label">{item.department}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="card glass-panel dashboard-motion-card dashboard-reveal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingTasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                No pending tasks.
              </div>
            ) : (
              upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="upcoming-task-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{t.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Req: {t.requirement_title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Clock3 size={13} /> {t.due_date}
                    </span>
                    <span className={`badge badge-non-compliant`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
