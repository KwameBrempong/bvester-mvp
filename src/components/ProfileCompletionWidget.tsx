import React from 'react';
import { UserProfile, profileUtils } from '../services/dataService';

interface ProfileCompletionWidgetProps {
  userProfile: UserProfile;
  onCompleteProfile?: () => void;
  compact?: boolean;
}

const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({
  userProfile,
  onCompleteProfile,
  compact = false
}) => {
  const completionPercentage = userProfile.profileCompletionPercentage;
  const missingFields = profileUtils.getRequiredFieldsForCompletion(userProfile);
  const isComplete = completionPercentage === 100;

  // Color scheme based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#2E8B57'; // Green
    if (percentage >= 60) return '#FF8C00'; // Orange
    if (percentage >= 40) return '#FFD700'; // Yellow
    return '#DC143C'; // Red
  };

  const progressColor = getProgressColor(completionPercentage);

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        cursor: onCompleteProfile ? 'pointer' : 'default'
      }} onClick={onCompleteProfile}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: `conic-gradient(${progressColor} ${completionPercentage * 3.6}deg, #f0f0f0 0deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: progressColor
        }}>
          {completionPercentage}%
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            Profile {isComplete ? 'Complete' : 'Incomplete'}
          </div>
          {!isComplete && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {missingFields.length} fields remaining
            </div>
          )}
        </div>
        {onCompleteProfile && !isComplete && (
          <div style={{
            marginLeft: 'auto',
            padding: '4px 8px',
            background: progressColor,
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Complete
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, color: '#2E8B57', fontSize: '18px' }}>Profile Completion</h3>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: progressColor }}>
            {completionPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#f0f0f0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            background: progressColor,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {isComplete ? (
        <div style={{
          padding: '16px',
          background: '#f0f8ff',
          borderRadius: '8px',
          border: '1px solid #2E8B57',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2E8B57', marginBottom: '4px' }}>
            🎉 Profile Complete!
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Your business profile is fully set up and verified.
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px' }}>
              Missing Information ({missingFields.length} fields)
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {missingFields.slice(0, 5).map((field, index) => (
                <span key={index} style={{
                  padding: '4px 8px',
                  background: '#fff5f5',
                  color: '#DC143C',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: '1px solid #ffe0e0'
                }}>
                  {field}
                </span>
              ))}
              {missingFields.length > 5 && (
                <span style={{
                  padding: '4px 8px',
                  background: '#f5f5f5',
                  color: '#666',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  +{missingFields.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Verification status */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px' }}>
              Verification Status
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>
                  {userProfile.isEmailVerified ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: '12px', color: userProfile.isEmailVerified ? '#2E8B57' : '#666' }}>
                  Email
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>
                  {userProfile.isPhoneVerified ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: '12px', color: userProfile.isPhoneVerified ? '#2E8B57' : '#666' }}>
                  Phone
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>
                  {userProfile.isBusinessVerified ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: '12px', color: userProfile.isBusinessVerified ? '#2E8B57' : '#666' }}>
                  Business
                </span>
              </div>
            </div>
          </div>

          {onCompleteProfile && (
            <button
              onClick={onCompleteProfile}
              style={{
                width: '100%',
                padding: '12px',
                background: progressColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Complete Profile ({missingFields.length} fields remaining)
            </button>
          )}
        </>
      )}

      {/* Benefits of completion */}
      {!isComplete && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>💡 Complete your profile to:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            <li>Unlock advanced features</li>
            <li>Improve funding eligibility</li>
            <li>Access detailed analytics</li>
            <li>Get priority support</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionWidget;