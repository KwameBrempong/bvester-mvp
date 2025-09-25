/**
 * Ghana SME Assessment Service
 * Professional business assessment tailored for Ghana's SME ecosystem
 * Focuses on critical failure points and investment readiness
 */

import { assessmentService } from './dataService';

export interface CriticalQuestion {
  id: string;
  question: string;
  type: 'multiple' | 'scale' | 'percentage' | 'number' | 'yes_no' | 'financial';
  category: 'financial_health' | 'operational_resilience' | 'market_position' | 'compliance_risk' | 'growth_readiness';
  options?: Array<{
    text: string;
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  range?: [number, number];
  weight: number;
  criticalThreshold?: number | string;
  businessKiller?: boolean; // Marks questions that can identify fatal issues
  insight: string;
  ghanaMeta: {
    localContext: string;
    regulatoryImplications?: string;
    marketReality: string;
  };
}

export interface AssessmentResult {
  overallScore: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  categoryScores: {
    financial_health: number;
    operational_resilience: number;
    market_position: number;
    compliance_risk: number;
    growth_readiness: number;
  };
  criticalIssues: Array<{
    id: string;
    title: string;
    severity: 'urgent' | 'important' | 'monitor';
    impact: string;
    solution: string;
    timeframe: string;
    category: string;
  }>;
  strengthsToLeverage: string[];
  competitiveAdvantages: string[];
  benchmarkComparison: {
    yourScore: number;
    industryAverage: number;
    topPerformers: number;
    percentile: number;
  };
  nextSteps: {
    immediate: string[];
    shortTerm: string[];
    strategic: string[];
  };
  fundingReadiness: {
    score: number;
    recommendation: string;
    requiredImprovements: string[];
  };
  timestamp: string;
}

// Ghana-specific critical questions that reveal business-killing issues
export const ghanaAssessmentQuestions: CriticalQuestion[] = [
  // FINANCIAL HEALTH - Most critical for survival
  {
    id: 'cash_runway_days',
    question: 'Based on your current expenses, how many days can your business operate without any new revenue?',
    type: 'multiple',
    category: 'financial_health',
    businessKiller: true,
    options: [
      { text: '90+ days - Strong cash reserves', score: 100, riskLevel: 'low' },
      { text: '60-89 days - Adequate reserves', score: 80, riskLevel: 'low' },
      { text: '30-59 days - Concerning', score: 50, riskLevel: 'medium' },
      { text: '15-29 days - High risk', score: 25, riskLevel: 'high' },
      { text: 'Less than 15 days - Critical danger', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.20,
    insight: '💸 78% of Ghanaian SMEs fail due to cash flow problems. Less than 30 days runway puts you in immediate danger.',
    ghanaMeta: {
      localContext: 'Ghana\'s irregular payment cycles and economic volatility make cash reserves critical',
      regulatoryImplications: 'Bank lending is expensive (25-30% interest), making self-funding essential',
      marketReality: 'Customers often delay payments by 60-90 days, especially government contracts'
    }
  },
  {
    id: 'receivables_aging',
    question: 'What percentage of your sales revenue is currently stuck in receivables older than 90 days?',
    type: 'percentage',
    category: 'financial_health',
    businessKiller: true,
    weight: 0.15,
    criticalThreshold: 30,
    insight: '🚨 Over 30% in old receivables indicates severe cash flow issues that can kill your business',
    ghanaMeta: {
      localContext: 'Ghana\'s payment culture often delays business payments',
      marketReality: 'Many businesses fail not from lack of sales, but from inability to collect'
    }
  },
  {
    id: 'customer_concentration_risk',
    question: 'What percentage of your total revenue comes from your top 3 customers?',
    type: 'percentage',
    category: 'market_position',
    businessKiller: true,
    weight: 0.15,
    criticalThreshold: 60,
    insight: '⚠️ Over 60% customer concentration is extremely dangerous - one customer loss could destroy you',
    ghanaMeta: {
      localContext: 'Ghana\'s small market makes customer concentration a common trap',
      marketReality: 'Large customers (banks, telcos, government) often dominate SME revenue'
    }
  },
  {
    id: 'profit_margin_reality',
    question: 'What is your actual net profit margin after ALL expenses (including your salary)?',
    type: 'multiple',
    category: 'financial_health',
    businessKiller: true,
    options: [
      { text: 'Above 25% - Excellent profitability', score: 100, riskLevel: 'low' },
      { text: '15-25% - Good profitability', score: 80, riskLevel: 'low' },
      { text: '10-15% - Acceptable but tight', score: 60, riskLevel: 'medium' },
      { text: '5-10% - Dangerously thin margins', score: 30, riskLevel: 'high' },
      { text: 'Below 5% or breakeven - Unsustainable', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.18,
    insight: '💰 Businesses with margins below 10% cannot survive economic shocks or invest in growth',
    ghanaMeta: {
      localContext: 'Ghana\'s inflation and currency volatility erode thin margins quickly',
      marketReality: 'Many SMEs think they\'re profitable but haven\'t accounted for all costs'
    }
  },

  // COMPLIANCE RISK - Can shut you down overnight
  {
    id: 'gra_tax_compliance',
    question: 'What is your current status with Ghana Revenue Authority (GRA) tax obligations?',
    type: 'multiple',
    category: 'compliance_risk',
    businessKiller: true,
    options: [
      { text: 'Fully compliant - All taxes current', score: 100, riskLevel: 'low' },
      { text: 'Minor delays - Behind 1-2 months', score: 70, riskLevel: 'medium' },
      { text: 'Significant delays - Behind 3-6 months', score: 40, riskLevel: 'high' },
      { text: 'Major non-compliance - Behind over 6 months', score: 15, riskLevel: 'critical' },
      { text: 'Never filed or registered', score: 5, riskLevel: 'critical' }
    ],
    weight: 0.12,
    insight: '🚫 GRA can freeze your bank accounts and shut down operations instantly for tax non-compliance',
    ghanaMeta: {
      localContext: 'GRA enforcement has increased significantly with digital systems',
      regulatoryImplications: 'Tax liens prevent you from getting loans or government contracts',
      marketReality: 'Many SMEs underestimate GRA\'s power to destroy businesses overnight'
    }
  },
  {
    id: 'business_registration_status',
    question: 'What is your business registration and licensing status?',
    type: 'multiple',
    category: 'compliance_risk',
    options: [
      { text: 'Fully registered with valid operating permits', score: 100, riskLevel: 'low' },
      { text: 'Registered but some permits expired', score: 70, riskLevel: 'medium' },
      { text: 'Basic registration only, missing key permits', score: 40, riskLevel: 'high' },
      { text: 'Operating informally without proper registration', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.08,
    insight: '📋 Informal businesses cannot access loans, government contracts, or scale operations',
    ghanaMeta: {
      localContext: 'Ghana requires multiple permits for different business activities',
      regulatoryImplications: 'Unregistered businesses face constant shutdown risk',
      marketReality: 'Informal businesses cannot scale or access funding opportunities'
    }
  },

  // OPERATIONAL RESILIENCE - Can you handle growth or shocks?
  {
    id: 'key_person_dependency',
    question: 'If you (the owner) were unavailable for 30 days, what would happen to your business operations?',
    type: 'multiple',
    category: 'operational_resilience',
    businessKiller: true,
    options: [
      { text: 'Business runs smoothly with capable team', score: 100, riskLevel: 'low' },
      { text: 'Minor disruptions but operations continue', score: 75, riskLevel: 'low' },
      { text: 'Significant problems but survivable', score: 50, riskLevel: 'medium' },
      { text: 'Major operations affected, customers lost', score: 25, riskLevel: 'high' },
      { text: 'Complete shutdown - everything depends on me', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.12,
    insight: '👥 Key person dependency is a major red flag for investors and growth limitation',
    ghanaMeta: {
      localContext: 'Ghana\'s skills shortage makes delegation challenging but critical',
      marketReality: 'Most Ghanaian SME owners are trapped doing everything themselves'
    }
  },
  {
    id: 'growth_bottleneck_identification',
    question: 'If your sales doubled tomorrow, what would break first in your business?',
    type: 'multiple',
    category: 'operational_resilience',
    options: [
      { text: 'Nothing - we\'re ready to scale', score: 100, riskLevel: 'low' },
      { text: 'Team capacity - need more skilled staff', score: 75, riskLevel: 'medium' },
      { text: 'Systems and processes - need better infrastructure', score: 70, riskLevel: 'medium' },
      { text: 'Inventory or supply chain capacity', score: 60, riskLevel: 'medium' },
      { text: 'Cash flow - couldn\'t finance the growth', score: 30, riskLevel: 'high' }
    ],
    weight: 0.10,
    insight: '🎯 Your growth bottleneck reveals your biggest investment need and scaling risk',
    ghanaMeta: {
      localContext: 'Ghana\'s infrastructure limits (power, internet, logistics) affect scaling',
      marketReality: 'Most SMEs hit cash flow walls when trying to grow'
    }
  },

  // MARKET POSITION - Are you competitive?
  {
    id: 'competitive_differentiation',
    question: 'What gives you a clear competitive advantage that customers value?',
    type: 'multiple',
    category: 'market_position',
    options: [
      { text: 'Strong brand and loyal customers', score: 90, riskLevel: 'low' },
      { text: 'Unique product or service offering', score: 85, riskLevel: 'low' },
      { text: 'Better quality or customer service', score: 75, riskLevel: 'low' },
      { text: 'Lower prices than competitors', score: 50, riskLevel: 'medium' },
      { text: 'Nothing specific - we compete on everything', score: 25, riskLevel: 'high' }
    ],
    weight: 0.08,
    insight: '🏆 Without clear differentiation, you\'re vulnerable to competition and price wars',
    ghanaMeta: {
      localContext: 'Ghana\'s small market means competition is often intense and personal',
      marketReality: 'Price competition alone is unsustainable in Ghana\'s cost environment'
    }
  },
  {
    id: 'customer_retention_rate',
    question: 'What percentage of customers return to buy from you again within 12 months?',
    type: 'percentage',
    category: 'market_position',
    weight: 0.10,
    criticalThreshold: 50,
    insight: '🔄 Customer retention below 50% indicates fundamental problems with value delivery',
    ghanaMeta: {
      localContext: 'Ghana\'s tight-knit business community means reputation spreads quickly',
      marketReality: 'Word-of-mouth is crucial - poor retention kills growth'
    }
  },

  // GROWTH READINESS - Can you handle investment?
  {
    id: 'financial_record_quality',
    question: 'How current and detailed are your financial records?',
    type: 'multiple',
    category: 'growth_readiness',
    options: [
      { text: 'Professional bookkeeping, monthly statements, audited annually', score: 100, riskLevel: 'low' },
      { text: 'Regular bookkeeping, quarterly reviews, good documentation', score: 80, riskLevel: 'low' },
      { text: 'Basic records, updated monthly but informal', score: 60, riskLevel: 'medium' },
      { text: 'Irregular record keeping, often behind', score: 35, riskLevel: 'high' },
      { text: 'Minimal records - mainly bank statements', score: 15, riskLevel: 'critical' }
    ],
    weight: 0.12,
    insight: '📊 90% of funding applications fail due to poor financial documentation',
    ghanaMeta: {
      localContext: 'Ghana\'s financial institutions demand detailed records for any funding',
      regulatoryImplications: 'Banks require 2+ years of audited statements for significant loans',
      marketReality: 'Poor records automatically disqualify businesses from serious funding'
    }
  },
  {
    id: 'funding_purpose_clarity',
    question: 'How would you use additional funding to grow your business?',
    type: 'multiple',
    category: 'growth_readiness',
    options: [
      { text: 'Detailed growth plan with ROI projections', score: 100, riskLevel: 'low' },
      { text: 'Clear expansion strategy and market plan', score: 85, riskLevel: 'low' },
      { text: 'General growth ideas and equipment needs', score: 60, riskLevel: 'medium' },
      { text: 'Mainly working capital and inventory', score: 40, riskLevel: 'high' },
      { text: 'Haven\'t really thought it through', score: 20, riskLevel: 'critical' }
    ],
    weight: 0.10,
    insight: '🎯 Vague funding plans indicate you\'re not ready for serious investment discussions',
    ghanaMeta: {
      localContext: 'Ghana\'s investors are sophisticated and demand detailed business cases',
      marketReality: 'Competition for funding is intense - only the best-prepared succeed'
    }
  }
];

// Industry benchmarks based on Ghana market data
export const ghanaBenchmarks = {
  retail: {
    avgMargin: 15,
    cashCycle: 45,
    customerRetention: 60,
    avgScore: 65
  },
  services: {
    avgMargin: 25,
    cashCycle: 30,
    customerRetention: 70,
    avgScore: 72
  },
  manufacturing: {
    avgMargin: 12,
    cashCycle: 90,
    customerRetention: 80,
    avgScore: 68
  },
  agriculture: {
    avgMargin: 18,
    cashCycle: 120,
    customerRetention: 65,
    avgScore: 62
  },
  technology: {
    avgMargin: 30,
    cashCycle: 60,
    customerRetention: 75,
    avgScore: 78
  }
};

export class GhanaAssessmentService {

  static calculateAssessmentScore(answers: Record<string, any>): AssessmentResult {
    const categoryTotals: Record<string, number> = {};
    const categoryWeights: Record<string, number> = {};
    const categoryMaxScores: Record<string, number> = {};
    const criticalIssues: AssessmentResult['criticalIssues'] = [];
    const strengths: string[] = [];

    let totalScore = 0;
    let totalWeight = 0;

    // Calculate scores for each question
    ghanaAssessmentQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer === undefined) return;

      let questionScore = 0;
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      // Calculate score based on question type
      switch (question.type) {
        case 'multiple':
          const selectedOption = question.options?.find(opt => opt.text === answer);
          if (selectedOption) {
            questionScore = selectedOption.score;
            riskLevel = selectedOption.riskLevel;
          }
          break;

        case 'percentage':
        case 'number':
          const numericAnswer = Number(answer);
          if (question.criticalThreshold && typeof question.criticalThreshold === 'number') {
            if (numericAnswer >= question.criticalThreshold) {
              questionScore = 30; // Poor score for exceeding threshold
              riskLevel = 'high';
            } else {
              questionScore = Math.max(70, 100 - (numericAnswer / question.criticalThreshold) * 40);
              riskLevel = numericAnswer > question.criticalThreshold * 0.7 ? 'medium' : 'low';
            }
          }
          break;

        case 'scale':
          questionScore = (Number(answer) / 5) * 100;
          riskLevel = Number(answer) >= 4 ? 'low' : Number(answer) >= 3 ? 'medium' : 'high';
          break;

        case 'yes_no':
          questionScore = answer === 'Yes' ? 100 : 20;
          riskLevel = answer === 'Yes' ? 'low' : 'high';
          break;
      }

      const weightedScore = questionScore * question.weight;
      totalScore += weightedScore;
      totalWeight += question.weight;

      // Category tracking
      if (!categoryTotals[question.category]) {
        categoryTotals[question.category] = 0;
        categoryWeights[question.category] = 0;
        categoryMaxScores[question.category] = 0;
      }

      categoryTotals[question.category] += weightedScore;
      categoryWeights[question.category] += question.weight;
      categoryMaxScores[question.category] += question.weight * 100;

      // Identify critical issues and strengths
      if (question.businessKiller && (riskLevel === 'high' || riskLevel === 'critical')) {
        criticalIssues.push({
          id: question.id,
          title: this.getCriticalIssueTitle(question.id, answer),
          severity: riskLevel === 'critical' ? 'urgent' : 'important',
          impact: this.getCriticalIssueImpact(question.id, answer),
          solution: this.getCriticalIssueSolution(question.id),
          timeframe: riskLevel === 'critical' ? 'Immediate' : '30 days',
          category: question.category
        });
      }

      if (questionScore >= 80) {
        strengths.push(this.getStrengthDescription(question.id, answer));
      }
    });

    // Calculate final scores
    const overallScore = Math.round(totalWeight > 0 ? (totalScore / totalWeight) : 0);

    const categoryScores = {
      financial_health: Math.round(categoryWeights['financial_health'] > 0 ?
        (categoryTotals['financial_health'] / categoryWeights['financial_health']) : 0),
      operational_resilience: Math.round(categoryWeights['operational_resilience'] > 0 ?
        (categoryTotals['operational_resilience'] / categoryWeights['operational_resilience']) : 0),
      market_position: Math.round(categoryWeights['market_position'] > 0 ?
        (categoryTotals['market_position'] / categoryWeights['market_position']) : 0),
      compliance_risk: Math.round(categoryWeights['compliance_risk'] > 0 ?
        (categoryTotals['compliance_risk'] / categoryWeights['compliance_risk']) : 0),
      growth_readiness: Math.round(categoryWeights['growth_readiness'] > 0 ?
        (categoryTotals['growth_readiness'] / categoryWeights['growth_readiness']) : 0),
    };

    // Determine risk level
    const riskLevel = overallScore >= 80 ? 'Low Risk' :
                     overallScore >= 60 ? 'Moderate Risk' :
                     overallScore >= 40 ? 'High Risk' : 'Critical Risk';

    // Generate next steps
    const nextSteps = this.generateNextSteps(criticalIssues, categoryScores, overallScore);

    // Calculate funding readiness
    const fundingReadiness = this.calculateFundingReadiness(categoryScores, criticalIssues);

    // Get benchmark comparison (simplified for now)
    const benchmarkComparison = {
      yourScore: overallScore,
      industryAverage: 65,
      topPerformers: 85,
      percentile: Math.max(10, Math.min(90, Math.round((overallScore / 100) * 100)))
    };

    return {
      overallScore,
      riskLevel,
      categoryScores,
      criticalIssues,
      strengthsToLeverage: strengths.filter(s => s).slice(0, 5),
      competitiveAdvantages: this.identifyCompetitiveAdvantages(answers),
      benchmarkComparison,
      nextSteps,
      fundingReadiness,
      timestamp: new Date().toISOString()
    };
  }

  private static getCriticalIssueTitle(questionId: string, answer: any): string {
    const titles: Record<string, string> = {
      'cash_runway_days': 'Cash Flow Crisis Risk',
      'receivables_aging': 'Severe Collection Problems',
      'customer_concentration_risk': 'Dangerous Customer Dependency',
      'profit_margin_reality': 'Unsustainable Profit Margins',
      'gra_tax_compliance': 'Tax Compliance Risk',
      'key_person_dependency': 'Single Point of Failure Risk'
    };
    return titles[questionId] || 'Business Risk Identified';
  }

  private static getCriticalIssueImpact(questionId: string, answer: any): string {
    const impacts: Record<string, string> = {
      'cash_runway_days': 'Could force business closure within weeks',
      'receivables_aging': 'Cash flow problems limiting operations and growth',
      'customer_concentration_risk': 'Loss of major customer could devastate revenue',
      'profit_margin_reality': 'Unable to survive economic downturns or invest in growth',
      'gra_tax_compliance': 'Risk of account freezing and business shutdown',
      'key_person_dependency': 'Business vulnerable to owner unavailability'
    };
    return impacts[questionId] || 'Significant business risk';
  }

  private static getCriticalIssueSolution(questionId: string): string {
    const solutions: Record<string, string> = {
      'cash_runway_days': 'Improve collection processes, reduce expenses, establish credit line',
      'receivables_aging': 'Implement strict collection policies, offer payment incentives',
      'customer_concentration_risk': 'Diversify customer base, reduce dependency on large accounts',
      'profit_margin_reality': 'Optimize pricing, reduce costs, improve operational efficiency',
      'gra_tax_compliance': 'Engage tax consultant, file missing returns, set up payment plan',
      'key_person_dependency': 'Delegate responsibilities, document processes, train team members'
    };
    return solutions[questionId] || 'Address this risk immediately';
  }

  private static getStrengthDescription(questionId: string, answer: any): string {
    const strengths: Record<string, string> = {
      'cash_runway_days': 'Strong cash reserves provide financial security',
      'profit_margin_reality': 'Healthy profit margins enable growth investment',
      'gra_tax_compliance': 'Full tax compliance reduces regulatory risk',
      'competitive_differentiation': 'Clear competitive advantage in market',
      'customer_retention_rate': 'Strong customer loyalty and repeat business'
    };
    return strengths[questionId] || '';
  }

  private static identifyCompetitiveAdvantages(answers: Record<string, any>): string[] {
    const advantages: string[] = [];

    if (answers['competitive_differentiation']?.includes('brand')) {
      advantages.push('Strong brand recognition');
    }
    if (answers['customer_retention_rate'] && Number(answers['customer_retention_rate']) > 70) {
      advantages.push('High customer loyalty');
    }
    if (answers['profit_margin_reality']?.includes('Above 25%')) {
      advantages.push('Superior profitability');
    }

    return advantages;
  }

  private static generateNextSteps(
    criticalIssues: AssessmentResult['criticalIssues'],
    categoryScores: AssessmentResult['categoryScores'],
    overallScore: number
  ): AssessmentResult['nextSteps'] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const strategic: string[] = [];

    // Add immediate actions for critical issues
    criticalIssues.filter(issue => issue.severity === 'urgent').forEach(issue => {
      immediate.push(issue.solution);
    });

    // Add short-term improvements for important issues
    criticalIssues.filter(issue => issue.severity === 'important').forEach(issue => {
      shortTerm.push(issue.solution);
    });

    // Add strategic recommendations based on scores
    if (categoryScores.financial_health < 60) {
      shortTerm.push('Implement professional bookkeeping system');
    }
    if (categoryScores.market_position < 60) {
      strategic.push('Develop clear market differentiation strategy');
    }
    if (categoryScores.growth_readiness < 70) {
      strategic.push('Create detailed business growth plan');
    }

    return { immediate, shortTerm, strategic };
  }

  private static calculateFundingReadiness(
    categoryScores: AssessmentResult['categoryScores'],
    criticalIssues: AssessmentResult['criticalIssues']
  ): AssessmentResult['fundingReadiness'] {
    const financialWeight = categoryScores.financial_health * 0.4;
    const complianceWeight = categoryScores.compliance_risk * 0.2;
    const growthWeight = categoryScores.growth_readiness * 0.4;

    const fundingScore = Math.round(financialWeight + complianceWeight + growthWeight);

    let recommendation = '';
    const requiredImprovements: string[] = [];

    if (fundingScore >= 80) {
      recommendation = 'Ready for investment discussions with detailed preparation';
    } else if (fundingScore >= 60) {
      recommendation = 'Address key issues before approaching investors';
      requiredImprovements.push('Improve financial documentation');
    } else {
      recommendation = 'Focus on business fundamentals before seeking investment';
      requiredImprovements.push('Establish stable cash flow');
      requiredImprovements.push('Ensure regulatory compliance');
    }

    if (criticalIssues.some(issue => issue.severity === 'urgent')) {
      requiredImprovements.push('Resolve critical business risks immediately');
    }

    return {
      score: fundingScore,
      recommendation,
      requiredImprovements
    };
  }

  // Save assessment to database
  static async saveAssessment(
    userId: string,
    answers: Record<string, any>,
    result: AssessmentResult
  ): Promise<void> {
    try {
      await assessmentService.create({
        userId,
        assessmentId: `${userId}-${Date.now()}`,
        marketScore: result.categoryScores.market_position,
        financialScore: result.categoryScores.financial_health,
        operationsScore: result.categoryScores.operational_resilience,
        teamScore: result.categoryScores.growth_readiness,
        growthScore: result.categoryScores.growth_readiness,
        totalScore: result.overallScore,
        responses: answers,
        recommendations: {
          marketRecommendations: result.nextSteps.strategic,
          financialRecommendations: result.nextSteps.immediate,
          operationsRecommendations: result.nextSteps.shortTerm,
          growthRecommendations: result.strengthsToLeverage
        },
        completedAt: new Date().toISOString(),
        reportGenerated: false,
      });
    } catch (error) {
      console.warn('Failed to save assessment to database:', error);
      // Still save to localStorage as backup
      localStorage.setItem(`assessment_${userId}`, JSON.stringify({
        answers,
        result,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Get previous assessment for comparison
  static async getPreviousAssessment(userId: string): Promise<AssessmentResult | null> {
    try {
      // Try to get from localStorage first (for backward compatibility)
      const cached = localStorage.getItem(`assessment_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.result || null;
      }
      return null;
    } catch (error) {
      console.warn('Failed to retrieve previous assessment:', error);
      return null;
    }
  }
}