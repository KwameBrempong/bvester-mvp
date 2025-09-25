import React, { useState, useEffect } from 'react';
import '../../styles/professional-dashboard.css';

interface ProfessionalDashboardProps {
  user: any;
  signOut: () => void;
  children?: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  user,
  signOut,
  children,
  activeView = 'overview',
  onViewChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      id: 'overview',
      icon: '📊',
      label: 'Dashboard',
      sublabel: 'Overview & Analytics'
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Business Profile',
      sublabel: 'Company Information'
    },
    {
      id: 'assessment',
      icon: '📋',
      label: 'Assessment',
      sublabel: 'Investment Readiness'
    },
    {
      id: 'growth',
      icon: '📈',
      label: 'Growth Tools',
      sublabel: 'Accelerator Program'
    },
    {
      id: 'bootcamp',
      icon: '🎯',
      label: 'Bootcamp',
      sublabel: 'Training & Resources'
    },
    {
      id: 'xray',
      icon: '🔍',
      label: 'Investment X-Ray',
      sublabel: 'Deep Analysis'
    },
    {
      id: 'transactions',
      icon: '💰',
      label: 'Transactions',
      sublabel: 'Financial Records'
    },
    {
      id: 'billing',
      icon: '💳',
      label: 'Billing',
      sublabel: 'Subscription & Payments'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      sublabel: 'Account Preferences'
    }
  ];

  const handleMenuClick = (itemId: string) => {
    if (onViewChange) {
      onViewChange(itemId);
    }
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  return (
    <div className="professional-dashboard">
      {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="mobile-logo">
            <span className="logo-icon">BV</span>
            <span className="logo-text">Bvester</span>
          </div>
          <button className="mobile-user-menu">
            <span className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${showMobileMenu ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">BV</span>
            {!isCollapsed && <span className="logo-text">Bvester</span>}
          </div>
          {!isMobile && (
            <button
              className="sidebar-toggle"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {menuItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-sublabel">{item.sublabel}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="nav-divider"></div>

          <div className="nav-section">
            {menuItems.slice(6).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-sublabel">{item.sublabel}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{user?.username || 'User'}</span>
                <span className="user-role">Business Owner</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="logout-button" onClick={signOut}>
              <span>🚪</span> Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}
            </h1>
            <p className="page-subtitle">
              {menuItems.find(item => item.id === activeView)?.sublabel || 'Welcome back!'}
            </p>
          </div>
          <div className="topbar-right">
            <button className="topbar-button notification-button">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="topbar-button">
              <span>❓</span>
            </button>
            <div className="topbar-user">
              <span className="user-greeting">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},</span>
              <span className="user-name">{user?.username || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          <div className="content-wrapper">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default ProfessionalDashboard;