/**
 * Enhanced Question Card - Phase 2 Implementation
 * Professional UI with micro-interactions and visual enhancements
 */

import React, { useState, useEffect } from 'react';
import { Question } from '../types/assessment.types';
import { AssessmentHelpers } from '../utils/assessmentHelpers';

interface EnhancedQuestionCardProps {
  question: Question;
  onAnswer: (answer: any) => void;
  onPrevious?: () => void;
  showInsight?: boolean;
  insightMessage?: string;
  questionNumber: number;
  totalQuestions: number;
}

const EnhancedQuestionCard: React.FC<EnhancedQuestionCardProps> = ({
  question,
  onAnswer,
  onPrevious,
  showInsight = false,
  insightMessage = '',
  questionNumber,
  totalQuestions
}) => {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Auto-focus effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('input, button') as HTMLElement;
      if (firstInput && firstInput.focus) {
        firstInput.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [question.id]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setValidationError(null);

    // Real-time validation for percentage/number inputs
    if (question.type === 'percentage' || question.type === 'number') {
      const validation = AssessmentHelpers.validateInput(value, question);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid input');
      }
    }
  };

  const handleSubmit = (value: any) => {
    const validation = AssessmentHelpers.validateInput(value, question);

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid input');
      return;
    }

    setIsThinking(true);

    // Add thinking delay for better UX
    setTimeout(() => {
      onAnswer(value);
      setInputValue('');
      setValidationError(null);
      setIsThinking(false);
    }, question.businessKiller ? 1000 : 300);
  };

  const getRiskColorScheme = (riskLevel: string) => {
    const schemes = {
      low: {
        border: '#2E8B57',
        background: '#F0FFF0',
        text: '#155724',
        hover: '#228B22'
      },
      medium: {
        border: '#FFA500',
        background: '#FFF8DC',
        text: '#856404',
        hover: '#FF8C00'
      },
      high: {
        border: '#FF6B35',
        background: '#FFE5D6',
        text: '#D73502',
        hover: '#FF4500'
      },
      critical: {
        border: '#DC143C',
        background: '#FFE5E5',
        text: '#721C24',
        hover: '#B22222'
      }
    };

    return schemes[riskLevel as keyof typeof schemes] || schemes.medium;
  };

  const renderQuestionInput = () => {
    if (isThinking) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #2E8B57',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p>Analyzing your response...</p>
        </div>
      );
    }

    switch (question.type) {
      case 'multiple':
        return (
          <div className="enhanced-options-container">
            {question.options?.map((option, index) => {
              const colorScheme = getRiskColorScheme(option.riskLevel);
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: '12px',
                    transform: 'translateX(-10px)',
                    animation: `slideIn 0.4s ease forwards`,
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <button
                    onClick={() => handleSubmit(option.text)}
                    style={{
                      padding: '20px 24px',
                      background: 'white',
                      border: `3px solid ${colorScheme.border}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      textAlign: 'left',
                      width: '100%',
                      minHeight: '70px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.borderColor = colorScheme.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = colorScheme.border;
                    }}
                  >
                    {/* Risk indicator */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '6px',
                      background: `linear-gradient(to bottom, ${colorScheme.border}, ${colorScheme.hover})`
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colorScheme.border}, ${colorScheme.hover})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      marginLeft: '8px',
                      flexShrink: 0,
                      fontSize: '20px'
                    }}>
                      {option.riskLevel === 'critical' ? '🚨' :
                       option.riskLevel === 'high' ? '⚠️' :
                       option.riskLevel === 'medium' ? '📊' : '✅'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#2C3E50',
                        lineHeight: '1.4',
                        marginBottom: '4px'
                      }}>
                        {option.text}
                      </div>
                      {option.insight && (
                        <div style={{
                          fontSize: '12px',
                          color: colorScheme.text,
                          opacity: 0.8
                        }}>
                          💡 {option.insight}
                        </div>
                      )}
                    </div>

                    {/* Risk badge */}
                    <div style={{
                      background: colorScheme.background,
                      color: colorScheme.text,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginLeft: '12px'
                    }}>
                      {option.riskLevel}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        );

      case 'percentage':
        return (
          <div className="enhanced-percentage-input">
            <div style={{
              background: '#F8F9FA',
              borderRadius: '16px',
              padding: '32px',
              border: '2px solid #E9ECEF'
            }}>
              <div style={{
                marginBottom: '24px',
                textAlign: 'center',
                fontSize: '16px',
                color: '#2C3E50',
                fontWeight: '600'
              }}>
                Enter percentage (0-100%)
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    padding: '20px',
                    borderRadius: '16px',
                    border: `3px solid ${validationError ? '#FF6B6B' : '#E9ECEF'}`,
                    width: '150px',
                    textAlign: 'center',
                    background: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputValue && !validationError) {
                      handleSubmit(Number(inputValue));
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2E8B57';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(46, 139, 87, 0.1)';
                  }}
                  onBlur={(e) => {
                    if (!validationError) {
                      e.currentTarget.style.borderColor = '#E9ECEF';
                    }
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                <span style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#2E8B57'
                }}>
                  %
                </span>

                <button
                  onClick={() => handleSubmit(Number(inputValue))}
                  disabled={!inputValue || !!validationError}
                  style={{
                    background: inputValue && !validationError
                      ? 'linear-gradient(135deg, #2E8B57, #228B22)'
                      : '#E9ECEF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '20px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: inputValue && !validationError ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    if (inputValue && !validationError) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(46, 139, 87, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Submit
                </button>
              </div>

              {validationError && (
                <div style={{
                  color: '#FF6B6B',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '12px',
                  background: '#FFE5E5',
                  borderRadius: '8px',
                  border: '1px solid #FFB3BA'
                }}>
                  ⚠️ {validationError}
                </div>
              )}

              {question.criticalThreshold && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#FFF3CD',
                  border: '2px solid #FFEAA7',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#856404',
                  textAlign: 'center'
                }}>
                  ⚠️ <strong>Warning:</strong> Values above {question.criticalThreshold}% indicate high risk
                </div>
              )}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="enhanced-yes-no">
            <div style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleSubmit('yes')}
                style={{
                  background: 'linear-gradient(135deg, #2E8B57, #228B22)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '24px 48px',
                  fontSize: '24px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  minWidth: '160px',
                  boxShadow: '0 6px 20px rgba(46, 139, 87, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(46, 139, 87, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 139, 87, 0.3)';
                }}
              >
                ✅ Yes
              </button>

              <button
                onClick={() => handleSubmit('no')}
                style={{
                  background: question.businessKiller
                    ? 'linear-gradient(135deg, #DC143C, #B22222)'
                    : 'linear-gradient(135deg, #6C757D, #495057)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '24px 48px',
                  fontSize: '24px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  minWidth: '160px',
                  boxShadow: question.businessKiller
                    ? '0 6px 20px rgba(220, 20, 60, 0.3)'
                    : '0 6px 20px rgba(108, 117, 125, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                  const shadowColor = question.businessKiller
                    ? 'rgba(220, 20, 60, 0.4)'
                    : 'rgba(108, 117, 125, 0.4)';
                  e.currentTarget.style.boxShadow = `0 12px 35px ${shadowColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  const shadowColor = question.businessKiller
                    ? 'rgba(220, 20, 60, 0.3)'
                    : 'rgba(108, 117, 125, 0.3)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${shadowColor}`;
                }}
              >
                {question.businessKiller ? '🚨' : '❌'} No
              </button>
            </div>
          </div>
        );

      default:
        return <div>Question type not supported in enhanced mode</div>;
    }
  };

  return (
    <div className="enhanced-question-card">
      {/* Question header with enhanced styling */}
      <div style={{
        marginBottom: '40px',
        position: 'relative'
      }}>
        {/* Question number indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2E8B57, #228B22)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '700',
            marginRight: '16px'
          }}>
            {questionNumber}
          </div>

          <div style={{
            flex: 1,
            height: '2px',
            background: 'linear-gradient(90deg, #2E8B57, #E9ECEF)',
            borderRadius: '1px'
          }} />

          <div style={{
            color: '#666',
            fontSize: '14px',
            fontWeight: '600',
            marginLeft: '16px'
          }}>
            {questionNumber} of {totalQuestions}
          </div>
        </div>

        {/* Main question */}
        <h3 style={{
          fontSize: '28px',
          lineHeight: '1.3',
          marginBottom: '20px',
          color: '#2C3E50',
          fontWeight: '600'
        }}>
          {question.question}
        </h3>

        {/* Ghana context */}
        {question.ghanaMeta && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF8DC, #F0FFF0)',
            border: '2px solid #D4AF37',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: 'linear-gradient(to bottom, #D4AF37, #2E8B57)'
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              paddingLeft: '8px'
            }}>
              <span style={{ marginRight: '8px', fontSize: '18px' }}>🇬🇭</span>
              <strong style={{ color: '#2E8B57', fontSize: '14px' }}>
                Ghana Context
              </strong>
            </div>

            <p style={{
              margin: 0,
              color: '#2C3E50',
              fontSize: '14px',
              lineHeight: '1.5',
              paddingLeft: '8px'
            }}>
              {question.ghanaMeta.localContext}
            </p>
          </div>
        )}

        {/* Business killer warning */}
        {question.businessKiller && (
          <div style={{
            background: 'linear-gradient(135deg, #FFE5E5, #FFB3BA)',
            border: '2px solid #FF6B6B',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#D63031',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              <span style={{ marginRight: '8px', fontSize: '20px' }}>⚠️</span>
              <strong>CRITICAL QUESTION</strong>
            </div>
            <p style={{
              margin: '8px 0 0 28px',
              color: '#721C24',
              fontSize: '13px',
              lineHeight: '1.4'
            }}>
              This question could reveal a business-killing issue that requires immediate attention
            </p>
          </div>
        )}
      </div>

      {/* Enhanced question input */}
      {renderQuestionInput()}

      {/* Navigation with enhanced styling */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '40px',
        paddingTop: '32px',
        borderTop: '2px solid #E9ECEF'
      }}>
        {onPrevious ? (
          <button
            onClick={onPrevious}
            style={{
              background: 'white',
              border: '2px solid #E9ECEF',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2E8B57';
              e.currentTarget.style.color = '#2E8B57';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E9ECEF';
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ← Previous
          </button>
        ) : <div />}

        <div style={{
          fontSize: '12px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: '600'
        }}>
          {question.category.replace('_', ' ')} Category
        </div>
      </div>

      {/* Enhanced insight overlay */}
      {showInsight && insightMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          zIndex: 10000,
          animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            animation: 'slideUp 0.6s ease'
          }}>
            <div style={{
              fontSize: '72px',
              marginBottom: '24px',
              animation: 'bounce 1s ease'
            }}>
              💡
            </div>

            <h3 style={{
              fontSize: '24px',
              marginBottom: '16px',
              color: '#D4AF37'
            }}>
              Business Insight
            </h3>

            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {insightMessage}
            </p>

            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, #D4AF37, #2E8B57)',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-20px);
            }
            60% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedQuestionCard;