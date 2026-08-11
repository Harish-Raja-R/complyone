import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ShieldAlert, FileText, CheckSquare, 
  FileCheck, ShieldQuestion, ClipboardList, BookOpen, 
  BarChart3, Settings, ShieldAlertIcon 
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const { user } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Employee', 'Auditor', 'Executive'] },
    { id: 'regulations', label: 'Regulations', icon: BookOpen, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Auditor'] },
    { id: 'requirements', label: 'Requirements', icon: FileText, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Auditor'] },
    { id: 'controls', label: 'Controls', icon: FileCheck, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Auditor'] },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Employee'] },
    { id: 'evidence', label: 'Evidence', icon: ClipboardList, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Employee', 'Auditor'] },
    { id: 'risks', label: 'Risks', icon: ShieldAlert, roles: ['Admin', 'Compliance Manager', 'Compliance Officer'] },
    { id: 'audits', label: 'Audits', icon: ShieldQuestion, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Auditor'] },
    { id: 'policies', label: 'Policies', icon: BookOpen, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Employee', 'Auditor', 'Executive'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Auditor', 'Executive'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Compliance Manager', 'Compliance Officer', 'Employee', 'Auditor', 'Executive'] }
  ];

  // Filter items based on user role
  const allowedItems = menuItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">C1</div>
        <span className="logo-text">ComplyOne</span>
      </div>
      <nav className="sidebar-menu">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`menu-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        v1.0 &copy; 2026 ComplyOne
      </div>
    </aside>
  );
};

export default Sidebar;
