/**
 * Enhanced Onboarding Flow - Phase 2 Implementation
 * Professional user segmentation and expectation setting
 */

import React, { useState } from 'react';
import { OnboardingData } from '../types/assessment.types';
import { AssessmentHelpers } from '../utils/assessmentHelpers';

interface OnboardingFlowEnhancedProps {
  onComplete: (data: OnboardingData) => void;
  onClose: () => void;
}

const OnboardingFlowEnhanced: React.FC<OnboardingFlowEnhancedProps> = ({
  onComplete,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Discover What\'s Really Happening in Your Business',
      subtitle: '90% of SMEs don\'t know they\'re 6 months from failure',
      content: 'welcome'
    },
    {
      id: 'business-type',
      title: 'What type of business do you operate?',
      subtitle: 'This helps us customize your assessment',
      content: 'businessType'
    },
    {
      id: 'experience',
      title: 'How long have you been in business?',
      subtitle: 'Experience level affects our recommendations',
      content: 'yearsInBusiness'
    },
    {
      id: 'revenue',
      title: 'What\'s your monthly revenue range?',
      subtitle: 'This helps us benchmark your performance',
      content: 'monthlyRevenue'
    },
    {
      id: 'location',
      title: 'Where is your business located?',
      subtitle: 'Regional insights matter in Ghana',
      content: 'location'
    }
  ];

  const businessTypes = [
    { value: 'Retail/Trading', icon: '🛒', description: 'Selling products to consumers' },
    { value: 'Manufacturing', icon: '🏭', description: 'Producing goods for sale' },
    { value: 'Services', icon: '💼', description: 'Providing professional services' },
    { value: 'Agriculture', icon: '🌾', description: 'Farming, livestock, fishing' },
    { value: 'Technology', icon: '💻', description: 'Software, digital products' },
    { value: 'Food & Beverage', icon: '🍽️', description: 'Restaurants, catering, food production' },
    { value: 'Construction', icon: '🏗️', description: 'Building, infrastructure projects' },
    { value: 'Transportation', icon: '🚛', description: 'Logistics, delivery, transport services' }
  ];

  const yearsOptions = [
    { value: 'Less than 1 year', icon: '🌱', risk: 'High support needed' },
    { value: '1-3 years', icon: '🌿', risk: 'Critical growth phase' },
    { value: '3-5 years', icon: '🌳', risk: 'Scaling challenges ahead' },
    { value: '5-10 years', icon: '🏆', risk: 'Maturation decisions' },
    { value: 'More than 10 years', icon: '👑', risk: 'Legacy optimization' }
  ];

  const revenueRanges = [
    { value: 'Less than GHS 5,000', icon: '💰', benchmark: 'Micro business' },
    { value: 'GHS 5,000 - 20,000', icon: '💰', benchmark: 'Small business' },
    { value: 'GHS 20,000 - 50,000', icon: '💰💰', benchmark: 'Growing business' },
    { value: 'GHS 50,000 - 100,000', icon: '💰💰', benchmark: 'Medium business' },
    { value: 'GHS 100,000 - 500,000', icon: '💰💰💰', benchmark: 'Large SME' },
    { value: 'More than GHS 500,000', icon: '💎', benchmark: 'Major enterprise' }
  ];

  const locations = [
    { value: 'Greater Accra', icon: '🏙️', context: 'Competitive urban market' },
    { value: 'Ashanti Region', icon: '🏘️', context: 'Commercial hub' },
    { value: 'Western Region', icon: '🌊', context: 'Resource-rich area' },
    { value: 'Northern Regions', icon: '🌾', context: 'Agricultural focus' },
    { value: 'Eastern Region', icon: '⛰️', context: 'Mixed economy' },
    { value: 'Other Regions', icon: '🗺️', context: 'Regional market' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);

      // Track progress
      AssessmentHelpers.trackEvent('onboarding_step_completed', {
        step: currentStep,
        stepId: steps[currentStep].id,
        data: formData
      });
    } else {
      // Complete onboarding
      const completeData: OnboardingData = {
        businessType: formData.businessType || 'General',
        yearsInBusiness: formData.yearsInBusiness || '1-3 years',
        monthlyRevenue: formData.monthlyRevenue || 'GHS 5,000 - 20,000',
        industry: formData.businessType || 'General',
        location: formData.location || 'Greater Accra'
      };

      AssessmentHelpers.trackEvent('onboarding_completed', completeData);
      onComplete(completeData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const updateFormData = (key: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.content) {
      case 'welcome':
        return (
          <div className="welcome-content">
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>🚀</div>
            <h2 style={{
              color: '#2E8B57',
              marginBottom: '16px',
              fontSize: '28px',
              fontWeight: '700'
            }}>
              {step.title}
            </h2>
            <p style={{
              color: '#DC143C',
              marginBottom: '32px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {step.subtitle}
            </p>

            <div style={{
              background: '#F0FFF0',
              border: '2px solid #2E8B57',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{ color: '#2E8B57', marginBottom: '16px' }}>
                What You'll Discover:
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                color: '#2E8B57',
                lineHeight: '1.6'
              }}>
                <li style={{ marginBottom: '8px' }}>🎯 Critical issues that could kill your business</li>
                <li style={{ marginBottom: '8px' }}>💰 Hidden profit opportunities worth thousands</li>
                <li style={{ marginBottom: '8px' }}>📈 Your exact path to growth and funding</li>
                <li style={{ marginBottom: '8px' }}>🇬🇭 Ghana-specific market insights</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              fontSize: '14px',
              color: '#666',
              marginBottom: '32px'
            }}>
              <span>⏱️ 15 minutes</span>
              <span>🔒 Confidential</span>
              <span>📊 Instant results</span>
            </div>
          </div>
        );

      case 'businessType':
        return (
          <div className="business-type-selection">
            <div style={{ display: 'grid', gap: '12px' }}>
              {businessTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    updateFormData('businessType', type.value);
                    setTimeout(handleNext, 500);
                  }}
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.businessType === type.value ? '#2E8B57' : '#E9ECEF'}`,
                    borderRadius: '12px',
                    background: formData.businessType === type.value ? '#F0FFF0' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.businessType !== type.value) {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.background = '#FFFBF0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.businessType !== type.value) {
                      e.currentTarget.style.borderColor = '#E9ECEF';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{type.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {type.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'yearsInBusiness':
        return (
          <div className="years-selection">
            <div style={{ display: 'grid', gap: '12px' }}>
              {yearsOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateFormData('yearsInBusiness', option.value);
                    setTimeout(handleNext, 500);
                  }}
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.yearsInBusiness === option.value ? '#2E8B57' : '#E9ECEF'}`,
                    borderRadius: '12px',
                    background: formData.yearsInBusiness === option.value ? '#F0FFF0' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{option.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {option.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#FFA500' }}>
                      {option.risk}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'monthlyRevenue':
        return (
          <div className="revenue-selection">
            <div style={{ display: 'grid', gap: '12px' }}>
              {revenueRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => {
                    updateFormData('monthlyRevenue', range.value);
                    setTimeout(handleNext, 500);
                  }}
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.monthlyRevenue === range.value ? '#2E8B57' : '#E9ECEF'}`,
                    borderRadius: '12px',
                    background: formData.monthlyRevenue === range.value ? '#F0FFF0' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{range.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {range.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#2E8B57' }}>
                      {range.benchmark}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="location-selection">
            <div style={{ display: 'grid', gap: '12px' }}>
              {locations.map(loc => (
                <button
                  key={loc.value}
                  onClick={() => {
                    updateFormData('location', loc.value);
                    setTimeout(handleNext, 500);
                  }}
                  style={{
                    padding: '20px',
                    border: `2px solid ${formData.location === loc.value ? '#2E8B57' : '#E9ECEF'}`,
                    borderRadius: '12px',
                    background: formData.location === loc.value ? '#F0FFF0' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{loc.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {loc.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {loc.context}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: 'white',
        borderBottom: '2px solid #E9ECEF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#2E8B57', fontSize: '24px', fontWeight: '700' }}>
            Business Health Assessment
          </h1>
          <p style={{ margin: 0, marginTop: '4px', color: '#666', fontSize: '14px' }}>
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '2px solid #E9ECEF',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        padding: '16px 32px',
        background: 'white',
        borderBottom: '1px solid #E9ECEF'
      }}>
        <div style={{
          height: '8px',
          background: '#E9ECEF',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2E8B57, #228B22)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
          transition: 'all 0.3s ease',
          width: '100%'
        }}>
          {currentStep > 0 && (
            <>
              <h2 style={{
                color: '#2C3E50',
                marginBottom: '8px',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {steps[currentStep].title}
              </h2>
              <p style={{
                color: '#666',
                marginBottom: '32px',
                fontSize: '16px'
              }}>
                {steps[currentStep].subtitle}
              </p>
            </>
          )}

          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      {currentStep === 0 && (
        <div style={{
          padding: '24px 32px',
          background: 'white',
          borderTop: '1px solid #E9ECEF',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg, #2E8B57, #228B22)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(46, 139, 87, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 139, 87, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 139, 87, 0.3)';
            }}
          >
            Start Your Free Assessment →
          </button>
        </div>
      )}

      {currentStep > 0 && (
        <div style={{
          padding: '24px 32px',
          background: 'white',
          borderTop: '1px solid #E9ECEF',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handlePrevious}
            style={{
              background: 'none',
              border: '2px solid #E9ECEF',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>

          <div style={{
            fontSize: '14px',
            color: '#666',
            display: 'flex',
            alignItems: 'center'
          }}>
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlowEnhanced;