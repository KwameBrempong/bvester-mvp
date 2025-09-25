/**
 * Growth Accelerator Enrollment Flow
 * Handles the seamless enrollment process from assessment to program
 */

import React, { useState } from 'react';
import { AssessmentResult } from '../types/assessment.types';

interface EnrollmentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface GrowthAcceleratorEnrollmentProps {
  moduleId: string;
  assessmentResult: AssessmentResult;
  userProfile: any;
  onEnrollmentComplete: (enrollmentData: any) => void;
  onBack: () => void;
}

const MODULE_DETAILS = {
  financial_mastery: {
    title: 'Financial Mastery Track',
    price: 'GHS 2,500',
    duration: '8 weeks',
    startDate: 'Next Monday',
    spots: '12 remaining',
    urgency: 'critical'
  },
  operational_excellence: {
    title: 'Operational Excellence Program',
    price: 'GHS 2,200',
    duration: '6 weeks',
    startDate: 'Next Wednesday',
    spots: '8 remaining',
    urgency: 'high'
  },
  market_domination: {
    title: 'Market Domination Strategy',
    price: 'GHS 3,000',
    duration: '10 weeks',
    startDate: 'Next Friday',
    spots: '15 remaining',
    urgency: 'medium'
  },
  compliance_shield: {
    title: 'Compliance & Risk Shield',
    price: 'GHS 1,800',
    duration: '4 weeks',
    startDate: 'Immediate',
    spots: '5 remaining',
    urgency: 'critical'
  },
  growth_rocket: {
    title: 'Growth Rocket Accelerator',
    price: 'GHS 4,500',
    duration: '12 weeks',
    startDate: 'Next Month',
    spots: '20 remaining',
    urgency: 'low'
  }
};

