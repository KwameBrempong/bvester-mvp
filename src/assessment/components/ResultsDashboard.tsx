/**
 * Results Dashboard Component - Phase 1 Implementation
 * Enhanced results display, will be expanded in later phases
 */

import React from 'react';
import { AssessmentResult } from '../types/assessment.types';

interface ResultsDashboardProps {
  result: AssessmentResult;
  onClose: () => void;
  onRestart: () => void;
  user: any;
  subscriptionStatus: any;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  onClose,
  onRestart,
  user,
  subscriptionStatus
}) => {
  const isFreeTier = !subscriptionStatus?.isPaidUser;

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      'Low Risk': '#2E8B57',
      'Moderate Risk': '#FFA500',
      'High Risk': '#FF6B35',
      'Critical Risk': '#DC143C'
    };
    return colors[riskLevel as keyof typeof colors] || colors['Moderate Risk'];
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: getRiskColor(result.riskLevel),
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '8px' }}>Assessment Complete</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Your Business Health Score: {result.overallScore}/100
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ×
          </button>
        </div>

        {/* Risk level indicator */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          <strong>{result.riskLevel}</strong>
          {result.criticalIssues.length > 0 && (
            <span style={{ marginLeft: '8px' }}>
              • {result.criticalIssues.length} Critical Issue{result.criticalIssues.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Results content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Score breakdown */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#2C3E50' }}>Category Scores</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(result.categoryScores).map(([category, score]) => (
              <div key={category} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#F8F9FA',
                borderRadius: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {category.replace('_', ' ').toUpperCase()}
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#E9ECEF',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${score}%`,
                      height: '100%',
                      background: score >= 75 ? '#2E8B57' : score >= 50 ? '#FFA500' : '#DC143C',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
                <div style={{ marginLeft: '16px', fontSize: '18px', fontWeight: '600' }}>
                  {score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical issues */}
        {result.criticalIssues.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: '#DC143C' }}>
              🚨 Critical Issues ({result.criticalIssues.length})
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {result.criticalIssues.slice(0, isFreeTier ? 3 : result.criticalIssues.length).map((issue, index) => (
                <div key={issue.id} style={{
                  padding: '16px',
                  border: '2px solid #FFE5E5',
                  borderRadius: '8px',
                  background: '#FFFAFA'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, marginBottom: '8px', color: '#DC143C' }}>
                        {issue.title}
                      </h4>
                      <p style={{ margin: 0, marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                        {issue.impact}
                      </p>
                      {!isFreeTier && (
                        <p style={{ margin: 0, fontSize: '14px', color: '#2E8B57', fontWeight: '500' }}>
                          Solution: {issue.solution}
                        </p>
                      )}
                    </div>
                    <span style={{
                      background: '#DC143C',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {isFreeTier && result.criticalIssues.length > 3 && (
              <div style={{
                padding: '16px',
                border: '2px solid #D4AF37',
                borderRadius: '8px',
                background: '#FFFBF0',
                marginTop: '12px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, marginBottom: '12px', color: '#856404' }}>
                  <strong>+{result.criticalIssues.length - 3} more critical issues found</strong>
                </p>
                <button style={{
                  background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Upgrade to See All Issues & Solutions
                </button>
              </div>
            )}
          </div>
        )}

        {/* Next steps */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#2C3E50' }}>Immediate Next Steps</h3>
          <ul style={{ paddingLeft: '20px' }}>
            {result.nextSteps.immediate.slice(0, isFreeTier ? 3 : result.nextSteps.immediate.length).map((step, index) => (
              <li key={index} style={{ marginBottom: '8px', color: '#666' }}>{step}</li>
            ))}
          </ul>

          {isFreeTier && (
            <div style={{
              padding: '16px',
              border: '2px solid #2E8B57',
              borderRadius: '8px',
              background: '#F0FFF0',
              marginTop: '16px'
            }}>
              <p style={{ margin: 0, marginBottom: '12px', color: '#2E8B57' }}>
                <strong>Get your complete action plan and join our Growth Accelerator program!</strong>
              </p>
              <button style={{
                background: 'linear-gradient(135deg, #2E8B57, #228B22)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Enroll in Growth Accelerator - Save Your Business
              </button>
            </div>
          )}
        </div>

        {/* Benchmark comparison */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#2C3E50' }}>How You Compare</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#2E8B57' }}>
                {result.benchmarkComparison.yourScore}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Your Score</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#FFA500' }}>
                {result.benchmarkComparison.industryAverage}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Industry Average</div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#666' }}>
                {result.benchmarkComparison.percentile}th
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Percentile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        padding: '24px 32px',
        borderTop: '1px solid #E9ECEF',
        background: '#F8F9FA',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onRestart}
          style={{
            background: 'none',
            border: '2px solid #E9ECEF',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          Retake Assessment
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!isFreeTier && (
            <button style={{
              background: 'linear-gradient(135deg, #6C757D, #495057)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Download PDF Report
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #2E8B57, #228B22)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;