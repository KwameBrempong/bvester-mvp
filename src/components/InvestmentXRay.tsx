import React, { useState, useEffect } from 'react';
import { isFeatureEnabled } from '../config/featureFlags';
import '../styles/premium-theme.css';

interface XRayQuestion {
  id: string;
  question: string;
  type: 'slider' | 'percentage' | 'multiple' | 'number';
  options?: string[];
  range?: [number, number];
  revealInsight: string;
  weight: number;
  category: 'financial' | 'operational' | 'market' | 'team';
  criticalThreshold?: number;
}

interface InvestmentXRayProps {
  user: any;
  userProfile: any;
  onClose: () => void;
  onComplete?: (score: number, insights: any) => void;
}

// Powerful, revealing questions that expose investment readiness
const criticalQuestions: XRayQuestion[] = [
  {
    id: 'cash_runway',
    question: 'How many months can you operate without new revenue?',
    type: 'slider',
    range: [0, 24],
    revealInsight: '💸 Companies with <3 months runway fail 78% of funding rounds',
    weight: 0.20,
    category: 'financial',
    criticalThreshold: 3,
  },
  {
    id: 'customer_concentration',
    question: 'What % of revenue comes from your top 3 customers?',
    type: 'percentage',
    revealInsight: '⚠️ Investors see >60% concentration as high risk',
    weight: 0.15,
    category: 'market',
    criticalThreshold: 60,
  },
  {
    id: 'growth_bottleneck',
    question: 'What would break first if you doubled sales tomorrow?',
    type: 'multiple',
    options: ['Operations', 'Cash flow', 'Team capacity', 'Supply chain', 'Nothing - we\'re ready'],
    revealInsight: '🎯 Your answer reveals your #1 investment readiness gap',
    weight: 0.15,
    category: 'operational',
  },
  {
    id: 'financial_reconciliation',
    question: 'When did you last reconcile your books?',
    type: 'multiple',
    options: ['This week', 'This month', 'This quarter', 'Over 3 months ago', 'Never'],
    revealInsight: '📊 90% of rejected deals have poor financial records',
    weight: 0.15,
    category: 'financial',
  },
  {
    id: 'pricing_validation',
    question: 'How many paying customers validated your current pricing?',
    type: 'number',
    revealInsight: '💰 <10 customers = pricing risk for investors',
    weight: 0.10,
    category: 'market',
    criticalThreshold: 10,
  },
  {
    id: 'team_depth',
    question: 'If you were unavailable for 30 days, what would happen?',
    type: 'multiple',
    options: [
      'Business runs smoothly',
      'Minor disruptions only',
      'Major operations affected',
      'Business would struggle severely',
      'Complete shutdown'
    ],
    revealInsight: '👥 Key person dependency is a major red flag',
    weight: 0.10,
    category: 'team',
  },
  {
    id: 'growth_rate',
    question: 'What\'s your monthly revenue growth rate?',
    type: 'percentage',
    revealInsight: '📈 Investors look for 10-20% monthly growth',
    weight: 0.15,
    category: 'financial',
    criticalThreshold: 10,
  },
];

