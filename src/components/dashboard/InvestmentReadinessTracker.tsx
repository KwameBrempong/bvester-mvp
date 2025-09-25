import React, { useState, useEffect } from 'react';
import { useUser } from '../../store/hooks';

interface ReadinessGoals {
  currentProgress: number;
  totalGoal: number;
  timeRemaining: number;
  completionRate: number;
  nextMilestone: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

interface ReadinessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  points: number;
}

const InvestmentReadinessTracker: React.FC = () => {
  const userState = useUser();
  const [goals, setGoals] = useState<ReadinessGoals | null>(null);
  const [readinessSteps, setReadinessSteps] = useState<ReadinessStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userProfile = userState.profile;

  useEffect(() => {
    calculateReadinessGoals();
    generateReadinessSteps();
  }, [userProfile]);

  const calculateReadinessGoals = () => {
    // Target: 1000 SMEs by Q2 2025 (90 days from now)
    const targetDate = new Date('2025-06-01');
    const currentDate = new Date();
    const timeRemaining = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

    // Simulated current progress (in real app, this would come from backend)
    const currentProgress = 247; // Current SMEs onboarded
    const totalGoal = 1000;
    const completionRate = (currentProgress / totalGoal) * 100;

    // Calculate urgency based on time remaining and progress
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
    if (timeRemaining < 30 && completionRate < 50) urgencyLevel = 'high';
    else if (timeRemaining < 60 && completionRate < 70) urgencyLevel = 'medium';

    // Calculate next milestone
    let nextMilestone = '';
    if (completionRate < 25) nextMilestone = '250 SMEs (Q1 Milestone)';
    else if (completionRate < 50) nextMilestone = '500 SMEs (Halfway Point)';
    else if (completionRate < 75) nextMilestone = '750 SMEs (Q1.5 Target)';
    else nextMilestone = '1000 SMEs (Launch Ready!)';

    setGoals({
      currentProgress,
      totalGoal,
      timeRemaining,
      completionRate,
      nextMilestone,
      urgencyLevel
    });
  };

  const generateReadinessSteps = () => {
    if (!userProfile) {
      setIsLoading(false);
      return;
    }

    const steps: ReadinessStep[] = [
      {
        id: 'business-profile',
        title: 'Complete Business Profile',
        description: 'All basic business information filled out',
        icon: '📋',
        completed: !!(userProfile.businessName && userProfile.businessType && userProfile.location),
        priority: 'high',
        points: 20
      },
      {
        id: 'email-verification',
        title: 'Verify Email Address',
        description: 'Confirm your email for secure communications',
        icon: '📧',
        completed: userProfile.isEmailVerified || false,
        priority: 'high',
        points: 15
      },
      {
        id: 'business-description',
        title: 'Add Business Description',
        description: 'Compelling description of your business and funding needs',
        icon: '📝',
        completed: !!(userProfile.businessDescription && userProfile.businessDescription.length > 50),
        priority: 'high',
        points: 20
      },
      {
        id: 'financial-info',
        title: 'Financial Information',
        description: 'Revenue range and funding requirements',
        icon: '💰',
        completed: !!(userProfile.monthlyRevenue && userProfile.fundingNeeded),
        priority: 'medium',
        points: 15
      },
      {
        id: 'business-details',
        title: 'Business Details',
        description: 'Team size, founding year, and growth stage',
        icon: '🏢',
        completed: !!(userProfile.employeeCount && userProfile.yearEstablished),
        priority: 'medium',
        points: 10
      },
      {
        id: 'phone-verification',
        title: 'Phone Verification',
        description: 'Add and verify your phone number',
        icon: '📱',
        completed: userProfile.isPhoneVerified || false,
        priority: 'medium',
        points: 10
      },
      {
        id: 'bootcamp-participation',
        title: 'Join Investment Bootcamp',
        description: 'Complete the 30-day investment readiness program',
        icon: '🎯',
        completed: false, // Would check bootcamp completion status
        priority: 'high',
        points: 30
      },
      {
        id: 'business-assessment',
        title: 'Complete Business Assessment',
        description: 'Take the comprehensive business evaluation',
        icon: '📊',
        completed: false, // Would check assessment completion
        priority: 'medium',
        points: 15
      }
    ];

    setReadinessSteps(steps);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="card fade-in">
        <div className="card-header">
          <div className="skeleton skeleton-title" style={{ width: '60%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '80%', marginTop: 'var(--space-sm)' }}></div>
        </div>
        <div className="card-body">
          <div className="skeleton skeleton-text mb-md"></div>
          <div className="skeleton skeleton-text mb-lg" style={{ width: '90%' }}></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    );
  }

  if (!goals) return null;

  const completedSteps = readinessSteps.filter(step => step.completed);
  const totalPoints = readinessSteps.reduce((sum, step) => sum + step.points, 0);
  const earnedPoints = completedSteps.reduce((sum, step) => sum + step.points, 0);
  const readinessScore = Math.round((earnedPoints / totalPoints) * 100);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'var(--danger-primary)';
      case 'medium': return 'var(--warning-primary)';
      default: return 'var(--success-primary)';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      default: return '✅';
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">
          <span>🎯</span>
          Investment Readiness Tracker
        </h3>
        <p className="card-subtitle">Your path to investment success</p>
      </div>

      <div className="card-body">
        {/* Personal Readiness Score */}
        <div className="card card-primary mb-xl">
          <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', alignItems: 'center' }}>
              <div>
                <div className="metric">
                  <span className="metric-value" style={{ color: 'var(--black-primary)', fontSize: 'var(--font-size-4xl)' }}>
                    {readinessScore}%
                  </span>
                  <span className="metric-label" style={{ color: 'var(--black-secondary)' }}>
                    Your Readiness Score
                  </span>
                </div>
                <div className="progress progress-lg mt-md">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${readinessScore}%`,
                      background: 'linear-gradient(90deg, var(--black-primary), var(--black-secondary))'
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="badge badge-neutral mb-md" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                  <span>📈</span>
                  {completedSteps.length} of {readinessSteps.length} Steps Complete
                </div>
                <p className="text-sm mb-0" style={{ color: 'var(--black-secondary)', lineHeight: 1.4 }}>
                  {readinessScore >= 80
                    ? 'Excellent! You\'re investment-ready'
                    : readinessScore >= 60
                    ? 'Good progress! Keep building your profile'
                    : 'Let\'s strengthen your investment readiness'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform-wide Progress */}
        <div className="mb-xl">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-lg font-semibold text-black mb-0">🇬🇭 Ghana SME Onboarding Progress</h4>
            <div className="flex items-center gap-xs">
              <span>{getUrgencyIcon(goals.urgencyLevel)}</span>
              <span className="text-xs" style={{ color: getUrgencyColor(goals.urgencyLevel) }}>
                {goals.timeRemaining} days remaining
              </span>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
            <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
              <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="metric">
                  <span className="metric-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {goals.currentProgress}
                  </span>
                  <span className="metric-label">SMEs Onboarded</span>
                </div>

                <div className="metric">
                  <span className="metric-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {Math.round(goals.completionRate)}%
                  </span>
                  <span className="metric-label">Goal Progress</span>
                </div>

                <div className="metric">
                  <span className="metric-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {goals.totalGoal}
                  </span>
                  <span className="metric-label">Target Goal</span>
                </div>
              </div>

              <div className="progress progress-xl mt-lg">
                <div
                  className="progress-bar"
                  style={{ width: `${goals.completionRate}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray mt-md mb-0 text-center">
                Next milestone: <strong>{goals.nextMilestone}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div>
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-lg font-semibold text-black mb-0">📋 Your Readiness Checklist</h4>
            <span className="text-xs text-gray">
              {earnedPoints}/{totalPoints} points earned
            </span>
          </div>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-sm)' }}>
            {readinessSteps
              .sort((a, b) => {
                // Sort by: incomplete high priority, completed high priority, incomplete medium/low, completed medium/low
                if (a.completed !== b.completed) {
                  return a.completed ? 1 : -1;
                }
                if (a.priority !== b.priority) {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return 0;
              })
              .map((step) => (
                <div
                  key={step.id}
                  className={`card ${step.completed ? 'card-success' : ''}`}
                  style={{
                    background: step.completed ? 'var(--success-light)' : 'var(--white-primary)',
                    opacity: step.completed ? 0.8 : 1,
                    transition: 'var(--transition-normal)'
                  }}
                >
                  <div className="card-body" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-md">
                        <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                          {step.completed ? '✅' : step.icon}
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold mb-xs text-black">
                            {step.title}
                            {step.priority === 'high' && !step.completed && (
                              <span className="badge badge-warning ml-sm" style={{ fontSize: '0.6rem' }}>
                                HIGH PRIORITY
                              </span>
                            )}
                          </h5>
                          <p className="text-xs text-gray mb-0">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold" style={{ color: 'var(--gold-primary)' }}>
                          +{step.points} pts
                        </div>
                        <div className="text-xs text-gray">
                          {step.completed ? 'Complete' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="flex items-center gap-md">
          <span style={{ fontSize: '1.25rem' }}>🚀</span>
          <div>
            <h5 className="text-sm font-semibold mb-xs text-black">Ready for Investment Launch</h5>
            <p className="text-xs text-gray mb-0">
              Complete your readiness checklist to be first in line when our investment platform launches with SEC approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentReadinessTracker;