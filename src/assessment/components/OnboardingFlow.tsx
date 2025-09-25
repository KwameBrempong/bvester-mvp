/**
 * Onboarding Flow Component - Phase 2 Implementation
 * Simple implementation for Phase 1, will be enhanced in Phase 2
 */

import React from 'react';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onClose }) => {
  const handleQuickStart = () => {
    // For Phase 1, skip onboarding with default data
    onComplete({
      businessType: 'SME',
      yearsInBusiness: '1-3 years',
      monthlyRevenue: 'GHS 20,000 - 50,000',
      industry: 'General',
      location: 'Greater Accra'
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      padding: '40px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#2E8B57', marginBottom: '16px' }}>
        Welcome to Your Business Health Assessment
      </h2>

      <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.5', maxWidth: '400px' }}>
        This comprehensive assessment will identify critical issues that could be killing your business
        and provide actionable insights to help you thrive.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          ⏱️ Takes 10-15 minutes<br />
          📊 Get immediate insights<br />
          🇬🇭 Tailored for Ghana SMEs
        </div>
      </div>

      <button
        onClick={handleQuickStart}
        style={{
          background: 'linear-gradient(135deg, #2E8B57, #228B22)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 32px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '16px',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Start Assessment
      </button>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: '14px',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Maybe later
      </button>
    </div>
  );
};

export default OnboardingFlow;