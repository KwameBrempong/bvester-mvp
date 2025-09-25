import React, { useState, useEffect } from 'react';
import { isFeatureEnabled } from '../config/featureFlags';
import '../styles/premium-theme.css';

interface HomepageNewProps {
  onGetStarted: () => void;
}

const HomepageNew: React.FC<HomepageNewProps> = ({ onGetStarted }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Check if premium theme is enabled
  const usePremiumTheme = isFeatureEnabled('useBlackGoldTheme');
  const useOptimizedHomepage = isFeatureEnabled('useOptimizedHomepage');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMenuOpen(false);
  };

  const mvpFeatures = [
    {
      icon: '💬',
      title: 'Smart Record Keeping',
      subtitle: 'Chat with AI to track transactions',
      description: 'Just type "Sold 50 bags of rice for 5000 cedis" and watch your books update automatically. No more Excel nightmares.',
      stats: '15 hours saved weekly',
      color: '#4CAF50'
    },
    {
      icon: '📊',
      title: 'Business Assessment',
      subtitle: '7-minute business health check',
      description: 'Get instant insights on cash flow, profit margins, and growth opportunities. Know exactly where you stand.',
      stats: '89% accuracy rate',
      color: '#2196F3'
    },
    {
      icon: '🚀',
      title: 'Growth Accelerator',
      subtitle: 'Step-by-step investment readiness',
      description: 'Follow our proven playbook used by 500+ SMEs to increase revenue 40% and attract serious investors.',
      stats: '40% revenue growth',
      color: '#FF9800'
    }
  ];

  return (
    <div style={{
      fontFamily: usePremiumTheme ? 'var(--font-premium)' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: usePremiumTheme ? 'var(--black-primary)' : '#ffffff',
      color: usePremiumTheme ? 'var(--white-primary)' : '#1a1a1a',
      lineHeight: 1.6,
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: usePremiumTheme
          ? (scrolled ? 'rgba(10, 10, 10, 0.98)' : 'var(--black-primary)')
          : (scrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff'),
        borderBottom: usePremiumTheme ? '2px solid var(--gold-primary)' : 'none',
        boxShadow: scrolled
          ? (usePremiumTheme ? '0 2px 20px rgba(212, 175, 55, 0.2)' : '0 2px 20px rgba(0,0,0,0.1)')
          : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: usePremiumTheme
              ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
            letterSpacing: '-0.5px'
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Bvester
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center'
          }} className="desktop-nav">
            {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: usePremiumTheme ? 'var(--white-primary)' : '#666',
                  fontSize: '15px',
                  cursor: 'pointer',
                  padding: '8px 0',
                  position: 'relative',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = usePremiumTheme ? 'var(--gold-primary)' : '#667eea'}
                onMouseLeave={(e) => e.currentTarget.style.color = usePremiumTheme ? 'var(--white-primary)' : '#666'}
              >
                {item}
              </button>
            ))}

            <button
              onClick={onGetStarted}
              className={usePremiumTheme ? "btn-premium" : ""}
              style={!usePremiumTheme ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              } : {}}
              onMouseEnter={(e) => {
                if (!usePremiumTheme) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!usePremiumTheme) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: usePremiumTheme ? 'var(--gold-primary)' : '#1a1a1a'
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          bottom: 0,
          background: usePremiumTheme
            ? 'linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.98) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)', // Safari support
          zIndex: 999,
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderTop: usePremiumTheme
            ? '1px solid rgba(212, 175, 55, 0.2)'
            : '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: usePremiumTheme
            ? '0 -4px 20px rgba(0, 0, 0, 0.3)'
            : '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: usePremiumTheme ? 'var(--white-primary)' : '#1a1a1a',
                textAlign: 'left',
                padding: '12px 0',
                borderBottom: usePremiumTheme ? '1px solid var(--gold-primary)' : '1px solid #e0e0e0',
                cursor: 'pointer'
              }}
            >
              {item}
            </button>
          ))}
          {/* Primary Action - Login/Start Trial */}
          <button
            onClick={onGetStarted}
            style={{
              background: usePremiumTheme
                ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: usePremiumTheme ? 'var(--black-primary)' : '#ffffff',
              border: usePremiumTheme ? '2px solid var(--white-primary)' : '2px solid rgba(255,255,255,0.3)',
              padding: '18px 24px',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '700',
              marginTop: '24px',
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: usePremiumTheme
                ? '0 8px 25px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 8px 25px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              transform: 'translateZ(0)' // Hardware acceleration
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = usePremiumTheme
                ? '0 12px 35px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
                : '0 12px 35px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = usePremiumTheme
                ? '0 8px 25px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 8px 25px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
            }}
          >
            🚀 Start Free Trial
          </button>

          {/* Secondary Action - Free Assessment */}
          <button
            onClick={() => {
              setMenuOpen(false);
              scrollToSection('how-it-works');
            }}
            style={{
              background: usePremiumTheme
                ? 'rgba(212, 175, 55, 0.08)'
                : 'rgba(102, 126, 234, 0.08)',
              color: usePremiumTheme ? 'var(--gold-primary)' : '#667eea',
              border: usePremiumTheme
                ? '2px solid var(--gold-primary)'
                : '2px solid #667eea',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              marginTop: '12px',
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = usePremiumTheme
                ? 'var(--gold-primary)'
                : '#667eea';
              e.currentTarget.style.color = usePremiumTheme ? 'var(--black-primary)' : '#ffffff';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = usePremiumTheme
                ? 'rgba(212, 175, 55, 0.08)'
                : 'rgba(102, 126, 234, 0.08)';
              e.currentTarget.style.color = usePremiumTheme ? 'var(--gold-primary)' : '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📊 Free Assessment
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        background: usePremiumTheme
          ? 'linear-gradient(180deg, var(--black-primary) 0%, var(--black-secondary) 100%)'
          : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center'
        }} className="hero-grid">

          <div>
            {/* Trust Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: usePremiumTheme ? 'rgba(212, 175, 55, 0.1)' : 'rgba(102, 126, 234, 0.1)',
              borderRadius: '20px',
              padding: '8px 16px',
              marginBottom: '24px',
              fontSize: '14px',
              color: usePremiumTheme ? 'var(--gold-primary)' : '#667eea',
              fontWeight: '600',
              border: usePremiumTheme ? '1px solid var(--gold-primary)' : 'none'
            }}>
              ⚡ 500+ SMEs transformed in 6 months
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '24px',
              color: usePremiumTheme ? 'var(--white-primary)' : '#1a1a1a'
            }}>
              Your Business. <br />
              <span style={{
                background: usePremiumTheme
                  ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Investment Ready.
              </span><br />
              In 90 Days.
            </h1>

            <p style={{
              fontSize: '20px',
              lineHeight: '1.6',
              color: usePremiumTheme ? 'var(--gray-300)' : '#666',
              marginBottom: '32px'
            }}>
              Stop losing money to poor records. Stop missing growth opportunities.
              Start building a business that attracts serious investors.
            </p>

            {/* 3 Core Benefits */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '40px'
            }}>
              {[
                '✅ Track money with simple chat messages',
                '✅ Get instant business health insights',
                '✅ Follow proven growth playbook'
              ].map((benefit, idx) => (
                <div key={idx} style={{
                  fontSize: '16px',
                  color: usePremiumTheme ? 'var(--white-primary)' : '#333',
                  fontWeight: '500',
                  padding: usePremiumTheme ? '8px 12px' : '0',
                  background: usePremiumTheme ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                  borderRadius: usePremiumTheme ? '8px' : '0',
                  borderLeft: usePremiumTheme ? '3px solid var(--gold-primary)' : 'none'
                }}>
                  {benefit}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={onGetStarted}
                className={usePremiumTheme ? "btn-premium" : ""}
                style={!usePremiumTheme ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                } : { fontSize: '16px', padding: '16px 32px' }}
                onMouseEnter={(e) => {
                  if (!usePremiumTheme) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!usePremiumTheme) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                Start 14-Day Free Trial →
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className={usePremiumTheme ? "btn-premium-black" : ""}
                style={!usePremiumTheme ? {
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '14px 30px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                } : { fontSize: '16px' }}
                onMouseEnter={(e) => {
                  if (!usePremiumTheme) {
                    e.currentTarget.style.background = '#667eea';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!usePremiumTheme) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#667eea';
                  }
                }}
              >
                See How It Works
              </button>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#999',
              marginTop: '20px'
            }}>
              No credit card required • Setup in 2 minutes • Cancel anytime
            </p>
          </div>

          {/* Interactive Feature Showcase */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {/* Feature Tabs */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '12px'
            }}>
              {mvpFeatures.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeFeature === idx ? feature.color : '#999',
                    cursor: 'pointer',
                    borderBottom: activeFeature === idx ? `3px solid ${feature.color}` : 'none',
                    marginBottom: '-14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {feature.icon} {feature.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Active Feature Display */}
            <div style={{ minHeight: '300px' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {mvpFeatures[activeFeature].icon}
              </div>

              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#1a1a1a',
                textAlign: 'center'
              }}>
                {mvpFeatures[activeFeature].title}
              </h3>

              <p style={{
                fontSize: '16px',
                color: mvpFeatures[activeFeature].color,
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {mvpFeatures[activeFeature].subtitle}
              </p>

              <p style={{
                fontSize: '15px',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                {mvpFeatures[activeFeature].description}
              </p>

              <div style={{
                background: `linear-gradient(135deg, ${mvpFeatures[activeFeature].color}15, ${mvpFeatures[activeFeature].color}05)`,
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: mvpFeatures[activeFeature].color,
                  marginBottom: '4px'
                }}>
                  {mvpFeatures[activeFeature].stats}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Average result for our users
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '80px 24px',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#1a1a1a'
          }}>
            Three Tools That Transform Your Business
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '60px',
            maxWidth: '700px',
            margin: '0 auto 60px'
          }}>
            Everything you need to organize finances, understand your business, and attract investment.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {mvpFeatures.map((feature, idx) => (
              <div key={idx} style={{
                background: '#f8f9ff',
                borderRadius: '16px',
                padding: '40px',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = feature.color;
                e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  margin: '0 auto 24px'
                }}>
                  {feature.icon}
                </div>

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#1a1a1a'
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  fontSize: '16px',
                  color: feature.color,
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  {feature.subtitle}
                </p>

                <p style={{
                  fontSize: '15px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  {feature.description}
                </p>

                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: feature.color
                }}>
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        background: '#f8f9ff'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#1a1a1a'
          }}>
            Start Today, See Results in Days
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '60px'
          }}>
            Join 500+ SMEs already transforming their businesses
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}>
            {[
              {
                step: '1',
                title: 'Sign Up Free',
                description: 'Create your account in 30 seconds. No credit card needed.',
                time: '30 seconds'
              },
              {
                step: '2',
                title: 'Set Up Your Business',
                description: 'Answer 5 simple questions about your business type and size.',
                time: '2 minutes'
              },
              {
                step: '3',
                title: 'Start Tracking',
                description: 'Send your first transaction via chat. Watch the magic happen.',
                time: 'Instant'
              },
              {
                step: '4',
                title: 'Get Insights',
                description: 'See your business health score and growth opportunities.',
                time: 'Real-time'
              }
            ].map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 auto 20px'
                }}>
                  {step.step}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#1a1a1a'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  {step.description}
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  ⏱ {step.time}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onGetStarted}
            style={{
              background: usePremiumTheme
                ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: usePremiumTheme ? 'var(--black-primary)' : '#ffffff',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
            }}
          >
            Get Started Now - It's Free
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{
        padding: '80px 24px',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            marginBottom: '60px',
            color: '#1a1a1a'
          }}>
            Real Results from Real Businesses
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                name: 'Kofi Mensah',
                business: 'KM Electronics',
                location: 'Accra',
                result: 'Revenue up 45% in 3 months',
                text: 'I was drowning in Excel sheets. Now I just chat my sales and expenses. My accountant loves the clean reports!',
                avatar: '👨🏿‍💼'
              },
              {
                name: 'Ama Owusu',
                business: 'Fresh Foods Ghana',
                location: 'Kumasi',
                result: 'Secured ₵50,000 investment',
                text: 'The Growth Accelerator program transformed my business. Investors now take me seriously.',
                avatar: '👩🏿‍🌾'
              },
              {
                name: 'Samuel Adjei',
                business: 'TechHub Solutions',
                location: 'Tema',
                result: 'Saved 20 hours weekly',
                text: 'Business assessment showed me exactly where I was losing money. Fixed it in 2 weeks!',
                avatar: '👨🏿‍💻'
              }
            ].map((testimonial, idx) => (
              <div key={idx} style={{
                background: '#f8f9ff',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginRight: '16px'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#1a1a1a'
                    }}>
                      {testimonial.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {testimonial.business} • {testimonial.location}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}>
                  {testimonial.result}
                </div>

                <p style={{
                  fontSize: '15px',
                  color: '#666',
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '80px 24px',
        background: '#f8f9ff'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#1a1a1a'
          }}>
            Simple Pricing, Powerful Results
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '60px'
          }}>
            Start free, upgrade when you're ready
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            {/* Free Plan */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px',
              border: '2px solid #e0e0e0',
              position: 'relative'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                Starter
              </h3>
              <div style={{
                fontSize: '48px',
                fontWeight: '800',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                ₵0
              </div>
              <p style={{
                color: '#666',
                marginBottom: '32px'
              }}>
                Perfect for getting started
              </p>
              <div style={{
                textAlign: 'left',
                marginBottom: '32px'
              }}>
                {[
                  '✅ 50 transactions/month',
                  '✅ Basic record keeping',
                  '✅ Business health score',
                  '❌ Growth Accelerator',
                  '❌ Priority support'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    marginBottom: '12px',
                    fontSize: '15px',
                    color: feature.startsWith('✅') ? '#333' : '#999'
                  }}>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#667eea';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#667eea';
                }}
              >
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '40px',
              position: 'relative',
              color: '#ffffff',
              transform: 'scale(1.05)',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#4CAF50',
                color: '#ffffff',
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                MOST POPULAR
              </div>

              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
                marginTop: '12px'
              }}>
                Growth
              </h3>
              <div style={{
                fontSize: '48px',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                ₵99
              </div>
              <p style={{
                opacity: 0.9,
                marginBottom: '32px'
              }}>
                Everything to scale your business
              </p>
              <div style={{
                textAlign: 'left',
                marginBottom: '32px'
              }}>
                {[
                  '✅ Unlimited transactions',
                  '✅ Advanced analytics',
                  '✅ Growth Accelerator Program',
                  '✅ Investment readiness tools',
                  '✅ Priority support'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    marginBottom: '12px',
                    fontSize: '15px'
                  }}>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  color: '#667eea',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            marginBottom: '24px',
            color: '#ffffff'
          }}>
            Your Competition is Already Using This
          </h2>
          <p style={{
            fontSize: '20px',
            marginBottom: '40px',
            color: '#ffffff',
            opacity: 0.9
          }}>
            Every day you wait, you're losing money and missing opportunities.
            Join 500+ SMEs building investment-ready businesses.
          </p>

          <button
            onClick={onGetStarted}
            style={{
              background: '#ffffff',
              color: '#667eea',
              border: 'none',
              padding: '20px 48px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
          >
            Start Your Free Trial Now →
          </button>

          <p style={{
            fontSize: '16px',
            marginTop: '24px',
            color: '#ffffff',
            opacity: 0.8
          }}>
            No credit card • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a1a1a',
        color: '#ffffff',
        padding: '60px 24px 40px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Bvester
          </div>
          <p style={{
            fontSize: '14px',
            color: '#999',
            marginBottom: '32px',
            maxWidth: '400px',
            margin: '0 auto 32px'
          }}>
            Making African SMEs investment-ready, one business at a time.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '32px'
          }}>
            {['Privacy', 'Terms', 'Support', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  color: '#999',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                {link}
              </a>
            ))}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666'
          }}>
            © 2024 Bvester. All rights reserved.
          </p>
        </div>
      </footer>

      {/* CSS Styles */}
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }

            .mobile-menu-btn {
              display: block !important;
            }

            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default HomepageNew;