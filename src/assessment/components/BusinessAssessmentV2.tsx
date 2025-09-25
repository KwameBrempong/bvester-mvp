/**
 * Business Assessment V2 - Enhanced Professional Assessment
 * Backward compatible replacement for EnhancedBusinessAssessment.tsx
 */

import React, { useEffect, useState } from 'react';
import { useAssessmentFlow } from '../hooks/useAssessmentFlow';
import { useSubscription } from '../../useSubscription';
import { AssessmentProps } from '../types/assessment.types';
import { AssessmentHelpers } from '../utils/assessmentHelpers';
import OnboardingFlow from './OnboardingFlow';
import OnboardingFlowEnhanced from './OnboardingFlowEnhanced';
import QuestionCard from './QuestionCard';
import EnhancedQuestionCard from './EnhancedQuestionCard';
import ResultsDashboard from './ResultsDashboard';
import ProgressTracker from './ProgressTracker';
import ErrorBoundary from './ErrorBoundary';
import '../../styles/enhanced-assessment.css';

const BusinessAssessmentV2: React.FC<AssessmentProps> = ({
  user,
  userProfile,
  onClose
}) => {
  const {
    // State
    currentQuestionIndex,
    answers,
    showResults,
    assessmentResult,
    isProcessing,
    progress,
    error,
    onboardingData,
    isOnboardingComplete,

    // Current question info
    currentQuestion,
    totalQuestions,
    questionsRemaining,

    // Actions
    completeOnboarding,
    answerQuestion,
    goToPreviousQuestion,
    restartAssessment,
    clearError
  } = useAssessmentFlow(user.username);

  const [showInsight, setShowInsight] = useState(false);
  const [insightMessage, setInsightMessage] = useState('');
  const subscriptionStatus = useSubscription(user?.username);

  // Prevent background scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle answer with insight display
  const handleAnswer = (answer: any) => {
    if (currentQuestion) {
      const insight = AssessmentHelpers.generateInsight(currentQuestion, answer);

      // Show insight for critical questions
      if (currentQuestion.businessKiller || currentQuestion.weight > 0.15) {
        setInsightMessage(insight);
        setShowInsight(true);

        setTimeout(() => {
          setShowInsight(false);
          answerQuestion(answer);
        }, 3000);
      } else {
        answerQuestion(answer);
      }
    }
  };

  const handleClose = () => {
    // Track close event
    AssessmentHelpers.trackEvent('assessment_closed', {
      progress,
      questionsAnswered: Object.keys(answers).length,
      completed: showResults
    });

    onClose();
  };

  // Render onboarding if not complete
  if (!isOnboardingComplete) {
    return (
      <div className="assessment-container">
        <div className="assessment-modal">
          <OnboardingFlowEnhanced
            onComplete={completeOnboarding}
            onClose={handleClose}
          />
        </div>
      </div>
    );
  }

  // Render results if assessment is complete
  if (showResults && assessmentResult) {
    return (
      <div className="assessment-container">
        <div className="assessment-modal">
          <ResultsDashboard
            result={assessmentResult}
            onClose={handleClose}
            onRestart={restartAssessment}
            user={user}
            subscriptionStatus={subscriptionStatus}
          />
        </div>
      </div>
    );
  }

  // Render processing state
  if (isProcessing) {
    return (
      <div className="assessment-container">
        <div className="assessment-modal">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '40px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #D4AF37',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px'
            }} />
            <h3 style={{ color: '#2E8B57', marginBottom: '16px' }}>
              Analyzing Your Business...
            </h3>
            <p style={{ color: '#666', textAlign: 'center', lineHeight: '1.5' }}>
              Our AI is identifying critical issues and opportunities<br />
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main assessment flow
  return (
    <ErrorBoundary>
      <div className="assessment-container">
        <div className="assessment-modal">
          {/* Header with progress */}
          <div className={`assessment-header ${
            currentQuestion?.businessKiller ? 'critical' :
            (currentQuestion?.weight || 0) > 0.15 ? 'high-risk' : ''
          }`}>
            <div className="assessment-header-content">
              <div>
                <h2 className="assessment-title">
                  Business Health Assessment
                  {currentQuestion?.businessKiller && (
                    <span className="critical-badge">CRITICAL</span>
                  )}
                </h2>
                <p className="assessment-subtitle">
                  Question {currentQuestionIndex + 1} of {totalQuestions} • {questionsRemaining} remaining
                </p>
              </div>

              <button
                onClick={handleClose}
                className="close-button"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>

            <ProgressTracker
              progress={progress}
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
            />
          </div>

          {/* Error display */}
          {error && (
            <div style={{
              background: '#FFE5E5',
              border: '1px solid #FF6B6B',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '16px',
              color: '#D63031',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{error}</span>
              <button
                onClick={clearError}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D63031',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Question content */}
          <div className="assessment-content">
            {currentQuestion && (
              <EnhancedQuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
                onPrevious={currentQuestionIndex > 0 ? goToPreviousQuestion : undefined}
                showInsight={showInsight}
                insightMessage={insightMessage}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />
            )}
          </div>

          {/* Ghana context footer */}
          <div className="assessment-footer">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: '#F8F9FA',
              borderTop: '1px solid #E9ECEF',
              fontSize: '12px',
              color: '#666'
            }}>
              <span style={{ marginRight: '8px' }}>🇬🇭</span>
              Tailored for Ghana SMEs • Powered by local market insights
            </div>
          </div>
        </div>

        {/* CSS for animations */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }

            .critical-badge {
              animation: pulse 2s infinite;
            }
          `}
        </style>
      </div>
    </ErrorBoundary>
  );
};

export default BusinessAssessmentV2;