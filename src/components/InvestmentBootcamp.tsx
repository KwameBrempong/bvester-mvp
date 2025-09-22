import React, { useState, useEffect } from 'react';
import { isFeatureEnabled } from '../config/featureFlags';
import '../styles/premium-theme.css';

interface BootcampWeek {
  week: number;
  title: string;
  focus: string;
  deliverables: string[];
  status: 'locked' | 'current' | 'completed';
  sessions: {
    title: string;
    duration: string;
    completed: boolean;
  }[];
}

interface PricingTier {
  name: string;
  price: number;
  priceId: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

interface InvestmentBootcampProps {
  user: any;
  userProfile: any;
  onClose: () => void;
  enrollmentScore?: number;
  insights?: any[];
}

const bootcampWeeks: BootcampWeek[] = [
  {
    week: 1,
    title: 'Financial Foundations',
    focus: 'Clean books, cash flow mastery, and financial systems',
    deliverables: [
      'Clean P&L statement',
      'Cash flow forecast (12 months)',
      'Unit economics model',
      'Financial dashboard'
    ],
    status: 'current',
    sessions: [
      { title: 'Financial Record Cleanup', duration: '90 min', completed: false },
      { title: 'Cash Flow Forecasting', duration: '120 min', completed: false },
      { title: 'Building Your Financial Dashboard', duration: '90 min', completed: false },
      { title: 'Unit Economics Deep Dive', duration: '60 min', completed: false },
    ]
  },
  {
    week: 2,
    title: 'Growth Systems',
    focus: 'Sales processes, customer acquisition, and scaling strategies',
    deliverables: [
      'Sales playbook',
      'Customer acquisition model',
      'Growth metrics dashboard',
      'Scaling roadmap'
    ],
    status: 'locked',
    sessions: [
      { title: 'Sales Process Optimization', duration: '90 min', completed: false },
      { title: 'Customer Acquisition Strategies', duration: '120 min', completed: false },
      { title: 'Growth Metrics That Matter', duration: '60 min', completed: false },
      { title: 'Building Scalable Operations', duration: '90 min', completed: false },
    ]
  },
  {
    week: 3,
    title: 'Investment Package',
    focus: 'Pitch deck, financial projections, and investment readiness',
    deliverables: [
      'Professional pitch deck',
      '3-year financial projections',
      'Investment memorandum',
      'Data room setup'
    ],
    status: 'locked',
    sessions: [
      { title: 'Pitch Deck Masterclass', duration: '120 min', completed: false },
      { title: 'Financial Modeling Workshop', duration: '150 min', completed: false },
      { title: 'Building Your Data Room', duration: '60 min', completed: false },
      { title: 'Investment Terms Explained', duration: '90 min', completed: false },
    ]
  },
  {
    week: 4,
    title: 'Investor Connections',
    focus: 'Mock pitches, feedback sessions, and real investor introductions',
    deliverables: [
      'Refined pitch delivery',
      'Investor outreach strategy',
      '3+ investor introductions',
      'Term sheet negotiation guide'
    ],
    status: 'locked',
    sessions: [
      { title: 'Mock Pitch Session', duration: '90 min', completed: false },
      { title: 'Investor Psychology & Communication', duration: '60 min', completed: false },
      { title: 'Live Investor Q&A Panel', duration: '120 min', completed: false },
      { title: 'Closing the Deal', duration: '90 min', completed: false },
    ]
  }
];

const pricingTiers: PricingTier[] = [
  {
    name: 'Self-Paced',
    price: 497,
    priceId: 'price_selfpaced_497',
    features: [
      'All course materials',
      'Templates & tools',
      'Community access',
      'Email support',
      'Lifetime updates'
    ]
  },
  {
    name: 'Group Cohort',
    price: 997,
    priceId: 'price_cohort_997',
    features: [
      'Everything in Self-Paced',
      '8 live group sessions',
      'Peer review & feedback',
      'Weekly office hours',
      'Cohort WhatsApp group',
      'Certificate of completion'
    ],
    recommended: true,
    savings: 'Most Popular'
  },
  {
    name: 'VIP Track',
    price: 2497,
    priceId: 'price_vip_2497',
    features: [
      'Everything in Group Cohort',
      '4 one-on-one coaching sessions',
      'Personal pitch review',
      'Direct investor introductions',
      'Priority support',
      'Success guarantee*'
    ],
    savings: 'Best Results'
  }
];

const InvestmentBootcamp: React.FC<InvestmentBootcampProps> = ({
  user,
  userProfile,
  onClose,
  enrollmentScore,
  insights
}) => {
  const [selectedTier, setSelectedTier] = useState<PricingTier>(pricingTiers[1]); // Default to recommended
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);

