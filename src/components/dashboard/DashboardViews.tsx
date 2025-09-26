import React, { useState, useEffect } from 'react';
import DashboardKPIs from './DashboardKPIs';
import MobileBusinessProfile from './MobileBusinessProfile';
import { ComingSoonState, NoTransactionsState, EmptyState } from '../EmptyStates';
import Icon from '../Icons';
import { useUser, useAppDispatch } from '../../store/hooks';
import { updateUserProfile } from '../../store/slices/userSlice';
import { notify } from '../../utils/notifications';
import { UserProfile } from '../../services/dataService';
import '../../styles/dashboard-views.css';

// Overview Dashboard (Default view with KPIs)
export const OverviewView: React.FC = () => {
  return <DashboardKPIs />;
};

// Business Profile View with comprehensive functionality
export const ProfileView: React.FC = () => {
  const userState = useUser();
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>(userState.profile || {});
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (userState.profile) {
      setEditedProfile(userState.profile);
    }
  }, [userState.profile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const profile = userState.profile;

  // Enhanced profile completion tracking
  const getProfileCompleteness = () => {
    if (!profile) return { percentage: 0, sections: [], completedFields: 0, totalFields: 0 };

    const sections = [
      {
        name: 'Basic Information',
        fields: [
          { key: 'businessName', label: 'Business Name', required: true },
          { key: 'businessType', label: 'Business Type', required: true },
          { key: 'businessDescription', label: 'Description', required: true },
          { key: 'email', label: 'Email', required: true },
          { key: 'phone', label: 'Phone', required: true }
        ]
      },
      {
        name: 'Location & Setup',
        fields: [
          { key: 'location', label: 'Location', required: true },
          { key: 'region', label: 'Region', required: true },
          { key: 'yearEstablished', label: 'Year Established', required: true },
          { key: 'employeeCount', label: 'Employee Count', required: false }
        ]
      },
      {
        name: 'Investment Information',
        fields: [
          { key: 'fundingStage', label: 'Funding Stage', required: false },
          { key: 'fundingAmount', label: 'Funding Amount', required: false },
          { key: 'investorType', label: 'Investor Type', required: false }
        ]
      },
      {
        name: 'Business Metrics',
        fields: [
          { key: 'monthlyRevenue', label: 'Monthly Revenue', required: false },
          { key: 'monthlyGrowth', label: 'Monthly Growth', required: false },
          { key: 'customerCount', label: 'Customer Count', required: false }
        ]
      },
      {
        name: 'Team & Leadership',
        fields: [
          { key: 'founderName', label: 'Founder Name', required: false },
          { key: 'ceoName', label: 'CEO Name', required: false },
          { key: 'keyTeamMembers', label: 'Key Team Members', required: false }
        ]
      }
    ];

    let completedFields = 0;
    let totalRequiredFields = 0;
    let totalFields = 0;

    const sectionsWithCompletion = sections.map(section => {
      const completedSectionFields = section.fields.filter(field => {
        const value = profile[field.key as keyof typeof profile];
        return value && value !== '';
      }).length;

      const requiredSectionFields = section.fields.filter(field => field.required).length;
      const sectionCompletion = section.fields.length > 0 ? (completedSectionFields / section.fields.length) * 100 : 0;

      completedFields += completedSectionFields;
      totalRequiredFields += requiredSectionFields;
      totalFields += section.fields.length;

      return {
        ...section,
        completed: completedSectionFields,
        total: section.fields.length,
        percentage: Math.round(sectionCompletion),
        isComplete: sectionCompletion === 100
      };
    });

    // Calculate overall completion based on required fields primarily, with bonus for optional fields
    const requiredCompletion = totalRequiredFields > 0 ? (sectionsWithCompletion.reduce((acc, section) => {
      return acc + section.fields.filter(field =>
        field.required && profile[field.key as keyof typeof profile]
      ).length;
    }, 0) / totalRequiredFields) * 80 : 0; // 80% weight for required fields

    const optionalCompletion = (completedFields - sectionsWithCompletion.reduce((acc, section) => {
      return acc + section.fields.filter(field =>
        field.required && profile[field.key as keyof typeof profile]
      ).length;
    }, 0)) / (totalFields - totalRequiredFields) * 20; // 20% weight for optional fields

    const overallPercentage = Math.round(requiredCompletion + (optionalCompletion || 0));

    return {
      percentage: Math.min(100, overallPercentage),
      sections: sectionsWithCompletion,
      completedFields,
      totalFields,
      requiredFields: totalRequiredFields
    };
  };

  const profileCompleteness = getProfileCompleteness();
  const completionPercentage = profileCompleteness.percentage;

  // Get business initials for avatar
  const getBusinessInitials = () => {
    if (!profile?.businessName) return 'B';
    return profile.businessName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Format year established
  const getEstablishedYear = () => {
    if (profile?.yearEstablished) {
      return profile.yearEstablished;
    }
    return 'Not specified';
  };

  // Get location display
  const getLocationDisplay = () => {
    if (profile?.location && profile?.region) {
      return `${profile.location}, ${profile.region}`;
    }
    return profile?.location || profile?.region || 'Location not set';
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!profile?.userId) return;

    setIsSaving(true);
    try {
      await dispatch(updateUserProfile({
        userId: profile.userId,
        updates: editedProfile
      })).unwrap();

      notify.success('Profile updated successfully!', 'Profile Saved');
      setIsEditing(false);
    } catch (error) {
      notify.error('Failed to update profile. Please try again.', 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Document management functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload - in real implementation, upload to cloud storage
      for (const file of Array.from(files)) {
        const newDocument = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString(),
          url: URL.createObjectURL(file), // Temporary URL for demo
        };
        setDocuments(prev => [...prev, newDocument]);
      }

      notify.success(`${files.length} document(s) uploaded successfully!`, 'Upload Complete');
    } catch (error) {
      notify.error('Failed to upload documents. Please try again.', 'Upload Failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    notify.success('Document deleted successfully!', 'Document Removed');
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return 'file-text';
    if (type.includes('image')) return 'folder';
    if (type.includes('word') || type.includes('document')) return 'file-text';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'file-text';
    return 'file-text';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!profile) {
    return (
      <div className="view-container animate-fadeIn">
        <div className="profile-loading">
          <Icon name="loader" size={48} color="var(--gold-primary)" />
          <p>Loading your business profile...</p>
        </div>
      </div>
    );
  }

  // Use mobile-optimized component for mobile devices
  if (isMobile) {
    return <MobileBusinessProfile className="mobile-profile-view" />;
  }

  return (
    <div className="view-container animate-fadeIn">
      {/* Profile Completion Banner */}
      {completionPercentage < 80 && (
        <div className="profile-completion-banner">
          <div className="completion-content">
            <Icon name="warning" size={20} color="var(--gold-primary)" />
            <span>Your profile is {completionPercentage}% complete. Complete it to attract more investors!</span>
          </div>
          <div className="completion-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">{completionPercentage}%</span>
          </div>
        </div>
      )}

      {/* Detailed Profile Completeness Dashboard */}
      {completionPercentage < 100 && (
        <div className="completeness-dashboard">
          <div className="completeness-header">
            <h3>
              <Icon name="target" size={20} />
              Profile Completion Guide
            </h3>
            <div className="completeness-stats">
              <span className="stat">
                <strong>{profileCompleteness.completedFields}</strong> of {profileCompleteness.totalFields} fields completed
              </span>
              <span className="stat">
                <strong>{profileCompleteness.sections.filter(s => s.isComplete).length}</strong> of {profileCompleteness.sections.length} sections complete
              </span>
            </div>
          </div>

          <div className="completion-sections">
            {profileCompleteness.sections.map((section, index) => (
              <div key={section.name} className={`completion-section ${section.isComplete ? 'section-complete' : ''}`}>
                <div className="section-header">
                  <div className="section-info">
                    <h4>{section.name}</h4>
                    <span className="section-progress">
                      {section.completed}/{section.total} fields
                    </span>
                  </div>
                  <div className="section-status">
                    {section.isComplete ? (
                      <div className="status-complete">
                        <Icon name="check" size={16} />
                        Complete
                      </div>
                    ) : (
                      <div className="status-progress">
                        {section.percentage}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="section-progress-bar">
                  <div
                    className="section-progress-fill"
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>

                {!section.isComplete && (
                  <div className="missing-fields">
                    <p className="missing-fields-title">Missing fields:</p>
                    <div className="missing-fields-list">
                      {section.fields
                        .filter(field => !profile[field.key as keyof typeof profile])
                        .map(field => (
                          <span key={field.key} className={`missing-field ${field.required ? 'required' : 'optional'}`}>
                            {field.label}
                            {field.required && <span className="required-indicator">*</span>}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="completion-tips">
            <h4>
              <Icon name="bulb" size={16} />
              Quick Tips
            </h4>
            <ul>
              <li>Complete all required fields (*) to increase your profile score significantly</li>
              <li>Add investment information to attract potential investors</li>
              <li>Include business metrics to showcase your company's growth</li>
              <li>Upload business documents to build credibility</li>
              <li>A complete profile increases your chances of finding investors by 70%</li>
            </ul>
          </div>
        </div>
      )}

      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-initials">{getBusinessInitials()}</span>
          </div>
          <div className="profile-info">
            <div className="profile-name-container">
              <h2 className="profile-name">
                {profile.businessName || 'Business Name Not Set'}
              </h2>
              <button
                className="edit-business-name-btn"
                onClick={() => setIsEditing(true)}
                title="Edit business name"
              >
                <Icon name="edit" size={16} color="var(--gold-primary)" />
              </button>
            </div>
            <p className="profile-industry">
              {profile.businessType || 'Business Type Not Specified'}
            </p>
            <div className="profile-badges">
              {completionPercentage >= 80 && (
                <span className="badge badge-gold">
                  <Icon name="check" size={12} />
                  Complete Profile
                </span>
              )}
              {profile.yearEstablished && (
                <span className="badge badge-outline">
                  Est. {profile.yearEstablished}
                </span>
              )}
            </div>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <Icon name="edit" size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  className="btn btn-outline"
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
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-sections">
          {/* Basic Company Information */}
          <div className="profile-section">
            <h3 className="section-title">
              <Icon name="building" size={20} />
              Company Information
            </h3>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Business Name</label>
                    <input
                      type="text"
                      value={editedProfile.businessName || ''}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Business Type</label>
                    <select
                      value={editedProfile.businessType || ''}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
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
                    <label>Year Established</label>
                    <input
                      type="number"
                      min="1950"
                      max="2025"
                      value={editedProfile.yearEstablished || ''}
                      onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div className="form-group">
                    <label>Employee Count</label>
                    <select
                      value={editedProfile.employeeCount || ''}
                      onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    >
                      <option value="">Select team size</option>
                      <option value="1-5">1-5 employees</option>
                      <option value="6-20">6-20 employees</option>
                      <option value="21-50">21-50 employees</option>
                      <option value="51-100">51-100 employees</option>
                      <option value="100+">100+ employees</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Business Name</span>
                  <span className="detail-value">
                    {profile.businessName || <span className="missing-data">Not set</span>}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Business Type</span>
                  <span className="detail-value">
                    {profile.businessType || <span className="missing-data">Not specified</span>}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Founded</span>
                  <span className="detail-value">{getEstablishedYear()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Employees</span>
                  <span className="detail-value">
                    {profile.employeeCount || <span className="missing-data">Not specified</span>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Location & Contact Information */}
          <div className="profile-section">
            <h3 className="section-title">
              <Icon name="location" size={20} />
              Location & Contact
            </h3>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Region</label>
                    <select
                      value={editedProfile.region || ''}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                    >
                      <option value="">Select region</option>
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Northern">Northern</option>
                      <option value="Upper East">Upper East</option>
                      <option value="Upper West">Upper West</option>
                      <option value="Volta">Volta</option>
                      <option value="Brong-Ahafo">Brong-Ahafo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City/Town</label>
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Accra, Kumasi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="business@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{getLocationDisplay()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">
                    {profile.email || <span className="missing-data">Not provided</span>}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">
                    {profile.phone || <span className="missing-data">Not provided</span>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Business Description */}
          <div className="profile-section">
            <h3 className="section-title">
              <Icon name="file-text" size={20} />
              Business Description
            </h3>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group full-width">
                  <label>Business Description</label>
                  <textarea
                    value={editedProfile.businessDescription || ''}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business, what you do, your value proposition, and what makes you unique..."
                    rows={6}
                  />
                  <div className="form-help">
                    A compelling description helps attract the right investors and partners.
                  </div>
                </div>
              </div>
            ) : (
              <div className="description-content">
                {profile.businessDescription ? (
                  <p className="profile-description">{profile.businessDescription}</p>
                ) : (
                  <p className="missing-description">
                    <Icon name="info" size={16} />
                    Add a business description to help investors understand your value proposition and market opportunity.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Investment Information */}
          <div className="profile-section investment-section">
            <h3 className="section-title">
              <Icon name="cash" size={20} />
              Investment Information
            </h3>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Funding Needed (GHS)</label>
                    <input
                      type="number"
                      value={editedProfile.fundingNeeded || ''}
                      onChange={(e) => handleInputChange('fundingNeeded', e.target.value)}
                      placeholder="e.g., 100000"
                    />
                    <div className="form-help">Total amount you're looking to raise</div>
                  </div>
                  <div className="form-group">
                    <label>Monthly Revenue (GHS)</label>
                    <select
                      value={editedProfile.monthlyRevenue || ''}
                      onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                    >
                      <option value="">Select revenue range</option>
                      <option value="0-5000">₵0 - 5,000</option>
                      <option value="5000-20000">₵5,000 - 20,000</option>
                      <option value="20000-50000">₵20,000 - 50,000</option>
                      <option value="50000-100000">₵50,000 - 100,000</option>
                      <option value="100000+">₵100,000+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Investment Stage</label>
                    <select
                      value={editedProfile.investmentStage || ''}
                      onChange={(e) => handleInputChange('investmentStage', e.target.value)}
                    >
                      <option value="">Select stage</option>
                      <option value="pre-seed">Pre-Seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Equity Offered (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="49"
                      value={editedProfile.equityOffered || ''}
                      onChange={(e) => handleInputChange('equityOffered', e.target.value)}
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Use of Funds</label>
                  <textarea
                    value={editedProfile.useOfFunds || ''}
                    onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                    placeholder="Explain how you plan to use the investment funds..."
                    rows={4}
                  />
                  <div className="form-help">
                    Be specific about how funds will be allocated (e.g., marketing, inventory, equipment)
                  </div>
                </div>
              </div>
            ) : (
              <div className="investment-display">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Funding Needed</span>
                    <span className="detail-value">
                      {profile.fundingNeeded ?
                        `GHS ${parseInt(profile.fundingNeeded).toLocaleString()}` :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Revenue</span>
                    <span className="detail-value">
                      {profile.monthlyRevenue || <span className="missing-data">Not disclosed</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Investment Stage</span>
                    <span className="detail-value">
                      {profile.investmentStage ?
                        profile.investmentStage.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Equity Offered</span>
                    <span className="detail-value">
                      {profile.equityOffered ?
                        `${profile.equityOffered}%` :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                </div>
                {profile.useOfFunds && (
                  <div className="use-of-funds">
                    <h4>Use of Funds</h4>
                    <p>{profile.useOfFunds}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Business Metrics & Performance */}
          <div className="profile-section metrics-section">
            <h3 className="section-title">
              <Icon name="trending-up" size={20} />
              Business Metrics & Growth
            </h3>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Annual Revenue (GHS)</label>
                    <input
                      type="number"
                      value={editedProfile.annualRevenue || ''}
                      onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                      placeholder="e.g., 500000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Revenue Growth Rate (%)</label>
                    <input
                      type="number"
                      value={editedProfile.revenueGrowthRate || ''}
                      onChange={(e) => handleInputChange('revenueGrowthRate', e.target.value)}
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Base</label>
                    <input
                      type="number"
                      value={editedProfile.customerBase || ''}
                      onChange={(e) => handleInputChange('customerBase', e.target.value)}
                      placeholder="Number of customers"
                    />
                  </div>
                  <div className="form-group">
                    <label>Market Size</label>
                    <select
                      value={editedProfile.marketSize || ''}
                      onChange={(e) => handleInputChange('marketSize', e.target.value)}
                    >
                      <option value="">Select market size</option>
                      <option value="local">Local Market</option>
                      <option value="regional">Regional Market</option>
                      <option value="national">National Market</option>
                      <option value="international">International Market</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Competitive Advantage</label>
                  <textarea
                    value={editedProfile.competitiveAdvantage || ''}
                    onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                    placeholder="What makes your business unique and competitive..."
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="metrics-display">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Annual Revenue</span>
                    <span className="detail-value">
                      {profile.annualRevenue ?
                        `GHS ${parseInt(profile.annualRevenue).toLocaleString()}` :
                        <span className="missing-data">Not disclosed</span>
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Growth Rate</span>
                    <span className="detail-value">
                      {profile.revenueGrowthRate ?
                        `${profile.revenueGrowthRate}% annually` :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Customer Base</span>
                    <span className="detail-value">
                      {profile.customerBase ?
                        `${parseInt(profile.customerBase).toLocaleString()} customers` :
                        <span className="missing-data">Not disclosed</span>
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Market Size</span>
                    <span className="detail-value">
                      {profile.marketSize ?
                        profile.marketSize.charAt(0).toUpperCase() + profile.marketSize.slice(1) + ' Market' :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                </div>
                {profile.competitiveAdvantage && (
                  <div className="competitive-advantage">
                    <h4>Competitive Advantage</h4>
                    <p>{profile.competitiveAdvantage}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team Information */}
          <div className="profile-section team-section">
            <h3 className="section-title">
              <Icon name="team" size={20} />
              Team & Leadership
            </h3>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Founder/CEO Name</label>
                    <input
                      type="text"
                      value={editedProfile.founderName || ''}
                      onChange={(e) => handleInputChange('founderName', e.target.value)}
                      placeholder="Enter founder name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Founder Experience (Years)</label>
                    <input
                      type="number"
                      value={editedProfile.founderExperience || ''}
                      onChange={(e) => handleInputChange('founderExperience', e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Key Team Members</label>
                    <input
                      type="number"
                      value={editedProfile.keyTeamMembers || ''}
                      onChange={(e) => handleInputChange('keyTeamMembers', e.target.value)}
                      placeholder="Number of key team members"
                    />
                  </div>
                  <div className="form-group">
                    <label>Advisory Board</label>
                    <select
                      value={editedProfile.hasAdvisoryBoard || ''}
                      onChange={(e) => handleInputChange('hasAdvisoryBoard', e.target.value)}
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes, we have advisors</option>
                      <option value="no">No advisory board yet</option>
                      <option value="forming">Currently forming</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Team Background & Expertise</label>
                  <textarea
                    value={editedProfile.teamBackground || ''}
                    onChange={(e) => handleInputChange('teamBackground', e.target.value)}
                    placeholder="Describe the background and expertise of your team..."
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="team-display">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Founder/CEO</span>
                    <span className="detail-value">
                      {profile.founderName || <span className="missing-data">Not specified</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Founder Experience</span>
                    <span className="detail-value">
                      {profile.founderExperience ?
                        `${profile.founderExperience} years` :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Key Team Size</span>
                    <span className="detail-value">
                      {profile.keyTeamMembers || <span className="missing-data">Not specified</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Advisory Board</span>
                    <span className="detail-value">
                      {profile.hasAdvisoryBoard ?
                        profile.hasAdvisoryBoard.charAt(0).toUpperCase() + profile.hasAdvisoryBoard.slice(1) :
                        <span className="missing-data">Not specified</span>
                      }
                    </span>
                  </div>
                </div>
                {profile.teamBackground && (
                  <div className="team-background">
                    <h4>Team Background & Expertise</h4>
                    <p>{profile.teamBackground}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Business Documents */}
          <div className="profile-section documents-section">
            <h3 className="section-title">
              <Icon name="folder" size={20} />
              Business Documents
            </h3>

            <div className="documents-content">
              {/* Document Upload Area */}
              <div
                className="document-upload-area"
                onClick={() => document.getElementById('document-upload')?.click()}
              >
                <div className="upload-icon">
                  <Icon name="upload" size={24} color="var(--gold-primary)" />
                </div>
                <div className="upload-text">
                  {isUploading ? 'Uploading documents...' : 'Upload Business Documents'}
                </div>
                <div className="upload-hint">
                  Business registration, financial statements, business plan, etc.
                </div>
              </div>

              <input
                id="document-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {/* Document List */}
              {documents.length > 0 && (
                <div className="document-list">
                  {documents.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-info">
                        <div className="document-icon">
                          <Icon name={getDocumentIcon(doc.type)} size={16} />
                        </div>
                        <div className="document-details">
                          <div className="document-name">{doc.name}</div>
                          <div className="document-meta">
                            {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="document-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Icon name="eye" size={12} />
                          View
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Icon name="trash" size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Document Categories Suggestion */}
              <div className="document-categories">
                <h4>Recommended Documents for Investors:</h4>
                <div className="category-grid">
                  <div className="category-item">
                    <Icon name="file-text" size={16} />
                    <span>Business Registration Certificate</span>
                  </div>
                  <div className="category-item">
                    <Icon name="chart-bar" size={16} />
                    <span>Financial Statements (3 years)</span>
                  </div>
                  <div className="category-item">
                    <Icon name="briefcase" size={16} />
                    <span>Business Plan</span>
                  </div>
                  <div className="category-item">
                    <Icon name="file-text" size={16} />
                    <span>Tax Returns</span>
                  </div>
                  <div className="category-item">
                    <Icon name="building" size={16} />
                    <span>Licenses & Permits</span>
                  </div>
                  <div className="category-item">
                    <Icon name="cash" size={16} />
                    <span>Bank Statements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Verification & Trust System */}
          <div className="profile-section verification-section">
            <h3 className="section-title">
              <Icon name="shield" size={20} />
              Business Verification & Trust
            </h3>

            <div className="verification-content">
              {/* Verification Status Overview */}
              <div className="verification-overview">
                <div className="trust-score">
                  <div className="trust-score-circle">
                    <div className="score-value">
                      {(() => {
                        let score = 0;
                        if (profile.businessName) score += 15;
                        if (profile.email) score += 15;
                        if (profile.phone) score += 15;
                        if (profile.businessRegistration) score += 20;
                        if (profile.taxId) score += 15;
                        if (documents.length > 0) score += 20;
                        return Math.min(100, score);
                      })()}
                    </div>
                    <div className="score-label">Trust Score</div>
                  </div>
                  <div className="trust-description">
                    <h4>Business Credibility</h4>
                    <p>Your trust score is based on verified information and uploaded documents</p>
                  </div>
                </div>
              </div>

              {/* Verification Items */}
              <div className="verification-items">
                <div className={`verification-item ${profile.businessName ? 'verified' : 'pending'}`}>
                  <div className="verification-icon">
                    <Icon name={profile.businessName ? "check" : "alert"} size={16} />
                  </div>
                  <div className="verification-info">
                    <h4>Business Name</h4>
                    <p>{profile.businessName ? 'Verified' : 'Not provided'}</p>
                  </div>
                  <div className="verification-status">
                    {profile.businessName ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className={`verification-item ${profile.email ? 'verified' : 'pending'}`}>
                  <div className="verification-icon">
                    <Icon name={profile.email ? "check" : "alert"} size={16} />
                  </div>
                  <div className="verification-info">
                    <h4>Email Address</h4>
                    <p>{profile.email ? 'Verified' : 'Not provided'}</p>
                  </div>
                  <div className="verification-status">
                    {profile.email ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className={`verification-item ${profile.phone ? 'verified' : 'pending'}`}>
                  <div className="verification-icon">
                    <Icon name={profile.phone ? "check" : "alert"} size={16} />
                  </div>
                  <div className="verification-info">
                    <h4>Phone Number</h4>
                    <p>{profile.phone ? 'Verified' : 'Not provided'}</p>
                  </div>
                  <div className="verification-status">
                    {profile.phone ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className={`verification-item ${profile.businessRegistration ? 'verified' : 'pending'}`}>
                  <div className="verification-icon">
                    <Icon name={profile.businessRegistration ? "check" : "alert"} size={16} />
                  </div>
                  <div className="verification-info">
                    <h4>Business Registration</h4>
                    <p>{profile.businessRegistration ? 'Registration number provided' : 'Not provided'}</p>
                  </div>
                  <div className="verification-status">
                    {profile.businessRegistration ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className={`verification-item ${profile.taxId ? 'verified' : 'pending'}`}>
                  <div className="verification-icon">
                    <Icon name={profile.taxId ? "check" : "alert"} size={16} />
                  </div>
                  <div className="verification-info">
                    <h4>Tax Identification</h4>
                    <p>{profile.taxId ? 'Tax ID provided' : 'Not provided'}</p>
                  </div>
                  <div className="verification-status">
                    {profile.taxId ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className={`verification-item ${documents.length > 0 ? 'verified' : 'pending'}`}>
                  <div className="verification-icon">
                    <Icon name={documents.length > 0 ? "check" : "alert"} size={16} />
                  </div>
                  <div className="verification-info">
                    <h4>Business Documents</h4>
                    <p>{documents.length > 0 ? `${documents.length} documents uploaded` : 'No documents uploaded'}</p>
                  </div>
                  <div className="verification-status">
                    {documents.length > 0 ? (
                      <span className="status-badge verified">✓ Verified</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges & Certifications */}
              <div className="trust-badges">
                <h4>Trust Badges & Certifications</h4>
                <div className="badges-grid">
                  {profile.businessName && profile.email && profile.phone && (
                    <div className="trust-badge earned">
                      <Icon name="shield" size={24} />
                      <div className="badge-info">
                        <h5>Verified Business</h5>
                        <p>Contact information verified</p>
                      </div>
                    </div>
                  )}

                  {documents.length >= 3 && (
                    <div className="trust-badge earned">
                      <Icon name="folder" size={24} />
                      <div className="badge-info">
                        <h5>Document Complete</h5>
                        <p>Essential documents uploaded</p>
                      </div>
                    </div>
                  )}

                  {profile.annualRevenue && parseFloat(profile.annualRevenue) > 100000 && (
                    <div className="trust-badge earned">
                      <Icon name="trending-up" size={24} />
                      <div className="badge-info">
                        <h5>Revenue Verified</h5>
                        <p>Strong financial performance</p>
                      </div>
                    </div>
                  )}

                  {(() => {
                    let score = 0;
                    if (profile.businessName) score += 15;
                    if (profile.email) score += 15;
                    if (profile.phone) score += 15;
                    if (profile.businessRegistration) score += 20;
                    if (profile.taxId) score += 15;
                    if (documents.length > 0) score += 20;
                    return score >= 80;
                  })() && (
                    <div className="trust-badge earned">
                      <Icon name="star" size={24} />
                      <div className="badge-info">
                        <h5>Premium Verified</h5>
                        <p>Highest trust level achieved</p>
                      </div>
                    </div>
                  )}

                  {/* Placeholder badges for future implementation */}
                  <div className="trust-badge available">
                    <Icon name="bank" size={24} />
                    <div className="badge-info">
                      <h5>Bank Verified</h5>
                      <p>Connect bank account to earn</p>
                    </div>
                  </div>

                  <div className="trust-badge available">
                    <Icon name="award" size={24} />
                    <div className="badge-info">
                      <h5>Industry Leader</h5>
                      <p>Complete assessment to earn</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Actions */}
              <div className="verification-actions">
                <h4>Increase Your Trust Score</h4>
                <div className="action-items">
                  {!profile.businessRegistration && (
                    <div className="action-item">
                      <Icon name="building" size={16} />
                      <span>Add business registration number</span>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setIsEditing(true);
                          notify.info('Please add business registration in the edit form', 'Info');
                        }}
                      >
                        Add Now
                      </button>
                    </div>
                  )}
                  {!profile.taxId && (
                    <div className="action-item">
                      <Icon name="file-text" size={16} />
                      <span>Provide tax identification number</span>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setIsEditing(true);
                          notify.info('Please add tax ID in the edit form', 'Info');
                        }}
                      >
                        Add Now
                      </button>
                    </div>
                  )}
                  {documents.length === 0 && (
                    <div className="action-item">
                      <Icon name="upload" size={16} />
                      <span>Upload business documents</span>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => document.getElementById('document-upload')?.click()}
                      >
                        Upload
                      </button>
                    </div>
                  )}
                  <div className="action-item">
                    <Icon name="phone" size={16} />
                    <span>Verify phone number via SMS</span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        notify.info('Phone verification feature coming soon!', 'Verification');
                      }}
                    >
                      Verify Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Analytics & Insights */}
          <div className="profile-section analytics-section">
            <h3 className="section-title">
              <Icon name="chart" size={20} />
              Profile Analytics & Insights
            </h3>

            <div className="analytics-content">
              {/* Profile Performance Overview */}
              <div className="analytics-overview">
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="card-header">
                      <Icon name="eye" size={20} />
                      <h4>Profile Views</h4>
                    </div>
                    <div className="card-value">
                      {(() => {
                        // Simulate profile views based on completion
                        const baseViews = Math.floor(Math.random() * 50) + 10;
                        const completionBonus = Math.floor(completionPercentage / 10) * 5;
                        return baseViews + completionBonus;
                      })()}
                    </div>
                    <div className="card-trend positive">
                      <Icon name="trending-up" size={14} />
                      +12% this week
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="card-header">
                      <Icon name="heart" size={20} />
                      <h4>Investor Interest</h4>
                    </div>
                    <div className="card-value">
                      {(() => {
                        // Simulate investor interest based on profile completion and data
                        let interest = 0;
                        if (profile.annualRevenue) interest += 20;
                        if (profile.fundingStage) interest += 15;
                        if (documents.length > 0) interest += 25;
                        if (completionPercentage > 70) interest += 30;
                        return Math.min(100, interest);
                      })()}%
                    </div>
                    <div className="card-trend positive">
                      <Icon name="trending-up" size={14} />
                      +8% this month
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="card-header">
                      <Icon name="message" size={20} />
                      <h4>Inquiries</h4>
                    </div>
                    <div className="card-value">
                      {(() => {
                        // Simulate inquiries based on profile quality
                        if (completionPercentage < 50) return Math.floor(Math.random() * 3);
                        if (completionPercentage < 80) return Math.floor(Math.random() * 8) + 2;
                        return Math.floor(Math.random() * 15) + 5;
                      })()}
                    </div>
                    <div className="card-trend neutral">
                      <Icon name="minus" size={14} />
                      No change
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="card-header">
                      <Icon name="shield" size={20} />
                      <h4>Trust Rating</h4>
                    </div>
                    <div className="card-value">
                      {(() => {
                        let score = 0;
                        if (profile.businessName) score += 15;
                        if (profile.email) score += 15;
                        if (profile.phone) score += 15;
                        if (profile.businessRegistration) score += 20;
                        if (profile.taxId) score += 15;
                        if (documents.length > 0) score += 20;
                        return Math.min(100, score);
                      })()}%
                    </div>
                    <div className="card-trend positive">
                      <Icon name="trending-up" size={14} />
                      +5% this week
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights & Recommendations */}
              <div className="insights-section">
                <h4>
                  <Icon name="lightbulb" size={18} />
                  AI-Powered Insights
                </h4>

                <div className="insights-list">
                  {completionPercentage < 70 && (
                    <div className="insight-item priority-high">
                      <div className="insight-icon">
                        <Icon name="alert" size={16} />
                      </div>
                      <div className="insight-content">
                        <h5>Profile Incomplete</h5>
                        <p>Complete your profile to increase visibility by up to 70%. Investors are 3x more likely to contact businesses with complete profiles.</p>
                        <button className="insight-action">Complete Profile</button>
                      </div>
                    </div>
                  )}

                  {!profile.annualRevenue && (
                    <div className="insight-item priority-medium">
                      <div className="insight-icon">
                        <Icon name="trending-up" size={16} />
                      </div>
                      <div className="insight-content">
                        <h5>Add Financial Information</h5>
                        <p>Businesses with financial data receive 40% more investor inquiries. Consider adding your revenue and growth metrics.</p>
                        <button className="insight-action">Add Financials</button>
                      </div>
                    </div>
                  )}

                  {documents.length === 0 && (
                    <div className="insight-item priority-medium">
                      <div className="insight-icon">
                        <Icon name="folder" size={16} />
                      </div>
                      <div className="insight-content">
                        <h5>Upload Business Documents</h5>
                        <p>Verified businesses with documents are viewed 50% more often. Upload your business registration and financial statements.</p>
                        <button className="insight-action">Upload Documents</button>
                      </div>
                    </div>
                  )}

                  {!profile.businessDescription && (
                    <div className="insight-item priority-low">
                      <div className="insight-icon">
                        <Icon name="edit" size={16} />
                      </div>
                      <div className="insight-content">
                        <h5>Enhance Business Description</h5>
                        <p>A compelling business description helps investors understand your value proposition. Profiles with descriptions get 25% more views.</p>
                        <button className="insight-action">Add Description</button>
                      </div>
                    </div>
                  )}

                  {(() => {
                    let score = 0;
                    if (profile.businessName) score += 15;
                    if (profile.email) score += 15;
                    if (profile.phone) score += 15;
                    if (profile.businessRegistration) score += 20;
                    if (profile.taxId) score += 15;
                    if (documents.length > 0) score += 20;
                    return score >= 80;
                  })() && (
                    <div className="insight-item priority-positive">
                      <div className="insight-icon">
                        <Icon name="star" size={16} />
                      </div>
                      <div className="insight-content">
                        <h5>Excellent Profile!</h5>
                        <p>Your profile is highly complete and trustworthy. You're in the top 10% of businesses on our platform.</p>
                        <button className="insight-action">Share Profile</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Performance Chart */}
              <div className="performance-chart">
                <h4>
                  <Icon name="bar-chart" size={18} />
                  Profile Performance Trends
                </h4>

                <div className="chart-container">
                  <div className="chart-placeholder">
                    <div className="chart-bars">
                      {Array.from({ length: 7 }, (_, i) => {
                        const height = Math.floor(Math.random() * 60) + 20;
                        return (
                          <div key={i} className="chart-bar">
                            <div
                              className="bar-fill"
                              style={{ height: `${height}%` }}
                            />
                            <span className="bar-label">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color primary"></div>
                        <span>Profile Views</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color secondary"></div>
                        <span>Investor Interest</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry Comparison */}
              <div className="industry-comparison">
                <h4>
                  <Icon name="target" size={18} />
                  Industry Comparison
                </h4>

                <div className="comparison-items">
                  <div className="comparison-item">
                    <div className="comparison-label">
                      <span>Profile Completeness</span>
                      <span className="comparison-value">{completionPercentage}%</span>
                    </div>
                    <div className="comparison-bar">
                      <div className="comparison-fill user" style={{ width: `${completionPercentage}%` }} />
                      <div className="comparison-indicator average" style={{ left: '65%' }}>
                        <span>Industry Average: 65%</span>
                      </div>
                    </div>
                  </div>

                  <div className="comparison-item">
                    <div className="comparison-label">
                      <span>Trust Score</span>
                      <span className="comparison-value">
                        {(() => {
                          let score = 0;
                          if (profile.businessName) score += 15;
                          if (profile.email) score += 15;
                          if (profile.phone) score += 15;
                          if (profile.businessRegistration) score += 20;
                          if (profile.taxId) score += 15;
                          if (documents.length > 0) score += 20;
                          return Math.min(100, score);
                        })()}%
                      </span>
                    </div>
                    <div className="comparison-bar">
                      <div
                        className="comparison-fill user"
                        style={{
                          width: `${(() => {
                            let score = 0;
                            if (profile.businessName) score += 15;
                            if (profile.email) score += 15;
                            if (profile.phone) score += 15;
                            if (profile.businessRegistration) score += 20;
                            if (profile.taxId) score += 15;
                            if (documents.length > 0) score += 20;
                            return Math.min(100, score);
                          })()}%`
                        }}
                      />
                      <div className="comparison-indicator average" style={{ left: '58%' }}>
                        <span>Industry Average: 58%</span>
                      </div>
                    </div>
                  </div>

                  <div className="comparison-item">
                    <div className="comparison-label">
                      <span>Response Rate</span>
                      <span className="comparison-value">
                        {completionPercentage > 70 ? '85%' : completionPercentage > 50 ? '60%' : '35%'}
                      </span>
                    </div>
                    <div className="comparison-bar">
                      <div
                        className="comparison-fill user"
                        style={{
                          width: completionPercentage > 70 ? '85%' : completionPercentage > 50 ? '60%' : '35%'
                        }}
                      />
                      <div className="comparison-indicator average" style={{ left: '72%' }}>
                        <span>Industry Average: 72%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Security & Compliance */}
          <div className="profile-section security-section">
            <h3 className="section-title">
              <Icon name="lock" size={20} />
              Security & Compliance
            </h3>

            <div className="security-content">
              {/* Security Status Overview */}
              <div className="security-overview">
                <div className="security-status-card">
                  <div className="status-header">
                    <Icon name="shield" size={24} />
                    <div>
                      <h4>Security Level</h4>
                      <p>
                        {(() => {
                          let securityScore = 0;
                          if (profile.email) securityScore += 20;
                          if (profile.phone) securityScore += 20;
                          if (profile.businessRegistration) securityScore += 25;
                          if (profile.taxId) securityScore += 15;
                          if (documents.length > 0) securityScore += 20;

                          if (securityScore >= 80) return 'Enterprise Grade';
                          if (securityScore >= 60) return 'High Security';
                          if (securityScore >= 40) return 'Standard';
                          return 'Basic';
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="security-score">
                    {(() => {
                      let securityScore = 0;
                      if (profile.email) securityScore += 20;
                      if (profile.phone) securityScore += 20;
                      if (profile.businessRegistration) securityScore += 25;
                      if (profile.taxId) securityScore += 15;
                      if (documents.length > 0) securityScore += 20;
                      return Math.min(100, securityScore);
                    })()}%
                  </div>
                </div>
              </div>

              {/* Privacy & Data Controls */}
              <div className="privacy-controls">
                <h4>
                  <Icon name="eye" size={18} />
                  Privacy & Data Controls
                </h4>

                <div className="control-items">
                  <div className="control-item">
                    <div className="control-info">
                      <h5>Profile Visibility</h5>
                      <p>Control who can view your business profile</p>
                    </div>
                    <div className="control-setting">
                      <select defaultValue="verified-investors">
                        <option value="public">Public</option>
                        <option value="verified-investors">Verified Investors Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="control-item">
                    <div className="control-info">
                      <h5>Financial Data Sharing</h5>
                      <p>Allow sharing of financial metrics with potential investors</p>
                    </div>
                    <div className="control-setting">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="control-item">
                    <div className="control-info">
                      <h5>Contact Information</h5>
                      <p>Display contact details on your public profile</p>
                    </div>
                    <div className="control-setting">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="control-item">
                    <div className="control-info">
                      <h5>Document Access</h5>
                      <p>Allow verified investors to request document access</p>
                    </div>
                    <div className="control-setting">
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="control-item">
                    <div className="control-info">
                      <h5>Analytics Tracking</h5>
                      <p>Allow us to track profile views and interactions for insights</p>
                    </div>
                    <div className="control-setting">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance & Certifications */}
              <div className="compliance-section">
                <h4>
                  <Icon name="check-circle" size={18} />
                  Compliance & Certifications
                </h4>

                <div className="compliance-grid">
                  <div className="compliance-item active">
                    <div className="compliance-icon">
                      <Icon name="shield" size={20} />
                    </div>
                    <div className="compliance-info">
                      <h5>Data Protection Compliance</h5>
                      <p>GDPR & CCPA Compliant</p>
                      <span className="status-badge verified">✓ Compliant</span>
                    </div>
                  </div>

                  <div className="compliance-item active">
                    <div className="compliance-icon">
                      <Icon name="lock" size={20} />
                    </div>
                    <div className="compliance-info">
                      <h5>Data Encryption</h5>
                      <p>256-bit AES Encryption</p>
                      <span className="status-badge verified">✓ Active</span>
                    </div>
                  </div>

                  <div className="compliance-item pending">
                    <div className="compliance-icon">
                      <Icon name="award" size={20} />
                    </div>
                    <div className="compliance-info">
                      <h5>Industry Certification</h5>
                      <p>Verify industry-specific compliance</p>
                      <span className="status-badge pending">⏳ Pending</span>
                    </div>
                  </div>

                  <div className="compliance-item pending">
                    <div className="compliance-icon">
                      <Icon name="file-text" size={20} />
                    </div>
                    <div className="compliance-info">
                      <h5>Audit Trail</h5>
                      <p>Complete activity logging</p>
                      <span className="status-badge pending">⏳ Setup Required</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="security-settings">
                <h4>
                  <Icon name="settings" size={18} />
                  Security Settings
                </h4>

                <div className="security-actions">
                  <div className="security-action">
                    <div className="action-info">
                      <Icon name="key" size={16} />
                      <div>
                        <h5>Two-Factor Authentication</h5>
                        <p>Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        notify.info('Two-factor authentication setup coming soon!', 'Security');
                      }}
                    >
                      Enable 2FA
                    </button>
                  </div>

                  <div className="security-action">
                    <div className="action-info">
                      <Icon name="phone" size={16} />
                      <div>
                        <h5>Phone Verification</h5>
                        <p>Verify your phone number for account security</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        notify.info('Phone verification feature coming soon!', 'Security');
                      }}
                    >
                      Verify Phone
                    </button>
                  </div>

                  <div className="security-action">
                    <div className="action-info">
                      <Icon name="mail" size={16} />
                      <div>
                        <h5>Email Verification</h5>
                        <p>Confirm your email address is valid and secure</p>
                      </div>
                    </div>
                    <button className="btn btn-success" disabled>
                      ✓ Verified
                    </button>
                  </div>

                  <div className="security-action">
                    <div className="action-info">
                      <Icon name="download" size={16} />
                      <div>
                        <h5>Data Export</h5>
                        <p>Download a copy of all your business data</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        notify.info('Data export feature coming soon!', 'Data Export');
                      }}
                    >
                      Export Data
                    </button>
                  </div>

                  <div className="security-action">
                    <div className="action-info">
                      <Icon name="trash" size={16} />
                      <div>
                        <h5>Account Deletion</h5>
                        <p>Permanently delete your account and all data</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          notify.error('Account deletion feature coming soon!', 'Account Deletion');
                        }
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="activity-log">
                <h4>
                  <Icon name="clock" size={18} />
                  Recent Security Activity
                </h4>

                <div className="activity-items">
                  <div className="activity-item">
                    <div className="activity-icon success">
                      <Icon name="check" size={14} />
                    </div>
                    <div className="activity-info">
                      <p>Profile updated successfully</p>
                      <span>2 hours ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon info">
                      <Icon name="eye" size={14} />
                    </div>
                    <div className="activity-info">
                      <p>Profile viewed by verified investor</p>
                      <span>1 day ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon success">
                      <Icon name="upload" size={14} />
                    </div>
                    <div className="activity-info">
                      <p>Documents uploaded</p>
                      <span>3 days ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon info">
                      <Icon name="mail" size={14} />
                    </div>
                    <div className="activity-info">
                      <p>Email verification completed</p>
                      <span>1 week ago</span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-outline view-all-activity"
                  onClick={() => {
                    notify.info('Detailed activity log coming soon!', 'Activity Log');
                  }}
                >
                  View All Activity
                </button>
              </div>
            </div>
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
            <div className="score-value">--</div>
          </div>
          <h3>Take Assessment</h3>
          <p>Complete your business assessment to see your investment readiness score</p>
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

// Growth Tools View - Investment Accelerator Program
export const GrowthView: React.FC = () => {
  return (
    <div className="view-container animate-fadeIn">
      <div className="accelerator-overview">
        <div className="accelerator-header">
          <Icon name="growth" size={48} color="var(--gold-primary)" />
          <h2>Investment Accelerator Program</h2>
          <p>Transform from struggling SME to investment-ready business in 90 days</p>
        </div>

        <div className="accelerator-tracks">
          <div className="track-card">
            <div className="track-icon">
              <Icon name="book" size={32} color="var(--blue-500)" />
            </div>
            <h3>Self-Paced Track</h3>
            <div className="track-price">₵800</div>
            <p>Complete the comprehensive curriculum at your own speed with community support</p>
            <ul className="track-features">
              <li>6 months access to all content</li>
              <li>Community support & Q&A forums</li>
              <li>Email mentor support</li>
              <li>All templates and resources</li>
            </ul>
            <button className="btn btn-secondary">Learn More</button>
          </div>

          <div className="track-card featured">
            <div className="track-badge">🏆 Most Popular</div>
            <div className="track-icon">
              <Icon name="users" size={32} color="var(--gold-primary)" />
            </div>
            <h3>Elite Cohort Track</h3>
            <div className="track-price">₵2,500 <span className="original-price">₵3,500</span></div>
            <p>Intensive 90-day program with personal mentorship and live group sessions</p>
            <ul className="track-features">
              <li>Personal mentor for 90 days</li>
              <li>Live weekly group sessions</li>
              <li>1-on-1 coaching calls</li>
              <li>Direct investor introductions</li>
              <li>90% investment readiness guarantee</li>
            </ul>
            <button className="btn btn-primary">Join Elite Cohort</button>
          </div>
        </div>

        <div className="success-metrics">
          <div className="metric">
            <div className="metric-value">✓</div>
            <div className="metric-label">Investment Ready</div>
          </div>
          <div className="metric">
            <div className="metric-value">💰</div>
            <div className="metric-label">Capital Access</div>
          </div>
          <div className="metric">
            <div className="metric-value">🎯</div>
            <div className="metric-label">SMEs Supported</div>
          </div>
        </div>

        <div className="program-highlight">
          <h3>🎯 Why SMEs Choose Our Investment Accelerator</h3>
          <div className="highlight-grid">
            <div className="highlight-item">
              <Icon name="check" size={20} color="var(--green-500)" />
              <span>Ghana-specific business solutions</span>
            </div>
            <div className="highlight-item">
              <Icon name="check" size={20} color="var(--green-500)" />
              <span>Real investor feedback & connections</span>
            </div>
            <div className="highlight-item">
              <Icon name="check" size={20} color="var(--green-500)" />
              <span>Proven frameworks & templates</span>
            </div>
            <div className="highlight-item">
              <Icon name="check" size={20} color="var(--green-500)" />
              <span>Personal mentorship from successful entrepreneurs</span>
            </div>
          </div>
        </div>
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