export const GrowthAcceleratorEnrollment: React.FC<GrowthAcceleratorEnrollmentProps> = ({
  moduleId,
  assessmentResult,
  userProfile,
  onEnrollmentComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState({
    contactInfo: {
      phone: '',
      whatsapp: '',
      preferredTime: '',
      businessAddress: ''
    },
    businessGoals: {
      primaryGoal: '',
      timeframe: '',
      currentChallenges: '',
      successMetrics: ''
    },
    commitment: {
      timeAvailability: '',
      investmentReadiness: false,
      implementationCommitment: false
    }
  });

  const module = MODULE_DETAILS[moduleId as keyof typeof MODULE_DETAILS];

  const enrollmentSteps: EnrollmentStep[] = [
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'How can we reach you?',
      completed: false
    },
    {
      id: 'goals',
      title: 'Business Goals',
      description: 'What do you want to achieve?',
      completed: false
    },
    {
      id: 'commitment',
      title: 'Commitment Level',
      description: 'Are you ready for transformation?',
      completed: false
    },
    {
      id: 'payment',
      title: 'Secure Your Spot',
      description: 'Complete enrollment',
      completed: false
    }
  ];

  const updateEnrollmentData = (step: string, data: any) => {
    setEnrollmentData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof typeof prev], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < enrollmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const renderContactStep = () => (
    <div className="enrollment-step">
      <h3>Let's Get Connected</h3>
      <p>We'll use this information to coordinate your program experience and provide personalized support.</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Primary Phone Number *</label>
          <input
            type="tel"
            placeholder="e.g., +233 24 123 4567"
            value={enrollmentData.contactInfo.phone}
            onChange={(e) => updateEnrollmentData('contactInfo', { phone: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>WhatsApp Number</label>
          <input
            type="tel"
            placeholder="For quick updates and support"
            value={enrollmentData.contactInfo.whatsapp}
            onChange={(e) => updateEnrollmentData('contactInfo', { whatsapp: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Best Time to Call</label>
          <select
            value={enrollmentData.contactInfo.preferredTime}
            onChange={(e) => updateEnrollmentData('contactInfo', { preferredTime: e.target.value })}
          >
            <option value="">Select preferred time</option>
            <option value="morning">Morning (8am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 5pm)</option>
            <option value="evening">Evening (5pm - 8pm)</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Business Address</label>
          <textarea
            placeholder="Your business location (for potential in-person sessions)"
            value={enrollmentData.contactInfo.businessAddress}
            onChange={(e) => updateEnrollmentData('contactInfo', { businessAddress: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="enrollment-step">
      <h3>Your Business Transformation Goals</h3>
      <p>Understanding your specific goals helps us customize the program for maximum impact.</p>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Primary Goal for This Program *</label>
          <select
            value={enrollmentData.businessGoals.primaryGoal}
            onChange={(e) => updateEnrollmentData('businessGoals', { primaryGoal: e.target.value })}
            required
          >
            <option value="">Select your primary goal</option>
            <option value="survival">Business Survival - Stop bleeding money</option>
            <option value="stability">Achieve Financial Stability</option>
            <option value="growth">Scale Up Operations</option>
            <option value="investment">Prepare for Investment</option>
            <option value="expansion">Market Expansion</option>
          </select>
        </div>

        <div className="form-group">
          <label>Desired Timeframe *</label>
          <select
            value={enrollmentData.businessGoals.timeframe}
            onChange={(e) => updateEnrollmentData('businessGoals', { timeframe: e.target.value })}
            required
          >
            <option value="">Select timeframe</option>
            <option value="immediate">Immediate (1-3 months)</option>
            <option value="short">Short-term (3-6 months)</option>
            <option value="medium">Medium-term (6-12 months)</option>
            <option value="long">Long-term (1+ years)</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Current Biggest Challenges</label>
          <textarea
            placeholder="What are the 2-3 biggest challenges holding your business back right now?"
            value={enrollmentData.businessGoals.currentChallenges}
            onChange={(e) => updateEnrollmentData('businessGoals', { currentChallenges: e.target.value })}
            rows={4}
          />
        </div>

        <div className="form-group full-width">
          <label>Success Metrics</label>
          <textarea
            placeholder="How will you measure success from this program? (e.g., 'Increase monthly revenue by 50%', 'Build 3-month cash runway')"
            value={enrollmentData.businessGoals.successMetrics}
            onChange={(e) => updateEnrollmentData('businessGoals', { successMetrics: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderCommitmentStep = () => (
    <div className="enrollment-step">
      <h3>Your Commitment to Success</h3>
      <p>This program requires dedication and implementation. We want to ensure you're ready for real transformation.</p>

      <div className="commitment-section">
        <div className="form-group">
          <label>Weekly Time Availability *</label>
          <select
            value={enrollmentData.commitment.timeAvailability}
            onChange={(e) => updateEnrollmentData('commitment', { timeAvailability: e.target.value })}
            required
          >
            <option value="">How many hours per week can you dedicate?</option>
            <option value="5-10">5-10 hours per week</option>
            <option value="10-15">10-15 hours per week</option>
            <option value="15-20">15-20 hours per week</option>
            <option value="20+">20+ hours per week</option>
          </select>
        </div>

        <div className="commitment-checkboxes">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="investment"
              checked={enrollmentData.commitment.investmentReadiness}
              onChange={(e) => updateEnrollmentData('commitment', { investmentReadiness: e.target.checked })}
            />
            <label htmlFor="investment">
              <strong>I understand this is an investment in my business future</strong>
              <br />
              <small>This program requires both financial investment and time commitment for results</small>
            </label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="implementation"
              checked={enrollmentData.commitment.implementationCommitment}
              onChange={(e) => updateEnrollmentData('commitment', { implementationCommitment: e.target.checked })}
            />
            <label htmlFor="implementation">
              <strong>I commit to implementing the strategies taught</strong>
              <br />
              <small>Success requires action - I will apply what I learn to my business</small>
            </label>
          </div>
        </div>

        <div className="success-mindset">
          <h4>🎯 Success Mindset Check</h4>
          <div className="mindset-points">
            <div className="mindset-point">
              ✓ I'm ready to make difficult but necessary business changes
            </div>
            <div className="mindset-point">
              ✓ I will attend all sessions and complete assignments
            </div>
            <div className="mindset-point">
              ✓ I understand that transformation takes time and consistency
            </div>
            <div className="mindset-point">
              ✓ I'm committed to following the proven system, not just taking parts
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="enrollment-step">
      <h3>Secure Your Transformation Spot</h3>

      <div className="enrollment-summary">
        <div className="program-summary">
          <h4>{module.title}</h4>
          <div className="program-details">
            <div className="detail">
              <span className="label">Investment:</span>
              <span className="value">{module.price}</span>
            </div>
            <div className="detail">
              <span className="label">Duration:</span>
              <span className="value">{module.duration}</span>
            </div>
            <div className="detail">
              <span className="label">Starts:</span>
              <span className="value">{module.startDate}</span>
            </div>
            <div className="detail urgency">
              <span className="label">Available Spots:</span>
              <span className="value" style={{ color: getUrgencyColor(module.urgency) }}>
                {module.spots}
              </span>
            </div>
          </div>
        </div>

        <div className="assessment-bonus">
          <div className="bonus-badge">🎁 ASSESSMENT BONUS</div>
          <p>Because you completed our assessment, you get:</p>
          <ul>
            <li>✓ Personalized action plan based on your specific results</li>
            <li>✓ Priority placement in cohort</li>
            <li>✓ Free 30-minute pre-program consultation</li>
            <li>✓ Digital copy of your detailed assessment report</li>
          </ul>
        </div>

        <div className="payment-options">
          <h4>Payment Options</h4>
          <div className="payment-methods">
            <div className="payment-option">
              <input type="radio" id="full" name="payment" value="full" defaultChecked />
              <label htmlFor="full">
                <div className="payment-header">
                  <strong>Pay in Full</strong>
                  <span className="discount-badge">Save 15%</span>
                </div>
                <div className="payment-amount">{module.price} → GHS {Math.round(parseFloat(module.price.replace('GHS ', '').replace(',', '')) * 0.85).toLocaleString()}</div>
                <small>One-time payment with maximum savings</small>
              </label>
            </div>

            <div className="payment-option">
              <input type="radio" id="installments" name="payment" value="installments" />
              <label htmlFor="installments">
                <div className="payment-header">
                  <strong>3 Monthly Installments</strong>
                </div>
                <div className="payment-amount">GHS {Math.round(parseFloat(module.price.replace('GHS ', '').replace(',', '')) / 3).toLocaleString()} × 3</div>
                <small>Spread payments over program duration</small>
              </label>
            </div>
          </div>
        </div>

        <div className="guarantee">
          <h4>🛡️ Your Success is Guaranteed</h4>
          <p>
            <strong>30-Day Money-Back Guarantee:</strong> If you're not satisfied with the program quality
            within the first 30 days, get a full refund.
          </p>
          <p>
            <strong>Results Guarantee:</strong> Follow our system and see measurable improvement in your
            key metrics within 90 days, or we'll work with you for free until you do.
          </p>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return enrollmentData.contactInfo.phone.length > 0;
      case 1:
        return enrollmentData.businessGoals.primaryGoal && enrollmentData.businessGoals.timeframe;
      case 2:
        return enrollmentData.commitment.timeAvailability &&
               enrollmentData.commitment.investmentReadiness &&
               enrollmentData.commitment.implementationCommitment;
      default:
        return true;
    }
  };

  const handleFinalEnrollment = () => {
    // This would integrate with Stripe and your backend
    const finalEnrollmentData = {
      moduleId,
      ...enrollmentData,
      assessmentResult,
      userProfile,
      timestamp: new Date().toISOString()
    };

    onEnrollmentComplete(finalEnrollmentData);
  };

  return (
    <div className="growth-accelerator-enrollment">
      <div className="enrollment-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Recommendations
        </button>
        <div className="program-info">
          <h2>{module.title}</h2>
          <div className="urgency-indicator" style={{ backgroundColor: getUrgencyColor(module.urgency) }}>
            {module.spots}
          </div>
        </div>
      </div>

      <div className="enrollment-progress">
        <div className="progress-steps">
          {enrollmentSteps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="enrollment-content">
        {currentStep === 0 && renderContactStep()}
        {currentStep === 1 && renderGoalsStep()}
        {currentStep === 2 && renderCommitmentStep()}
        {currentStep === 3 && renderPaymentStep()}
      </div>

      <div className="enrollment-actions">
        {currentStep > 0 && (
          <button className="btn secondary" onClick={previousStep}>
            Previous
          </button>
        )}

        {currentStep < enrollmentSteps.length - 1 ? (
          <button
            className="btn primary"
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Continue
          </button>
        ) : (
          <button
            className="btn enroll-final"
            onClick={handleFinalEnrollment}
            disabled={!canProceed()}
          >
            🚀 Complete Enrollment - {module.price}
          </button>
        )}
      </div>

      <style>{`
        .growth-accelerator-enrollment {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .enrollment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .back-button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #e5e7eb;
        }

        .program-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .program-info h2 {
          margin: 0;
          color: #1f2937;
        }

        .urgency-indicator {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .enrollment-progress {
          margin-bottom: 40px;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .progress-step {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .progress-step.active {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .progress-step.completed {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .progress-step.active .step-number {
          background: #3b82f6;
          color: white;
        }

        .progress-step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step-info {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .step-description {
          font-size: 12px;
          color: #6b7280;
        }

        .enrollment-step h3 {
          color: #1f2937;
          margin-bottom: 8px;
        }

        .enrollment-step p {
          color: #6b7280;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .commitment-section {
          space-y: 25px;
        }

        .commitment-checkboxes {
          margin: 25px 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .checkbox-group input[type="checkbox"] {
          margin-top: 2px;
          width: 18px;
          height: 18px;
        }

        .checkbox-group label {
          flex: 1;
          cursor: pointer;
        }

        .success-mindset {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #bbf7d0;
          margin-top: 25px;
        }

        .success-mindset h4 {
          color: #065f46;
          margin-bottom: 15px;
        }

        .mindset-points {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mindset-point {
          color: #047857;
          font-weight: 500;
          font-size: 14px;
        }

        .enrollment-summary {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .program-summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .program-summary h4 {
          color: #1e40af;
          margin-bottom: 15px;
        }

        .program-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail .label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .detail .value {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
        }

        .assessment-bonus {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #f59e0b;
        }

        .bonus-badge {
          background: #f59e0b;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 12px;
        }

        .assessment-bonus ul {
          margin: 12px 0;
          padding-left: 20px;
        }

        .assessment-bonus li {
          margin-bottom: 6px;
          color: #92400e;
        }

        .payment-options h4 {
          color: #1f2937;
          margin-bottom: 15px;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .payment-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .payment-option:hover {
          border-color: #3b82f6;
        }

        .payment-option input[type="radio"]:checked + label {
          border-color: #3b82f6;
        }

        .payment-option label {
          flex: 1;
          cursor: pointer;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .discount-badge {
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .payment-amount {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .guarantee {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #bbf7d0;
        }

        .guarantee h4 {
          color: #065f46;
          margin-bottom: 12px;
        }

        .guarantee p {
          color: #047857;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .enrollment-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 16px;
        }

        .btn.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn.secondary:hover {
          background: #e5e7eb;
        }

        .btn.primary {
          background: #3b82f6;
          color: white;
        }

        .btn.primary:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-2px);
        }

        .btn.enroll-final {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: white;
          padding: 15px 40px;
          font-size: 18px;
        }

        .btn.enroll-final:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .growth-accelerator-enrollment {
            padding: 15px;
          }

          .enrollment-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .progress-steps {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .program-details {
            grid-template-columns: 1fr;
          }

          .payment-methods {
            gap: 10px;
          }

          .enrollment-actions {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};