import React, { useState, useEffect } from 'react';
import '../styles/homepage-perfect.css';
import '../styles/homepage-fixes.css';
import { stripeService } from '../stripeService';

interface HomepageProps {
  onGetStarted: () => void;
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#programs' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const Homepage: React.FC<HomepageProps> = ({ onGetStarted }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'growth' | 'accelerate' | null>(null);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTierSelect = (tier: 'growth' | 'accelerate') => {
    setSelectedTier(tier);
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !selectedTier) return;

    setIsProcessing(true);

    try {
      console.log('🚀 Starting guest checkout for tier:', selectedTier, 'email:', email);

      const session = await stripeService.createGuestCheckoutSession({
        tierId: selectedTier,
        customerEmail: email,
        billing: 'monthly', // Default to monthly
        isFoundingMember: true // Enable founding member pricing
      });

      console.log('✅ Checkout session created, redirecting to Stripe...');

      // Redirect to Stripe checkout
      window.location.href = session.url;

    } catch (error) {
      console.error('❌ Guest checkout failed:', error);
      alert('Something went wrong. Please try again or contact support.');
      setIsProcessing(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setSelectedTier(null);
    setEmail('');
    setIsProcessing(false);
  };

  return (
    <div className="homepage">
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
              <button className="btn btn--gold" onClick={onGetStarted}>Get Started</button>
            </div>
          </nav>

          <div className="nav__cta nav__cta--desktop">
            <button className="btn btn--ghost" onClick={onGetStarted}>Log In</button>
            <button className="btn btn--gold" onClick={onGetStarted}>Get Started</button>
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
        <section className="hero" id="home">
          <div className="hero__content">
            <div className="hero__copy">
              <span className="pill pill--light">Investment &amp; Growth Platform for African SMEs</span>
              <h1>
                Empowering African SMEs <br />
                <span>with Smart Investment</span>
              </h1>
              <p>
                Bridge the funding gap. Scale your business. Bvester keeps your records organised like a chat, builds
                your investor story, and connects you with diaspora capital you can trust.
              </p>
              <div className="hero__actions">
                <button className="btn btn--gold" onClick={onGetStarted}>Check Investment Readiness</button>
                <button className="btn btn--ghost" onClick={() => handleNavClick('#programs')}>Join Accelerator Cohort</button>
              </div>
              <div className="hero__metrics">
                <div>
                  <strong>500+</strong>
                  <span>SMEs Registered</span>
                </div>
                <div>
                  <strong>&#8373;2M+</strong>
                  <span>Total Raised</span>
                </div>
                <div>
                  <strong>150+</strong>
                  <span>Investor Partners</span>
                </div>
              </div>
            </div>
            <div className="hero__visual">
              <div className="hero__card">
                <div className="hero__score">
                  <span className="hero__score-label">Your Business Score</span>
                  <span className="hero__score-value">85</span>
                  <span className="hero__score-status">Investment Ready</span>
                </div>
                <ul className="hero__insights">
                  <li>
                    <span>Financial Health</span>
                    <div><span style={{ width: '85%' }} /></div>
                  </li>
                  <li>
                    <span>Market Position</span>
                    <div><span style={{ width: '70%' }} /></div>
                  </li>
                  <li>
                    <span>Growth Potential</span>
                    <div><span style={{ width: '90%' }} /></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="impact" id="impact">
          <div className="section-heading">
            <span className="pill pill--dark">Trusted by ambitious founders</span>
            <h2>Building sustainable SMEs across Ghana</h2>
            <p>
              From Kumasi to Accra, founders use Bvester to professionalise their operations, prove traction, and
              pitch with data investors trust.
            </p>
          </div>
          <div className="impact__grid">
            <div className="impact__card">
              <h3>12k+</h3>
              <p>Transactions recorded via chat-style bookkeeping in the last 90 days.</p>
            </div>
            <div className="impact__card">
              <h3>87%</h3>
              <p>Of accelerator graduates progressed to investor conversations within 6 weeks.</p>
            </div>
            <div className="impact__card">
              <h3>4.9 / 5</h3>
              <p>Average NPS from SMEs on the Bvester Growth Accelerator experience.</p>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-heading section-heading--split">
            <div>
              <span className="pill pill--light">Product pillars</span>
              <h2>Everything you need to become investment ready</h2>
            </div>
            <p>
              We designed every workflow alongside accountants, investors, and SME operators so that your data,
              documents, and daily actions stay connected.
            </p>
          </div>
          <div className="features__grid">
            <article className="feature-card">
              <div className="feature-card__icon">💬</div>
              <h3>Chat-Based Record Keeping</h3>
              <p>
                Log income and expenses with natural language. Our AI parses the entry, categorises it, and syncs
                instantly to your financial dashboard.
              </p>
              <ul>
                <li>Voice note and WhatsApp-style inputs</li>
                <li>Automated cashflow categorisation</li>
                <li>Investor-ready ledger exports</li>
              </ul>
            </article>
            <article className="feature-card">
              <div className="feature-card__icon">📊</div>
              <h3>Business Health X-Ray</h3>
              <p>
                Answer a 7-minute diagnostic and receive a tailored score, blind-spot analysis, and action plan based
                on Ghanaian market benchmarks.
              </p>
              <ul>
                <li>Dynamic scoring across 5 growth pillars</li>
                <li>Auto-generated investor briefing deck</li>
                <li>Access to curated capital matches</li>
              </ul>
            </article>
            <article className="feature-card">
              <div className="feature-card__icon">🚀</div>
              <h3>Growth Accelerator</h3>
              <p>
                A 30-day blended accelerator with masterclasses, mentorship, and data room preparation to close your
                next funding round faster.
              </p>
              <ul>
                <li>Weekly investment clinics &amp; office hours</li>
                <li>Investor pipeline templates</li>
                <li>Certification recognised by partners</li>
              </ul>
            </article>
            <article className="feature-card">
              <div className="feature-card__icon">🤝</div>
              <h3>Diaspora Investor Network</h3>
              <p>
                Showcase your profile to pre-vetted diaspora angels and impact funds looking to deploy in African SMEs
                with strong fundamentals.
              </p>
              <ul>
                <li>Curated investor introductions</li>
                <li>Virtual demo days every quarter</li>
                <li>Secure data room sharing</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="programs" id="programs">
          <div className="section-heading">
            <span className="pill pill--dark">30-Day Accelerator Journey</span>
            <h2>From organised records to investor-ready in four sprints</h2>
          </div>
          <div className="timeline">
            <div className="timeline__item">
              <div className="timeline__badge">Week 1</div>
              <h3>Stabilise your numbers</h3>
              <p>Clean historical records, automate weekly reporting, and understand your funding gap.</p>
            </div>
            <div className="timeline__item">
              <div className="timeline__badge">Week 2</div>
              <h3>Assess and benchmark</h3>
              <p>Complete the Bvester X-Ray, receive investor-grade diagnostics, and map quick wins.</p>
            </div>
            <div className="timeline__item">
              <div className="timeline__badge">Week 3</div>
              <h3>Craft your narrative</h3>
              <p>Build a compelling data room with guided templates, traction summaries, and growth roadmap.</p>
            </div>
            <div className="timeline__item">
              <div className="timeline__badge">Week 4</div>
              <h3>Connect &amp; pitch</h3>
              <p>Join demo day, receive personalised investor matches, and prepare for diligence.</p>
            </div>
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="section-heading section-heading--split">
            <div>
              <span className="pill pill--light">Flexible membership</span>
              <h2>Start free, unlock pro growth when you are ready</h2>
            </div>
            <p>
              Fair, transparent pricing for founders at every stage. Upgrade for deeper analytics, accelerator access,
              and investor introductions.
            </p>
          </div>
          <div className="pricing__grid">
            <div className="plan plan--free">
              <div className="plan__header">
                <h3>Launch</h3>
                <p>Organise your business fundamentals</p>
                <strong>₵0</strong>
                <span>per month</span>
              </div>
              <ul>
                <li>Chat-style transaction recorder</li>
                <li>Starter financial dashboards</li>
                <li>Quarterly investment health check</li>
              </ul>
              <button className="btn btn--outline" onClick={onGetStarted}>Start for Free</button>
            </div>
            <div className="plan plan--featured">
              <div className="plan__header">
                <span className="plan__tag">Most popular</span>
                <h3>Pro</h3>
                <p>Elevate your reporting &amp; investor story</p>
                <strong>₵50</strong>
                <span>per month</span>
              </div>
              <ul>
                <li>Unlimited transactions &amp; smart analytics</li>
                <li>Full business health X-Ray &amp; benchmarks</li>
                <li>Diaspora investor introductions</li>
              </ul>
              <button className="btn btn--gold" onClick={() => handleTierSelect('growth')}>Upgrade to Pro</button>
            </div>
            <div className="plan plan--enterprise">
              <div className="plan__header">
                <h3>Accelerator</h3>
                <p>Go from readiness to capital in 30 days</p>
                <strong>₵2,000</strong>
                <span>one-time cohort fee</span>
              </div>
              <ul>
                <li>Guided investor prep &amp; pitch reviews</li>
                <li>Dedicated growth coach &amp; experts</li>
                <li>Priority access to partner capital</li>
              </ul>
              <button className="btn btn--ghost" onClick={() => handleTierSelect('accelerate')}>Join Next Cohort</button>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <div className="section-heading">
            <span className="pill pill--dark">Proof from the field</span>
            <h2>Founders and investors rely on Bvester</h2>
          </div>
          <div className="testimonials__grid">
            <blockquote>
              “Bvester transformed our messy WhatsApp receipts into a credible financial story. We closed ₵350k from
              diaspora angels in three months.”
              <cite>— Ama K., Founder, AgroBridge Ghana</cite>
            </blockquote>
            <blockquote>
              “The accelerator sharpened our pitch and taught us how to communicate metrics investors care about. We are
              now rolling out to two additional regions.”
              <cite>— Joshua M., CEO, PayBuddy</cite>
            </blockquote>
            <blockquote>
              “As an investor abroad, the platform gives me real-time visibility into SME performance, making diligence
              faster and more transparent.”
              <cite>— Nadia A., Diaspora Angel Investor</cite>
            </blockquote>
          </div>
        </section>

        <section className="cta">
          <div className="cta__card">
            <span className="pill pill--light">Launch in minutes</span>
            <h2>Your next investor conversation can start today</h2>
            <p>
              Build your digital profile, invite your team, and start recording transactions in under five minutes. The
              earlier you start, the faster you unlock growth capital.
            </p>
            <div className="cta__actions">
              <button className="btn btn--gold" onClick={onGetStarted}>Create Free Account</button>
              <button className="btn btn--ghost" onClick={() => handleNavClick('#programs')}>Explore Accelerator</button>
            </div>
          </div>
        </section>

        <section className="faqs" id="faqs">
          <div className="section-heading">
            <span className="pill pill--dark">Frequently asked</span>
            <h2>Answers for founders &amp; investors</h2>
          </div>
          <div className="faqs__grid">
            <div className="faq">
              <h3>What makes Bvester different from accounting software?</h3>
              <p>
                We go beyond bookkeeping. Bvester connects your daily records to investor-ready reporting, health
                diagnostics, and curated capital introductions.
              </p>
            </div>
            <div className="faq">
              <h3>Can I invite my accountant or co-founder?</h3>
              <p>
                Yes. Pro plans support up to three seats with role-based access control so your team can collaborate
                securely.
              </p>
            </div>
            <div className="faq">
              <h3>Do investors pay to access SMEs?</h3>
              <p>
                Investors join by invitation and pay success-based fees. This keeps the platform aligned with founder
                outcomes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="nav__logo">
              <img src="/bvester-logo.png" alt="Bvester" className="nav__logo-img" />
              <span className="nav__logo-text">Bvester</span>
            </div>
            <p>Connecting African SMEs with diaspora capital, accountability, and growth guidance.</p>
          </div>
          <div className="footer__links">
            <div>
              <h4>Platform</h4>
              <ul>
                <li><button type="button" onClick={() => handleNavClick('#features')}>Features</button></li>
                <li><button type="button" onClick={() => handleNavClick('#programs')}>Accelerator</button></li>
                <li><button type="button" onClick={() => handleNavClick('#pricing')}>Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="mailto:hello@bvester.com">Contact</a></li>
                <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__cta">
            <h4>Ready to grow?</h4>
            <button className="btn btn--gold" onClick={onGetStarted}>Join Bvester</button>
          </div>
        </div>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Bvester. All rights reserved.</span>
          <div>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </footer>

      {/* Email Collection Modal for Guest Checkout */}
      {showEmailModal && (
        <div className="email-modal-overlay" onClick={closeEmailModal}>
          <div className="email-modal" onClick={(e) => e.stopPropagation()}>
            <div className="email-modal-header">
              <h3>Get Started with {selectedTier === 'growth' ? 'Pro' : 'Accelerator'}</h3>
              <button className="email-modal-close" onClick={closeEmailModal} disabled={isProcessing}>×</button>
            </div>
            <div className="email-modal-body">
              <p>Enter your email to proceed to secure payment and instant access to your dashboard.</p>
              <form onSubmit={handleEmailSubmit}>
                <div className="email-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="email-form-pricing">
                  {selectedTier === 'growth' ? (
                    <div className="pricing-details">
                      <span className="original-price">₵100/month</span>
                      <span className="founding-price">₵50/month</span>
                      <span className="discount-badge">50% OFF - Founding Member</span>
                    </div>
                  ) : (
                    <div className="pricing-details">
                      <span className="original-price">₵500/month</span>
                      <span className="founding-price">₵250/month</span>
                      <span className="discount-badge">50% OFF - Founding Member</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn--gold email-submit-btn"
                  disabled={isProcessing || !email}
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment →'}
                </button>
              </form>
              <p className="email-modal-note">
                Your account will be created automatically after successful payment.
                No signup required!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
