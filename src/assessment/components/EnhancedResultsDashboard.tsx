/**
 * Enhanced Results Dashboard - Phase 5 Implementation
 * Advanced results with tiered monetization and conversion optimization
 */

import React, { useState } from 'react';
import { AssessmentResult } from '../types/assessment.types';
import { AssessmentHelpers } from '../utils/assessmentHelpers';
import { GrowthAcceleratorRecommendation } from './GrowthAcceleratorRecommendation';
import { GrowthAcceleratorEnrollment } from './GrowthAcceleratorEnrollment';

interface EnhancedResultsDashboardProps {
  result: AssessmentResult;
  onClose: () => void;
  onRestart: () => void;
  user: any;
  subscriptionStatus: any;
}

const EnhancedResultsDashboard: React.FC<EnhancedResultsDashboardProps> = ({
  result,
  onClose,
  onRestart,
  user,
  subscriptionStatus
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showGrowthAccelerator, setShowGrowthAccelerator] = useState(false);
  const [showEnrollmentFlow, setShowEnrollmentFlow] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const isFreeTier = !subscriptionStatus?.isPaidUser;

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      'Low Risk': '#2E8B57',
      'Moderate Risk': '#FFA500',
      'High Risk': '#FF6B35',
      'Critical Risk': '#DC143C'
    };
    return colors[riskLevel as keyof typeof colors] || colors['Moderate Risk'];
  };

  const getRiskGradient = (riskLevel: string) => {
    const gradients = {
      'Low Risk': 'linear-gradient(135deg, #2E8B57, #228B22)',
      'Moderate Risk': 'linear-gradient(135deg, #FFA500, #FF8C00)',
      'High Risk': 'linear-gradient(135deg, #FF6B35, #FF4500)',
      'Critical Risk': 'linear-gradient(135deg, #DC143C, #B22222)'
    };
    return gradients[riskLevel as keyof typeof gradients] || gradients['Moderate Risk'];
  };

  const handleGrowthAcceleratorClick = () => {
    AssessmentHelpers.trackEvent('growth_accelerator_opened', {
      riskLevel: result.riskLevel,
      overallScore: result.overallScore,
      criticalIssues: result.criticalIssues.length
    });
    setShowGrowthAccelerator(true);
  };

  const handleModuleEnrollClick = (moduleId: string) => {
    AssessmentHelpers.trackEvent('module_enroll_clicked', {
      moduleId,
      source: 'recommendation'
    });
    setSelectedModule(moduleId);
    setShowEnrollmentFlow(true);
  };

  const handleEnrollmentComplete = (enrollmentData: any) => {
    AssessmentHelpers.trackEvent('enrollment_completed', {
      moduleId: selectedModule,
      ...enrollmentData
    });
    // This would integrate with your backend to process enrollment
    // TODO: Replace with proper notification system
    setShowEnrollmentFlow(false);
    setShowGrowthAccelerator(false);
  };

  const handleBackToRecommendations = () => {
    setShowEnrollmentFlow(false);
    setSelectedModule(null);
  };

  const handleUpgradeClick = () => {
    AssessmentHelpers.trackEvent('upgrade_modal_opened', {
      source: 'results_dashboard',
      riskLevel: result.riskLevel,
      criticalIssues: result.criticalIssues.length
    });
    setShowUpgradeModal(true);
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', free: true },
    { id: 'growth-accelerator', label: '🚀 Growth Program', free: true },
    { id: 'critical', label: '🚨 Critical Issues', free: false },
    { id: 'predictive', label: '🔮 Predictions', free: false },
    { id: 'recommendations', label: '💡 Solutions', free: false },
    { id: 'benchmarks', label: '📈 Benchmarks', free: true }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8F9FA' }}>
      {/* Dramatic Header */}
      <div style={{
        padding: '32px',
        background: getRiskGradient(result.riskLevel),
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background patterns */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{
                margin: 0,
                marginBottom: '8px',
                fontSize: '32px',
                fontWeight: '800',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Business Health Report
              </h1>
              <p style={{
                margin: 0,
                fontSize: '18px',
                opacity: 0.9,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                Your comprehensive business analysis is complete
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>

          {/* Score Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '24px'
          }}>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px'
            }}>
              {/* Circular progress */}
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="white"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${(result.overallScore / 100) * 339.29} 339.29`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 2s ease' }}
                />
              </svg>

              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '800' }}>
                  {result.overallScore}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  /100
                </div>
              </div>
            </div>

            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                padding: '12px 24px',
                marginBottom: '16px',
                display: 'inline-block'
              }}>
                <strong style={{ fontSize: '20px' }}>{result.riskLevel}</strong>
              </div>

              {result.criticalIssues.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  animation: result.riskLevel === 'Critical Risk' ? 'pulse 2s infinite' : 'none'
                }}>
                  <span>🚨</span>
                  <strong>{result.criticalIssues.length} Critical Issue{result.criticalIssues.length > 1 ? 's' : ''} Found</strong>
                </div>
              )}

              {/* Predictive insight teaser */}
              {result.predictiveAnalytics && (
                <div style={{
                  marginTop: '12px',
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  📈 6-month survival probability: {Math.round((1 - result.predictiveAnalytics.failureProbability['6_months']) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Action urgency */}
          {result.riskLevel === 'Critical Risk' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              animation: 'pulse 3s infinite'
            }}>
              <strong style={{ fontSize: '16px' }}>⚠️ URGENT ACTION REQUIRED</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                Your business has critical issues that need immediate attention to prevent failure
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderBottom: '2px solid #E9ECEF',
        padding: '0 32px',
        display: 'flex',
        gap: '0',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (!tab.free && isFreeTier) {
                handleUpgradeClick();
                return;
              }
              setActiveTab(tab.id);
              AssessmentHelpers.trackEvent('results_tab_clicked', { tab: tab.id });
            }}
            style={{
              background: activeTab === tab.id ? '#F8F9FA' : 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === tab.id ? '#2E8B57' : 'transparent'}`,
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              color: activeTab === tab.id ? '#2E8B57' : '#666'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.color = '#2E8B57';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            {tab.label}
            {!tab.free && isFreeTier && (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#D4AF37',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: '700'
              }}>
                PRO
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#2C3E50', fontSize: '24px' }}>
              Business Health Overview
            </h3>

            {/* Category Scores */}
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ marginBottom: '20px', color: '#2C3E50' }}>Category Performance</h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {Object.entries(result.categoryScores).map(([category, score]) => (
                  <div key={category} style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E9ECEF',
                    transition: 'transform 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: score >= 75 ? '#2E8B57' : score >= 50 ? '#FFA500' : '#DC143C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        fontSize: '20px'
                      }}>
                        {category === 'financial_health' ? '💰' :
                         category === 'operational_resilience' ? '⚙️' :
                         category === 'market_position' ? '🎯' :
                         category === 'compliance_risk' ? '📋' : '🚀'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px',
                          textTransform: 'capitalize'
                        }}>
                          {category.replace('_', ' ')}
                        </div>

                        <div style={{
                          height: '8px',
                          background: '#E9ECEF',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${score}%`,
                            height: '100%',
                            background: score >= 75 ?
                              'linear-gradient(90deg, #2E8B57, #228B22)' :
                              score >= 50 ?
                                'linear-gradient(90deg, #FFA500, #FF8C00)' :
                                'linear-gradient(90deg, #DC143C, #B22222)',
                            borderRadius: '4px',
                            transition: 'width 1s ease 0.5s'
                          }} />
                        </div>
                      </div>

                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: score >= 75 ? '#2E8B57' : score >= 50 ? '#FFA500' : '#DC143C',
                        marginLeft: '16px'
                      }}>
                        {score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Accelerator CTA */}
            <div style={{
              background: result.riskLevel === 'Critical Risk' || result.riskLevel === 'High Risk' ?
                'linear-gradient(135deg, #DC143C, #B22222)' :
                'linear-gradient(135deg, #3b82f6, #1e40af)',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              color: 'white',
              marginBottom: '32px',
              boxShadow: result.riskLevel === 'Critical Risk' ?
                '0 8px 32px rgba(220, 20, 60, 0.4)' :
                '0 8px 32px rgba(59, 130, 246, 0.3)',
              animation: result.riskLevel === 'Critical Risk' ? 'pulse 3s infinite' : 'none'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '32px' }}>
                  {result.riskLevel === 'Critical Risk' ? '🚨' :
                   result.riskLevel === 'High Risk' ? '⚠️' : '🚀'}
                </span>
              </div>

              <h3 style={{ margin: '0 0 16px 0', fontSize: '28px', fontWeight: 'bold' }}>
                {result.riskLevel === 'Critical Risk' ?
                  'URGENT: Your Business Needs Immediate Help' :
                  result.riskLevel === 'High Risk' ?
                  'Transform Your Business Before It\'s Too Late' :
                  'Take Your Strong Business to the Next Level'
                }
              </h3>

              <p style={{ margin: '0 0 24px 0', fontSize: '18px', opacity: 0.95, lineHeight: '1.6' }}>
                {result.riskLevel === 'Critical Risk' ?
                  `With ${Math.round((result.predictiveAnalytics?.failureProbability?.['6_months'] || 0) * 100)}% failure probability in 6 months, you need the Growth Accelerator Program NOW to save your business.` :
                  'Join over 2,847 Ghanaian SMEs who transformed their businesses with our proven Growth Accelerator Program.'
                }
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                marginBottom: '24px',
                fontSize: '16px',
                flexWrap: 'wrap'
              }}>
                <div>✓ Immediate Risk Mitigation</div>
                <div>✓ Personalized Action Plan</div>
                <div>✓ Expert Mentorship</div>
              </div>

              <button
                onClick={handleGrowthAcceleratorClick}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid white',
                  borderRadius: '12px',
                  padding: '18px 40px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = result.riskLevel === 'Critical Risk' ? '#DC143C' : '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🚀 Start Growth Accelerator Program
              </button>

              <div style={{ marginTop: '16px', fontSize: '14px', opacity: 0.9 }}>
                {result.riskLevel === 'Critical Risk' && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    animation: 'pulse 2s infinite'
                  }}>
                    ⏰ PRIORITY ENROLLMENT - Limited spots for critical cases
                  </span>
                )}
              </div>
            </div>

            {/* Free Tier Preview */}
            {isFreeTier && (
              <div style={{
                background: 'linear-gradient(135deg, #2E8B57, #228B22)',
                borderRadius: '20px',
                padding: '32px',
                color: 'white',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <h3 style={{ marginBottom: '12px', fontSize: '24px' }}>
                  Unlock Your Complete Business Analysis
                </h3>
                <p style={{ marginBottom: '24px', fontSize: '16px', opacity: 0.9 }}>
                  Get detailed insights, predictive analytics, and actionable solutions to transform your business
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '32px',
                  marginBottom: '24px',
                  fontSize: '14px'
                }}>
                  <div>✓ {result.criticalIssues.length}+ Critical Issues Identified</div>
                  <div>✓ Detailed Action Plan</div>
                  <div>✓ Predictive Analytics</div>
                </div>

                <button
                  onClick={handleUpgradeClick}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid white',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#2E8B57';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  Upgrade to Pro - Save Your Business →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div>
            <h3 style={{ marginBottom: '24px', color: '#2C3E50', fontSize: '24px' }}>
              Industry Benchmarks
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#2E8B57', marginBottom: '8px' }}>
                  {result.benchmarkComparison.yourScore}%
                </div>
                <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Your Score</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#FFA500', marginBottom: '8px' }}>
                  {result.benchmarkComparison.industryAverage}%
                </div>
                <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Ghana SME Average</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#666', marginBottom: '8px' }}>
                  {result.benchmarkComparison.percentile}th
                </div>
                <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Percentile Rank</div>
              </div>
            </div>

            {/* Performance insights */}
            <div style={{
              background: result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ?
                'linear-gradient(135deg, #D4EDDA, #C3E6CB)' :
                'linear-gradient(135deg, #F8D7DA, #F5C6CB)',
              borderRadius: '16px',
              padding: '24px',
              border: `2px solid ${result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ? '#28A745' : '#DC3545'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                color: result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ? '#155724' : '#721C24'
              }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>
                  {result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ? '🎉' : '⚠️'}
                </span>
                <strong style={{ fontSize: '18px' }}>
                  {result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ?
                    'Above Average Performance!' :
                    'Below Industry Average'}
                </strong>
              </div>

              <p style={{
                margin: 0,
                lineHeight: '1.5',
                color: result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ? '#155724' : '#721C24'
              }}>
                {result.benchmarkComparison.yourScore >= result.benchmarkComparison.industryAverage ?
                  `Your business performs ${result.benchmarkComparison.yourScore - result.benchmarkComparison.industryAverage} points above the Ghana SME average. You're in the top ${100 - result.benchmarkComparison.percentile}% of businesses!` :
                  `Your business is ${result.benchmarkComparison.industryAverage - result.benchmarkComparison.yourScore} points below the Ghana SME average. Focus on the critical issues to improve your position.`
                }
              </p>
            </div>
          </div>
        )}

        {activeTab === 'growth-accelerator' && (
          <div>
            <GrowthAcceleratorRecommendation
              assessmentResult={result}
              userProfile={user}
              onEnrollClick={handleModuleEnrollClick}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '24px 32px',
        background: 'white',
        borderTop: '2px solid #E9ECEF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onRestart}
          style={{
            background: 'white',
            border: '2px solid #E9ECEF',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2E8B57';
            e.currentTarget.style.color = '#2E8B57';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E9ECEF';
            e.currentTarget.style.color = '#666';
          }}
        >
          🔄 Retake Assessment
        </button>

        <div style={{ display: 'flex', gap: '16px' }}>
          {!isFreeTier && (
            <button style={{
              background: 'linear-gradient(135deg, #6C757D, #495057)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              📄 Download PDF Report
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #2E8B57, #228B22)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Continue to Dashboard →
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            animation: 'slideUp 0.4s ease'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>

            <h2 style={{ color: '#2E8B57', marginBottom: '16px', fontSize: '28px' }}>
              Unlock Your Business Success Plan
            </h2>

            <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px', lineHeight: '1.5' }}>
              Get complete access to critical issues, predictive analytics, and actionable solutions that could save your business.
            </p>

            <div style={{
              background: '#F8F9FA',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2E8B57', marginRight: '8px' }}>✓</span>
                All {result.criticalIssues.length}+ critical issues with solutions
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2E8B57', marginRight: '8px' }}>✓</span>
                Business failure prediction & prevention
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2E8B57', marginRight: '8px' }}>✓</span>
                30-day emergency action plan
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2E8B57', marginRight: '8px' }}>✓</span>
                Professional PDF report
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  background: 'white',
                  border: '2px solid #E9ECEF',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>

              <button
                style={{
                  background: 'linear-gradient(135deg, #2E8B57, #228B22)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(46, 139, 87, 0.3)'
                }}
                onClick={() => {
                  AssessmentHelpers.trackEvent('upgrade_clicked', {
                    source: 'results_modal'
                  });
                }}
              >
                Upgrade Now - GHS 149/month
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Growth Accelerator Modal */}
      {showGrowthAccelerator && !showEnrollmentFlow && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp 0.4s ease',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowGrowthAccelerator(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 1
              }}
            >
              ×
            </button>

            <GrowthAcceleratorRecommendation
              assessmentResult={result}
              userProfile={user}
              onEnrollClick={handleModuleEnrollClick}
            />
          </div>
        </div>
      )}

      {/* Growth Accelerator Enrollment Flow */}
      {showEnrollmentFlow && selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '95vh',
            overflowY: 'auto',
            animation: 'slideUp 0.4s ease'
          }}>
            <GrowthAcceleratorEnrollment
              moduleId={selectedModule}
              assessmentResult={result}
              userProfile={user}
              onEnrollmentComplete={handleEnrollmentComplete}
              onBack={handleBackToRecommendations}
            />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedResultsDashboard;