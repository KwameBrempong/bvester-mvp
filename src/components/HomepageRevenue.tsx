import React, { useState, useEffect } from 'react';
import '../styles/homepage-revenue.css';
import '../styles/homepage-fixes.css';
import '../styles/homepage-enhanced.css';
import { PRICING_CONFIG, formatPrice, calculateAnnualSavings, getFoundingMemberSpotInfo, isFoundingMemberEligible } from '../config/pricingConfig';
import '../styles/homepage-animations.css';

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

    // Dynamic activity feed messages
    const activityMessages = [
      "Sarah from Kumasi just completed her assessment",
      "Kwame from Accra just improved his score by 25 points",
      "Akosua from Takoradi just received her business roadmap",
      "Michael from Tema just connected with 3 investors",
      "Grace from Cape Coast just generated her financial report",
      "Emmanuel from Tamale just started his 90-day journey",
      "Ama from Ho just completed week 1 of building",
      "Joseph from Sunyani just received funding interest",
      "Adwoa from Koforidua just unlocked investor matching",
      "David from Bolgatanga just improved to investment-ready status"
    ];

    let messageIndex = 0;
    const activityInterval = setInterval(() => {
      const activityText = document.getElementById('activity-text');
      if (activityText) {
        messageIndex = (messageIndex + 1) % activityMessages.length;
        activityText.textContent = activityMessages[messageIndex];
      }
    }, 4000);

    // Scroll animations - reveal elements on scroll
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-left, .animate-right, .animate-scale');
    animatedElements.forEach(el => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      clearInterval(activityInterval);
      animatedElements.forEach(el => observer.unobserve(el));
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

  // State for pricing configuration
  const [foundingMemberEligible, setFoundingMemberEligible] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(0);

  // Check founding member eligibility on component mount
  useEffect(() => {
    const checkFoundingMember = async () => {
      const eligible = await isFoundingMemberEligible();
      const spotInfo = await getFoundingMemberSpotInfo();

      setFoundingMemberEligible(eligible);
      setSpotsRemaining(spotInfo.remaining);
    };

    checkFoundingMember();
  }, []);

  // Get pricing tiers from config
  const pricingTiers = Object.values(PRICING_CONFIG);

  // Helper functions for new pricing structure
  const getDisplayPrice = (tier: typeof PRICING_CONFIG.starter, showUSD = false) => {
    const pricing = isAnnualPricing ? tier.price.annual : tier.price.monthly;
    const currency = showUSD ? tier.currency.display.usd : tier.currency.display.ghs;
    const amount = isAnnualPricing ? currency.annual : currency.monthly;

    if (foundingMemberEligible && tier.foundingMember?.enabled) {
      const foundingPrice = isAnnualPricing ? tier.foundingMember.discountedPrice.annual : tier.foundingMember.discountedPrice.monthly;
      return foundingPrice;
    }

    return amount;
  };

  const getOriginalPrice = (tier: typeof PRICING_CONFIG.starter) => {
    return isAnnualPricing ? tier.price.annual : tier.price.monthly;
  };

  const hasFoundingDiscount = (tier: typeof PRICING_CONFIG.starter) => {
    return foundingMemberEligible && tier.foundingMember?.enabled;
  };

  return (
    <div className="homepage-revenue">
      {/* Navigation */}
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <a href="#home" className="nav__logo" onClick={() => handleNavClick('#home')}>
            <img src="/bvester-logo.png" alt="Bvester" className="nav__logo-img" />
            <span className="nav__logo-text">Bvester</span>
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
              <div className="hero__badge animate-on-scroll">
                🚀 Exclusive Launch: First 1,000 Founding Members
              </div>

              <h1 className="hero__headline">
                <span className="headline-line1">Your Business Is Worth Millions.</span>
                <span className="headline-line2">You Just Can't Prove It... Yet.</span>
              </h1>

              <p className="hero__subtitle">
                Discover exactly what's blocking your funding and transform
                into an investment-ready business in 90 days.
              </p>

              <p className="hero__authority">
                Built by former investment bankers who've evaluated
                billions in funding applications across Africa.
              </p>

              <div className="hero__actions">
                <button
                  className="btn btn--primary btn--large pulse"
                  onClick={startAssessment}
                >
                  Get My Free Business Assessment →
                  <span className="btn__subtitle">Takes 5 minutes • No credit card • Instant results</span>
                </button>
                <button
                  className="btn btn--secondary"
                  onClick={() => handleNavClick('#how-it-works')}
                >
                  See How It Works
                </button>
              </div>

              <div className="hero__trust-indicators">
                <span className="trust-item">🔒 Bank-Level Security</span>
                <span className="trust-divider">|</span>
                <span className="trust-item">⚡ No Credit Card Required</span>
              </div>

              <div className="founding-member-counter">
                <div className="counter-label">🔥 Founding Member Spots:</div>
                <div className="counter-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '36.7%' }}></div>
                  </div>
                  <span className="progress-text">367/1,000 claimed</span>
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

        {/* Problem Recognition Section */}
        <section className="problem-section" id="problem">
          <div className="container">
            <div className="problem__content animate-on-scroll">
              <h2 className="section__title">Why Do Banks Keep Saying No?</h2>
              <p className="section__subtitle">
                It's not your business. It's your presentation.
              </p>

              <div className="problems__grid">
                <div className="problem__item animate-left">
                  <span className="problem__icon">❌</span>
                  <p>Your financials are scattered across Excel sheets</p>
                </div>
                <div className="problem__item animate-right">
                  <span className="problem__icon">❌</span>
                  <p>You don't know your actual business valuation</p>
                </div>
                <div className="problem__item animate-left">
                  <span className="problem__icon">❌</span>
                  <p>Your records don't meet investor standards</p>
                </div>
                <div className="problem__item animate-right">
                  <span className="problem__icon">❌</span>
                  <p>You're missing critical documents investors need</p>
                </div>
              </div>

              <div className="problem__conclusion">
                <p className="highlight-text">
                  One missing piece = automatic rejection.<br/>
                  <strong>We help you fix every single gap.</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works" id="how-it-works">
          <div className="container">
            <h2 className="section__title animate-on-scroll">
              Your Path from Struggling to Funded
            </h2>

            <div className="steps__container">
              <div className="step animate-scale">
                <div className="step__number">1</div>
                <div className="step__icon">📊</div>
                <h3 className="step__title">ASSESS</h3>
                <h4 className="step__subtitle">Take 5-Minute Assessment</h4>
                <p className="step__description">
                  Instantly discover what's blocking your funding<br/>
                  Get your Investment Readiness Score (0-100)
                </p>
              </div>

              <div className="step__connector"></div>

              <div className="step animate-scale">
                <div className="step__number">2</div>
                <div className="step__icon">📈</div>
                <h3 className="step__title">BUILD</h3>
                <h4 className="step__subtitle">Follow Your Custom Roadmap</h4>
                <p className="step__description">
                  Track finances the investor way<br/>
                  Build missing documentation<br/>
                  Watch your score rise weekly
                </p>
              </div>

              <div className="step__connector"></div>

              <div className="step animate-scale">
                <div className="step__number">3</div>
                <div className="step__icon">🤝</div>
                <h3 className="step__title">CONNECT</h3>
                <h4 className="step__subtitle">Get Matched with Investors</h4>
                <p className="step__description">
                  Submit to verified funders<br/>
                  Skip the cold emails<br/>
                  Start real conversations
                </p>
              </div>
            </div>

            <div className="steps__cta">
              <button className="btn btn--primary btn--large" onClick={startAssessment}>
                Start Your Journey Today →
              </button>
            </div>
          </div>
        </section>

        {/* Transformation Timeline Section */}
        <section className="transformation-timeline" id="transformation">
          <div className="container">
            <h2 className="section__title animate-on-scroll">
              Your First 90 Days with Bvester
            </h2>

            <div className="timeline__container">
              <div className="timeline__item animate-left">
                <div className="timeline__marker">Day 1</div>
                <div className="timeline__content">
                  <h4>Immediate Clarity</h4>
                  <ul>
                    <li>✓ Complete assessment</li>
                    <li>✓ Get your score & gaps</li>
                    <li>✓ Receive 90-day roadmap</li>
                  </ul>
                </div>
              </div>

              <div className="timeline__item animate-right">
                <div className="timeline__marker">Week 1</div>
                <div className="timeline__content">
                  <h4>Foundation Building</h4>
                  <ul>
                    <li>✓ Financial system setup</li>
                    <li>✓ Start professional tracking</li>
                    <li>✓ First weekly progress report</li>
                  </ul>
                </div>
              </div>

              <div className="timeline__item animate-left">
                <div className="timeline__marker">Month 1</div>
                <div className="timeline__content">
                  <h4>Visible Progress</h4>
                  <ul>
                    <li>✓ Clean financial statements</li>
                    <li>✓ Business valuation ready</li>
                    <li>✓ +15 point score increase</li>
                  </ul>
                </div>
              </div>

              <div className="timeline__item animate-right">
                <div className="timeline__marker">Month 3</div>
                <div className="timeline__content">
                  <h4>Investment Ready</h4>
                  <ul>
                    <li>✓ Investment-ready status</li>
                    <li>✓ Investor matches available</li>
                    <li>✓ Funding conversations begin</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="transformation__promise">
              <div className="promise__box">
                <div className="promise__from">
                  <span className="label">FROM:</span>
                  <span className="text">Confused & Rejected</span>
                </div>
                <div className="promise__arrow">→</div>
                <div className="promise__to">
                  <span className="label">TO:</span>
                  <span className="text">Clear, Confident & Funded</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Activity Feed */}
        <section className="activity-feed">
          <div className="feed__container">
            <div className="feed__item">
              <span className="feed__avatar">👤</span>
              <span className="feed__text" id="activity-text">Sarah from Kumasi just completed her assessment</span>
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

        {/* Authority Building Section */}
        <section className="authority-section" id="authority">
          <div className="container">
            <h2 className="section__title animate-on-scroll">
              Built by People Who've Been on Both Sides
            </h2>

            <div className="authority__content">
              <div className="founders__story animate-left">
                <h3>Our Story</h3>
                <p>
                  Our team includes former investment bankers from:
                </p>
                <div className="banks__logos">
                  <span className="bank-name">Standard Bank</span>
                  <span className="divider">|</span>
                  <span className="bank-name">Stanbic</span>
                  <span className="divider">|</span>
                  <span className="bank-name">Ecobank</span>
                  <span className="divider">|</span>
                  <span className="bank-name">AfDB</span>
                </div>
                <p className="highlight-stat">
                  Combined, we've reviewed <strong>10,000+ loan applications</strong>.<br/>
                  We know exactly why 95% get rejected.<br/>
                  And exactly how to be in the 5% that succeed.
                </p>
              </div>

              <div className="platform__credentials animate-right">
                <h3>Platform Credentials</h3>
                <ul className="credentials__list">
                  <li>
                    <span className="icon">🧠</span>
                    Smart analysis engine trained on successful funding patterns
                  </li>
                  <li>
                    <span className="icon">📊</span>
                    Based on real criteria from 500+ African investors
                  </li>
                  <li>
                    <span className="icon">🔬</span>
                    Proprietary scoring algorithm from banking data
                  </li>
                  <li>
                    <span className="icon">✅</span>
                    Proven improvement methodology
                  </li>
                </ul>
              </div>
            </div>

            <div className="guarantee__box animate-scale">
              <div className="guarantee__icon">📋</div>
              <h3>Our Promise</h3>
              <p>
                Improve your Investment Readiness Score by <strong>30 points in 90 days</strong>,
                or we work with you <strong>FREE</strong> until you do.
              </p>
              <p className="guarantee__note">
                That's how confident we are in our system.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing" id="pricing">
          <div className="container">
            <div className="section-header">
              <div className="section__badge">🔥 Founding Member Pricing</div>
              <h2>Choose Your Growth Speed</h2>
              <p>Lock in 50% lifetime discount - Only for first 1,000 members</p>
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
              {pricingTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`pricing-card ${tier.id === 'growth' ? 'pricing-card--popular' : ''} ${tier.isComingSoon ? 'pricing-card--coming-soon' : ''}`}
                >
                  {tier.id === 'growth' && <div className="pricing__badge">Most Popular</div>}
                  {tier.isComingSoon && <div className="pricing__badge pricing__badge--coming-soon">Coming Soon</div>}

                  {/* Founding Member Badge */}
                  {hasFoundingDiscount(tier) && (
                    <div className="founding-member-badge">
                      🎯 Founding Member - {tier.foundingMember?.discountPercentage}% Off
                      <div className="spots-remaining">{spotsRemaining}/1,000 spots left</div>
                    </div>
                  )}

                  <div className="pricing__header">
                    <h3>{tier.displayName}</h3>
                    <div className="pricing__price">
                      {hasFoundingDiscount(tier) && (
                        <div className="price-strike">
                          <span className="original-price">{formatPrice(getOriginalPrice(tier), 'GHS')}</span>
                        </div>
                      )}
                      <span className="price__amount">{formatPrice(getDisplayPrice(tier), 'GHS')}</span>
                      <span className="price__period">/{isAnnualPricing ? 'year' : 'month'}</span>

                      {/* USD Display */}
                      <div className="price__usd">
                        ≈ {formatPrice(getDisplayPrice(tier, true), 'USD')} USD
                      </div>

                      {isAnnualPricing && tier.price.monthly > 0 && (
                        <div className="price__savings">
                          Save {formatPrice(calculateAnnualSavings(tier.id).amount, 'GHS')} per year ({calculateAnnualSavings(tier.id).percentage}% off)
                        </div>
                      )}
                    </div>

                    {tier.trial?.enabled && !tier.isComingSoon && (
                      <div className="pricing__trial">
                        {tier.trial.days}-day free trial included
                      </div>
                    )}

                    <p>{tier.description}</p>
                  </div>

                  <ul className="pricing__features">
                    {tier.features.map((feature, index) => (
                      <li key={index}>
                        {tier.isComingSoon && tier.comingSoonFeatures?.includes(feature) ? (
                          <span className="feature-coming-soon">
                            {feature} <span className="coming-soon-label">(Coming Soon)</span>
                          </span>
                        ) : (
                          feature
                        )}
                      </li>
                    ))}
                  </ul>

                  {tier.isComingSoon ? (
                    <button className="btn btn--disabled" disabled>
                      Coming Soon
                    </button>
                  ) : tier.id === 'starter' ? (
                    <button className="btn btn--outline" onClick={onGetStarted}>
                      Start Free
                    </button>
                  ) : tier.id === 'growth' ? (
                    <button className="btn btn--primary" onClick={onGetStarted}>
                      Start {tier.trial?.days}-Day Trial
                    </button>
                  ) : (
                    <button className="btn btn--gold" onClick={onGetStarted}>
                      Coming Soon
                    </button>
                  )}
                </div>
              ))}
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

        {/* Final CTA Section */}
        <section className="final-cta-section">
          <div className="container">
            <div className="cta__content">
              <h2>Two Types of Businesses in Africa Today:</h2>
              <div className="business-types">
                <div className="type type--struggling">
                  <div className="type__icon">😔</div>
                  <h3>Type 1</h3>
                  <p>Still wondering why banks keep saying no.</p>
                  <p>Still using Excel. Still hoping things change.</p>
                </div>
                <div className="type__arrow">→</div>
                <div className="type type--winning">
                  <div className="type__icon">🚀</div>
                  <h3>Type 2</h3>
                  <p>Building investor-ready businesses with Bvester.</p>
                  <p>Clear roadmap. Real progress. Funding conversations.</p>
                </div>
              </div>
              <h3 className="cta__question">Which one will you be?</h3>
              <button className="btn btn--gold btn--extra-large pulse" onClick={startAssessment}>
                Join 367 Smart Business Owners Today →
              </button>
              <p className="cta__subtext">Free to start • No credit card • Cancel anytime</p>
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