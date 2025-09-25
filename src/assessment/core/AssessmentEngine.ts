/**
 * Assessment Engine - Core Business Logic
 * Handles question flow, scoring, and risk analysis
 */

import {
  Question,
  AssessmentResult,
  BusinessIssue,
  BusinessCategory,
  RiskLevel,
  OnboardingData
} from '../types/assessment.types';
import { RiskAnalyzer, CompoundRisk } from './RiskAnalyzer';

export class AssessmentEngine {
  private static instance: AssessmentEngine;

  public static getInstance(): AssessmentEngine {
    if (!AssessmentEngine.instance) {
      AssessmentEngine.instance = new AssessmentEngine();
    }
    return AssessmentEngine.instance;
  }

  /**
   * Determines next question based on current answers
   */
  getNextQuestion(
    questions: Question[],
    currentIndex: number,
    answers: Record<string, any>
  ): number {
    // Check if we should skip questions based on conditions
    for (let i = currentIndex + 1; i < questions.length; i++) {
      const question = questions[i];

      if (this.shouldShowQuestion(question, answers)) {
        return i;
      }
    }

    return questions.length; // Assessment complete
  }

  /**
   * Checks if question should be shown based on conditions
   */
  private shouldShowQuestion(question: Question, answers: Record<string, any>): boolean {
    if (!question.conditions || question.conditions.length === 0) {
      return true;
    }

    return question.conditions.every(condition => {
      const answerValue = answers[condition.dependsOn];

      switch (condition.operator) {
        case 'equals':
          return answerValue === condition.value;
        case 'greater_than':
          return Number(answerValue) > Number(condition.value);
        case 'less_than':
          return Number(answerValue) < Number(condition.value);
        case 'contains':
          return String(answerValue).includes(String(condition.value));
        default:
          return true;
      }
    });
  }

