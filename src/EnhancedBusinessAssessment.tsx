/**
 * Enhanced Business Assessment for Ghana SMEs
 * Professional investment readiness evaluation with critical insights
 */

import React, { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import {
  GhanaAssessmentService,
  ghanaAssessmentQuestions,
  CriticalQuestion,
  AssessmentResult
} from './services/ghanaAssessmentService';
import './styles/enhanced-assessment.css';

interface EnhancedBusinessAssessmentProps {
  user: { username: string };
  userProfile: any;
  onClose: () => void;
}

const EnhancedBusinessAssessment: React.FC<EnhancedBusinessAssessmentProps> = ({
  user,
  userProfile,
  onClose
}) => {
  // Assessment state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // UI state
  const [showInsight, setShowInsight] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [startTime] = useState(Date.now());

  const subscriptionStatus = useSubscription(user?.username);
  const currentQuestion = ghanaAssessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ghanaAssessmentQuestions.length) * 100;

  // Prevent background scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`assessment_progress_${user?.username}`, JSON.stringify({
        answers,
        currentQuestionIndex,
        timestamp: Date.now()
      }));
    }
  }, [answers, currentQuestionIndex, user?.username]);

  // Load previous progress
  useEffect(() => {
    const saved = localStorage.getItem(`assessment_progress_${user?.username}`);
    if (saved) {
      try {
        const { answers: savedAnswers, currentQuestionIndex: savedIndex, timestamp } = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          const shouldRestore = window.confirm(
            'You have a previous assessment in progress. Would you like to continue where you left off?'
          );
          if (shouldRestore) {
            setAnswers(savedAnswers);
            setCurrentQuestionIndex(savedIndex);
          }
        }
      } catch (error) {
        console.warn('Failed to restore assessment progress:', error);
      }
    }
  }, [user?.username]);

  const handleAnswer = (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Show insight for critical questions
    if (currentQuestion.businessKiller || currentQuestion.weight > 0.15) {
      setShowInsight(true);
      setTimeout(() => setShowInsight(false), 3000);
    }

    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestionIndex < ghanaAssessmentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setInputValue('');
      } else {
        processAssessment(newAnswers);
      }
    }, showInsight ? 3500 : 500);
  };

  const processAssessment = async (finalAnswers: Record<string, any>) => {
    setIsProcessing(true);

    try {
      // Calculate results
      const result = GhanaAssessmentService.calculateAssessmentScore(finalAnswers);

      // Save to database and localStorage
      await GhanaAssessmentService.saveAssessment(user?.username, finalAnswers, result);

      // Clear progress
      localStorage.removeItem(`assessment_progress_${user?.username}`);

      setAssessmentResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to process assessment:', error);
      alert('There was an error processing your assessment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestionInput = () => {
    const question = currentQuestion;

    switch (question.type) {
      case 'multiple':
        return (
          <div className="options-container">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.text)}
                className={`option-button ${option.riskLevel === 'critical' ? 'critical-risk' :
                  option.riskLevel === 'high' ? 'high-risk' : ''}`}
                style={{
                  padding: '18px 24px',
                  margin: '8px 0',
                  background: 'white',
                  border: `2px solid ${
                    option.riskLevel === 'critical' ? '#DC143C' :
                    option.riskLevel === 'high' ? '#FF6B35' :
                    option.riskLevel === 'medium' ? '#FFA500' : '#2E8B57'
                  }`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  textAlign: 'left',
                  width: '100%',
                  minHeight: '60px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: option.riskLevel === 'critical' ? '#DC143C' :
                    option.riskLevel === 'high' ? '#FF6B35' :
                    option.riskLevel === 'medium' ? '#FFA500' : '#2E8B57',
                  marginRight: '12px',
                  flexShrink: 0
                }} />
                {option.text}
              </button>
            ))}
          </div>
        );

      case 'percentage':
        return (
          <div className="percentage-input-container">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Enter percentage (0-100%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="0"
                max="100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter percentage"
                style={{
                  padding: '15px 20px',
                  fontSize: '18px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  width: '200px',
                  textAlign: 'center'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue) {
                    handleAnswer(Number(inputValue));
                  }
                }}
                autoFocus
              />
              <span style={{ fontSize: '18px', color: '#666' }}>%</span>
              <button
                onClick={() => inputValue && handleAnswer(Number(inputValue))}
                disabled={!inputValue}
                style={{
                  padding: '15px 30px',
                  background: inputValue ? '#2E8B57' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: inputValue ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="number-input-container">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Enter number
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number"
                style={{
                  padding: '15px 20px',
                  fontSize: '18px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  width: '200px',
                  textAlign: 'center'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue) {
                    handleAnswer(Number(inputValue));
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => inputValue && handleAnswer(Number(inputValue))}
                disabled={!inputValue}
                style={{
                  padding: '15px 30px',
                  background: inputValue ? '#2E8B57' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: inputValue ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'scale':
        return (
          <div className="scale-input-container">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
              Rate from 1 (Very Poor) to 5 (Excellent)
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAnswer(rating)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '3px solid #2E8B57',
                    background: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#2E8B57',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2E8B57';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#2E8B57';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="yes-no-container">
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {['Yes', 'No'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  style={{
                    padding: '20px 40px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: `3px solid ${option === 'Yes' ? '#2E8B57' : '#DC143C'}`,
                    background: 'white',
                    color: option === 'Yes' ? '#2E8B57' : '#DC143C',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    minWidth: '120px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = option === 'Yes' ? '#2E8B57' : '#DC143C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = option === 'Yes' ? '#2E8B57' : '#DC143C';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (isProcessing) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #D4AF37',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h3 style={{ color: '#2E8B57', marginBottom: '10px' }}>Analyzing Your Business</h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Our AI is processing your responses and generating personalized insights...
          </p>
        </div>
      </div>
    );
  }

  if (showResults && assessmentResult) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          height: '90vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${
              assessmentResult.riskLevel === 'Low Risk' ? '#2E8B57, #228B22' :
              assessmentResult.riskLevel === 'Moderate Risk' ? '#FFA500, #FF8C00' :
              assessmentResult.riskLevel === 'High Risk' ? '#FF6B35, #FF4500' :
              '#DC143C, #B22222'
            })`,
            color: 'white',
            padding: '25px 30px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
              Assessment Complete!
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
              🇬🇭 Ghana SME Investment Readiness Analysis
            </p>
          </div>

          {/* Score Display */}
          <div style={{
            padding: '30px',
            textAlign: 'center',
            background: '#f8f9fa',
            borderBottom: '2px solid #e9ecef'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '20px 30px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              border: `3px solid ${
                assessmentResult.riskLevel === 'Low Risk' ? '#2E8B57' :
                assessmentResult.riskLevel === 'Moderate Risk' ? '#FFA500' :
                assessmentResult.riskLevel === 'High Risk' ? '#FF6B35' : '#DC143C'
              }`
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: assessmentResult.riskLevel === 'Low Risk' ? '#2E8B57' :
                  assessmentResult.riskLevel === 'Moderate Risk' ? '#FFA500' :
                  assessmentResult.riskLevel === 'High Risk' ? '#FF6B35' : '#DC143C',
                marginBottom: '8px',
                lineHeight: 1
              }}>
                {assessmentResult.overallScore}%
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: assessmentResult.riskLevel === 'Low Risk' ? '#2E8B57' :
                  assessmentResult.riskLevel === 'Moderate Risk' ? '#FFA500' :
                  assessmentResult.riskLevel === 'High Risk' ? '#FF6B35' : '#DC143C',
                marginBottom: '5px'
              }}>
                {assessmentResult.riskLevel}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                fontStyle: 'italic'
              }}>
                Based on {ghanaAssessmentQuestions.length} critical factors
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0'
          }}>
            {/* Critical Issues */}
            {assessmentResult.criticalIssues.length > 0 && (
              <div style={{ padding: '25px 30px', borderBottom: '1px solid #e9ecef' }}>
                <h3 style={{
                  color: '#DC143C',
                  marginBottom: '20px',
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  🚨 Critical Issues Requiring Immediate Attention
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {assessmentResult.criticalIssues.slice(0, 5).map((issue, index) => (
                    <div key={index} style={{
                      padding: '20px',
                      background: issue.severity === 'urgent' ? '#fff5f5' : '#fffbf0',
                      borderLeft: `5px solid ${issue.severity === 'urgent' ? '#DC143C' : '#FF6B35'}`,
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '15px'
                      }}>
                        <span style={{
                          background: issue.severity === 'urgent' ? '#DC143C' : '#FF6B35',
                          color: 'white',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {index + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 8px 0',
                            color: issue.severity === 'urgent' ? '#DC143C' : '#FF6B35',
                            fontSize: '16px'
                          }}>
                            {issue.title}
                          </h4>
                          <p style={{
                            margin: '0 0 8px 0',
                            color: '#333',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}>
                            <strong>Impact:</strong> {issue.impact}
                          </p>
                          <p style={{
                            margin: '0 0 8px 0',
                            color: '#333',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}>
                            <strong>Solution:</strong> {issue.solution}
                          </p>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: issue.severity === 'urgent' ? '#DC143C' : '#FF6B35',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {issue.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {assessmentResult.strengthsToLeverage.length > 0 && (
              <div style={{ padding: '25px 30px', borderBottom: '1px solid #e9ecef' }}>
                <h3 style={{
                  color: '#2E8B57',
                  marginBottom: '20px',
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  💪 Your Business Strengths
                </h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {assessmentResult.strengthsToLeverage.map((strength, index) => (
                    <div key={index} style={{
                      padding: '15px 20px',
                      background: '#f0f8f0',
                      borderLeft: '4px solid #2E8B57',
                      borderRadius: '8px',
                      fontSize: '15px',
                      color: '#333'
                    }}>
                      ✅ {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div style={{ padding: '25px 30px' }}>
              <h3 style={{
                color: '#2E8B57',
                marginBottom: '20px',
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🎯 Your Action Plan
              </h3>

              {assessmentResult.nextSteps.immediate.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#DC143C', marginBottom: '10px', fontSize: '16px' }}>
                    🔥 Immediate Actions (This Week):
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {assessmentResult.nextSteps.immediate.map((action, index) => (
                      <li key={index} style={{ color: '#333', fontSize: '14px', marginBottom: '5px' }}>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessmentResult.nextSteps.shortTerm.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#FF6B35', marginBottom: '10px', fontSize: '16px' }}>
                    📅 Short-term Goals (Next 30 Days):
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {assessmentResult.nextSteps.shortTerm.map((action, index) => (
                      <li key={index} style={{ color: '#333', fontSize: '14px', marginBottom: '5px' }}>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessmentResult.nextSteps.strategic.length > 0 && (
                <div>
                  <h4 style={{ color: '#2E8B57', marginBottom: '10px', fontSize: '16px' }}>
                    🚀 Strategic Initiatives (Next 3 Months):
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {assessmentResult.nextSteps.strategic.map((action, index) => (
                      <li key={index} style={{ color: '#333', fontSize: '14px', marginBottom: '5px' }}>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Funding Readiness */}
            <div style={{
              padding: '25px 30px',
              background: '#f8f9fa',
              borderTop: '2px solid #e9ecef'
            }}>
              <h3 style={{
                color: '#2E8B57',
                marginBottom: '15px',
                fontSize: '20px'
              }}>
                💰 Investment Readiness Score: {assessmentResult.fundingReadiness.score}%
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#333',
                marginBottom: '15px',
                lineHeight: '1.6'
              }}>
                {assessmentResult.fundingReadiness.recommendation}
              </p>

              {assessmentResult.fundingReadiness.requiredImprovements.length > 0 && (
                <>
                  <h4 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                    Required improvements before seeking investment:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {assessmentResult.fundingReadiness.requiredImprovements.map((improvement, index) => (
                      <li key={index} style={{ color: '#666', fontSize: '13px', marginBottom: '5px' }}>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Premium Report Call-to-Action */}
            <div style={{
              padding: '25px 30px',
              background: subscriptionStatus.hasDetailedReports() ? '#e8f5e8' : '#fff3cd',
              border: `1px solid ${subscriptionStatus.hasDetailedReports() ? '#d4edda' : '#ffeaa7'}`,
              textAlign: 'center'
            }}>
              {subscriptionStatus.hasDetailedReports() ? (
                <>
                  <h4 style={{ margin: '0 0 15px 0', color: '#2E8B57' }}>
                    📊 Get Your Detailed PDF Report
                  </h4>
                  <p style={{ margin: '0 0 20px 0', color: '#2E8B57', fontSize: '15px' }}>
                    Download your comprehensive 15-page business analysis with funding strategies,
                    competitor benchmarking, and 90-day action plan.
                  </p>
                  <button
                    onClick={() => {
                      // This will be implemented in Phase 3
                      alert('PDF report generation will be implemented in Phase 3');
                    }}
                    style={{
                      background: '#2E8B57',
                      color: 'white',
                      border: 'none',
                      padding: '15px 30px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Download PDF Report
                  </button>
                </>
              ) : (
                <>
                  <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                    🚀 Unlock Your Detailed Business Report
                  </h4>
                  <p style={{ margin: '0 0 20px 0', color: '#856404', fontSize: '15px' }}>
                    Get the complete 15-page analysis with financial projections, competitor benchmarking,
                    funding readiness checklist, and step-by-step growth action plan.
                    <br/><strong>Upgrade to Pro for just GHS 50/month.</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        // This will be implemented in Phase 4 - integrate with Growth Accelerator
                        alert('Growth Accelerator enrollment will be implemented in Phase 4');
                      }}
                      style={{
                        background: '#2E8B57',
                        color: 'white',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🚀 Join Growth Accelerator
                    </button>
                    <button
                      onClick={() => {
                        // This will link to subscription upgrade
                        alert('Subscription upgrade will be implemented in Phase 4');
                      }}
                      style={{
                        background: 'transparent',
                        color: '#2E8B57',
                        border: '2px solid #2E8B57',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      📊 Upgrade for PDF Report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 30px',
            borderTop: '2px solid #e9ecef',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Assessment completed: {new Date(assessmentResult.timestamp).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  // Retake assessment
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setAssessmentResult(null);
                  localStorage.removeItem(`assessment_progress_${user?.username}`);
                }}
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Retake Assessment
              </button>
              <button
                onClick={onClose}
                style={{
                  background: '#2E8B57',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        height: '90vh',
        maxHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: currentQuestion.businessKiller ?
            'linear-gradient(135deg, #DC143C, #B22222)' :
            'linear-gradient(135deg, #2E8B57, #228B22)',
          color: 'white',
          padding: '25px 30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                Ghana SME Assessment
              </h2>
              <p style={{ margin: '0', opacity: 0.9, fontSize: '16px' }}>
                Question {currentQuestionIndex + 1} of {ghanaAssessmentQuestions.length}
                {currentQuestion.businessKiller &&
                  <span style={{
                    marginLeft: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    🚨 CRITICAL
                  </span>
                }
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>Progress</span>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.3)',
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'white',
                height: '100%',
                width: `${progress}%`,
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div style={{
          flex: 1,
          padding: '40px 30px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            color: '#333',
            marginBottom: '20px',
            fontSize: '20px',
            lineHeight: '1.4',
            fontWeight: '600'
          }}>
            {currentQuestion.question}
          </h3>

          {/* Ghana Context */}
          <div style={{
            background: '#f8f9fa',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '25px',
            borderLeft: '4px solid #D4AF37'
          }}>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              <strong>🇬🇭 Ghana Context:</strong> {currentQuestion.ghanaMeta.localContext}
            </p>
          </div>

          {/* Question Input */}
          <div style={{ flex: 1 }}>
            {renderQuestionInput()}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e9ecef'
          }}>
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                background: currentQuestionIndex === 0 ? '#f5f5f5' : 'transparent',
                color: currentQuestionIndex === 0 ? '#ccc' : '#666',
                border: '1px solid #ccc',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ← Previous
            </button>

            <div style={{ fontSize: '13px', color: '#666' }}>
              {Object.keys(answers).length} of {ghanaAssessmentQuestions.length} answered
            </div>

            <button
              onClick={() => {
                if (currentQuestionIndex < ghanaAssessmentQuestions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                }
              }}
              disabled={currentQuestionIndex >= ghanaAssessmentQuestions.length - 1}
              style={{
                background: currentQuestionIndex >= ghanaAssessmentQuestions.length - 1 ? '#f5f5f5' : '#2E8B57',
                color: currentQuestionIndex >= ghanaAssessmentQuestions.length - 1 ? '#ccc' : 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: currentQuestionIndex >= ghanaAssessmentQuestions.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Skip →
            </button>
          </div>
        </div>

        {/* Insight Popup */}
        {showInsight && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            background: currentQuestion.businessKiller ? '#fff5f5' : '#f0f8ff',
            border: `2px solid ${currentQuestion.businessKiller ? '#DC143C' : '#2E8B57'}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px'
            }}>
              <span style={{
                fontSize: '24px'
              }}>
                {currentQuestion.businessKiller ? '🚨' : '💡'}
              </span>
              <div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: currentQuestion.businessKiller ? '#DC143C' : '#2E8B57',
                  fontSize: '16px'
                }}>
                  {currentQuestion.businessKiller ? 'Critical Business Insight' : 'Business Insight'}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.5'
                }}>
                  {currentQuestion.insight}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedBusinessAssessment;