import React, { useState, useEffect } from 'react';
import Icon from '../Icons';
import '../../styles/professional-dashboard.css';

interface ProfessionalDashboardProps {
  user: any;
  userProfile?: {
    businessName?: string;
    ownerName?: string;
    email?: string;
  };
  signOut: () => void;
  children?: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  user,
  userProfile,
  signOut,
  children,
  activeView = 'overview',
  onViewChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Professional name display logic
  const getDisplayName = () => {
    return userProfile?.businessName || userProfile?.ownerName || user?.username || 'Business Owner';
  };

  const getDisplayInitials = () => {
    const name = getDisplayName();
    if (userProfile?.businessName) {
      // Use business name initials (e.g., "Acme Corp" -> "AC")
      return userProfile.businessName.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
    }
    return name.charAt(0).toUpperCase();
  };

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
      icon: 'dashboard',
      label: 'Dashboard',
      sublabel: 'Overview & Analytics'
    },
    {
      id: 'assessment',
      icon: 'assessment',
      label: 'Assessment',
      sublabel: 'Investment Readiness'
    },
    {
      id: 'growth',
      icon: 'growth',
      label: 'Investment Accelerator',
      sublabel: 'Transform Your Business'
    },
    {
      id: 'transactions',
      icon: 'transactions',
      label: 'Transactions',
      sublabel: 'Financial Records'
    },
    {
      id: 'billing',
      icon: 'billing',
      label: 'Billing',
      sublabel: 'Subscription & Payments'
    },
    {
      id: 'profile',
      icon: 'profile',
      label: 'Business Profile',
      sublabel: 'Company Information'
    },
    {
      id: 'settings',
      icon: 'settings',
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
            <span className="user-avatar">{getDisplayInitials()}</span>
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
              <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} size={16} />
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
                <span className="nav-icon">
                  <Icon name={item.icon} size={20} />
                </span>
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
                <span className="nav-icon">
                  <Icon name={item.icon} size={20} />
                </span>
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
              {getDisplayInitials()}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{getDisplayName()}</span>
                <span className="user-role">Business Owner</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="logout-button" onClick={signOut}>
              <Icon name="logout" size={18} />
              <span>Sign Out</span>
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
              <Icon name="notification" size={20} />
              <span className="notification-badge">3</span>
            </button>
            <button className="topbar-button">
              <Icon name="help" size={20} />
            </button>
            <div className="topbar-user">
              <span className="user-greeting">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},</span>
              <span className="user-name">{getDisplayName()}</span>
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