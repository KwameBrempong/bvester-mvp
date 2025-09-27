import React, { useState } from 'react';
import { notify } from './utils/notifications';
import './styles/profile-form.css';

interface ProfileData {
  businessName: string;
  businessType: string;
  location: string;
  region: string;
  yearEstablished: string;
  numberOfEmployees: string;
  monthlyRevenue: string;
  fundingNeeded: string;
  businessDescription: string;
  userType: string;
}

interface SMEProfileProps {
  user: { username: string };
  onProfileComplete: (profileData: ProfileData) => void;
}

export default function SMEProfile({ onProfileComplete }: SMEProfileProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    location: '', // No default location
    region: '',
    yearEstablished: '',
    numberOfEmployees: '',
    monthlyRevenue: '',
    fundingNeeded: '',
    businessDescription: '',
    userType: 'sme_owner' // Default to SME owner
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const ghanaRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
    'Western North', 'Ahafo', 'Bono', 'Bono East', 'Oti', 'Savannah', 'North East'
  ];

  const businessTypes = [
    'Agriculture', 'Manufacturing', 'Trading/Retail', 'Technology',
    'Healthcare', 'Education', 'Construction', 'Transportation',
    'Food & Beverage', 'Fashion & Textiles', 'Tourism', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation

    // Check if all required fields are filled for SME owners
    if (formData.userType === 'sme_owner') {
      const requiredFields = ['businessName', 'businessType', 'region', 'location'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

      if (missingFields.length > 0) {
        // Show validation error to user
        notify.warning(`Please fill in the following required fields: ${missingFields.join(', ')}`, 'Required Fields Missing');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calling profile completion
      await onProfileComplete(formData);
    } catch (error) {
      // Profile completion failed
      notify.error('Profile completion failed. Please try again.', 'Profile Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-form-container">
      {/* Progress Indicator */}
      <div className="profile-progress-indicator">
        <div className="progress-step completed">
          <span>1️⃣</span>
          <span>Account Created</span>
        </div>
        <div className="progress-step active">
          <span>2️⃣</span>
          <span>Profile Setup</span>
        </div>
        <div className="progress-step pending">
          <span>3️⃣</span>
          <span>Dashboard</span>
        </div>
      </div>

      {/* Enhanced Welcome Header */}
      <div className="profile-welcome-header">
        <h2>🎯 Complete Your Business Profile</h2>
        <p>Tell us about your SME to connect with the right investors and unlock premium features</p>
      </div>

      <div className="profile-form-card">
        <form onSubmit={handleSubmit}>

          {/* User Type Selection */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span>👤</span>
              I am a:
            </h3>
            <div className="user-type-selector">
              <div
                className={`user-type-card ${formData.userType === 'sme_owner' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'sme_owner' })}
              >
                <div className="icon">🏢</div>
                <div className="title">SME Business Owner</div>
                <div className="description">Seeking funding and growth opportunities</div>
              </div>
              <div
                className={`user-type-card ${formData.userType === 'investor' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'investor' })}
              >
                <div className="icon">💼</div>
                <div className="title">Investor</div>
                <div className="description">Looking to invest in promising SMEs</div>
              </div>
            </div>
          </div>

          {formData.userType === 'sme_owner' && (
            <>
              {/* Basic Business Information */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span>🏪</span>
                  Basic Business Information
                </h3>

                <div className="form-group">
                  <label className="form-label required">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className={`form-input ${!formData.businessName ? 'error' : ''}`}
                    placeholder="Enter your business name"
                  />
                  <div className="form-help-text">
                    This will be displayed to potential investors
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Business Type</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className={`form-select ${!formData.businessType ? 'error' : ''}`}
                  >
                    <option value="">Select your business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Description</label>
                  <textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Briefly describe your business, what you do, and what you plan to use the funding for..."
                  />
                  <div className="form-help-text">
                    A compelling description helps attract the right investors
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span>📍</span>
                  Location & Contact
                </h3>

                <div className="form-group two-column">
                  <div>
                    <label className="form-label required">Region</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select your region</option>
                      {ghanaRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label required">City/Town</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className={`form-input ${!formData.location ? 'error' : ''}`}
                      placeholder="e.g., Accra, Kumasi"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span>📊</span>
                  Business Details
                </h3>

                <div className="form-group two-column">
                  <div>
                    <label className="form-label">Year Established</label>
                    <input
                      type="number"
                      name="yearEstablished"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      min="1950"
                      max="2025"
                      className="form-input"
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div>
                    <label className="form-label">Number of Employees</label>
                    <select
                      name="numberOfEmployees"
                      value={formData.numberOfEmployees}
                      onChange={handleInputChange}
                      className="form-select"
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

                <div className="form-group two-column">
                  <div>
                    <label className="form-label">Monthly Revenue (GHS)</label>
                    <select
                      name="monthlyRevenue"
                      value={formData.monthlyRevenue}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select revenue range</option>
                      <option value="0-5000">₵0 - 5,000</option>
                      <option value="5000-20000">₵5,000 - 20,000</option>
                      <option value="20000-50000">₵20,000 - 50,000</option>
                      <option value="50000-100000">₵50,000 - 100,000</option>
                      <option value="100000+">₵100,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Funding Needed (GHS)</label>
                    <input
                      type="number"
                      name="fundingNeeded"
                      value={formData.fundingNeeded}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., 50000"
                    />
                    <div className="form-help-text">
                      How much capital are you looking to raise?
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.userType === 'investor' && (
            <div className="investor-preview">
              <h3>🎯 Investor Profile</h3>
              <p>As an investor, you'll be able to browse SME investment opportunities and connect with business owners seeking funding.</p>
              <p><strong>Coming soon:</strong> Advanced investor features, portfolio management, and deal flow analytics.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
          >
            {isSubmitting ? 'Setting up your profile...' : '🚀 Complete Profile & Get Started'}
          </button>

          {formData.userType === 'sme_owner' && (
            <div className="completion-benefits">
              <h4>🎉 What happens next?</h4>
              <ul>
                <li>Access your personalized business dashboard</li>
                <li>Get matched with relevant investors</li>
                <li>Start using our growth tools and analytics</li>
                <li>Join our investment readiness bootcamp</li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}