import React from 'react';
import DashboardKPIs from './DashboardKPIs';
import { ComingSoonState, NoTransactionsState, EmptyState } from '../EmptyStates';
import Icon from '../Icons';
import '../../styles/dashboard-views.css';

// Overview Dashboard (Default view with KPIs)
export const OverviewView: React.FC = () => {
  return <DashboardKPIs />;
};

// Business Profile View
export const ProfileView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <Icon name="building" size={48} color="var(--gold-primary)" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">Your Business Name</h2>
            <p className="profile-industry">Technology & Innovation</p>
            <div className="profile-badges">
              <span className="badge badge-gold">Verified</span>
              <span className="badge badge-outline">Growth Stage</span>
            </div>
          </div>
        </div>
        
        <div className="profile-sections">
          <div className="profile-section">
            <h3 className="section-title">Company Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Founded</span>
                <span className="detail-value">2022</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employees</span>
                <span className="detail-value">10-25</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">Accra, Ghana</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Revenue</span>
                <span className="detail-value">GHS 500K - 1M</span>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h3 className="section-title">Business Description</h3>
            <p className="profile-description">
              Add your business description here to help investors understand your value proposition and market opportunity.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                // Open profile editing modal or navigate to profile page
                const confirmed = confirm('This will open the profile editor. Would you like to continue?');
                if (confirmed) {
                  // For now, show a placeholder message
                  alert('Profile editing functionality will be implemented soon. You can update your business information, description, and other details here.');
                  // TODO: Implement actual profile editing logic
                  // This could open a modal, navigate to a separate page, or enable inline editing
                }
              }}
            >
              <Icon name="edit" size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assessment View
export const AssessmentView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <div className="assessment-card">
        <div className="assessment-header">
          <Icon name="assessment" size={48} color="var(--gold-primary)" />
          <h2>Investment Readiness Assessment</h2>
          <p>Evaluate your business's preparedness for investment</p>
        </div>
        
        <div className="assessment-score">
          <div className="score-circle">
            <svg className="score-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--gray-200)" strokeWidth="10"/>
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="none" 
                stroke="var(--gold-primary)" 
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50 * 0.72} ${2 * Math.PI * 50}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="score-value">72%</div>
          </div>
          <h3>Good Progress</h3>
          <p>Your business shows strong potential for investment</p>
        </div>
        
        <div className="assessment-categories">
          <div className="category-item">
            <span className="category-name">Business Model</span>
            <div className="category-progress">
              <div className="progress-bar" style={{ width: '85%' }} />
            </div>
            <span className="category-score">85%</span>
          </div>
          <div className="category-item">
            <span className="category-name">Financial Health</span>
            <div className="category-progress">
              <div className="progress-bar" style={{ width: '70%' }} />
            </div>
            <span className="category-score">70%</span>
          </div>
          <div className="category-item">
            <span className="category-name">Market Opportunity</span>
            <div className="category-progress">
              <div className="progress-bar" style={{ width: '75%' }} />
            </div>
            <span className="category-score">75%</span>
          </div>
          <div className="category-item">
            <span className="category-name">Team & Leadership</span>
            <div className="category-progress">
              <div className="progress-bar" style={{ width: '60%' }} />
            </div>
            <span className="category-score">60%</span>
          </div>
        </div>
        
        <button className="btn btn-primary btn-lg">
          Start Full Assessment
        </button>
      </div>
    </div>
  );
};

// Growth Tools View
export const GrowthView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <ComingSoonState feature="Growth Tools" />
    </div>
  );
};

