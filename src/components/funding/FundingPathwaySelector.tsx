import React, { useState, useEffect } from 'react';
import { FundingPathway, UserFundingProfile } from '../../types/funding.types';
import { FUNDING_PATHWAYS, getRecommendedPathway, getUserDiscountedPrice } from '../../config/fundingPathways';
import { isFeatureEnabled } from '../../config/featureFlags';

interface FundingPathwaySelectorProps {
  userProfile?: any;
  assessmentResult?: any;
  onPathwaySelect: (pathwayId: string) => void;
  onClose: () => void;
}

interface BusinessMetrics {
  annualRevenue: number;
  businessAge: number;
  assessmentScore: number;
}

const FundingPathwaySelector: React.FC<FundingPathwaySelectorProps> = ({
  userProfile,
  assessmentResult,
  onPathwaySelect,
  onClose
}) => {
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    annualRevenue: 0,
    businessAge: 0,
    assessmentScore: 0
  });

  const completedPathways: string[] = []; // TODO: Get from user profile

  useEffect(() => {
    // Extract business metrics from user profile and assessment
    const revenue = extractRevenue(userProfile);
    const age = extractBusinessAge(userProfile);
    const score = extractAssessmentScore(assessmentResult);

    setBusinessMetrics({
      annualRevenue: revenue,
      businessAge: age,
      assessmentScore: score
    });

    // Get recommended pathway
    const recommended = getRecommendedPathway(revenue, age, score);
    setSelectedPathway(recommended.id);
  }, [userProfile, assessmentResult]);

  const extractRevenue = (profile: any): number => {
    // Extract from user profile - implement based on your data structure
    return profile?.annualRevenue || profile?.monthlyRevenue * 12 || 0;
  };

  const extractBusinessAge = (profile: any): number => {
    // Calculate business age from establishment year
    if (profile?.yearEstablished) {
      return new Date().getFullYear() - parseInt(profile.yearEstablished);
    }
    return 0;
  };

  const extractAssessmentScore = (assessment: any): number => {
    // Extract overall score from assessment results
    return assessment?.overallScore || assessment?.investmentReadinessScore || 0;
  };

  const getPathwayRecommendationReason = (pathway: FundingPathway): string[] => {
    const reasons = [];

    if (businessMetrics.annualRevenue < 100000 && pathway.id === 'crowdfunding_starter') {
      reasons.push(`Your current revenue (₵${businessMetrics.annualRevenue.toLocaleString()}) is perfect for crowdfunding`);
    }

    if (businessMetrics.assessmentScore < 60 && pathway.id === 'crowdfunding_starter') {
      reasons.push('Build foundation skills before pursuing traditional investment');
    }

    if (businessMetrics.businessAge < 2 && pathway.id === 'crowdfunding_starter') {
      reasons.push('Ideal pathway for early-stage businesses');
    }

    return reasons;
  };

  const PathwayCard: React.FC<{ pathway: FundingPathway; isRecommended: boolean }> = ({
    pathway,
    isRecommended
  }) => {
    const discountedPrice = getUserDiscountedPrice(pathway.id, completedPathways);
    const hasDiscount = discountedPrice < pathway.price;
    const recommendationReasons = getPathwayRecommendationReason(pathway);

    return (
      <div
        className={`pathway-card ${selectedPathway === pathway.id ? 'selected' : ''} ${
          isRecommended ? 'recommended' : ''
        }`}
        onClick={() => setSelectedPathway(pathway.id)}
      >
        {isRecommended && (
          <div className="recommendation-badge">
            <span className="badge-icon">🎯</span>
            <span>Recommended for You</span>
          </div>
        )}

        <div className="pathway-header">
          <div className="pathway-icon">{pathway.icon}</div>
          <div className="pathway-titles">
            <h3>{pathway.title}</h3>
            <p className="pathway-subtitle">{pathway.subtitle}</p>
          </div>
        </div>

        <div className="pathway-pricing">
          <span className="current-price">₵{discountedPrice.toLocaleString()}</span>
          {hasDiscount && (
            <span className="original-price">₵{pathway.price.toLocaleString()}</span>
          )}
          {pathway.originalPrice && !hasDiscount && (
            <span className="original-price">₵{pathway.originalPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="pathway-meta">
          <div className="meta-item">
            <span className="meta-icon">⏱</span>
            <span>{pathway.duration}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🎓</span>
            <span>{pathway.supportLevel}</span>
          </div>
        </div>

        <p className="pathway-description">{pathway.description}</p>

        {isRecommended && recommendationReasons.length > 0 && (
          <div className="recommendation-reasons">
            <h4>Why we recommend this:</h4>
            <ul>
              {recommendationReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pathway-highlights">
          <div className="highlight-item">
            <span className="highlight-icon">🎯</span>
            <div>
              <strong>{pathway.successMetrics.primaryGoal}</strong>
              <span>{pathway.successMetrics.successRate}% success rate</span>
            </div>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">📈</span>
            <div>
              <strong>Average Outcome</strong>
              <span>{pathway.successMetrics.averageOutcome}</span>
            </div>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">⚡</span>
            <div>
              <strong>Time to Results</strong>
              <span>{pathway.successMetrics.timeToResult}</span>
            </div>
          </div>
        </div>

        <div className="pathway-audience">
          <h4>Perfect if you have:</h4>
          <ul className="audience-list">
            <li>📊 Revenue: {pathway.targetAudience.revenueRange}</li>
            <li>🏢 Business Age: {pathway.targetAudience.businessAge}</li>
            <li>📋 Assessment Score: {pathway.targetAudience.assessmentScore}</li>
          </ul>
        </div>

        {pathway.prerequisites && (
          <div className="pathway-prerequisites">
            <p className="prerequisites-note">
              💡 Available after completing {pathway.prerequisites.join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  };

  const recommendedPathway = getRecommendedPathway(
    businessMetrics.annualRevenue,
    businessMetrics.businessAge,
    businessMetrics.assessmentScore
  );

  return (
    <div className="funding-pathway-selector-overlay">
      <div className="funding-pathway-selector">
        {/* SEC License Pending Overlay */}
        <div className="sec-pending-overlay" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div className="sec-pending-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#fff4cd',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <span className="badge-icon" style={{ fontSize: '1.5rem' }}>⚖️</span>
            <span className="badge-text" style={{ fontWeight: 'bold', color: '#D4AF37' }}>SEC License Pending</span>
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Coming Soon!</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Our Investment Journey feature will be available once our Securities and Exchange Commission license is approved.
          </p>
          <div className="expected-timeline" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            color: '#D4AF37',
            fontWeight: 'bold'
          }}>
            <span className="timeline-icon">📅</span>
            <span>Expected: Q1 2025 (45 days)</span>
          </div>
          <button className="btn btn--gold" onClick={onClose} style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#D4AF37',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Notify Me When Available
          </button>
        </div>

        <div className="selector-header" style={{ opacity: 0.3, pointerEvents: 'none' }}>
          <button className="close-button" onClick={onClose} style={{
            pointerEvents: 'auto',
            opacity: 1,
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            zIndex: 101
          }}>
            ×
          </button>
          <div className="header-content">
            <h1>🚀 Choose Your Investment Journey</h1>
            <p>Select the pathway that best fits your business stage and funding goals</p>
          </div>
        </div>

        <div className="business-context" style={{ opacity: 0.3, pointerEvents: 'none' }}>
          <div className="context-item">
            <span className="context-label">Your Business:</span>
            <span className="context-value">
              ₵{businessMetrics.annualRevenue.toLocaleString()} revenue, {businessMetrics.businessAge} years old
            </span>
          </div>
          <div className="context-item">
            <span className="context-label">Assessment Score:</span>
            <span className="context-value">{businessMetrics.assessmentScore}% investment ready</span>
          </div>
        </div>

        <div className="pathways-grid" style={{ opacity: 0.3, pointerEvents: 'none' }}>
          {FUNDING_PATHWAYS.map((pathway) => (
            <PathwayCard
              key={pathway.id}
              pathway={pathway}
              isRecommended={pathway.id === recommendedPathway.id}
            />
          ))}
        </div>

        <div className="pathway-progression">
          <h3>📈 Your Growth Journey</h3>
          <div className="progression-flow">
            <div className="flow-step">
              <span className="step-icon">🌱</span>
              <span>Crowdfunding Starter</span>
              <span className="step-goal">₵10K-₵100K</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="step-icon">🚀</span>
              <span>Growth Capital</span>
              <span className="step-goal">₵100K-₵1M</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="step-icon">👑</span>
              <span>Investment Ready</span>
              <span className="step-goal">₵1M+</span>
            </div>
          </div>
          <p className="progression-note">
            💡 Complete each pathway to unlock the next with exclusive discounts
          </p>
        </div>

        <div className="selector-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Maybe Later
          </button>
          <button
            className="btn btn-primary"
            onClick={() => selectedPathway && onPathwaySelect(selectedPathway)}
            disabled={!selectedPathway}
          >
            Start {selectedPathway ? FUNDING_PATHWAYS.find(p => p.id === selectedPathway)?.title : 'Journey'}
          </button>
        </div>

        <div className="success-proof">
          <h3>🏆 Proven Results</h3>
          <div className="proof-stats">
            <div className="stat">
              <span className="stat-number">✓</span>
              <span className="stat-label">SMEs Supported</span>
            </div>
            <div className="stat">
              <span className="stat-number">💰</span>
              <span className="stat-label">Capital Raised</span>
            </div>
            <div className="stat">
              <span className="stat-number">🎯</span>
              <span className="stat-label">Proven Results</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .funding-pathway-selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          overflow-y: auto;
        }

        .funding-pathway-selector {
          background: white;
          border-radius: 16px;
          max-width: 1200px;
          width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .selector-header {
          background: linear-gradient(135deg, #1e3a8a, #3730a3);
          color: white;
          padding: 2rem;
          border-radius: 16px 16px 0 0;
          position: relative;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .header-content h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 800;
        }

        .header-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .business-context {
          background: #f8f9fa;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .context-item {
          display: flex;
          gap: 0.5rem;
        }

        .context-label {
          font-weight: 600;
          color: #666;
        }

        .context-value {
          color: #D4AF37;
          font-weight: 600;
        }

        .pathways-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
        }

        .pathway-card {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          position: relative;
        }

        .pathway-card:hover {
          border-color: #D4AF37;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .pathway-card.selected {
          border-color: #D4AF37;
          background: #fffbf0;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .pathway-card.recommended {
          border-color: #28a745;
          background: #f8fff9;
        }

        .pathway-card.recommended.selected {
          border-color: #D4AF37;
          background: #fffbf0;
        }

        .recommendation-badge {
          position: absolute;
          top: -12px;
          right: 1rem;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }

        .pathway-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .pathway-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .pathway-titles h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .pathway-subtitle {
          margin: 0;
          color: #666;
          font-weight: 500;
        }

        .pathway-pricing {
          margin-bottom: 1rem;
        }

        .current-price {
          font-size: 1.8rem;
          font-weight: 800;
          color: #D4AF37;
        }

        .original-price {
          margin-left: 0.5rem;
          text-decoration: line-through;
          color: #999;
          font-size: 1.1rem;
        }

        .pathway-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: #666;
        }

        .pathway-description {
          color: #444;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .recommendation-reasons {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .recommendation-reasons h4 {
          margin: 0 0 0.5rem 0;
          color: #0369a1;
          font-size: 0.9rem;
        }

        .recommendation-reasons ul {
          margin: 0;
          padding-left: 1rem;
          font-size: 0.85rem;
          color: #0369a1;
        }

        .pathway-highlights {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .highlight-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .highlight-icon {
          font-size: 1.2rem;
          margin-top: 0.1rem;
        }

        .highlight-item div {
          display: flex;
          flex-direction: column;
        }

        .highlight-item strong {
          font-size: 0.9rem;
          color: #1a1a1a;
          margin-bottom: 0.1rem;
        }

        .highlight-item span {
          font-size: 0.8rem;
          color: #666;
        }

        .pathway-audience {
          margin-bottom: 1rem;
        }

        .pathway-audience h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #333;
        }

        .audience-list {
          margin: 0;
          padding: 0;
          list-style: none;
          font-size: 0.8rem;
        }

        .audience-list li {
          color: #666;
          margin-bottom: 0.25rem;
        }

        .pathway-prerequisites {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 0.75rem;
          margin-top: 1rem;
        }

        .prerequisites-note {
          margin: 0;
          font-size: 0.85rem;
          color: #856404;
        }

        .pathway-progression {
          background: #f8f9fa;
          padding: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .pathway-progression h3 {
          margin: 0 0 1rem 0;
          text-align: center;
          color: #1a1a1a;
        }

        .progression-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .flow-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .step-icon {
          font-size: 2rem;
        }

        .step-goal {
          font-size: 0.8rem;
          color: #666;
          font-weight: 600;
        }

        .flow-arrow {
          font-size: 1.5rem;
          color: #D4AF37;
          font-weight: bold;
        }

        .progression-note {
          text-align: center;
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .selector-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
        }

        .btn-secondary:hover {
          background: #e9ecef;
          color: #495057;
        }

        .btn-primary {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #1a1a1a;
          font-weight: 700;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #FFD700, #D4AF37);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .success-proof {
          background: linear-gradient(135deg, #1e3a8a, #3730a3);
          color: white;
          padding: 2rem;
          border-radius: 0 0 16px 16px;
        }

        .success-proof h3 {
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .proof-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #D4AF37;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .pathways-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .progression-flow {
            flex-direction: column;
          }

          .flow-arrow {
            transform: rotate(90deg);
          }

          .proof-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .business-context {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FundingPathwaySelector;