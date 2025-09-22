import React, { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';

interface Question {
  id: string;
  question: string;
  type: 'multiple' | 'scale' | 'yes_no';
  options?: string[];
  weight: number;
  category: 'financial' | 'market' | 'operations' | 'growth' | 'compliance';
}

interface Assessment {
  answers: Record<string, string | number | boolean>;
  score: number;
  recommendations: string[];
  timestamp: string;
}

interface BusinessAssessmentProps {
  user: any;
  userProfile: any;
  onClose: () => void;
}

const questions: Question[] = [
  {
    id: 'revenue_consistency',
    question: 'How consistent is your monthly revenue?',
    type: 'multiple',
    options: [
      'Very consistent - varies less than 10%',
      'Mostly consistent - varies 10-25%', 
      'Somewhat variable - varies 25-50%',
      'Highly variable - varies more than 50%'
    ],
    weight: 0.15,
    category: 'financial'
  },
  {
    id: 'financial_records',
    question: 'How well do you maintain financial records?',
    type: 'multiple',
    options: [
      'Detailed digital records with monthly statements',
      'Basic digital records updated regularly',
      'Paper records that are mostly up to date',
      'Minimal record keeping'
    ],
    weight: 0.12,
    category: 'financial'
  },
  {
    id: 'profitability',
    question: 'What is your average monthly profit margin?',
    type: 'multiple',
    options: [
      'Above 25%',
      '15-25%',
      '5-15%',
      'Below 5% or breakeven'
    ],
    weight: 0.15,
    category: 'financial'
  },
  {
    id: 'market_demand',
    question: 'How would you rate demand for your products/services in Ghana?',
    type: 'scale',
    weight: 0.1,
    category: 'market'
  },
  {
    id: 'competition_advantage',
    question: 'Do you have a clear competitive advantage over other businesses?',
    type: 'yes_no',
    weight: 0.08,
    category: 'market'
  },
  {
    id: 'customer_base',
    question: 'How diversified is your customer base?',
    type: 'multiple',
    options: [
      'Many customers, no single customer >20% of revenue',
      'Several customers, largest is 20-40% of revenue',
      'Few customers, largest is 40-60% of revenue',
      'Heavily dependent on 1-2 major customers'
    ],
    weight: 0.1,
    category: 'market'
  },
  {
    id: 'business_plan',
    question: 'Do you have a written business plan?',
    type: 'multiple',
    options: [
      'Comprehensive plan updated within 12 months',
      'Basic plan that covers key areas',
      'Informal plan or outline',
      'No written business plan'
    ],
    weight: 0.08,
    category: 'operations'
  },
  {
    id: 'team_capability',
    question: 'How would you rate your team\'s capability to execute growth plans?',
    type: 'scale',
    weight: 0.07,
    category: 'operations'
  },
  {
    id: 'funding_use',
    question: 'What would you primarily use investment funding for?',
    type: 'multiple',
    options: [
      'Equipment and infrastructure expansion',
      'Inventory and working capital',
      'Marketing and customer acquisition',
      'Debt repayment or personal expenses'
    ],
    weight: 0.1,
    category: 'growth'
  },
  {
    id: 'growth_potential',
    question: 'What is your realistic revenue growth expectation with investment?',
    type: 'multiple',
    options: [
      'Double revenue within 2 years',
      'Grow 50-100% within 2 years',
      'Grow 25-50% within 2 years',
      'Maintain current level or modest growth'
    ],
    weight: 0.12,
    category: 'growth'
  },
  {
    id: 'business_registration',
    question: 'Is your business properly registered in Ghana?',
    type: 'yes_no',
    weight: 0.08,
    category: 'compliance'
  },
  {
    id: 'tax_compliance',
    question: 'Are you up to date with tax obligations (GRA, VAT if applicable)?',
    type: 'yes_no',
    weight: 0.05,
    category: 'compliance'
  }
];

function BusinessAssessment({ user, userProfile, onClose }: BusinessAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const subscriptionStatus = useSubscription(user?.username);

  // Prevent background scroll when modal is open
  useEffect(() => {
    // Save original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Disable scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleAnswer = (value: any) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateAssessment(newAnswers);
    }
  };

  const generateAssessment = (finalAnswers: { [key: string]: any }) => {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(question => {
      const answer = finalAnswers[question.id];
      maxScore += question.weight * 100;

      let questionScore = 0;
      if (question.type === 'multiple' && question.options) {
        const selectedIndex = question.options.indexOf(answer);
        questionScore = ((question.options.length - selectedIndex) / question.options.length) * question.weight * 100;
      } else if (question.type === 'scale') {
        questionScore = (answer / 5) * question.weight * 100;
      } else if (question.type === 'yes_no') {
        questionScore = answer === 'Yes' ? question.weight * 100 : 0;
      }

      totalScore += questionScore;
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    const recommendations = generateRecommendations(finalAnswers, finalScore);

    const newAssessment: Assessment = {
      answers: finalAnswers,
      score: finalScore,
      recommendations,
      timestamp: new Date().toLocaleString()
    };

    // Save assessment
    localStorage.setItem(`assessment_${user?.username}`, JSON.stringify(newAssessment));
    setAssessment(newAssessment);
    setShowResults(true);
  };

  const generateRecommendations = (answers: { [key: string]: any }, score: number): string[] => {
    const recommendations: string[] = [];

    // Financial recommendations
    if (answers.revenue_consistency === 'Highly variable - varies more than 50%') {
      recommendations.push('Focus on diversifying revenue streams to reduce income volatility');
    }
    if (answers.financial_records === 'Minimal record keeping') {
      recommendations.push('Implement proper financial record-keeping system before seeking investment');
    }
    if (answers.profitability === 'Below 5% or breakeven') {
      recommendations.push('Improve profit margins before seeking external funding');
    }

    // Market recommendations
    if (answers.competition_advantage === 'No') {
      recommendations.push('Develop clear competitive advantages in your market niche');
    }
    if (answers.customer_base === 'Heavily dependent on 1-2 major customers') {
      recommendations.push('Diversify customer base to reduce business risk');
    }

    // Operations recommendations
    if (answers.business_plan === 'No written business plan') {
      recommendations.push('Create a comprehensive business plan with financial projections');
    }

    // Compliance recommendations
    if (answers.business_registration === 'No') {
      recommendations.push('Complete business registration with Ghana Registrar General Department');
    }
    if (answers.tax_compliance === 'No') {
      recommendations.push('Ensure full compliance with GRA tax requirements');
    }

    // Score-based recommendations
    if (score >= 80) {
      recommendations.push('Your business shows strong investment readiness');
      recommendations.push('Consider approaching angel investors or SME-focused funds');
    } else if (score >= 60) {
      recommendations.push('Your business has good potential but needs improvement in key areas');
      recommendations.push('Address recommendations before seeking major investment');
    } else {
      recommendations.push('Focus on strengthening business fundamentals before seeking investment');
      recommendations.push('Consider starting with smaller funding sources or grants');
    }

    return recommendations;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#2E8B57';
    if (score >= 60) return '#FFA500';
    return '#DC143C';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Investment Ready';
    if (score >= 60) return 'Needs Improvement';
    return 'Requires Development';
  };

  if (showResults && assessment) {
    return (
      <div 
        style={{ 
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
          overflow: 'hidden',
          padding: '20px'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          width: '100%', 
          maxWidth: '800px',
          height: '90vh',
          maxHeight: '700px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          
          {/* Header - Fixed */}
          <div style={{ 
            background: 'linear-gradient(135deg, #2E8B57, #228B22)', 
            color: 'white', 
            padding: '18px 30px', 
            textAlign: 'center',
            flexShrink: 0
          }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>Assessment Complete!</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
              Ghana SME Investment Readiness Analysis
            </p>
          </div>

          {/* Score Section - Fixed */}
          <div style={{ 
            padding: '20px 30px', 
            textAlign: 'center', 
            background: '#f8f9fa',
            flexShrink: 0,
            borderBottom: '2px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'inline-block',
              padding: '15px 25px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${getScoreColor(assessment.score)}`
            }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: getScoreColor(assessment.score),
                marginBottom: '5px',
                lineHeight: 1
              }}>
                {assessment.score}%
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: getScoreColor(assessment.score),
                marginBottom: '3px'
              }}>
                {getScoreLabel(assessment.score)}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                Based on {questions.length} key factors
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '0'
          }}>
            
            {/* Recommendations Section */}
            <div style={{ padding: '25px 30px' }}>
              <h3 style={{ 
                color: '#2E8B57', 
                marginBottom: '20px', 
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  width: '4px', 
                  height: '24px', 
                  background: '#2E8B57', 
                  borderRadius: '2px' 
                }}></span>
                Key Recommendations
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gap: '15px'
              }}>
                {assessment.recommendations.map((rec, index) => (
                  <div key={index} style={{ 
                    padding: '18px 20px',
                    background: index < 3 ? '#f8f9fa' : '#fff',
                    borderLeft: `4px solid ${index < 3 ? '#2E8B57' : '#FFA500'}`,
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <span style={{ 
                        background: index < 3 ? '#2E8B57' : '#FFA500',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ color: '#333' }}>{rec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Report Notice */}
            <div style={{ 
              margin: '20px 30px',
              padding: '15px',
              background: subscriptionStatus.hasDetailedReports() ? '#e8f5e8' : '#fff3cd',
              border: `1px solid ${subscriptionStatus.hasDetailedReports() ? '#d4edda' : '#ffeaa7'}`,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {subscriptionStatus.hasDetailedReports() ? (
                <>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2E8B57' }}>Premium Report Available</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#2E8B57', fontSize: '14px' }}>
                    Download your comprehensive business analysis report.
                  </p>
                  <button style={{ 
                    background: '#2E8B57', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Download PDF Report
                  </button>
                </>
              ) : (
                <>
                  <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Upgrade for Detailed Report</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '14px' }}>
                    Get comprehensive PDF analysis with funding strategies - Upgrade to Pro for 50 GHS/month.
                  </p>
                  <button style={{ 
                    background: '#2E8B57', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Upgrade to Access PDF Reports
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div style={{ 
            padding: '20px 30px',
            borderTop: '2px solid #e9ecef',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Assessment completed: {assessment.timestamp}
            </div>
            <button
              onClick={onClose}
              style={{ 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '10px 24px', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div 
      style={{ 
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
        overflow: 'hidden'
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div style={{ 
        background: 'white', 
        padding: '0',
        borderRadius: '12px', 
        width: '90%', 
        maxWidth: '600px',
        height: '90vh',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ 
          background: '#2E8B57', 
          color: 'white', 
          padding: '20px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Business Assessment</h2>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                padding: '8px 12px', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
          
          {/* Progress Bar */}
          <div style={{ marginTop: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.3)', height: '6px', borderRadius: '3px' }}>
              <div style={{ 
                background: 'white', 
                height: '100%', 
                width: `${progress}%`, 
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Question Content - Scrollable */}
        <div style={{ 
          padding: '30px',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ 
            color: '#333', 
            marginBottom: '20px', 
            fontSize: '18px',
            lineHeight: '1.4'
          }}>
            {question.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.type === 'multiple' && question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                style={{ 
                  padding: '15px 20px',
                  background: 'white',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  color: '#333',
                  width: '100%',
                  minHeight: '50px',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2E8B57';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {option}
              </button>
            ))}

            {question.type === 'yes_no' && ['Yes', 'No'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                style={{ 
                  padding: '15px 20px',
                  background: 'white',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  width: '100%',
                  minHeight: '50px',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2E8B57';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {option}
              </button>
            ))}

            {question.type === 'scale' && (
              <div>
                <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                  Rate from 1 (Poor) to 5 (Excellent)
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswer(rating)}
                      style={{ 
                        width: '50px',
                        height: '50px',
                        background: 'white',
                        border: '2px solid #e0e0e0',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2E8B57';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessAssessment;