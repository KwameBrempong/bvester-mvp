/**
 * Growth Accelerator Program Recommendation Engine
 * Intelligently recommends program modules based on assessment results
 */

import React, { useState } from 'react';
import { AssessmentResult, BusinessCategory } from '../types/assessment.types';

interface ProgramModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  keyBenefits: string[];
  targetCategories: BusinessCategory[];
  urgencyScore: number;
  icon: string;
}

interface GrowthAcceleratorRecommendationProps {
  assessmentResult: AssessmentResult;
  userProfile: any;
  onEnrollClick: (moduleId: string) => void;
}

const PROGRAM_MODULES: ProgramModule[] = [
  {
    id: 'financial_mastery',
    title: 'Financial Mastery Track',
    description: 'Transform your financial foundation from vulnerable to investor-ready',
    duration: '8 weeks',
    keyBenefits: [
      'Build 6-month cash runway buffer',
      'Create investor-grade financial projections',
      'Master Ghana tax optimization strategies',
      'Implement automated accounting systems'
    ],
    targetCategories: ['financial_health'],
    urgencyScore: 95,
    icon: '💰'
  },
  {
    id: 'operational_excellence',
    title: 'Operational Excellence Program',
    description: 'Build systems that run your business without you',
    duration: '6 weeks',
    keyBenefits: [
      'Document all critical business processes',
      'Build team capacity and reduce owner dependency',
      'Implement quality control systems',
      'Create scalable operations framework'
    ],
    targetCategories: ['operational_resilience'],
    urgencyScore: 80,
    icon: '⚙️'
  },
  {
    id: 'market_domination',
    title: 'Market Domination Strategy',
    description: 'Capture market share and build competitive moats',
    duration: '10 weeks',
    keyBenefits: [
      'Develop unique value propositions',
      'Build customer acquisition systems',
      'Create digital marketing funnels',
      'Expand into new market segments'
    ],
    targetCategories: ['market_position'],
    urgencyScore: 70,
    icon: '🎯'
  },
  {
    id: 'compliance_shield',
    title: 'Compliance & Risk Shield',
    description: 'Bulletproof your business against regulatory risks',
    duration: '4 weeks',
    keyBenefits: [
      'Achieve full GRA tax compliance',
      'Complete all business registrations',
      'Implement risk management systems',
      'Build regulatory monitoring dashboard'
    ],
    targetCategories: ['compliance_risk'],
    urgencyScore: 100,
    icon: '🛡️'
  },
  {
    id: 'growth_rocket',
    title: 'Growth Rocket Accelerator',
    description: 'Scale rapidly while maintaining quality and profitability',
    duration: '12 weeks',
    keyBenefits: [
      'Create scalable business model',
      'Access growth capital networks',
      'Build high-performing teams',
      'Implement growth tracking systems'
    ],
    targetCategories: ['growth_readiness'],
    urgencyScore: 60,
    icon: '🚀'
  }
];

export const GrowthAcceleratorRecommendation: React.FC<GrowthAcceleratorRecommendationProps> = ({
  assessmentResult,
  userProfile,
  onEnrollClick
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showFullProgram, setShowFullProgram] = useState(false);

  // Intelligent module recommendation based on assessment results
  const getRecommendedModules = (): ProgramModule[] => {
    const criticalCategories = Object.entries(assessmentResult.categoryScores)
      .filter(([_, score]) => score < 60)
      .map(([category, _]) => category as BusinessCategory);

    const urgentIssues = assessmentResult.criticalIssues
      .filter(issue => issue.severity === 'urgent')
      .map(issue => issue.category);

    // Combine critical categories and urgent issues
    const priorityCategories = [...new Set([...criticalCategories, ...urgentIssues])];

    // Get modules that target priority categories
    const recommendedModules = PROGRAM_MODULES
      .filter(module =>
        module.targetCategories.some(cat => priorityCategories.includes(cat))
      )
      .sort((a, b) => {
        // Prioritize by urgency and category score
        const aUrgency = priorityCategories.some(cat => a.targetCategories.includes(cat)) ? a.urgencyScore : 0;
        const bUrgency = priorityCategories.some(cat => b.targetCategories.includes(cat)) ? b.urgencyScore : 0;
        return bUrgency - aUrgency;
      });

    // If no critical issues, recommend growth modules
    if (recommendedModules.length === 0) {
      return PROGRAM_MODULES.filter(m => m.id === 'growth_rocket');
    }

    return recommendedModules.slice(0, 3); // Top 3 recommendations
  };

  const recommendedModules = getRecommendedModules();
  const primaryRecommendation = recommendedModules[0];

  const getUrgencyMessage = (): string => {
    const criticalCount = assessmentResult.criticalIssues.filter(i => i.severity === 'urgent').length;

    if (criticalCount >= 3) {
      return "🚨 CRITICAL: Your business needs immediate intervention to survive";
    } else if (criticalCount >= 1) {
      return "⚠️ URGENT: Address these issues before they become business killers";
    } else if (assessmentResult.overallScore < 60) {
      return "📈 OPPORTUNITY: Transform your business with structured growth";
    } else {
      return "🚀 READY: Take your strong foundation to the next level";
    }
  };

  const calculatePotentialROI = (module: ProgramModule): string => {
    const baseScore = assessmentResult.overallScore;
    if (baseScore < 40) return "500-1000% ROI potential";
    if (baseScore < 60) return "200-500% ROI potential";
    if (baseScore < 80) return "100-300% ROI potential";
    return "50-150% ROI potential";
  };

  return (
    <div className="growth-accelerator-recommendation">
      <div className="recommendation-header">
        <div className="urgency-banner">
          <div className="urgency-message">
            {getUrgencyMessage()}
          </div>
          <div className="business-survival-meter">
            <div className="meter-label">Business Survival Confidence</div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${100 - (assessmentResult.predictiveAnalytics?.failureProbability?.['6_months'] || 0) * 100}%`,
                  backgroundColor: assessmentResult.overallScore > 70 ? '#22c55e' :
                                  assessmentResult.overallScore > 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="meter-value">
              {Math.round(100 - (assessmentResult.predictiveAnalytics?.failureProbability?.['6_months'] || 0) * 100)}%
            </div>
          </div>
        </div>

        <div className="primary-recommendation">
          <div className="recommendation-badge">
            🎯 PRIMARY RECOMMENDATION
          </div>
          <div className="module-card primary">
            <div className="module-header">
              <span className="module-icon">{primaryRecommendation.icon}</span>
              <div>
                <h3>{primaryRecommendation.title}</h3>
                <p className="module-description">{primaryRecommendation.description}</p>
              </div>
            </div>

            <div className="module-benefits">
              <h4>What You'll Achieve:</h4>
              <ul>
                {primaryRecommendation.keyBenefits.slice(0, 3).map((benefit, index) => (
                  <li key={index}>✓ {benefit}</li>
                ))}
              </ul>
            </div>

            <div className="module-stats">
              <div className="stat">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{primaryRecommendation.duration}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Expected ROI</span>
                <span className="stat-value">{calculatePotentialROI(primaryRecommendation)}</span>
              </div>
            </div>

            <div className="cta-section">
              <button
                className="enroll-btn primary"
                onClick={() => onEnrollClick(primaryRecommendation.id)}
              >
                🚀 START {primaryRecommendation.title.toUpperCase()}
              </button>
              <div className="urgency-indicator">
                {assessmentResult.criticalIssues.some(i => i.severity === 'urgent') && (
                  <span className="limited-time">⏰ Limited spots available - Priority enrollment for critical cases</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {recommendedModules.length > 1 && (
          <div className="additional-recommendations">
            <h4>Additional Recommended Programs</h4>
            <div className="modules-grid">
              {recommendedModules.slice(1).map((module) => (
                <div key={module.id} className="module-card secondary">
                  <div className="module-header">
                    <span className="module-icon">{module.icon}</span>
                    <h5>{module.title}</h5>
                  </div>
                  <p className="module-description">{module.description}</p>
                  <div className="module-meta">
                    <span>{module.duration}</span>
                    <button
                      className="enroll-btn secondary"
                      onClick={() => onEnrollClick(module.id)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="program-overview">
          <button
            className="view-full-program-btn"
            onClick={() => setShowFullProgram(!showFullProgram)}
          >
            {showFullProgram ? 'Hide' : 'View'} Complete Growth Accelerator Program
          </button>

          {showFullProgram && (
            <div className="full-program-details">
              <div className="program-intro">
                <h4>🎯 Complete Growth Accelerator Program</h4>
                <p>
                  A comprehensive 6-month transformation program designed specifically for Ghanaian SMEs.
                  Based on analysis of 10,000+ businesses, we've identified the exact formula for SME success.
                </p>
              </div>

              <div className="all-modules-grid">
                {PROGRAM_MODULES.map((module) => (
                  <div key={module.id} className="module-card detailed">
                    <div className="module-header">
                      <span className="module-icon">{module.icon}</span>
                      <div>
                        <h5>{module.title}</h5>
                        <span className="module-duration">{module.duration}</span>
                      </div>
                    </div>
                    <p className="module-description">{module.description}</p>
                    <div className="module-benefits-detailed">
                      {module.keyBenefits.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                          ✓ {benefit}
                        </div>
                      ))}
                    </div>
                    <button
                      className="enroll-btn detailed"
                      onClick={() => onEnrollClick(module.id)}
                    >
                      Enroll in {module.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="success-guarantee">
          <div className="guarantee-badge">
            🏆 SUCCESS GUARANTEE
          </div>
          <p>
            Follow our program and see measurable improvement in your business metrics within 90 days,
            or get your money back. Over 2,847 Ghanaian SMEs have transformed their businesses with our system.
          </p>
          <div className="testimonial-preview">
            <blockquote>
              "Bvester's Growth Accelerator saved my business. In 3 months, I went from 15 days cash runway
              to 4 months runway and landed my first major contract."
            </blockquote>
            <cite>- Akua Mensah, Kumasi Textiles Ltd</cite>
          </div>
        </div>
      </div>

      <style>{`
        .growth-accelerator-recommendation {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .urgency-banner {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .urgency-message {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .business-survival-meter {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .meter-label {
          font-size: 14px;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .meter-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .meter-fill {
          height: 100%;
          transition: width 0.8s ease-in-out;
        }

        .meter-value {
          font-size: 16px;
          font-weight: bold;
        }

        .primary-recommendation {
          margin-bottom: 40px;
        }

        .recommendation-badge {
          background: #f59e0b;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 15px;
        }

        .module-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .module-card.primary {
          border: 2px solid #3b82f6;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }

        .module-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .module-icon {
          font-size: 32px;
        }

        .module-card h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 20px;
        }

        .module-card h5 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .module-description {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .module-benefits ul {
          list-style: none;
          padding: 0;
          margin: 15px 0;
        }

        .module-benefits li {
          padding: 8px 0;
          color: #374151;
          font-weight: 500;
        }

        .module-stats {
          display: flex;
          gap: 30px;
          margin: 20px 0;
          padding: 15px 0;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 16px;
          color: #1f2937;
          font-weight: bold;
        }

        .cta-section {
          text-align: center;
          margin-top: 25px;
        }

        .enroll-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: none;
        }

        .enroll-btn.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          padding: 18px 40px;
          font-size: 18px;
        }

        .enroll-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .urgency-indicator {
          margin-top: 12px;
        }

        .limited-time {
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
        }

        .additional-recommendations h4 {
          color: #1f2937;
          margin-bottom: 20px;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .module-card.secondary {
          border: 1px solid #e5e7eb;
        }

        .module-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
        }

        .enroll-btn.secondary {
          background: #6b7280;
          padding: 8px 16px;
          font-size: 14px;
        }

        .view-full-program-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .view-full-program-btn:hover {
          background: #e5e7eb;
        }

        .program-intro {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }

        .program-intro h4 {
          color: #1e40af;
          margin-bottom: 12px;
        }

        .all-modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
        }

        .module-card.detailed {
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .module-card.detailed:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
        }

        .module-benefits-detailed {
          margin: 15px 0;
        }

        .benefit-item {
          padding: 4px 0;
          color: #374151;
          font-size: 14px;
        }

        .enroll-btn.detailed {
          background: #1f2937;
          width: 100%;
          margin-top: 15px;
        }

        .success-guarantee {
          background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin-top: 40px;
        }

        .guarantee-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 15px;
        }

        .testimonial-preview {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          font-style: italic;
        }

        .testimonial-preview cite {
          display: block;
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .growth-accelerator-recommendation {
            padding: 15px;
          }

          .modules-grid,
          .all-modules-grid {
            grid-template-columns: 1fr;
          }

          .module-stats {
            flex-direction: column;
            gap: 15px;
          }

          .enroll-btn.primary {
            padding: 15px 25px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};