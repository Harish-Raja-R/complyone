import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ShieldAlert, FileText, CheckSquare, 
  FileCheck, ShieldQuestion, ClipboardList, BookOpen, 
  BarChart3, Settings, Sparkles
} from 'lucide-react';
import complyOneLogo from '../assets/complyone-logo.png';

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
        <div className="brand-lockup" aria-label="ComplyOne">
          <span className="brand-logo-frame">
            <img className="brand-logo brand-logo-sidebar" src={complyOneLogo} alt="" />
          </span>
          <span className="brand-copy">
            <strong>ComplyOne</strong>
            <span>Governance OS</span>
          </span>
        </div>
      </div>
      <nav className="sidebar-menu">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`menu-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-footer-chip"><Sparkles size={13} /> v1.0</span>
        <span>&copy; 2026 ComplyOne</span>
      </div>
    </aside>
  );
};

export default Sidebar;
