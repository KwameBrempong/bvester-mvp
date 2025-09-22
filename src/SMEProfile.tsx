import React, { useState } from 'react';

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
    location: 'Accra', // Default to Accra
    region: 'Greater Accra',
    yearEstablished: '',
    numberOfEmployees: '',
    monthlyRevenue: '',
    fundingNeeded: '',
    businessDescription: '',
    userType: 'sme_owner' // Default to SME owner
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileComplete(formData);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: '#2E8B57', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Complete Your Business Profile</h2>
        <p>Tell us about your SME to connect with the right investors</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>I am a:</label>
          <select 
            name="userType" 
            value={formData.userType} 
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="sme_owner">SME Business Owner (seeking funding)</option>
            <option value="investor">Investor (looking to invest)</option>
          </select>
        </div>

        {formData.userType === 'sme_owner' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Enter your business name"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Business Type *</label>
              <select 
                name="businessType" 
                value={formData.businessType} 
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Region *</label>
                <select 
                  name="region" 
                  value={formData.region} 
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  {ghanaRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City/Town *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="e.g., Accra, Kumasi"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Year Established</label>
                <input
                  type="number"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleInputChange}
                  min="1950"
                  max="2025"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="e.g., 2020"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Number of Employees</label>
                <select 
                  name="numberOfEmployees" 
                  value={formData.numberOfEmployees} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Select range</option>
                  <option value="1-5">1-5 employees</option>
                  <option value="6-20">6-20 employees</option>
                  <option value="21-50">21-50 employees</option>
                  <option value="51-100">51-100 employees</option>
                  <option value="100+">100+ employees</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Monthly Revenue (GHS)</label>
                <select 
                  name="monthlyRevenue" 
                  value={formData.monthlyRevenue} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Select range</option>
                  <option value="0-5000">0 - 5,000 GHS</option>
                  <option value="5000-20000">5,000 - 20,000 GHS</option>
                  <option value="20000-50000">20,000 - 50,000 GHS</option>
                  <option value="50000-100000">50,000 - 100,000 GHS</option>
                  <option value="100000+">100,000+ GHS</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Funding Needed (GHS)</label>
                <input
                  type="number"
                  name="fundingNeeded"
                  value={formData.fundingNeeded}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Business Description</label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                rows={4}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Briefly describe your business, what you do, and what you plan to use the funding for..."
              />
            </div>
          </>
        )}

        {formData.userType === 'investor' && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '5px' }}>
            <h3>Investor Profile</h3>
            <p>As an investor, you'll be able to browse SME investment opportunities and connect with business owners seeking funding.</p>
          </div>
        )}

        <button
          type="submit"
          style={{
            background: '#2E8B57',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Complete Profile
        </button>
      </form>
    </div>
  );
}