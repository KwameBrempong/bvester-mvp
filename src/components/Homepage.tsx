import React, { useState } from 'react';

interface HomepageProps {
  onGetStarted: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Store email for later signup
      localStorage.setItem('preSignupEmail', email);
      onGetStarted();
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2E8B57 0%, #1e5f3f 100%)',
        color: 'white',
        padding: '60px 20px 80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 1
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Navigation */}
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '60px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              Bvester
            </div>
            <button
              onClick={onGetStarted}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              Sign In
            </button>
          </nav>

          {/* Hero Content */}
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 'bold',
              marginBottom: '24px',
              lineHeight: '1.2',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              Turn Your Business Into an
              <span style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                marginTop: '10px'
              }}>
                Investment Magnet
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              marginBottom: '40px',
              opacity: 0.95,
              lineHeight: '1.5',
              fontWeight: '300'
            }}>
              AI-powered tools that help Ghanaian SMEs grow revenue, streamline operations,
              and become irresistible to investors — all in one platform.
            </p>

            {/* Key Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '20px',
              marginBottom: '50px',
              maxWidth: '600px',
              margin: '0 auto 50px auto'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700' }}>500+</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Active SMEs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700' }}>₵2.5M+</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Revenue Tracked</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700' }}>15hrs</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Saved/Week</div>
              </div>
            </div>

            {/* CTA Form */}
            <form onSubmit={handleEmailSignup} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{
                display: 'flex',
                width: '100%',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
                padding: '6px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                flexDirection: 'column',
                gap: '10px'
              }}
              className="hero-form"
              >
                <style>
                  {`
                    @media (min-width: 768px) {
                      .hero-form {
                        flex-direction: row !important;
                        gap: 0 !important;
                      }
                    }
                  `}
                </style>
                <input
                  type="email"
                  placeholder="Enter your business email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    border: 'none',
                    background: 'transparent',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    borderRadius: '25px'
                  }}
                  className="hero-input"
                />
                <style>
                  {`
                    @media (min-width: 768px) {
                      .hero-input {
                        border-radius: 0 !important;
                      }
                    }
                  `}
                </style>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#2E8B57',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
                  }}
                >
                  Start Free Trial
                </button>
              </div>
              <p style={{
                fontSize: '14px',
                opacity: 0.8,
                margin: 0
              }}>
                🔥 <strong>Early Bird Special:</strong> 50% off first 3 months • No credit card required
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{
        padding: '80px 20px',
        background: '#f8f9fa'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#2c3e50'
          }}>
            Are You Struggling With These Business Challenges?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginTop: '50px'
          }}>
            {[
              {
                icon: '📊',
                title: 'No Clear Financial Picture',
                description: 'Spending hours on spreadsheets but still can\'t see where your money goes or how profitable you really are.'
              },
              {
                icon: '💸',
                title: 'Missing Growth Opportunities',
                description: 'Feeling stuck at the same revenue level with no clear path to scale or attract serious investors.'
              },
              {
                icon: '⏰',
                title: 'Drowning in Admin Work',
                description: 'Wasting 15+ hours weekly on bookkeeping and reporting instead of growing your business.'
              },
              {
                icon: '🚫',
                title: 'Investment-Ready? No Idea.',
                description: 'Want to raise capital but don\'t know if your business is attractive to investors or what to improve.'
              }
            ].map((problem, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '40px 30px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px'
                }}>
                  {problem.icon}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: '#2c3e50'
                }}>
                  {problem.title}
                </h3>
                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}>
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Preview */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            What If You Could Solve All of This in One Platform?
          </h2>
          <p style={{
            fontSize: '20px',
            marginBottom: '40px',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Bvester gives you AI-powered business intelligence, automated bookkeeping,
            and a proven growth framework that has helped 500+ SMEs become investment-ready.
          </p>
          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#2E8B57',
              border: 'none',
              padding: '20px 40px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.3)';
            }}
          >
            See How It Works — Free Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#2c3e50'
            }}>
              Three Game-Changing Tools for SME Growth
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Everything you need to scale your business and attract investors, powered by AI
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            {[
              {
                icon: '🚀',
                title: 'Growth Accelerator Program',
                subtitle: 'Your Path to Investment Readiness',
                description: 'Step-by-step framework that has helped 200+ businesses increase revenue by 40% and become irresistible to investors.',
                features: [
                  '✅ Personalized growth strategy',
                  '✅ Investment readiness assessment',
                  '✅ Revenue optimization playbook',
                  '✅ Investor pitch preparation'
                ],
                highlight: 'Most Popular',
                color: '#2E8B57'
              },
              {
                icon: '💬',
                title: 'AI-Powered Quick Record',
                subtitle: 'Bookkeeping Made Simple',
                description: 'Chat with our AI to record transactions instantly. No more spreadsheets, no more confusion — just smart, automated bookkeeping.',
                features: [
                  '✅ Chat-style transaction entry',
                  '✅ Auto-categorization',
                  '✅ Real-time financial insights',
                  '✅ Export to any format'
                ],
                highlight: 'Time Saver',
                color: '#32CD32'
              },
              {
                icon: '📊',
                title: 'Business Intelligence Dashboard',
                subtitle: 'See Your Business Like Never Before',
                description: 'Get instant insights that usually cost ₵50,000+ from consultants. See exactly where your money goes and how to optimize.',
                features: [
                  '✅ Real-time profit analysis',
                  '✅ Cash flow predictions',
                  '✅ Growth opportunities AI',
                  '✅ Investor-ready reports'
                ],
                highlight: 'AI-Powered',
                color: '#FF6B6B'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.1)';
              }}>
                {/* Highlight Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  {feature.highlight}
                </div>

                <div style={{
                  fontSize: '64px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {feature.icon}
                </div>

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#2c3e50',
                  textAlign: 'center'
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  fontSize: '16px',
                  color: feature.color,
                  fontWeight: '600',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {feature.subtitle}
                </p>

                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  fontSize: '16px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  {feature.description}
                </p>

                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  {feature.features.map((feat, idx) => (
                    <div key={idx} style={{
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      {feat}
                    </div>
                  ))}
                </div>

                <button
                  onClick={onGetStarted}
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                    color: 'white',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Try This Feature
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section style={{
        padding: '80px 20px',
        background: '#f8f9fa'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#2c3e50'
            }}>
              Join 500+ Growing Businesses
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              See why SMEs across Ghana trust Bvester to grow their businesses
            </p>
          </div>

          {/* Success Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}>
            {[
              { number: '₵2.5M+', label: 'Revenue Tracked Monthly' },
              { number: '15hrs', label: 'Average Time Saved/Week' },
              { number: '40%', label: 'Average Revenue Increase' },
              { number: '92%', label: 'Customer Satisfaction' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '30px 20px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#2E8B57',
                  marginBottom: '8px'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                name: 'Kwame Asante',
                business: 'Asante Trading Ltd',
                location: 'Kumasi',
                text: 'Bvester helped us increase revenue by 45% in just 6 months. The Growth Accelerator program showed us exactly what investors look for.',
                avatar: '👨🏿‍💼'
              },
              {
                name: 'Akosua Mensah',
                business: 'Fresh Farms Ghana',
                location: 'Accra',
                text: 'Before Bvester, I spent 20 hours a week on bookkeeping. Now it takes me 2 hours with their AI chat feature. Game changer!',
                avatar: '👩🏿‍🌾'
              },
              {
                name: 'Emmanuel Tetteh',
                business: 'TechSolutions GH',
                location: 'Tema',
                text: 'The business insights dashboard revealed profit leaks I never knew existed. Fixed them and improved our margins by 30%.',
                avatar: '👨🏿‍💻'
              }
            ].map((testimonial, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8'
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
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#2c3e50',
                      marginBottom: '4px'
                    }}>
                      {testimonial.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#2E8B57',
                      fontWeight: '600'
                    }}>
                      {testimonial.business}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      📍 {testimonial.location}
                    </div>
                  </div>
                </div>
                <p style={{
                  color: '#555',
                  lineHeight: '1.6',
                  fontSize: '16px',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.text}"
                </p>
                <div style={{
                  color: '#FFD700',
                  fontSize: '18px',
                  marginTop: '16px'
                }}>
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #2E8B57 0%, #1e5f3f 100%)',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            Special Launch Pricing
          </h2>
          <p style={{
            fontSize: '20px',
            marginBottom: '50px',
            opacity: 0.9
          }}>
            🔥 Early Bird Special: Get 50% off your first 3 months
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Free Plan */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '40px 30px',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Starter
              </h3>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                FREE
              </div>
              <p style={{
                opacity: 0.8,
                marginBottom: '30px'
              }}>
                Perfect for getting started
              </p>
              <div style={{
                textAlign: 'left',
                marginBottom: '30px'
              }}>
                {[
                  '✅ Up to 20 transactions/month',
                  '✅ Basic business insights',
                  '✅ Email support',
                  '❌ Growth Accelerator',
                  '❌ Advanced analytics'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                Start Free
              </button>
            </div>

            {/* Pro Plan - Most Popular */}
            <div style={{
              background: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              color: '#2c3e50',
              position: 'relative',
              transform: 'scale(1.05)',
              border: '3px solid #FFD700'
            }}>
              {/* Popular Badge */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#2E8B57',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
              }}>
                🔥 MOST POPULAR
              </div>

              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
                marginTop: '20px'
              }}>
                Pro
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  color: '#666',
                  textDecoration: 'line-through',
                  marginRight: '8px'
                }}>
                  ₵199
                </span>
                <span style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#2E8B57'
                }}>
                  ₵99
                </span>
                <span style={{
                  fontSize: '16px',
                  color: '#666',
                  marginLeft: '4px'
                }}>
                  /month
                </span>
              </div>
              <p style={{
                color: '#e74c3c',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                50% OFF for 3 months!
              </p>
              <div style={{
                textAlign: 'left',
                marginBottom: '30px'
              }}>
                {[
                  '✅ Unlimited transactions',
                  '✅ Growth Accelerator Program',
                  '✅ Advanced AI insights',
                  '✅ Priority support',
                  '✅ Export capabilities',
                  '✅ Investment readiness tools'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2E8B57, #3CB371)',
                  border: 'none',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(46, 139, 87, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(46, 139, 87, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 139, 87, 0.3)';
                }}
              >
                Start Pro Trial
              </button>
            </div>

            {/* Business Plan */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '40px 30px',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Business
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  opacity: 0.6,
                  textDecoration: 'line-through',
                  marginRight: '8px'
                }}>
                  ₵399
                </span>
                <span style={{
                  fontSize: '48px',
                  fontWeight: 'bold'
                }}>
                  ₵199
                </span>
                <span style={{
                  fontSize: '16px',
                  opacity: 0.8,
                  marginLeft: '4px'
                }}>
                  /month
                </span>
              </div>
              <p style={{
                color: '#FFD700',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                50% OFF for 3 months!
              </p>
              <div style={{
                textAlign: 'left',
                marginBottom: '30px'
              }}>
                {[
                  '✅ Everything in Pro',
                  '✅ Multi-user access (10 users)',
                  '✅ Custom branding',
                  '✅ Phone support',
                  '✅ Advanced integrations',
                  '✅ Dedicated success manager'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                Start Business Trial
              </button>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            opacity: 0.8,
            marginTop: '40px'
          }}>
            💡 All plans include 14-day free trial • Cancel anytime • No setup fees
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#2c3e50'
          }}>
            Ready to Transform Your Business?
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Join 500+ SMEs already using Bvester to grow revenue, streamline operations,
            and prepare for investment opportunities.
          </p>

          {/* Urgency Elements */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#856404',
              marginBottom: '8px'
            }}>
              ⏰ Limited Time Offer
            </div>
            <div style={{
              color: '#856404',
              fontSize: '16px'
            }}>
              Only <strong>47 spots left</strong> in our Growth Accelerator program this month.
              Early bird pricing ends in 5 days!
            </div>
          </div>

          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg, #2E8B57, #3CB371)',
              color: 'white',
              border: 'none',
              padding: '24px 48px',
              borderRadius: '30px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(46, 139, 87, 0.3)',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(46, 139, 87, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(46, 139, 87, 0.3)';
            }}
          >
            🚀 Start Your Free Trial Now
          </button>

          <p style={{
            fontSize: '14px',
            color: '#999',
            marginTop: '16px'
          }}>
            No credit card required • 14-day free trial • Setup takes 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2c3e50',
        color: 'white',
        padding: '60px 20px 40px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Company Info */}
            <div>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#2E8B57'
              }}>
                Bvester
              </div>
              <p style={{
                color: '#bdc3c7',
                lineHeight: '1.6',
                marginBottom: '20px'
              }}>
                Empowering Ghanaian SMEs with AI-powered tools to grow revenue,
                streamline operations, and attract investors.
              </p>
              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                {['📧', '📱', '🌐'].map((icon, idx) => (
                  <div key={idx} style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(46, 139, 87, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2E8B57';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(46, 139, 87, 0.2)';
                  }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'white'
              }}>
                Features
              </h4>
              {[
                'Growth Accelerator',
                'Quick Record',
                'Business Analysis',
                'Investment Tools',
                'Pricing'
              ].map((link, idx) => (
                <div key={idx} style={{
                  marginBottom: '8px',
                  color: '#bdc3c7',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2E8B57';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#bdc3c7';
                }}>
                  {link}
                </div>
              ))}
            </div>

            {/* Support */}
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'white'
              }}>
                Support
              </h4>
              {[
                'Help Center',
                'Contact Us',
                'Live Chat',
                'Tutorials',
                'Success Stories'
              ].map((link, idx) => (
                <div key={idx} style={{
                  marginBottom: '8px',
                  color: '#bdc3c7',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2E8B57';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#bdc3c7';
                }}>
                  {link}
                </div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'white'
              }}>
                Contact
              </h4>
              <div style={{
                color: '#bdc3c7',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '8px' }}>📍 Accra, Ghana</div>
                <div style={{ marginBottom: '8px' }}>📧 hello@bvester.com</div>
                <div style={{ marginBottom: '8px' }}>📱 +233 XX XXX XXXX</div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid #34495e',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{
              color: '#bdc3c7',
              fontSize: '14px'
            }}>
              © 2024 Bvester. All rights reserved.
            </div>
            <div style={{
              display: 'flex',
              gap: '20px',
              fontSize: '14px'
            }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link, idx) => (
                <div key={idx} style={{
                  color: '#bdc3c7',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2E8B57';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#bdc3c7';
                }}>
                  {link}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;