const InvestmentXRay: React.FC<InvestmentXRayProps> = ({ user, userProfile, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showInsight, setShowInsight] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [percentageValue, setPercentageValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [startTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [insights, setInsights] = useState<any[]>([]);

  const question = criticalQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / criticalQuestions.length) * 100;

  const calculateScore = () => {
    let totalScore = 0;
    const calculatedInsights: any[] = [];

    criticalQuestions.forEach((q) => {
      const answer = answers[q.id];
      let questionScore = 0;
      let insight = {
        question: q.question,
        category: q.category,
        insight: q.revealInsight,
        status: 'neutral' as 'good' | 'warning' | 'critical' | 'neutral',
        recommendation: '',
      };

      switch (q.id) {
        case 'cash_runway':
          questionScore = Math.min(answer / 12, 1) * 100;
          if (answer < 3) {
            insight.status = 'critical';
            insight.recommendation = 'Immediate cash flow intervention needed';
          } else if (answer < 6) {
            insight.status = 'warning';
            insight.recommendation = 'Build 6+ month runway before seeking investment';
          } else {
            insight.status = 'good';
            insight.recommendation = 'Healthy runway for fundraising';
          }
          break;

        case 'customer_concentration':
          questionScore = answer > 60 ? 30 : (answer > 40 ? 60 : 100);
          if (answer > 60) {
            insight.status = 'critical';
            insight.recommendation = 'Diversify customer base urgently';
          } else if (answer > 40) {
            insight.status = 'warning';
            insight.recommendation = 'Work on customer diversification';
          } else {
            insight.status = 'good';
            insight.recommendation = 'Well-diversified customer base';
          }
          break;

        case 'growth_bottleneck':
          const bottleneckScores: Record<string, number> = {
            'Nothing - we\'re ready': 100,
            'Team capacity': 70,
            'Operations': 60,
            'Supply chain': 50,
            'Cash flow': 30,
          };
          questionScore = bottleneckScores[answer] || 50;
          if (answer === 'Cash flow') {
            insight.status = 'critical';
            insight.recommendation = 'Fix cash flow before scaling';
          } else if (answer === 'Nothing - we\'re ready') {
            insight.status = 'good';
            insight.recommendation = 'Well-prepared for growth';
          } else {
            insight.status = 'warning';
            insight.recommendation = `Address ${answer.toLowerCase()} constraints`;
          }
          break;

        case 'financial_reconciliation':
          const reconciliationScores: Record<string, number> = {
            'This week': 100,
            'This month': 80,
            'This quarter': 50,
            'Over 3 months ago': 20,
            'Never': 0,
          };
          questionScore = reconciliationScores[answer] || 0;
          if (answer === 'Never' || answer === 'Over 3 months ago') {
            insight.status = 'critical';
            insight.recommendation = 'Implement monthly bookkeeping immediately';
          } else if (answer === 'This quarter') {
            insight.status = 'warning';
            insight.recommendation = 'Move to monthly reconciliation';
          } else {
            insight.status = 'good';
            insight.recommendation = 'Excellent financial discipline';
          }
          break;

        case 'pricing_validation':
          questionScore = Math.min(answer / 50, 1) * 100;
          if (answer < 10) {
            insight.status = 'critical';
            insight.recommendation = 'Validate pricing with more customers';
          } else if (answer < 25) {
            insight.status = 'warning';
            insight.recommendation = 'Good start, need more validation';
          } else {
            insight.status = 'good';
            insight.recommendation = 'Strong pricing validation';
          }
          break;

        case 'team_depth':
          const teamScores: Record<string, number> = {
            'Business runs smoothly': 100,
            'Minor disruptions only': 75,
            'Major operations affected': 50,
            'Business would struggle severely': 25,
            'Complete shutdown': 0,
          };
          questionScore = teamScores[answer] || 0;
          if (questionScore <= 25) {
            insight.status = 'critical';
            insight.recommendation = 'Build management team urgently';
          } else if (questionScore <= 50) {
            insight.status = 'warning';
            insight.recommendation = 'Delegate more responsibilities';
          } else {
            insight.status = 'good';
            insight.recommendation = 'Strong operational independence';
          }
          break;

        case 'growth_rate':
          questionScore = Math.min(answer / 20, 1) * 100;
          if (answer < 5) {
            insight.status = 'critical';
            insight.recommendation = 'Focus on growth before fundraising';
          } else if (answer < 10) {
            insight.status = 'warning';
            insight.recommendation = 'Accelerate growth to attract investors';
          } else {
            insight.status = 'good';
            insight.recommendation = 'Excellent growth trajectory';
          }
          break;
      }

      totalScore += questionScore * q.weight;
      calculatedInsights.push(insight);
    });

    setScore(Math.round(totalScore));
    setInsights(calculatedInsights);
    return Math.round(totalScore);
  };

  const handleAnswer = () => {
    let answerValue: any;

    switch (question.type) {
      case 'slider':
        answerValue = sliderValue;
        break;
      case 'percentage':
        answerValue = parseFloat(percentageValue) || 0;
        break;
      case 'number':
        answerValue = parseInt(numberValue) || 0;
        break;
      case 'multiple':
        answerValue = selectedOption;
        break;
    }

    setAnswers({ ...answers, [question.id]: answerValue });
    setShowInsight(true);

    setTimeout(() => {
      if (currentQuestion < criticalQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowInsight(false);
        // Reset input values
        setSliderValue(0);
        setPercentageValue('');
        setNumberValue('');
        setSelectedOption('');
      } else {
        // Assessment complete
        const finalScore = calculateScore();
        setShowResults(true);
        if (onComplete) {
          onComplete(finalScore, insights);
        }
      }
    }, 2500);
  };

  const getScoreZone = (score: number) => {
    if (score <= 40) return { zone: 'Red Zone', color: 'var(--error)', message: 'Critical gaps need immediate attention' };
    if (score <= 70) return { zone: 'Yellow Zone', color: 'var(--warning)', message: 'Has potential but needs structure' };
    return { zone: 'Green Zone', color: 'var(--success)', message: 'Investment-ready with minor tweaks' };
  };

  const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

  if (showResults) {
    const zoneInfo = getScoreZone(score);
    const criticalInsights = insights.filter(i => i.status === 'critical');
    const biggestBlindspot = criticalInsights[0] || insights[0];

    return (
      <div className="modal-premium-overlay">
        <div className="modal-premium-content" style={{ maxWidth: '800px', padding: '40px' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--gray-500)',
            }}
          >
            ×
          </button>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="heading-premium h2">
              Your Investment Readiness <span className="gold-emphasis">X-Ray Results</span>
            </h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '18px' }}>
              Completed in {elapsedMinutes || 1} minutes
            </p>
          </div>

          {/* Score Visual */}
          <div style={{
            background: 'linear-gradient(135deg, var(--black-primary), var(--black-secondary))',
            borderRadius: 'var(--border-radius-xl)',
            padding: '40px',
            marginBottom: '40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: zoneInfo.color,
              marginBottom: '10px',
            }}>
              {score}
            </div>
            <div style={{
              fontSize: '24px',
              color: 'var(--gold-primary)',
              fontWeight: '600',
              marginBottom: '10px',
            }}>
              {zoneInfo.zone}
            </div>
            <div style={{
              fontSize: '16px',
              color: 'var(--white-primary)',
            }}>
              {zoneInfo.message}
            </div>

            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, var(--gold-primary), transparent)',
              opacity: 0.1,
            }}></div>
          </div>

          {/* Biggest Blind Spot */}
          <div className="card-premium" style={{ marginBottom: '30px', background: 'var(--error-light)' }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '15px' }}>
              🎯 Your #1 Hidden Investment Blocker:
            </h3>
            <p style={{ fontSize: '18px', color: 'var(--black-primary)', marginBottom: '15px' }}>
              {biggestBlindspot.question}
            </p>
            <p style={{ color: 'var(--error)', fontWeight: '600', fontSize: '16px' }}>
              {biggestBlindspot.insight}
            </p>
            <p style={{ marginTop: '15px', color: 'var(--black-primary)' }}>
              <strong>Action Required:</strong> {biggestBlindspot.recommendation}
            </p>
          </div>

          {/* Key Insights */}
          <div style={{ marginBottom: '30px' }}>
            <h3 className="heading-premium h3">Key Insights</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="card-premium" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: insight.status === 'good' ? 'var(--success)' :
                        insight.status === 'warning' ? 'var(--warning)' : 'var(--error)',
                    }}></span>
                    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                      {insight.category}
                    </span>
                  </div>
                  <p style={{ color: 'var(--gray-600)', marginBottom: '10px' }}>
                    {insight.insight}
                  </p>
                  <p style={{ color: 'var(--black-primary)', fontWeight: '500' }}>
                    {insight.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--gold-subtle), var(--white-primary))',
            borderRadius: 'var(--border-radius-xl)',
            padding: '30px',
            textAlign: 'center',
          }}>
            <h3 className="heading-premium h3">
              Transform These Weaknesses Into <span className="gold-emphasis">Strengths</span>
            </h3>
            <p style={{ fontSize: '18px', color: 'var(--gray-600)', marginBottom: '20px' }}>
              Our 30-Day Investment Readiness Bootcamp addresses every gap we found
            </p>
            <button
              className="btn-premium"
              style={{ fontSize: '18px', padding: '16px 40px' }}
              onClick={() => {
                onClose();
                // Navigate to accelerator enrollment
                const event = new CustomEvent('enrollInAccelerator', { detail: { score, insights } });
                window.dispatchEvent(event);
              }}
            >
              Join Next Cohort (Starts Monday)
              <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
                Only 12 spots remaining
              </div>
            </button>
            <p style={{ marginTop: '15px', color: 'var(--gray-600)' }}>
              30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-premium-overlay">
      <div className="modal-premium-content" style={{ maxWidth: '700px', padding: '40px' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--gray-500)',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="heading-premium h2">
            Investment <span className="gold-emphasis">X-Ray</span>
          </h2>
          <p style={{ color: 'var(--gray-600)' }}>
            7 Questions · {7 - currentQuestion} Remaining
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-premium" style={{ marginBottom: '30px' }}>
          <div className="progress-premium-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '30px' }}>
          <h3 className="heading-premium h3" style={{ marginBottom: '20px' }}>
            {question.question}
          </h3>

          {/* Input based on question type */}
          {question.type === 'slider' && question.range && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>{question.range[0]}</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold-primary)' }}>
                  {sliderValue} months
                </span>
                <span>{question.range[1]}+</span>
              </div>
              <input
                type="range"
                min={question.range[0]}
                max={question.range[1]}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--gray-200)',
                  borderRadius: '4px',
                  outline: 'none',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
          )}

          {question.type === 'percentage' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="0"
                max="100"
                value={percentageValue}
                onChange={(e) => setPercentageValue(e.target.value)}
                className="input-premium"
                placeholder="Enter percentage"
                style={{ fontSize: '20px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>%</span>
            </div>
          )}

          {question.type === 'number' && (
            <input
              type="number"
              min="0"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              className="input-premium"
              placeholder="Enter number"
              style={{ fontSize: '20px', textAlign: 'center' }}
            />
          )}

          {question.type === 'multiple' && question.options && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  style={{
                    padding: '15px 20px',
                    background: selectedOption === option ? 'var(--gold-primary)' : 'var(--white-primary)',
                    color: selectedOption === option ? 'var(--black-primary)' : 'var(--black-primary)',
                    border: `2px solid ${selectedOption === option ? 'var(--gold-primary)' : 'var(--gray-200)'}`,
                    borderRadius: 'var(--border-radius-md)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: selectedOption === option ? '600' : '400',
                    transition: 'all var(--transition-base)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOption !== option) {
                      e.currentTarget.style.borderColor = 'var(--gold-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOption !== option) {
                      e.currentTarget.style.borderColor = 'var(--gray-200)';
                    }
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Insight (shown after answering) */}
        {showInsight && (
          <div style={{
            background: 'var(--gold-subtle)',
            borderLeft: '4px solid var(--gold-primary)',
            padding: '15px',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '20px',
            animation: 'slideUp var(--transition-slow)',
          }}>
            <p style={{ color: 'var(--black-primary)', fontWeight: '500' }}>
              {question.revealInsight}
            </p>
          </div>
        )}

        {/* Continue Button */}
        <button
          className="btn-premium"
          onClick={handleAnswer}
          disabled={
            (question.type === 'slider' && sliderValue === 0) ||
            (question.type === 'percentage' && !percentageValue) ||
            (question.type === 'number' && !numberValue) ||
            (question.type === 'multiple' && !selectedOption)
          }
          style={{
            width: '100%',
            opacity:
              ((question.type === 'slider' && sliderValue === 0) ||
              (question.type === 'percentage' && !percentageValue) ||
              (question.type === 'number' && !numberValue) ||
              (question.type === 'multiple' && !selectedOption)) ? 0.5 : 1,
            cursor:
              ((question.type === 'slider' && sliderValue === 0) ||
              (question.type === 'percentage' && !percentageValue) ||
              (question.type === 'number' && !numberValue) ||
              (question.type === 'multiple' && !selectedOption)) ? 'not-allowed' : 'pointer',
          }}
        >
          {currentQuestion < criticalQuestions.length - 1 ? 'Next Question' : 'See Your Results'}
        </button>
      </div>
    </div>
  );
};

export default InvestmentXRay;