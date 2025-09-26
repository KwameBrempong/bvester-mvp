/**
 * Funding Pathway Types
 * New types for crowdfunding integration - fully additive, no breaking changes
 */

export type FundingType = 'crowdfunding' | 'traditional' | 'hybrid';
export type FundingPathwayId = 'crowdfunding_starter' | 'growth_capital' | 'investment_readiness';
export type CrowdfundingPlatform = 'kickstarter' | 'gofundme' | 'indiegogo' | 'fundrazr' | 'custom';

export interface FundingPathway {
  id: FundingPathwayId;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  supportLevel: string;
  icon: string;
  features: string[];
  deliverables: string[];
  prerequisites?: FundingPathwayId[];
  nextStep?: FundingPathwayId;
  discountFromPrevious?: number; // Percentage discount if completed previous pathway
  recommended?: boolean;
  targetAudience: {
    revenueRange: string;
    businessAge: string;
    assessmentScore: string;
    idealFor: string[];
  };
  successMetrics: {
    primaryGoal: string;
    successRate: number;
    averageOutcome: string;
    timeToResult: string;
  };
}

export interface CrowdfundingMeta {
  platformIntegrations: CrowdfundingPlatform[];
  campaignTemplates: string[];
  socialMediaStrategy: string[];
  communityBuildingTools: string[];
  marketingChannels: string[];
  legalConsiderations: string[];
}

export interface AcceleratorModuleExtension {
  fundingType?: FundingType;
  crowdfundingMeta?: CrowdfundingMeta;
  pathwayRelevance: FundingPathwayId[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserFundingProfile {
  userId: string;
  currentPathway?: FundingPathwayId;
  completedPathways: FundingPathwayId[];
  recommendedPathway?: FundingPathwayId;
  fundingGoal?: {
    amount: number;
    purpose: string;
    timeline: string;
  };
  crowdfundingExperience?: {
    hasPreviousCampaigns: boolean;
    platformsUsed: CrowdfundingPlatform[];
    successfulCampaigns: number;
    totalRaised: number;
  };
  assessmentBasedRecommendation?: {
    pathwayId: FundingPathwayId;
    confidence: number;
    reasons: string[];
    alternativeOptions: FundingPathwayId[];
  };
}

export interface CrowdfundingCampaign {
  id: string;
  userId: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentAmount: number;
  platform: CrowdfundingPlatform;
  status: 'draft' | 'active' | 'successful' | 'failed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  category: string;
  rewardTiers?: {
    amount: number;
    title: string;
    description: string;
    estimatedDelivery: string;
    backerCount: number;
  }[];
  metrics?: {
    pageViews: number;
    backerCount: number;
    shareCount: number;
    conversionRate: number;
  };
}

export interface FundingPathwayProgress {
  userId: string;
  pathwayId: FundingPathwayId;
  completionPercentage: number;
  currentModule: string;
  completedModules: string[];
  milestones: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
    evidence?: string; // Link to deliverable, screenshot, etc.
  }[];
  nextActions: {
    title: string;
    description: string;
    dueDate?: Date;
    priority: 'high' | 'medium' | 'low';
  }[];
}