/**
 * Question Card Component
 * Renders individual questions with proper validation and UX
 */

import React, { useState } from 'react';
import { Question } from '../types/assessment.types';
import { AssessmentHelpers } from '../utils/assessmentHelpers';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: any) => void;
  onPrevious?: () => void;
  showInsight?: boolean;
  insightMessage?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  onPrevious,
  showInsight = false,
  insightMessage = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setValidationError(null);

    // Real-time validation for percentage/number inputs
    if (question.type === 'percentage' || question.type === 'number') {
      const validation = AssessmentHelpers.validateInput(value, question);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid input');
      }
    }
  };

  const handleSubmit = (value: any) => {
    const validation = AssessmentHelpers.validateInput(value, question);

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid input');
      return;
    }

    onAnswer(value);
    setInputValue('');
    setValidationError(null);
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple':
        return (
          <div className="options-container">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(option.text)}
                className={`option-button ${option.riskLevel}`}
                style={{
                  padding: '18px 24px',
                  margin: '8px 0',
                  background: 'white',
                  border: `2px solid ${AssessmentHelpers.getRiskColor(option.riskLevel)}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  textAlign: 'left',
                  width: '100%',
                  minHeight: '60px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: AssessmentHelpers.getRiskColor(option.riskLevel),
                  marginRight: '12px',
                  flexShrink: 0
                }} />
                {option.text}
              </button>
            ))}
          </div>
        );

      case 'percentage':
        return (
          <div className="percentage-input-container">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Enter percentage (0-100%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                style={{
                  fontSize: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${validationError ? '#FF6B6B' : '#E9ECEF'}`,
                  width: '120px',
                  textAlign: 'center'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue) {
                    handleSubmit(Number(inputValue));
                  }
                }}
              />
              <span style={{ fontSize: '24px', fontWeight: '600', color: '#666' }}>%</span>
              <button
                onClick={() => handleSubmit(Number(inputValue))}
                disabled={!inputValue || !!validationError}
                style={{
                  background: inputValue && !validationError
                    ? 'linear-gradient(135deg, #2E8B57, #228B22)'
                    : '#E9ECEF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: inputValue && !validationError ? 'pointer' : 'not-allowed',
                  marginLeft: '12px'
                }}
              >
                Submit
              </button>
            </div>

            {validationError && (
              <div style={{
                color: '#FF6B6B',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {validationError}
              </div>
            )}

            {question.criticalThreshold && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#FFF3CD',
                border: '1px solid #FFEAA7',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#856404'
              }}>
                ⚠️ Values above {question.criticalThreshold}% indicate high risk
              </div>
            )}
          </div>
        );

      case 'yes_no':
        return (
          <div className="yes-no-container">
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => handleSubmit('yes')}
                style={{
                  background: 'linear-gradient(135deg, #2E8B57, #228B22)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '20px 40px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '120px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Yes
              </button>

              <button
                onClick={() => handleSubmit('no')}
                style={{
                  background: question.businessKiller
                    ? 'linear-gradient(135deg, #DC143C, #B22222)'
                    : 'linear-gradient(135deg, #6C757D, #495057)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '20px 40px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '120px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                No
              </button>
            </div>
          </div>
        );

      case 'scale':
        return (
          <div className="scale-container">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
              Rate from 1 (Poor) to 10 (Excellent)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => handleSubmit(num)}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid #E9ECEF',
                    background: num <= 3 ? '#FFE5E5' : num <= 6 ? '#FFF3CD' : '#D4EDDA',
                    color: num <= 3 ? '#DC3545' : num <= 6 ? '#856404' : '#155724',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '#E9ECEF';
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-card">
      {/* Question header */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          lineHeight: '1.4',
          marginBottom: '16px',
          color: '#2C3E50',
          fontWeight: '600'
        }}>
          {question.question}
        </h3>

        {/* Ghana context */}
        {question.ghanaMeta && (
          <div style={{
            background: '#F8F9FA',
            border: '1px solid #E9ECEF',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: '#666',
            marginBottom: '16px'
          }}>
            <strong>🇬🇭 Ghana Context:</strong> {question.ghanaMeta.localContext}
          </div>
        )}

        {/* Business killer warning */}
        {question.businessKiller && (
          <div style={{
            background: '#FFE5E5',
            border: '1px solid #FF6B6B',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: '#D63031',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px' }}>⚠️</span>
            <strong>Critical Question:</strong> This could reveal a business-killing issue
          </div>
        )}
      </div>

      {/* Question input */}
      {renderQuestionInput()}

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #E9ECEF'
      }}>
        {onPrevious ? (
          <button
            onClick={onPrevious}
            style={{
              background: 'none',
              border: '2px solid #E9ECEF',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
              e.currentTarget.style.color = '#D4AF37';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E9ECEF';
              e.currentTarget.style.color = '#666';
            }}
          >
            ← Previous
          </button>
        ) : <div />}

        <div style={{ fontSize: '12px', color: '#999' }}>
          Question {question.category.replace('_', ' ')}
        </div>
      </div>

      {/* Insight overlay */}
      {showInsight && insightMessage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
            <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
              {insightMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;