/**
 * Risk Analyzer - Phase 3 Implementation
 * Advanced risk correlation and prediction engine
 */

import { Question, BusinessIssue, AssessmentResult } from '../types/assessment.types';

export interface CompoundRisk {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium';
  factors: string[];
  probability: number;
  impact: string;
  mitigation: string[];
}

export interface PredictiveMetrics {
  failureProbability: {
    '3_months': number;
    '6_months': number;
    '12_months': number;
  };
  survivalFactors: string[];
  criticalInterventions: string[];
  recoveryTimeEstimate: string;
}

export class RiskAnalyzer {
  private static instance: RiskAnalyzer;

  public static getInstance(): RiskAnalyzer {
    if (!RiskAnalyzer.instance) {
      RiskAnalyzer.instance = new RiskAnalyzer();
    }
    return RiskAnalyzer.instance;
  }

  /**
   * Identifies compound risks based on answer combinations
   */
  analyzeCompoundRisks(answers: Record<string, any>): CompoundRisk[] {
    const compoundRisks: CompoundRisk[] = [];

    // Critical Cash Flow Crisis (multiple factors)
    if (this.isCashFlowCrisis(answers)) {
      compoundRisks.push({
        id: 'cash_flow_crisis',
        name: 'Imminent Cash Flow Collapse',
        severity: 'critical',
        factors: [
          'Less than 30 days cash runway',
          'High receivables aging',
          'Thin profit margins'
        ],
        probability: 0.95,
        impact: 'Business failure within 60-90 days without immediate action',
        mitigation: [
          'Emergency cash flow management plan',
          'Aggressive collections on outstanding receivables',
          'Immediate cost reduction measures',
          'Emergency funding search (family, friends, emergency loans)'
        ]
      });
    }

    // Customer Concentration Death Spiral
    if (this.isCustomerConcentrationTrap(answers)) {
      compoundRisks.push({
        id: 'customer_concentration_trap',
        name: 'Customer Concentration Death Spiral',
        severity: 'critical',
        factors: [
          'Over 60% revenue from top 3 customers',
          'No competitive differentiation',
          'Weak cash position'
        ],
        probability: 0.85,
        impact: 'Loss of major customer could immediately destroy business',
        mitigation: [
          'Emergency customer diversification plan',
          'Strengthen relationships with existing major customers',
          'Develop unique value propositions',
          'Build emergency customer pipeline'
        ]
      });
    }

    // Owner Dependency Crisis
    if (this.isOwnerDependencyCrisis(answers)) {
      compoundRisks.push({
        id: 'owner_dependency_crisis',
        name: 'Critical Owner Dependency',
        severity: 'high',
        factors: [
          'Business collapses without owner',
          'No documented processes',
          'Single point of failure'
        ],
        probability: 0.75,
        impact: 'Owner illness or absence could immediately halt operations',
        mitigation: [
          'Document all critical processes immediately',
          'Train key team members',
          'Create succession plan',
          'Implement systems and procedures'
        ]
      });
    }

    // Compliance Shutdown Risk
    if (this.isComplianceShutdownRisk(answers)) {
      compoundRisks.push({
        id: 'compliance_shutdown',
        name: 'Regulatory Shutdown Risk',
        severity: 'critical',
        factors: [
          'Non-compliant with GRA',
          'Missing business registrations',
          'Tax payment delays'
        ],
        probability: 0.80,
        impact: 'Government agencies could shut down business without warning',
        mitigation: [
          'Immediate compliance audit',
          'Engage tax advisor/accountant',
          'Set up payment plans with authorities',
          'Complete all outstanding registrations'
        ]
      });
    }

    // Profitability Death Spiral
    if (this.isProfitabilityDeathSpiral(answers)) {
      compoundRisks.push({
        id: 'profitability_death_spiral',
        name: 'Unsustainable Business Model',
        severity: 'high',
        factors: [
          'Margins below 5%',
          'No pricing power',
          'Rising costs'
        ],
        probability: 0.70,
        impact: 'Business cannot survive economic shocks or invest in growth',
        mitigation: [
          'Immediate cost analysis and reduction',
          'Price optimization strategy',
          'Value-added service development',
          'Operational efficiency improvements'
        ]
      });
    }

    return compoundRisks.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Generates predictive analytics for business failure
   */
  calculatePredictiveMetrics(answers: Record<string, any>, compoundRisks: CompoundRisk[]): PredictiveMetrics {
    const criticalRisks = compoundRisks.filter(r => r.severity === 'critical');
    const highRisks = compoundRisks.filter(r => r.severity === 'high');

    // Calculate base failure probability
    let baseProbability = 0.15; // Ghana SME baseline

    // Adjust based on critical factors
    if (this.isCashFlowCrisis(answers)) baseProbability += 0.40;
    if (this.isCustomerConcentrationTrap(answers)) baseProbability += 0.30;
    if (this.isComplianceShutdownRisk(answers)) baseProbability += 0.35;
    if (this.isProfitabilityDeathSpiral(answers)) baseProbability += 0.25;
    if (this.isOwnerDependencyCrisis(answers)) baseProbability += 0.20;

    // Time decay factors
    const failureProbability = {
      '3_months': Math.min(0.95, baseProbability * 1.5),
      '6_months': Math.min(0.95, baseProbability * 1.2),
      '12_months': Math.min(0.95, baseProbability)
    };

    // Identify survival factors
    const survivalFactors = this.identifySurvivalFactors(answers);

    // Critical interventions
    const criticalInterventions = this.generateCriticalInterventions(compoundRisks);

    // Recovery time estimate
    const recoveryTimeEstimate = this.estimateRecoveryTime(failureProbability['6_months']);

    return {
      failureProbability,
      survivalFactors,
      criticalInterventions,
      recoveryTimeEstimate
    };
  }

  /**
   * Advanced business health scoring with risk weighting
   */
  calculateAdvancedScore(answers: Record<string, any>, compoundRisks: CompoundRisk[]): number {
    let baseScore = 75; // Start with average

    // Deduct for critical risks
    compoundRisks.forEach(risk => {
      switch (risk.severity) {
        case 'critical':
          baseScore -= 25 * risk.probability;
          break;
        case 'high':
          baseScore -= 15 * risk.probability;
          break;
        case 'medium':
          baseScore -= 8 * risk.probability;
          break;
      }
    });

    // Boost for positive factors
    if (this.hasStrongFinancials(answers)) baseScore += 10;
    if (this.hasGoodGovernance(answers)) baseScore += 8;
    if (this.hasDiversifiedRevenue(answers)) baseScore += 12;
    if (this.hasCompetitiveAdvantage(answers)) baseScore += 15;

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  // Private helper methods for risk detection

  private isCashFlowCrisis(answers: Record<string, any>): boolean {
    const cashRunway = answers['cash_runway_days'];
    const receivables = parseFloat(answers['receivables_aging'] || '0');
    const profitMargin = answers['profit_margin_reality'];

    const lowCashRunway = cashRunway?.includes('15-29 days') || cashRunway?.includes('Less than 15 days');
    const highReceivables = receivables > 30;
    const lowMargins = profitMargin?.includes('Below 5%') || profitMargin?.includes('5-10%');

    return lowCashRunway && (highReceivables || lowMargins);
  }

  private isCustomerConcentrationTrap(answers: Record<string, any>): boolean {
    const concentration = parseFloat(answers['customer_concentration_risk'] || '0');
    const differentiation = answers['competitive_differentiation'];

    const highConcentration = concentration > 60;
    const noDifferentiation = differentiation?.includes('Nothing significant') ||
                             differentiation?.includes('Lower prices');

    return highConcentration && noDifferentiation;
  }

  private isOwnerDependencyCrisis(answers: Record<string, any>): boolean {
    const ownerDependency = answers['key_person_dependency'];
    return ownerDependency?.includes('likely collapse') || ownerDependency?.includes('Significant problems');
  }

  private isComplianceShutdownRisk(answers: Record<string, any>): boolean {
    const graCompliance = answers['gra_tax_compliance'];
    return graCompliance?.includes('behind') || graCompliance?.includes('not registered');
  }

  private isProfitabilityDeathSpiral(answers: Record<string, any>): boolean {
    const profitMargin = answers['profit_margin_reality'];
    const differentiation = answers['competitive_differentiation'];

    const lowMargins = profitMargin?.includes('Below 5%') || profitMargin?.includes('5-10%');
    const priceCompetition = differentiation?.includes('Lower prices') ||
                           differentiation?.includes('Nothing significant');

    return lowMargins && priceCompetition;
  }

  private hasStrongFinancials(answers: Record<string, any>): boolean {
    const cashRunway = answers['cash_runway_days'];
    const profitMargin = answers['profit_margin_reality'];
    const emergencyFund = answers['emergency_fund'];

    const goodCash = cashRunway?.includes('90+ days') || cashRunway?.includes('60-89 days');
    const goodMargins = profitMargin?.includes('Above 25%') || profitMargin?.includes('15-25%');
    const hasEmergency = emergencyFund?.includes('6+ months') || emergencyFund?.includes('3-6 months');

    return goodCash && goodMargins && hasEmergency;
  }

  private hasGoodGovernance(answers: Record<string, any>): boolean {
    const records = answers['financial_records_quality'];
    const graCompliance = answers['gra_tax_compliance'];

    const goodRecords = records?.includes('Professional') || records?.includes('Basic system');
    const compliant = graCompliance?.includes('Fully compliant');

    return goodRecords && compliant;
  }

  private hasDiversifiedRevenue(answers: Record<string, any>): boolean {
    const concentration = parseFloat(answers['customer_concentration_risk'] || '100');
    return concentration < 40;
  }

  private hasCompetitiveAdvantage(answers: Record<string, any>): boolean {
    const differentiation = answers['competitive_differentiation'];
    return differentiation?.includes('Unique product') || differentiation?.includes('Better quality');
  }

  private identifySurvivalFactors(answers: Record<string, any>): string[] {
    const factors: string[] = [];

    if (this.hasStrongFinancials(answers)) {
      factors.push('Strong financial foundation provides resilience');
    }

    if (this.hasGoodGovernance(answers)) {
      factors.push('Good governance and compliance reduce regulatory risks');
    }

    if (this.hasDiversifiedRevenue(answers)) {
      factors.push('Diversified customer base provides stability');
    }

    if (this.hasCompetitiveAdvantage(answers)) {
      factors.push('Clear competitive advantage protects market position');
    }

    const digitalPayments = parseFloat(answers['digital_payment_adoption'] || '0');
    if (digitalPayments > 50) {
      factors.push('Digital payment adoption improves cash flow and reduces risks');
    }

    return factors;
  }

  private generateCriticalInterventions(compoundRisks: CompoundRisk[]): string[] {
    const interventions: string[] = [];

    compoundRisks
      .filter(risk => risk.severity === 'critical')
      .forEach(risk => {
        interventions.push(...risk.mitigation);
      });

    // Remove duplicates
    return Array.from(new Set(interventions));
  }

  private estimateRecoveryTime(sixMonthFailureProb: number): string {
    if (sixMonthFailureProb > 0.8) {
      return '12-18 months with aggressive intervention';
    } else if (sixMonthFailureProb > 0.6) {
      return '8-12 months with focused improvements';
    } else if (sixMonthFailureProb > 0.4) {
      return '6-9 months with moderate changes';
    } else {
      return '3-6 months with minor adjustments';
    }
  }
}