  /**
   * Calculates comprehensive assessment score
   */
  calculateScore(questions: Question[], answers: Record<string, any>): AssessmentResult {
    const riskAnalyzer = RiskAnalyzer.getInstance();
    const categoryTotals: Record<BusinessCategory, number> = {
      financial_health: 0,
      operational_resilience: 0,
      market_position: 0,
      compliance_risk: 0,
      growth_readiness: 0
    };

    const categoryWeights: Record<BusinessCategory, number> = {
      financial_health: 0,
      operational_resilience: 0,
      market_position: 0,
      compliance_risk: 0,
      growth_readiness: 0
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const criticalIssues: BusinessIssue[] = [];

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer === undefined) return;

      let questionScore = 0;

      // Calculate question score based on type
      switch (question.type) {
        case 'multiple':
          if (question.options) {
            const selectedOption = question.options.find(opt => opt.text === answer);
            questionScore = selectedOption ? selectedOption.score : 0;

            // Check for critical issues
            if (selectedOption && selectedOption.riskLevel === 'critical' && question.businessKiller) {
              criticalIssues.push(this.createCriticalIssue(question, selectedOption));
            }
          }
          break;

        case 'percentage':
        case 'number':
          const numValue = Number(answer);
          if (question.criticalThreshold && numValue > Number(question.criticalThreshold)) {
            questionScore = Math.max(0, 100 - (numValue / Number(question.criticalThreshold)) * 100);

            if (question.businessKiller) {
              criticalIssues.push(this.createCriticalIssueFromThreshold(question, numValue));
            }
          } else {
            questionScore = Math.min(100, (numValue / 100) * 100);
          }
          break;

        case 'yes_no':
          questionScore = answer === 'yes' ? 100 : 0;
          if (answer === 'no' && question.businessKiller) {
            criticalIssues.push(this.createCriticalIssue(question));
          }
          break;

        case 'scale':
          questionScore = (Number(answer) / 10) * 100;
          break;
      }

      const weightedScore = questionScore * question.weight;
      categoryTotals[question.category] += weightedScore;
      categoryWeights[question.category] += question.weight;

      totalWeightedScore += weightedScore;
      totalWeight += question.weight;
    });

    // Calculate category scores
    const categoryScores: Record<BusinessCategory, number> = Object.keys(categoryTotals).reduce(
      (acc, category) => {
        const cat = category as BusinessCategory;
        acc[cat] = categoryWeights[cat] > 0
          ? Math.round(categoryTotals[cat] / categoryWeights[cat])
          : 0;
        return acc;
      },
      {} as Record<BusinessCategory, number>
    );

    // Use advanced scoring with risk analysis
    const compoundRisks = riskAnalyzer.analyzeCompoundRisks(answers);
    const overallScore = riskAnalyzer.calculateAdvancedScore(answers, compoundRisks);
    const predictiveMetrics = riskAnalyzer.calculatePredictiveMetrics(answers, compoundRisks);

    // Convert compound risks to business issues
    const compoundIssues: BusinessIssue[] = compoundRisks.map((risk, index) => ({
      id: risk.id,
      title: risk.name,
      severity: risk.severity === 'critical' ? 'urgent' : risk.severity === 'high' ? 'important' : 'monitor',
      impact: risk.impact,
      solution: risk.mitigation.join('; '),
      timeframe: risk.severity === 'critical' ? 'Immediate' : '30 days',
      category: 'financial_health', // Default category
      priority: (1 - risk.probability) * 100 + index
    }));

    // Combine with regular critical issues
    const allCriticalIssues = [...criticalIssues, ...compoundIssues]
      .sort((a, b) => b.priority - a.priority);

    return {
      overallScore,
      riskLevel: this.determineRiskLevel(overallScore, criticalIssues.length),
      categoryScores,
      criticalIssues: allCriticalIssues,
      strengthsToLeverage: this.identifyStrengths(categoryScores),
      competitiveAdvantages: this.identifyAdvantages(answers, categoryScores),
      benchmarkComparison: this.getBenchmarkComparison(overallScore),
      nextSteps: this.generateNextSteps(categoryScores, allCriticalIssues),
      fundingReadiness: this.assessFundingReadiness(categoryScores, allCriticalIssues),
      predictiveAnalytics: predictiveMetrics,
      timestamp: new Date().toISOString()
    };
  }

  private createCriticalIssue(question: Question, option?: any): BusinessIssue {
    return {
      id: question.id,
      title: this.generateIssueTitle(question),
      severity: 'urgent',
      impact: question.insight,
      solution: this.generateSolution(question),
      timeframe: question.businessKiller ? 'Immediate' : '30 days',
      category: question.category,
      priority: question.businessKiller ? 100 : 75
    };
  }

  private createCriticalIssueFromThreshold(question: Question, value: number): BusinessIssue {
    return {
      id: question.id,
      title: `Critical: ${question.question.replace('?', '')}`,
      severity: 'urgent',
      impact: `Value of ${value}% exceeds safe threshold of ${question.criticalThreshold}%`,
      solution: this.generateSolution(question),
      timeframe: 'Immediate',
      category: question.category,
      priority: 95
    };
  }

  private generateIssueTitle(question: Question): string {
    const categoryTitles = {
      financial_health: 'Critical Cash Flow Issue',
      operational_resilience: 'Operational Risk Detected',
      market_position: 'Market Vulnerability',
      compliance_risk: 'Compliance Violation Risk',
      growth_readiness: 'Growth Barrier Identified'
    };

    return categoryTitles[question.category] || 'Business Risk Identified';
  }

  private generateSolution(question: Question): string {
    // This would be expanded with specific solutions per question
    const categorySolutions = {
      financial_health: 'Implement emergency cash flow management and seek immediate funding',
      operational_resilience: 'Strengthen operational processes and build redundancy',
      market_position: 'Diversify customer base and improve competitive positioning',
      compliance_risk: 'Achieve immediate regulatory compliance to avoid shutdowns',
      growth_readiness: 'Address structural barriers before pursuing growth'
    };

    return categorySolutions[question.category] || 'Implement corrective measures immediately';
  }

  private determineRiskLevel(score: number, criticalIssues: number): AssessmentResult['riskLevel'] {
    if (criticalIssues > 2 || score < 40) return 'Critical Risk';
    if (criticalIssues > 0 || score < 60) return 'High Risk';
    if (score < 75) return 'Moderate Risk';
    return 'Low Risk';
  }

  private identifyStrengths(categoryScores: Record<BusinessCategory, number>): string[] {
    const strengths: string[] = [];

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score >= 80) {
        const strengthMap = {
          financial_health: 'Strong financial management and cash flow control',
          operational_resilience: 'Robust operational processes and efficiency',
          market_position: 'Strong market position and customer relationships',
          compliance_risk: 'Excellent regulatory compliance',
          growth_readiness: 'Well-positioned for growth and expansion'
        };

        strengths.push(strengthMap[category as BusinessCategory] || 'Strong performance in key area');
      }
    });

    return strengths;
  }

  private identifyAdvantages(answers: Record<string, any>, categoryScores: Record<BusinessCategory, number>): string[] {
    const advantages: string[] = [];

    // This would be expanded based on specific answer combinations
    if (categoryScores.market_position > 75 && categoryScores.financial_health > 70) {
      advantages.push('Strong market position backed by solid financials');
    }

    if (categoryScores.operational_resilience > 80) {
      advantages.push('Operational excellence provides competitive edge');
    }

    return advantages;
  }

  private getBenchmarkComparison(score: number) {
    // Ghana SME benchmarks (would be data-driven in production)
    return {
      yourScore: score,
      industryAverage: 58,
      topPerformers: 82,
      percentile: Math.min(95, Math.round((score / 82) * 100))
    };
  }

  private generateNextSteps(
    categoryScores: Record<BusinessCategory, number>,
    criticalIssues: BusinessIssue[]
  ) {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const strategic: string[] = [];

    // Immediate actions for critical issues
    criticalIssues.forEach(issue => {
      if (issue.severity === 'urgent') {
        immediate.push(issue.solution);
      }
    });

    // Short-term improvements for low-scoring categories
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 60) {
        const improvements = {
          financial_health: 'Implement monthly financial reporting and cash flow forecasting',
          operational_resilience: 'Document key processes and create backup systems',
          market_position: 'Develop customer retention program and market research',
          compliance_risk: 'Complete regulatory audit and implement compliance checklist',
          growth_readiness: 'Create business plan and identify growth opportunities'
        };

        shortTerm.push(improvements[category as BusinessCategory] || 'Address identified weaknesses');
      }
    });

    // Strategic initiatives for growth
    if (categoryScores.financial_health > 70 && categoryScores.compliance_risk > 70) {
      strategic.push('Consider growth financing options and expansion planning');
    }

    return { immediate, shortTerm, strategic };
  }

  private assessFundingReadiness(
    categoryScores: Record<BusinessCategory, number>,
    criticalIssues: BusinessIssue[]
  ) {
    const averageScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 5;
    const hasCriticalIssues = criticalIssues.some(issue => issue.severity === 'urgent');

    let fundingScore = averageScore;

    if (hasCriticalIssues) {
      fundingScore = Math.min(fundingScore, 40);
    }

    const recommendations = {
      high: 'Ready for investment - strong fundamentals across all areas',
      medium: 'Address identified issues before seeking funding',
      low: 'Significant improvements needed before investment readiness'
    };

    const level = fundingScore >= 75 ? 'high' : fundingScore >= 60 ? 'medium' : 'low';

    return {
      score: Math.round(fundingScore),
      recommendation: recommendations[level],
      requiredImprovements: criticalIssues.map(issue => issue.title)
    };
  }

  private calculatePredictiveAnalytics(
    categoryScores: Record<BusinessCategory, number>,
    criticalIssues: BusinessIssue[]
  ) {
    const baseHealth = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 5;
    const criticalCount = criticalIssues.filter(issue => issue.severity === 'urgent').length;

    // Simple predictive model (would be ML-based in production)
    const failureRisk = {
      '3_months': Math.max(0, 100 - baseHealth - (criticalCount * 20)),
      '6_months': Math.max(0, 80 - baseHealth - (criticalCount * 15)),
      '12_months': Math.max(0, 60 - baseHealth - (criticalCount * 10))
    };

    const growthPotential = {
      current: baseHealth,
      withRecommendations: Math.min(100, baseHealth + 25),
      withAcceleratorProgram: Math.min(100, baseHealth + 40)
    };

    return {
      failureProbability: failureRisk,
      growthPotential
    };
  }
}