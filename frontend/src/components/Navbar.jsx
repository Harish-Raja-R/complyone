import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, LogOut, User, CheckSquare } from 'lucide-react';

const Navbar = ({ onSearchChange }) => {
  const { user, logout, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await authFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await authFetch('/api/notifications/read-all', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="search-bar-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Global Search..."
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        {/* Notifications Icon and Popover */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-popover glass-panel">
              <div className="popover-header">
                <h4 style={{ fontWeight: 600 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="popover-body">
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile and Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{user?.name}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {user?.role}
            </span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={logout} title="Log Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
