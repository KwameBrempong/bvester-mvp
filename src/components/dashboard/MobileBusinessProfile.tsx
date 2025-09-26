import React, { useState, useEffect } from 'react';
import Icon from '../Icons';
import { useUser, useAppDispatch } from '../../store/hooks';
import { updateUserProfile } from '../../store/slices/userSlice';
import { notify } from '../../utils/notifications';
import { UserProfile } from '../../services/dataService';
import '../../styles/mobile-business-profile.css';

interface MobileBusinessProfileProps {
  className?: string;
}

export const MobileBusinessProfile: React.FC<MobileBusinessProfileProps> = ({ className = '' }) => {
  const userState = useUser();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>(userState.profile || {});
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  useEffect(() => {
    if (userState.profile) {
      setEditedProfile(userState.profile);
    }
  }, [userState.profile]);

  const profile = userState.profile;

  // Enhanced mobile-first profile completion
  const getProfileCompleteness = () => {
    if (!profile) return { percentage: 0, essentialMissing: [], optionalMissing: [] };

    const essentialFields = [
      { key: 'businessName', label: 'Business Name' },
      { key: 'businessType', label: 'Business Type' },
      { key: 'location', label: 'Location' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' }
    ];

    const optionalFields = [
      { key: 'businessDescription', label: 'Description' },
      { key: 'yearEstablished', label: 'Year Established' },
      { key: 'employeeCount', label: 'Team Size' },
      { key: 'monthlyRevenue', label: 'Monthly Revenue' }
    ];

    const essentialMissing = essentialFields.filter(field => !profile[field.key as keyof typeof profile]);
    const optionalMissing = optionalFields.filter(field => !profile[field.key as keyof typeof profile]);

    const totalFields = essentialFields.length + optionalFields.length;
    const completedFields = totalFields - essentialMissing.length - optionalMissing.length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    return { percentage, essentialMissing, optionalMissing };
  };

  const completeness = getProfileCompleteness();

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile?.userId) {
      notify.error('User ID not found. Please try logging in again.', 'Error');
      return;
    }

    console.log('Mobile: Saving profile with data:', { userId: profile.userId, updates: editedProfile });
    setIsSaving(true);
    try {
      const result = await dispatch(updateUserProfile({
        userId: profile.userId,
        updates: editedProfile
      })).unwrap();

      console.log('Mobile: Profile save successful:', result);
      notify.success('Profile updated successfully!', 'Success');
      setIsEditing(false);
    } catch (error) {
      console.error('Mobile: Profile save failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      notify.error(errorMessage, 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'details', label: 'Details', icon: 'building' },
    { id: 'metrics', label: 'Metrics', icon: 'chart-bar' },
    { id: 'documents', label: 'Docs', icon: 'folder' }
  ];

  if (!profile) {
    return (
      <div className="mobile-profile-loading">
        <div className="loading-content">
          <Icon name="loader" size={40} color="var(--gold-primary)" />
          <h3>Loading Profile</h3>
          <p>Getting your business information ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mobile-business-profile ${className}`}>
      {/* Mobile Header */}
      <div className="mobile-profile-header">
        <div className="header-content">
          <div className="business-avatar">
            <Icon name="building" size={24} color="var(--gold-primary)" />
          </div>
          <div className="business-info">
            <div className="business-name-container">
              <h1>{profile.businessName || 'Your Business'}</h1>
              <button
                className="edit-business-name-btn"
                onClick={() => {
                  setIsEditing(true);
                  setActiveTab('details');
                  setExpandedSections(['basic']);
                }}
                title="Edit business name"
              >
                <Icon name="edit" size={14} color="var(--gold-primary)" />
              </button>
            </div>
            <p className="business-type">{profile.businessType || 'Business Type'}</p>
            <div className="business-location">
              <Icon name="map-pin" size={14} />
              <span>{profile.location || 'Location not set'}</span>
            </div>
          </div>
          <button
            className="edit-toggle"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            <Icon name={isEditing ? 'x' : 'edit'} size={18} />
          </button>
        </div>

        {/* Profile Completion Banner */}
        {completeness.percentage < 100 && (
          <div className="completion-banner">
            <div className="completion-text">
              <span>Profile {completeness.percentage}% complete</span>
              <small>{completeness.essentialMissing.length} essential fields missing</small>
            </div>
            <div className="completion-ring">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke="var(--gray-200)"
                  strokeWidth="3"
                />
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke="var(--gold-primary)"
                  strokeWidth="3"
                  strokeDasharray={`${(completeness.percentage / 100) * 100} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span className="completion-percentage">{completeness.percentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mobile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mobile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-content">
            {/* Quick Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Icon name="calendar" size={20} color="var(--blue-600)" />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{profile.yearEstablished || 'N/A'}</span>
                  <span className="stat-label">Established</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Icon name="team" size={20} color="var(--green-600)" />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{profile.employeeCount || 'N/A'}</span>
                  <span className="stat-label">Team Size</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Icon name="cash" size={20} color="var(--gold-primary)" />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{profile.monthlyRevenue || 'N/A'}</span>
                  <span className="stat-label">Revenue</span>
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="description-card">
              <h3>About Your Business</h3>
              <p>{profile.businessDescription || 'Add a description to tell investors about your business...'}</p>
              {!profile.businessDescription && (
                <button
                  className="add-description-btn"
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab('details');
                    setExpandedSections(['basic']);
                  }}
                >
                  <Icon name="add" size={16} />
                  Add Description
                </button>
              )}
            </div>

            {/* Next Steps */}
            {completeness.essentialMissing.length > 0 && (
              <div className="next-steps-card">
                <h3>
                  <Icon name="target" size={18} />
                  Complete Your Profile
                </h3>
                <p>Complete these essential fields to attract investors:</p>
                <div className="missing-fields">
                  {completeness.essentialMissing.slice(0, 3).map(field => (
                    <div key={field.key} className="missing-field">
                      <Icon name="alert-circle" size={14} />
                      <span>{field.label}</span>
                    </div>
                  ))}
                  {completeness.essentialMissing.length > 3 && (
                    <div className="more-fields">
                      +{completeness.essentialMissing.length - 3} more
                    </div>
                  )}
                </div>
                <button
                  className="complete-btn"
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab('details');
                    setExpandedSections(['basic', 'contact']);
                  }}
                >
                  Complete Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="tab-content details-content">
            {isEditing ? (
              <div className="mobile-form">
                {/* Basic Information Section */}
                <div className="form-section">
                  <div
                    className="section-header"
                    onClick={() => toggleSection('basic')}
                  >
                    <h3>
                      <Icon name="building" size={18} />
                      Basic Information
                    </h3>
                    <Icon
                      name={expandedSections.includes('basic') ? 'chevron-up' : 'chevron-down'}
                      size={16}
                    />
                  </div>

                  {expandedSections.includes('basic') && (
                    <div className="section-content">
                      <div className="form-group">
                        <label>Business Name *</label>
                        <input
                          type="text"
                          value={editedProfile.businessName || ''}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          placeholder="Enter your business name"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Business Type *</label>
                        <select
                          value={editedProfile.businessType || ''}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="mobile-select"
                        >
                          <option value="">Select business type</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Trading/Retail">Trading/Retail</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Construction">Construction</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Fashion & Textiles">Fashion & Textiles</option>
                          <option value="Tourism">Tourism</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Business Description</label>
                        <textarea
                          value={editedProfile.businessDescription || ''}
                          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                          placeholder="Describe what your business does..."
                          className="mobile-textarea"
                          rows={4}
                        />
                      </div>

                      <div className="form-group">
                        <label>Business Logo URL</label>
                        <input
                          type="text"
                          value={editedProfile.businessLogo || ''}
                          onChange={(e) => handleInputChange('businessLogo', e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>CEO/Founder Name</label>
                        <input
                          type="text"
                          value={editedProfile.ceoName || ''}
                          onChange={(e) => handleInputChange('ceoName', e.target.value)}
                          placeholder="John Doe"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>CEO/Founder Email</label>
                        <input
                          type="email"
                          value={editedProfile.ceoEmail || ''}
                          onChange={(e) => handleInputChange('ceoEmail', e.target.value)}
                          placeholder="ceo@example.com"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>CEO/Founder Phone</label>
                        <input
                          type="tel"
                          value={editedProfile.ceoPhone || ''}
                          onChange={(e) => handleInputChange('ceoPhone', e.target.value)}
                          placeholder="+233 XX XXX XXXX"
                          className="mobile-input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information Section */}
                <div className="form-section">
                  <div
                    className="section-header"
                    onClick={() => toggleSection('contact')}
                  >
                    <h3>
                      <Icon name="phone" size={18} />
                      Contact Information
                    </h3>
                    <Icon
                      name={expandedSections.includes('contact') ? 'chevron-up' : 'chevron-down'}
                      size={16}
                    />
                  </div>

                  {expandedSections.includes('contact') && (
                    <div className="section-content">
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          value={editedProfile.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="business@example.com"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+233 XX XXX XXXX"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          value={editedProfile.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="City, Region"
                          className="mobile-input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Details Section */}
                <div className="form-section">
                  <div
                    className="section-header"
                    onClick={() => toggleSection('business')}
                  >
                    <h3>
                      <Icon name="chart-bar" size={18} />
                      Business Details
                    </h3>
                    <Icon
                      name={expandedSections.includes('business') ? 'chevron-up' : 'chevron-down'}
                      size={16}
                    />
                  </div>

                  {expandedSections.includes('business') && (
                    <div className="section-content">
                      <div className="form-group">
                        <label>Year Established</label>
                        <input
                          type="number"
                          min="1950"
                          max="2025"
                          value={editedProfile.yearEstablished || ''}
                          onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                          placeholder="2020"
                          className="mobile-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Team Size</label>
                        <select
                          value={editedProfile.employeeCount || ''}
                          onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                          className="mobile-select"
                        >
                          <option value="">Select team size</option>
                          <option value="1-5">1-5 employees</option>
                          <option value="6-20">6-20 employees</option>
                          <option value="21-50">21-50 employees</option>
                          <option value="51-100">51-100 employees</option>
                          <option value="100+">100+ employees</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Monthly Revenue</label>
                        <input
                          type="text"
                          value={editedProfile.monthlyRevenue || ''}
                          onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                          placeholder="e.g., 50,000 GHS"
                          className="mobile-input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Actions */}
                <div className="mobile-form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(profile);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Icon name="loader" size={16} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-view">
                {/* View Mode - Clean Card Layout */}
                <div className="detail-sections">
                  <div className="detail-section">
                    <h3>
                      <Icon name="building" size={18} />
                      Company Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Business Name</span>
                        <span className="value">{profile.businessName || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Business Type</span>
                        <span className="value">{profile.businessType || 'Not provided'}</span>
                      </div>
                      <div className="detail-item full-width">
                        <span className="label">Description</span>
                        <span className="value">{profile.businessDescription || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>
                      <Icon name="phone" size={18} />
                      Contact Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Email</span>
                        <span className="value">{profile.email || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phone</span>
                        <span className="value">{profile.phone || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Location</span>
                        <span className="value">{profile.location || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="tab-content metrics-content">
            <div className="metrics-placeholder">
              <Icon name="chart-bar" size={48} color="var(--gray-400)" />
              <h3>Business Metrics</h3>
              <p>Advanced metrics and analytics will be available here.</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  notify.info('Business metrics feature coming soon!', 'Metrics');
                }}
              >
                <Icon name="plus" size={16} />
                Add Metrics
              </button>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="tab-content documents-content">
            <div className="documents-placeholder">
              <Icon name="folder" size={48} color="var(--gray-400)" />
              <h3>Document Management</h3>
              <p>Upload and manage your business documents.</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  notify.info('Document upload feature coming soon!', 'Documents');
                }}
              >
                <Icon name="upload" size={16} />
                Upload Documents
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBusinessProfile;