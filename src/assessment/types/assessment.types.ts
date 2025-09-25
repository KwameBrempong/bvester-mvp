/**
 * Business Assessment - TypeScript Definitions
 * Comprehensive type system for the new modular assessment architecture
 */

export type QuestionType = 'multiple' | 'scale' | 'percentage' | 'number' | 'yes_no' | 'financial';

export type BusinessCategory =
  | 'financial_health'
  | 'operational_resilience'
  | 'market_position'
  | 'compliance_risk'
  | 'growth_readiness';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type Severity = 'urgent' | 'important' | 'monitor';

export interface QuestionOption {
  text: string;
  score: number;
  riskLevel: RiskLevel;
  insight?: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  category: BusinessCategory;
  options?: QuestionOption[];
  range?: [number, number];
  weight: number;
  criticalThreshold?: number | string;
  businessKiller?: boolean;
  insight: string;
  ghanaMeta: {
    localContext: string;
    regulatoryImplications?: string;
    marketReality: string;
  };
  conditions?: QuestionCondition[];
  validators?: ValidationRule[];
}

export interface QuestionCondition {
  dependsOn: string;
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface ValidationRule {
  type: 'range' | 'pattern' | 'custom';
  rule: any;
  message: string;
}

export interface BusinessIssue {
  id: string;
  title: string;
  severity: Severity;
  impact: string;
  solution: string;
  timeframe: string;
  category: BusinessCategory;
  priority: number;
}

export interface AssessmentResult {
  overallScore: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  categoryScores: Record<BusinessCategory, number>;
  criticalIssues: BusinessIssue[];
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
  predictiveAnalytics: {
    failureProbability: {
      '3_months': number;
      '6_months': number;
      '12_months': number;
    };
    growthPotential?: {
      current: number;
      withRecommendations: number;
      withAcceleratorProgram: number;
    };
    survivalFactors?: string[];
    criticalInterventions?: string[];
    recoveryTimeEstimate?: string;
  };
  timestamp: string;
}

export interface AssessmentState {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  showResults: boolean;
  assessmentResult: AssessmentResult | null;
  isProcessing: boolean;
  startTime: number;
  progress: number;
}

export interface AssessmentProps {
  user: { username: string };
  userProfile: any;
  onClose: () => void;
}

export interface OnboardingData {
  businessType: string;
  yearsInBusiness: string;
  monthlyRevenue: string;
  industry: string;
  location: string;
}

export interface GhanaBusinessMetrics {
  averageCashRunway: number;
  averageReceivables: number;
  averageCustomerConcentration: number;
  averageProfitMargin: number;
  commonFailureReasons: string[];
  successFactors: string[];
}