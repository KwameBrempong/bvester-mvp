import React, { useState, useEffect } from 'react';
import '../styles/homepage-revenue.css';

interface HomepageProps {
  onGetStarted: () => void;
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Assessment', href: '#assessment' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Trust', href: '#trust' },
  { label: 'Bootcamp', href: '#program' },
];


const Homepage: React.FC<HomepageProps> = ({ onGetStarted }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // User email for notifications
  const [userEmail, setUserEmail] = useState('');

  // Pricing state
  const [isAnnualPricing, setIsAnnualPricing] = useState(false);

  // Animation states
  const [liveStats, setLiveStats] = useState({
    assessments: 1247,
    raised: 2100000,
    investors: 156
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    // Animate live stats
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        assessments: prev.assessments + Math.floor(Math.random() * 3),
        raised: prev.raised + Math.floor(Math.random() * 10000),
        investors: prev.investors + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 5000);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  // Assessment functions - Redirect to enhanced Business Assessment
  const startAssessment = () => {
    // Set flag to indicate user wants to take the assessment after signup/login
    localStorage.setItem('assessment_intent', 'true');
    // Assessment intent set - user will see Business Assessment after profile completion
    // Redirect to sign up/login so user can access the enhanced Business Assessment
    onGetStarted();
  };


  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Pricing data structure
  const pricingPlans = {
    free: {
      name: 'Free',
      monthly: 0,
      annual: 0,
      description: 'Perfect for getting started',
      features: [
        '✓ Investment readiness assessment',
        '✓ Basic dashboard',
        '✓ 50 transaction records',
        '✓ Email support',
        '✗ Advanced analytics',
        '✗ Investor connections',
        '✗ Priority support'
      ]
    },
    growth: {
      name: 'Growth',
      monthly: 87,
      annual: 730,
      description: 'For growing businesses',
      popular: true,
      features: [
        '✓ Everything in Free',
        '✓ Unlimited transactions',
        '✓ Advanced analytics',
        '✓ Custom reports',
        '✓ Chat-based record keeping',
        '✓ Priority email support',
        '✗ Investor network access'
      ]
    },
    scale: {
      name: 'Scale',
      monthly: 497,
      annual: 4174,
      description: 'For investment-ready SMEs',
      features: [
        '✓ Everything in Growth',
        '✓ Investor network access',
        '✓ Dedicated account manager',
        '✓ Custom integrations',
        '✓ White-label reports',
        '✓ Phone & chat support',
        '✓ API access'
      ]
    }
  };

  const getPrice = (plan: keyof typeof pricingPlans) => {
    return isAnnualPricing ? pricingPlans[plan].annual : pricingPlans[plan].monthly;
  };

  const getAnnualSavings = (plan: keyof typeof pricingPlans) => {
    const monthlyTotal = pricingPlans[plan].monthly * 12;
    const annualPrice = pricingPlans[plan].annual;
    return monthlyTotal - annualPrice;
  };

  const getDiscountPercentage = (plan: keyof typeof pricingPlans) => {
    if (plan === 'free') return 0;
    const monthlyTotal = pricingPlans[plan].monthly * 12;
    const annualPrice = pricingPlans[plan].annual;
    const savings = monthlyTotal - annualPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className="homepage-revenue">
      {/* Navigation */}
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <a href="#home" className="nav__logo" onClick={() => handleNavClick('#home')}>
            <img src="/bvester-logo.png" alt="Bvester" className="nav__logo-img" />
            <span className="nav__logo-text">Bvester</span>
            <span className="nav__badge">SEC Pending</span>
          </a>

          <nav className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button type="button" onClick={() => handleNavClick(link.href)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="nav__cta nav__cta--mobile">
              <button className="btn btn--ghost" onClick={onGetStarted}>Log In</button>
              <button className="btn btn--primary" onClick={startAssessment}>Free Assessment</button>
            </div>
          </nav>

          <div className="nav__cta nav__cta--desktop">
            <button className="btn btn--ghost" onClick={onGetStarted}>Log In</button>
            <button className="btn btn--primary" onClick={startAssessment}>Start Free Assessment</button>
          </div>

          <button
            className={`nav__toggle ${menuOpen ? 'nav__toggle--open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero__content">
            <div className="hero__copy">
              <div className="hero__badge">
                🚨 Most SMEs fail investor meetings because of ONE missing piece
              </div>

              <h1>
                <span style={{ color: 'white', fontWeight: 'bold' }}>Is Your Business</span> <br />
                <span className="gradient-text" style={{ color: '#D4AF37', fontWeight: 'bold' }}>Investment Ready?</span>
              </h1>

              <p className="hero__subheading">
                Bridge the funding gap. Scale your business.
              </p>

              <p className="hero__subtitle">
                Take our 5-minute assessment and discover the blind spots costing you millions.
                Join {liveStats.assessments.toLocaleString()}+ SMEs who found their hidden potential.
              </p>

              <div className="hero__actions">
                <button
                  className="btn btn--primary btn--large pulse"
                  onClick={startAssessment}
                >
                  🎯 Start Free Assessment
                  <span className="btn__subtitle">Takes 5 minutes • Instant results</span>
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => handleNavClick('#program')}
                >
                  JOIN GROWTH ACCELERATOR
                </button>
              </div>

              <div className="hero__proof">
                <div className="proof__item">
                  <div className="proof__number">{liveStats.assessments.toLocaleString()}+</div>
                  <div className="proof__label">Assessments Completed</div>
                </div>
                <div className="proof__item">
                  <div className="proof__number">{formatCurrency(liveStats.raised)}</div>
                  <div className="proof__label">Capital Raised</div>
                </div>
                <div className="proof__item">
                  <div className="proof__number">{liveStats.investors}+</div>
                  <div className="proof__label">Active Investors</div>
                </div>
              </div>
            </div>

            <div className="hero__visual">
              <div className="assessment-preview">
                <div className="preview__header">
                  <span>Investment Readiness Score</span>
                  <div className="preview__badges">
                    <span className="badge badge--red">0-40 Critical</span>
                    <span className="badge badge--yellow">41-70 Potential</span>
                    <span className="badge badge--green">71-100 Ready</span>
                  </div>
                </div>

                <div className="score-circle">
                  <div className="circle-progress">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className="circle"
                        strokeDasharray="75, 100"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="score-text">
                      <span className="score-number">75</span>
                      <span className="score-label">Ready</span>
                    </div>
                  </div>
                </div>

                <div className="blind-spots">
                  <h4>Common Blind Spots We Find:</h4>
                  <ul>
                    <li>❌ Inconsistent financial tracking</li>
                    <li>❌ No investor-ready documents</li>
                    <li>❌ Unclear growth projections</li>
                    <li>❌ Missing compliance requirements</li>
                  </ul>
                </div>

                <button className="btn btn--outline" onClick={startAssessment}>
                  Find Your Blind Spots →
                </button>
              </div>
            </div>
          </div>

          {/* Floating Assessment Button - Mobile */}
          <div className="floating-cta">
            <button
              className="btn btn--primary btn--floating"
              onClick={startAssessment}
            >
              🎯 Start Assessment
            </button>
          </div>
        </section>

        {/* Live Activity Feed */}
        <section className="activity-feed">
          <div className="feed__container">
            <div className="feed__item">
              <span className="feed__avatar">👤</span>
              <span className="feed__text">Sarah from Kumasi just completed her assessment</span>
              <span className="feed__time">2 min ago</span>
            </div>
          </div>
        </section>

        {/* Quick Benefits Section */}
        <section className="quick-benefits">
          <div className="container">
            <div className="benefits__grid">
              <div className="benefit">
                <div className="benefit__icon">⚡</div>
                <h3>5-Minute Assessment</h3>
                <p>Get instant insights into your business readiness</p>
              </div>
              <div className="benefit">
                <div className="benefit__icon">🎯</div>
                <h3>Find Blind Spots</h3>
                <p>Discover what's holding you back from investment</p>
              </div>
              <div className="benefit">
                <div className="benefit__icon">🚀</div>
                <h3>Get Action Plan</h3>
                <p>Clear next steps to become investment ready</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features" id="features">
          <div className="container">
            <div className="section-header">
              <h2>Everything You Need to Scale</h2>
              <p>Comprehensive tools designed for African SMEs to manage, grow, and secure investment</p>
            </div>

            <div className="features__grid">
              <div className="feature-card">
                <div className="feature__icon">💬</div>
                <h3>Chat-Based Record Keeping</h3>
                <p>Log transactions like texting. Our AI categorizes everything automatically.</p>
                <div className="feature__benefits">
                  <span>✓ WhatsApp-style inputs</span>
                  <span>✓ Auto-categorization</span>
                  <span>✓ Investor-ready reports</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature__icon">📊</div>
                <h3>Investment Readiness Score</h3>
                <p>Real-time scoring system that shows exactly where you stand with investors.</p>
                <div className="feature__benefits">
                  <span>✓ Traffic light system</span>
                  <span>✓ Blind spot detection</span>
                  <span>✓ Action-based improvements</span>
                </div>
              </div>

              <div className="feature-card feature-card--premium">
                <div className="feature__badge">Most Popular</div>
                <div className="feature__icon">🚀</div>
                <h3>30-Day Bootcamp</h3>
                <p>Transform your business into an investment magnet in just 30 days.</p>
                <div className="feature__benefits">
                  <span>✓ Weekly live sessions</span>
                  <span>✓ 1-on-1 mentoring</span>
                  <span>✓ Investor introductions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing" id="pricing">
          <div className="container">
            <div className="section-header">
              <div className="section__badge">Simple Pricing</div>
              <h2>Choose Your Growth Path</h2>
              <p>Start free, upgrade when you're ready to scale</p>
            </div>

            {/* Pricing Toggle */}
            <div className="pricing-toggle">
              <div className="toggle-container">
                <span className={`toggle-label ${!isAnnualPricing ? 'active' : ''}`}>Monthly</span>
                <button
                  className={`pricing-toggle-btn ${isAnnualPricing ? 'annual' : 'monthly'}`}
                  onClick={() => setIsAnnualPricing(!isAnnualPricing)}
                  aria-label="Toggle between monthly and annual pricing"
                >
                  <div className="toggle-slider" />
                </button>
                <span className={`toggle-label ${isAnnualPricing ? 'active' : ''}`}>
                  Annual
                  <span className="discount-badge">Save 30%</span>
                </span>
              </div>
            </div>

            <div className="pricing__grid">
              {/* Free Tier */}
              <div className="pricing-card">
                <div className="pricing__header">
                  <h3>{pricingPlans.free.name}</h3>
                  <div className="pricing__price">
                    <span className="price__amount">₵{getPrice('free')}</span>
                    <span className="price__period">/{isAnnualPricing ? 'year' : 'month'}</span>
                  </div>
                  <p>{pricingPlans.free.description}</p>
                </div>

                <ul className="pricing__features">
                  {pricingPlans.free.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <button className="btn btn--outline" onClick={onGetStarted}>
                  Get Started Free
                </button>
              </div>

              {/* Growth Tier */}
              <div className="pricing-card pricing-card--popular">
                <div className="pricing__badge">Most Popular</div>
                <div className="pricing__header">
                  <h3>{pricingPlans.growth.name}</h3>
                  <div className="pricing__price">
                    <span className="price__amount">₵{getPrice('growth')}</span>
                    <span className="price__period">/{isAnnualPricing ? 'year' : 'month'}</span>
                    {isAnnualPricing && (
                      <div className="price__savings">
                        Save ₵{getAnnualSavings('growth')} ({getDiscountPercentage('growth')}% off)
                      </div>
                    )}
                  </div>
                  <p>{pricingPlans.growth.description}</p>
                </div>

                <ul className="pricing__features">
                  {pricingPlans.growth.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <button className="btn btn--primary" onClick={onGetStarted}>
                  Start Growth Trial
                </button>
              </div>

              {/* Scale Tier */}
              <div className="pricing-card">
                <div className="pricing__header">
                  <h3>{pricingPlans.scale.name}</h3>
                  <div className="pricing__price">
                    <span className="price__amount">₵{getPrice('scale')}</span>
                    <span className="price__period">/{isAnnualPricing ? 'year' : 'month'}</span>
                    {isAnnualPricing && (
                      <div className="price__savings">
                        Save ₵{getAnnualSavings('scale')} ({getDiscountPercentage('scale')}% off)
                      </div>
                    )}
                  </div>
                  <p>{pricingPlans.scale.description}</p>
                </div>

                <ul className="pricing__features">
                  {pricingPlans.scale.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <button className="btn btn--gold" onClick={onGetStarted}>
                  Go Scale
                </button>
              </div>
            </div>

            <div className="pricing__footer">
              <p>🔒 All plans include bank-level security • Cancel anytime • No setup fees</p>
              <div className="pricing__cta">
                <h3>Not sure which plan is right for you?</h3>
                <button className="btn btn--ghost" onClick={startAssessment}>
                  Take the assessment first →
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* Trust & Authority Section */}
        <section className="trust-authority" id="trust">
          <div className="container">
            <div className="section-header">
              <div className="section__badge">Trust & Authority</div>
              <h2>Built by Investment Professionals</h2>
              <p>Backed by industry experts who understand African markets</p>
            </div>

            <div className="trust__grid">
              {/* SEC Status */}
              <div className="trust-card trust-card--sec">
                <div className="trust__icon">⚖️</div>
                <h3>SEC License Pending</h3>
                <p>Currently awaiting Securities and Exchange Commission license approval</p>
                <div className="sec-countdown">
                  <div className="countdown__item">
                    <span className="countdown__number">45</span>
                    <span className="countdown__label">Days Est.</span>
                  </div>
                  <div className="countdown__status">
                    <span className="status__dot status__dot--pending"></span>
                    <span>Application Under Review</span>
                  </div>
                </div>
              </div>

              {/* Team Expertise */}
              <div className="trust-card">
                <div className="trust__icon">👥</div>
                <h3>Expert Team</h3>
                <p>15+ years combined experience in African financial markets</p>
                <div className="team__stats">
                  <div className="team-stat">
                    <strong>₵500M+</strong>
                    <span>Capital Facilitated</span>
                  </div>
                  <div className="team-stat">
                    <strong>200+</strong>
                    <span>SMEs Funded</span>
                  </div>
                </div>
              </div>

              {/* Industry Recognition */}
              <div className="trust-card">
                <div className="trust__icon">🏆</div>
                <h3>Industry Recognition</h3>
                <p>Featured in leading African fintech publications</p>
                <div className="recognition__logos">
                  <div className="logo-item">TechPoint Africa</div>
                  <div className="logo-item">Ghana Business News</div>
                  <div className="logo-item">Fintech Ghana</div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="trust-card">
                <div className="trust__icon">🔒</div>
                <h3>Bank-Level Security</h3>
                <p>Your data is protected with enterprise-grade encryption</p>
                <div className="security__badges">
                  <div className="security-badge">
                    <span>🛡️</span>
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="security-badge">
                    <span>🔐</span>
                    <span>SOC 2 Compliant</span>
                  </div>
                  <div className="security-badge">
                    <span>🏦</span>
                    <span>Banking Standard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Section */}
            <div className="partnerships">
              <h3>Trusted Partners</h3>
              <div className="partners__grid">
                <div className="partner-logo">
                  <img src="/api/placeholder/120/60" alt="Ghana Stock Exchange" />
                  <span>Ghana Stock Exchange</span>
                </div>
                <div className="partner-logo">
                  <img src="/api/placeholder/120/60" alt="African Development Bank" />
                  <span>African Development Bank</span>
                </div>
                <div className="partner-logo">
                  <img src="/api/placeholder/120/60" alt="IFC World Bank" />
                  <span>IFC - World Bank Group</span>
                </div>
                <div className="partner-logo">
                  <img src="/api/placeholder/120/60" alt="Ghana Investment Fund" />
                  <span>Ghana Investment Fund</span>
                </div>
              </div>
            </div>

            {/* Regulatory Compliance */}
            <div className="compliance">
              <div className="compliance__badge">
                <div className="compliance__icon">📋</div>
                <div className="compliance__text">
                  <h4>Regulatory Compliant</h4>
                  <p>Adheres to all Ghana SEC and Bank of Ghana regulations</p>
                </div>
              </div>
              <div className="compliance__features">
                <div className="compliance-item">✓ Anti-Money Laundering (AML)</div>
                <div className="compliance-item">✓ Know Your Customer (KYC)</div>
                <div className="compliance-item">✓ Data Protection Compliance</div>
                <div className="compliance-item">✓ Regular Security Audits</div>
              </div>
            </div>
          </div>
        </section>

        {/* Accelerator Program Section */}
        <section className="accelerator-program" id="program">
          <div className="container">
            <div className="section-header">
              <div className="section__badge">🚀 Featured Program</div>
              <h2>30-Day Investment Readiness Bootcamp</h2>
              <p>Transform your business into an investment magnet in just 30 days</p>
            </div>

            <div className="program__hero">
              <div className="program__visual">
                <div className="program-timeline">
                  <h3>Your 30-Day Journey</h3>
                  <div className="timeline">
                    <div className="timeline-item timeline-item--active">
                      <div className="timeline__day">Days 1-7</div>
                      <div className="timeline__phase">Foundation</div>
                      <div className="timeline__desc">Financial record cleanup & organization</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline__day">Days 8-15</div>
                      <div className="timeline__phase">Strategy</div>
                      <div className="timeline__desc">Business model optimization & projections</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline__day">Days 16-23</div>
                      <div className="timeline__phase">Pitch Deck</div>
                      <div className="timeline__desc">Investor-ready presentation creation</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline__day">Days 24-30</div>
                      <div className="timeline__phase">Connections</div>
                      <div className="timeline__desc">Direct investor introductions</div>
                    </div>
                  </div>
                </div>

                <div className="program-stats">
                  <div className="stat-item">
                    <span className="stat__number">89%</span>
                    <span className="stat__label">Success Rate</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat__number">₵15M+</span>
                    <span className="stat__label">Average Funding</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat__number">45 Days</span>
                    <span className="stat__label">Avg. Time to Funding</span>
                  </div>
                </div>
              </div>

              <div className="program__content">
                <div className="program-guarantee">
                  <div className="guarantee__badge">💰 Money-Back Guarantee</div>
                  <h4>Get Funding or Get Refunded</h4>
                  <p>If you don't secure investor meetings within 60 days of completing the program, we'll refund 100% of your investment.</p>
                </div>

                <div className="program-includes">
                  <h4>What's Included:</h4>
                  <ul className="includes-list">
                    <li>✅ 4 Weekly live group sessions (2 hours each)</li>
                    <li>✅ 1-on-1 mentoring with investment experts</li>
                    <li>✅ Custom pitch deck creation</li>
                    <li>✅ Direct introductions to 5+ investors</li>
                    <li>✅ Investment readiness certification</li>
                    <li>✅ Lifetime access to investor network</li>
                    <li>✅ 24/7 WhatsApp support group</li>
                  </ul>
                </div>

                <div className="program-pricing">
                  <div className="price-strike">
                    <span className="original-price">₵5,000</span>
                    <span className="discount-badge">70% OFF</span>
                  </div>
                  <div className="current-price">
                    <span className="price-amount">₵1,500</span>
                    <span className="price-period">one-time</span>
                  </div>
                  <div className="price-note">Limited time offer - Next cohort starts in 5 days</div>
                </div>

                <div className="program-cta">
                  <button className="btn btn--gold btn--large">
                    🚀 Join Next Cohort - ₵1,500
                  </button>
                  <div className="cta-bonus">
                    <strong>Bonus:</strong> Complete assessment first and get additional ₵500 off
                  </div>
                </div>
              </div>
            </div>

            {/* Program Curriculum */}
            <div className="program-curriculum">
              <h3>Complete Curriculum Breakdown</h3>
              <div className="curriculum__grid">
                <div className="curriculum-week">
                  <div className="week__header">
                    <span className="week__number">Week 1</span>
                    <h4>Foundation Building</h4>
                  </div>
                  <ul className="week__topics">
                    <li>Financial record organization</li>
                    <li>Cash flow optimization</li>
                    <li>Key metric identification</li>
                    <li>Investment readiness assessment</li>
                  </ul>
                  <div className="week__session">
                    <strong>Live Session:</strong> Monday 7PM - 9PM GMT
                  </div>
                </div>

                <div className="curriculum-week">
                  <div className="week__header">
                    <span className="week__number">Week 2</span>
                    <h4>Business Strategy</h4>
                  </div>
                  <ul className="week__topics">
                    <li>Market analysis & positioning</li>
                    <li>Competitive advantage mapping</li>
                    <li>Revenue model optimization</li>
                    <li>Growth projections</li>
                  </ul>
                  <div className="week__session">
                    <strong>Live Session:</strong> Monday 7PM - 9PM GMT
                  </div>
                </div>

                <div className="curriculum-week">
                  <div className="week__header">
                    <span className="week__number">Week 3</span>
                    <h4>Investor Materials</h4>
                  </div>
                  <ul className="week__topics">
                    <li>Pitch deck creation</li>
                    <li>Financial projections</li>
                    <li>Due diligence preparation</li>
                    <li>Investor Q&A practice</li>
                  </ul>
                  <div className="week__session">
                    <strong>Live Session:</strong> Monday 7PM - 9PM GMT
                  </div>
                </div>

                <div className="curriculum-week">
                  <div className="week__header">
                    <span className="week__number">Week 4</span>
                    <h4>Investor Connections</h4>
                  </div>
                  <ul className="week__topics">
                    <li>Investor matching</li>
                    <li>Introduction facilitation</li>
                    <li>Pitch presentation</li>
                    <li>Follow-up strategy</li>
                  </ul>
                  <div className="week__session">
                    <strong>Live Session:</strong> Monday 7PM - 9PM GMT
                  </div>
                </div>
              </div>
            </div>


            {/* Next Cohort Info */}
            <div className="cohort-info">
              <div className="cohort__urgency">
                <h3>🔥 Next Cohort Starting Soon</h3>
                <div className="cohort__countdown">
                  <div className="countdown-timer">
                    <div className="timer-item">
                      <span className="timer__number">5</span>
                      <span className="timer__label">Days</span>
                    </div>
                    <div className="timer-item">
                      <span className="timer__number">12</span>
                      <span className="timer__label">Hours</span>
                    </div>
                    <div className="timer-item">
                      <span className="timer__number">34</span>
                      <span className="timer__label">Minutes</span>
                    </div>
                  </div>
                  <p>Only 8 spots left in this cohort!</p>
                </div>
              </div>

              <div className="cohort__action">
                <button className="btn btn--gold btn--large pulse" onClick={startAssessment}>
                  Take Assessment & Get ₵500 Off
                </button>
                <p className="action-note">
                  Complete assessment first, then join at the discounted rate of ₵1,000
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OLD Assessment Modal - Now redirects to enhanced Business Assessment
        {showAssessment && (
          <div className="assessment-modal">
            <div className="modal__backdrop" onClick={() => setShowAssessment(false)} />
            <div className="modal__content">
              {!showResults ? (
                <div className="assessment__question">
                  <div className="question__header">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${((currentQuestion + 1) / assessmentQuestions.length) * 100}%` }}
                      />
                    </div>
                    <span className="question__counter">
                      {currentQuestion + 1} of {assessmentQuestions.length}
                    </span>
                  </div>

                  <h3 className="question__text">
                    {assessmentQuestions[currentQuestion].question}
                  </h3>

                  <div className="question__options">
                    {assessmentQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        className="option__button"
                        onClick={() => handleAnswer(option.score)}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="assessment__results">
                  <div className="results__header">
                    <h2>Your Investment Readiness Score</h2>
                    <button
                      className="modal__close"
                      onClick={() => setShowAssessment(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="results__score">
                    <div
                      className="score-display"
                      style={{ color: getScoreColor(assessmentScore || 0) }}
                    >
                      <span className="score-number">{countingScore}</span>
                      <span className="score-max">/100</span>
                    </div>
                    <div
                      className="score-status"
                      style={{ color: getScoreColor(assessmentScore || 0) }}
                    >
                      {getScoreLabel(assessmentScore || 0)}
                    </div>
                  </div>

                  <div className="results__insight">
                    <h4>Your Critical Blind Spot:</h4>
                    <p>
                      {assessmentScore && assessmentScore <= 40
                        ? "Your financial records need immediate attention - this is the #1 reason SMEs get rejected by investors."
                        : assessmentScore && assessmentScore <= 70
                        ? "You have potential but lack the structured approach investors look for - we can fix this in 30 days."
                        : "You're close to investment ready! A few tweaks and you'll be unstoppable."
                      }
                    </p>
                  </div>

                  <div className="results__actions">
                    <div className="email-capture">
                      <h4>Get Your Complete Report + Action Plan</h4>
                      <div className="email-form">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="email-input"
                        />
                        <button className="btn btn--primary">
                          Get Free Report
                        </button>
                      </div>
                      <p className="email-disclaimer">
                        We'll send your detailed assessment + a 30-day action plan to become investment ready
                      </p>
                    </div>

                    <div className="upgrade-offer">
                      <div className="offer__badge">⚡ Limited Time</div>
                      <h4>Skip the Wait - Join Our 30-Day Bootcamp</h4>
                      <p>Transform your business into an investment magnet</p>
                      <button className="btn btn--gold btn--large">
                        Join Bootcamp - ₵1,500
                        <span className="original-price">₵3,000</span>
                      </button>
                      <div className="offer__features">
                        ✅ Fix all your blind spots in 30 days<br/>
                        ✅ Direct investor introductions<br/>
                        ✅ Investment-ready pitch deck
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )} */}
      </main>
    </div>
  );
};

export default Homepage;