  // Calculate next cohort start date (next Monday)
  const getNextMonday = () => {
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
  };

  const nextCohortDate = getNextMonday();
  const spotsRemaining = 12 - Math.floor(Math.random() * 5); // Dynamic spots for urgency

  const handleEnroll = () => {
    console.log('Enrolling in tier:', selectedTier);
    // Trigger Stripe checkout or enrollment process
    const event = new CustomEvent('initiateEnrollment', {
      detail: {
        tier: selectedTier,
        userId: user?.username,
        userEmail: userProfile?.email,
        score: enrollmentScore,
      }
    });
    window.dispatchEvent(event);
    setShowEnrollment(true);
  };

  const usePremiumTheme = isFeatureEnabled('useBlackGoldTheme');

  return (
    <div className={usePremiumTheme ? "modal-premium-overlay" : ""} style={!usePremiumTheme ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    } : undefined}>
      <div className={usePremiumTheme ? "modal-premium-content" : ""} style={{
        ...(usePremiumTheme ? {} : {
          background: 'white',
          borderRadius: '16px',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto',
        }),
        width: '95%',
        padding: '40px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: usePremiumTheme ? '2px solid var(--gold-primary)' : '1px solid #e0e0e0',
          paddingBottom: '20px'
        }}>
          <div>
            <h1 className={usePremiumTheme ? "heading-premium h1" : ""} style={!usePremiumTheme ? {
              fontSize: '32px',
              fontWeight: 'bold',
              margin: 0
            } : { margin: 0 }}>
              30-Day Investment Readiness <span className={usePremiumTheme ? "gold-emphasis" : ""}
                style={!usePremiumTheme ? { color: '#D4AF37' } : undefined}>Bootcamp</span>
            </h1>
            <p style={{
              color: usePremiumTheme ? 'var(--gray-600)' : '#666',
              marginTop: '10px',
              fontSize: '18px'
            }}>
              Transform your SME into an investment magnet in just 4 weeks
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: usePremiumTheme ? 'var(--gray-500)' : '#999',
            }}
          >
            ×
          </button>
        </div>

        {/* Urgency Banner */}
        {enrollmentScore && enrollmentScore < 70 && (
          <div style={{
            background: usePremiumTheme ? 'var(--warning-light)' : '#FFF3CD',
            border: `2px solid ${usePremiumTheme ? 'var(--warning)' : '#FFC107'}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
          }}>
            <h3 style={{
              color: usePremiumTheme ? 'var(--warning)' : '#856404',
              marginBottom: '10px'
            }}>
              ⚠️ Based on your assessment score ({enrollmentScore}/100), you need immediate intervention
            </h3>
            <p style={{ margin: 0 }}>
              This bootcamp specifically addresses the critical gaps we identified in your business
            </p>
          </div>
        )}

        {/* Program Structure */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className={usePremiumTheme ? "heading-premium h2" : ""} style={!usePremiumTheme ? {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px'
          } : undefined}>
            Program Structure
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {bootcampWeeks.map((week, index) => (
              <div
                key={week.week}
                className={usePremiumTheme ? "card-premium" : ""}
                style={{
                  ...(usePremiumTheme ? {} : {
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '20px',
                    background: 'white',
                  }),
                  opacity: week.status === 'locked' ? 0.7 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onClick={() => setActiveWeek(index)}
                onMouseEnter={(e) => {
                  if (!usePremiumTheme) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!usePremiumTheme) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {week.status === 'current' && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '20px',
                    background: usePremiumTheme ? 'var(--gold-primary)' : '#28a745',
                    color: usePremiumTheme ? 'var(--black-primary)' : 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    CURRENT
                  </div>
                )}

                <div style={{
                  fontSize: '14px',
                  color: usePremiumTheme ? 'var(--gold-primary)' : '#D4AF37',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  WEEK {week.week}
                </div>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: usePremiumTheme ? 'var(--black-primary)' : '#333'
                }}>
                  {week.title}
                </h3>

                <p style={{
                  color: usePremiumTheme ? 'var(--gray-600)' : '#666',
                  fontSize: '14px',
                  marginBottom: '15px'
                }}>
                  {week.focus}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: usePremiumTheme ? 'var(--gray-500)' : '#999',
                    marginBottom: '8px'
                  }}>
                    DELIVERABLES:
                  </h4>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: usePremiumTheme ? 'var(--gray-600)' : '#666'
                  }}>
                    {week.deliverables.slice(0, 3).map((deliverable, idx) => (
                      <li key={idx}>{deliverable}</li>
                    ))}
                  </ul>
                </div>

                {week.status === 'locked' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '40px',
                    opacity: 0.3,
                  }}>
                    🔒
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className={usePremiumTheme ? "heading-premium h2" : ""} style={!usePremiumTheme ? {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center'
          } : { textAlign: 'center' }}>
            Choose Your Track
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={usePremiumTheme ? "card-premium" : ""}
                style={{
                  ...(usePremiumTheme ? {} : {
                    border: `3px solid ${selectedTier.name === tier.name ? '#D4AF37' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    padding: '30px 20px',
                    background: 'white',
                  }),
                  ...(selectedTier.name === tier.name && !usePremiumTheme ? {
                    background: 'linear-gradient(to bottom, #FFFEF7, #FFFFFF)',
                  } : {}),
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setSelectedTier(tier)}
              >
                {tier.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: usePremiumTheme ? 'var(--gold-primary)' : '#D4AF37',
                    color: usePremiumTheme ? 'var(--black-primary)' : 'white',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                {tier.savings && tier.name === 'VIP Track' && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '20px',
                    background: usePremiumTheme ? 'var(--success)' : '#28a745',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    {tier.savings}
                  </div>
                )}

                <h3 style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  textAlign: 'center',
                  color: usePremiumTheme ? 'var(--black-primary)' : '#333'
                }}>
                  {tier.name}
                </h3>

                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '20px',
                  color: usePremiumTheme ? 'var(--gold-primary)' : '#D4AF37'
                }}>
                  ₵{tier.price}
                </div>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}>
                  {tier.features.map((feature, idx) => (
                    <li key={idx} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      color: usePremiumTheme ? 'var(--gray-600)' : '#666',
                    }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>

                {selectedTier.name === tier.name && (
                  <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    background: usePremiumTheme ? 'var(--gold-subtle)' : '#FFF9E6',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: usePremiumTheme ? 'var(--gold-deep)' : '#D4AF37',
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment CTA */}
        <div style={{
          background: usePremiumTheme ? 'var(--gold-subtle)' : 'linear-gradient(to right, #FFFEF7, #FFF9E6)',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: usePremiumTheme ? 'var(--black-primary)' : '#333'
          }}>
            Next Cohort Starts {nextCohortDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>

          <p style={{
            fontSize: '18px',
            color: usePremiumTheme ? 'var(--error)' : '#dc3545',
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            ⚡ Only {spotsRemaining} spots remaining
          </p>

          <button
            className={usePremiumTheme ? "btn-premium" : ""}
            style={!usePremiumTheme ? {
              background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              color: '#000',
              border: 'none',
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.3s ease',
            } : { fontSize: '18px', padding: '16px 40px' }}
            onClick={handleEnroll}
            onMouseEnter={(e) => {
              if (!usePremiumTheme) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!usePremiumTheme) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
              }
            }}
          >
            Enroll Now - {selectedTier.name} (₵{selectedTier.price})
          </button>

          <p style={{
            marginTop: '15px',
            color: usePremiumTheme ? 'var(--gray-600)' : '#666',
            fontSize: '14px'
          }}>
            💰 30-day money-back guarantee · 🔒 Secure payment via Stripe
          </p>
        </div>

        {/* Success Stories / Social Proof */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: usePremiumTheme ? 'var(--gray-50)' : '#f8f9fa',
          borderRadius: '12px',
        }}>
          <p style={{
            textAlign: 'center',
            fontSize: '16px',
            color: usePremiumTheme ? 'var(--gray-600)' : '#666',
            fontStyle: 'italic'
          }}>
            "This bootcamp transformed my construction business. We secured ₵500,000 in funding within 60 days of completion!"
          </p>
          <p style={{
            textAlign: 'center',
            marginTop: '10px',
            fontWeight: 'bold',
            color: usePremiumTheme ? 'var(--black-primary)' : '#333'
          }}>
            - Kwame A., CEO of BuildGhana Ltd
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentBootcamp;