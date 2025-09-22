import React, { useState } from 'react';
import { useUser, useVerificationStatus, useProfileCompletion, useUserRole } from '../store/hooks';
import { rbacService } from '../services/rbacService';
import ProfileCompletionWidget from './ProfileCompletionWidget';
import VerificationModal from './VerificationModal';

interface UserProfileHeaderProps {
  user?: any;
  signOut?: () => void;
  onEditProfile?: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  signOut,
  onEditProfile
}) => {
  const userProfile = useUser().profile;
  const verificationStatus = useVerificationStatus();
  const profileCompletion = useProfileCompletion();
  const userRole = useUserRole();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');

  if (!userProfile) {
    return null;
  }

  const handleVerificationClick = (type: 'email' | 'phone') => {
    setVerificationType(type);
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = () => {
    // Verification success will be handled by the Redux store
    setShowVerificationModal(false);
  };

  const roleDisplayName = rbacService.getRoleDisplayName(userProfile.role);

  return (
    <>
      {/* Enhanced Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2E8B57, #228B22, #32CD32)',
        color: 'white',
        padding: '25px 30px',
        borderRadius: '15px',
        marginBottom: '25px',
        boxShadow: '0 8px 16px rgba(46, 139, 87, 0.3)',
        border: '2px solid #1F5F3F'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '28px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              🇬🇭 Welcome to Bvester, {user?.username}!
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '600',
                color: '#FFD700',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                {userProfile.businessName}
              </h2>
              <div style={{
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {roleDisplayName}
              </div>
            </div>

            <p style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              color: 'white',
              opacity: 0.95
            }}>
              📍 {userProfile.location}, {userProfile.region} • 🏢 {userProfile.businessType}
            </p>

            {/* Verification Status */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Verification:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleVerificationClick('email')}
                  style={{
                    padding: '4px 8px',
                    background: verificationStatus.email ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 193, 7, 0.3)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: verificationStatus.email ? 'default' : 'pointer'
                  }}
                  disabled={verificationStatus.email}
                >
                  {verificationStatus.email ? '✅ Email' : '⚠️ Email'}
                </button>
                <button
                  onClick={() => handleVerificationClick('phone')}
                  style={{
                    padding: '4px 8px',
                    background: verificationStatus.phone ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 193, 7, 0.3)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: verificationStatus.phone ? 'default' : 'pointer'
                  }}
                  disabled={verificationStatus.phone}
                >
                  {verificationStatus.phone ? '✅ Phone' : '⚠️ Phone'}
                </button>
                <div style={{
                  padding: '4px 8px',
                  background: verificationStatus.business ? 'rgba(76, 175, 80, 0.3)' : 'rgba(158, 158, 158, 0.3)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {verificationStatus.business ? '✅ Business' : '⏳ Business'}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Widget - Compact */}
          <div style={{ width: '280px', marginLeft: '20px' }}>
            <ProfileCompletionWidget
              userProfile={userProfile}
              onCompleteProfile={onEditProfile}
              compact
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
            >
              Edit Profile
            </button>
          )}
          {signOut && (
            <button
              onClick={signOut}
              style={{
                background: 'rgba(220, 20, 60, 0.8)',
                border: '1px solid rgba(220, 20, 60, 0.5)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          verificationType={verificationType}
          contactInfo={verificationType === 'email' ? userProfile.email : (userProfile.phone || '')}
          userId={userProfile.userId}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
};

export default UserProfileHeader;