// Bootcamp View
export const BootcampView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <div className="bootcamp-container">
        <div className="bootcamp-header">
          <h2>Business Bootcamp</h2>
          <p>Accelerate your business growth with expert-led training</p>
        </div>
        
        <div className="bootcamp-modules">
          <div className="module-card">
            <div className="module-icon">
              <Icon name="book" size={32} color="var(--gold-primary)" />
            </div>
            <h3>Foundation Module</h3>
            <p>Business fundamentals and strategy</p>
            <div className="module-progress">
              <div className="progress-bar" style={{ width: '30%' }} />
            </div>
            <span className="module-status">3 of 10 lessons completed</span>
          </div>
          
          <div className="module-card">
            <div className="module-icon">
              <Icon name="finance" size={32} color="var(--gold-primary)" />
            </div>
            <h3>Financial Management</h3>
            <p>Master your business finances</p>
            <div className="module-progress">
              <div className="progress-bar" style={{ width: '0%' }} />
            </div>
            <span className="module-status">Not started</span>
          </div>
          
          <div className="module-card locked">
            <div className="module-icon">
              <Icon name="lock" size={32} color="var(--gray-400)" />
            </div>
            <h3>Advanced Growth</h3>
            <p>Scaling and expansion strategies</p>
            <span className="module-status">Unlock after completing Financial Management</span>
          </div>
        </div>
        
        <button className="btn btn-primary">
          Continue Learning
        </button>
      </div>
    </div>
  );
};

// Investment X-Ray View
export const XRayView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <ComingSoonState feature="Investment X-Ray" />
    </div>
  );
};

// Transactions View
export const TransactionsView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <NoTransactionsState />
    </div>
  );
};

// Billing View
export const BillingView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <div className="billing-container">
        <div className="billing-header">
          <h2>Billing & Subscription</h2>
          <p>Manage your subscription and payment methods</p>
        </div>
        
        <div className="subscription-card">
          <div className="subscription-badge">
            <Icon name="star" size={24} color="var(--gold-primary)" />
            <span>Pro Plan</span>
          </div>
          <h3>GHS 99/month</h3>
          <p>Full access to all features and tools</p>
          
          <div className="subscription-features">
            <div className="feature-item">
              <Icon name="check" size={16} color="var(--gold-primary)" />
              <span>Unlimited assessments</span>
            </div>
            <div className="feature-item">
              <Icon name="check" size={16} color="var(--gold-primary)" />
              <span>All bootcamp modules</span>
            </div>
            <div className="feature-item">
              <Icon name="check" size={16} color="var(--gold-primary)" />
              <span>Investment X-Ray reports</span>
            </div>
            <div className="feature-item">
              <Icon name="check" size={16} color="var(--gold-primary)" />
              <span>Priority support</span>
            </div>
          </div>
          
          <div className="subscription-actions">
            <button className="btn btn-outline">Change Plan</button>
            <button className="btn btn-outline">Cancel Subscription</button>
          </div>
        </div>
        
        <div className="payment-methods">
          <h3>Payment Methods</h3>
          <div className="payment-card">
            <Icon name="card" size={24} color="var(--gray-600)" />
            <div className="payment-info">
              <span className="payment-type">•••• •••• •••• 4242</span>
              <span className="payment-expiry">Expires 12/24</span>
            </div>
            <button className="btn btn-sm btn-outline">Update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings View
export const SettingsView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <div className="settings-container">
        <h2>Settings</h2>
        
        <div className="settings-sections">
          <div className="settings-section">
            <h3>Account Settings</h3>
            <div className="settings-item">
              <div className="setting-info">
                <span className="setting-label">Email Address</span>
                <span className="setting-value">user@example.com</span>
              </div>
              <button className="btn btn-sm btn-outline">Change</button>
            </div>
            <div className="settings-item">
              <div className="setting-info">
                <span className="setting-label">Password</span>
                <span className="setting-value">••••••••</span>
              </div>
              <button className="btn btn-sm btn-outline">Update</button>
            </div>
            <div className="settings-item">
              <div className="setting-info">
                <span className="setting-label">Two-Factor Authentication</span>
                <span className="setting-value">Disabled</span>
              </div>
              <button className="btn btn-sm btn-primary">Enable</button>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Notifications</h3>
            <div className="settings-item">
              <label className="toggle-setting">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
                <span className="setting-label">Email Notifications</span>
              </label>
            </div>
            <div className="settings-item">
              <label className="toggle-setting">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
                <span className="setting-label">Assessment Reminders</span>
              </label>
            </div>
            <div className="settings-item">
              <label className="toggle-setting">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
                <span className="setting-label">Marketing Updates</span>
              </label>
            </div>
          </div>
          
          <div className="settings-section danger-zone">
            <h3>Danger Zone</h3>
            <div className="settings-item">
              <div className="setting-info">
                <span className="setting-label">Delete Account</span>
                <span className="setting-value">This action cannot be undone</span>
              </div>
              <button className="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};