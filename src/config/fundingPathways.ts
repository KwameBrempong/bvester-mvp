/**
 * Funding Pathway Definitions
 * Configuration for the three-tier crowdfunding-integrated Investment Accelerator
 */

import { FundingPathway, CrowdfundingMeta } from '../types/funding.types';

export const crowdfundingMeta: CrowdfundingMeta = {
  platformIntegrations: ['gofundme', 'kickstarter', 'indiegogo', 'fundrazr', 'custom'],
  campaignTemplates: [
    'Product Launch Campaign',
    'Business Expansion Fund',
    'Community Impact Project',
    'Technology Development',
    'Social Enterprise Initiative'
  ],
  socialMediaStrategy: [
    'Pre-launch audience building',
    'Campaign announcement strategy',
    'Daily engagement tactics',
    'Influencer outreach plan',
    'Success story sharing'
  ],
  communityBuildingTools: [
    'Email list building',
    'Social media communities',
    'Local network activation',
    'Customer testimonial collection',
    'Brand ambassador program'
  ],
  marketingChannels: [
    'Facebook & Instagram ads',
    'WhatsApp business marketing',
    'Local radio partnerships',
    'Community event sponsorships',
    'Cross-promotion strategies'
  ],
  legalConsiderations: [
    'Ghana Securities & Exchange Commission compliance',
    'Tax implications of crowdfunding',
    'Reward fulfillment obligations',
    'Intellectual property protection',
    'Consumer protection laws'
  ]
};

export const FUNDING_PATHWAYS: FundingPathway[] = [
  {
    id: 'crowdfunding_starter',
    title: 'Crowdfunding Starter',
    subtitle: 'Launch Your First Successful Campaign',
    description: 'Master crowdfunding fundamentals and launch your first successful campaign to raise ₵10K-₵100K',
    price: 500,
    duration: '8 weeks intensive',
    supportLevel: 'Community + Email Mentorship',
    icon: '🌱',
    features: [
      '8-week crowdfunding mastery curriculum',
      'Campaign planning & strategy templates',
      'Social media marketing toolkit',
      'Community building strategies for Ghana',
      'Platform selection & setup guidance',
      'Reward tier design & fulfillment planning',
      'Legal compliance for Ghana crowdfunding',
      'Live Q&A sessions (2x per week)',
      'Peer support community access',
      'Email mentor support (24hr response)',
      'Campaign launch checklist & timeline'
    ],
    deliverables: [
      'Complete crowdfunding campaign (ready to launch)',
      'Social media content calendar (3 months)',
      'Email marketing sequence (pre & post launch)',
      'Reward tier structure with pricing',
      'Legal compliance documentation',
      'Marketing budget & ROI projections',
      'Community engagement strategy'
    ],
    targetAudience: {
      revenueRange: '₵0 - ₵100K annually',
      businessAge: 'Startup to 2 years',
      assessmentScore: '30-60%',
      idealFor: [
        'Product-based businesses',
        'Community-focused ventures',
        'Creative projects & innovations',
        'Social impact enterprises',
        'First-time entrepreneurs'
      ]
    },
    successMetrics: {
      primaryGoal: 'Launch successful crowdfunding campaign',
      successRate: 0, // Will be populated with real data
      averageOutcome: 'Varies by business and campaign',
      timeToResult: '8-12 weeks from start to campaign launch'
    },
    nextStep: 'growth_capital',
    recommended: false
  },
  {
    id: 'growth_capital',
    title: 'Growth Capital Track',
    subtitle: 'Scale Your Proven Business Model',
    description: 'Transform crowdfunding success into sustainable growth and prepare for larger funding rounds',
    price: 750,
    originalPrice: 800,
    duration: '10 weeks intensive',
    supportLevel: 'Personal Mentor + Group Coaching',
    icon: '🚀',
    features: [
      'Everything in Crowdfunding Starter PLUS:',
      '10-week business scaling curriculum',
      'Personal mentor assigned for full duration',
      'Weekly 1-on-1 coaching calls (30 min)',
      'Business model optimization',
      'Financial systems & investor metrics',
      'Growth marketing beyond crowdfunding',
      'Team building & operations scaling',
      'Customer retention & lifetime value',
      'Partnership & distribution strategies',
      'Pre-investment preparation',
      'Pitch deck development (basic version)'
    ],
    deliverables: [
      'Scaled business operations framework',
      'Financial dashboard & KPI tracking',
      'Growth marketing system',
      'Standard operating procedures',
      'Team structure & hiring plan',
      'Customer acquisition & retention system',
      'Basic investor pitch deck',
      '12-month growth roadmap'
    ],
    prerequisites: ['crowdfunding_starter'],
    targetAudience: {
      revenueRange: '₵50K - ₵500K annually',
      businessAge: '1-3 years',
      assessmentScore: '50-75%',
      idealFor: [
        'Post-successful crowdfunding campaigns',
        'Businesses with proven product-market fit',
        'Ready to scale operations',
        'Seeking ₵100K-₵1M funding',
        'Building systems for growth'
      ]
    },
    successMetrics: {
      primaryGoal: 'Business scaling & growth capital readiness',
      successRate: 0, // Will be populated with real data
      averageOutcome: 'Sustainable business growth',
      timeToResult: '10-16 weeks to see measurable scaling results'
    },
    discountFromPrevious: 50, // ₵50 discount for completing crowdfunding starter
    nextStep: 'investment_readiness',
    recommended: true
  },
  {
    id: 'investment_readiness',
    title: 'Investment Readiness Elite',
    subtitle: 'Secure Major Investment Funding',
    description: 'Master investor relations and secure ₵1M+ funding rounds from VCs, angels, and institutions',
    price: 2000,
    originalPrice: 2500,
    duration: '12 weeks intensive',
    supportLevel: 'Elite Mentorship + Investor Introductions',
    icon: '👑',
    features: [
      'Everything in Growth Capital Track PLUS:',
      '12-week investment mastery curriculum',
      'Elite mentor (successful entrepreneur/investor)',
      'Weekly 1-on-1 strategy sessions (45 min)',
      'Professional pitch deck creation',
      '3-year financial projections & models',
      'Due diligence preparation & data room',
      'Investor relations & negotiation skills',
      'Term sheet review & legal preparation',
      'Direct introductions to qualified investors',
      'Mock investor meetings & feedback',
      'Post-investment growth planning',
      'Graduation ceremony with investor pitch'
    ],
    deliverables: [
      'Professional investor pitch deck (15-20 slides)',
      'Comprehensive 3-year financial model',
      'Due diligence ready data room',
      'Investment memorandum',
      'Go-to-market expansion strategy',
      'Post-investment growth roadmap',
      'Legal structure optimization',
      'Investor relations communication system'
    ],
    prerequisites: ['growth_capital'],
    targetAudience: {
      revenueRange: '₵500K+ annually',
      businessAge: '2+ years',
      assessmentScore: '75%+',
      idealFor: [
        'Scalable business models',
        'Strong market traction',
        'Experienced leadership team',
        'Seeking ₵1M+ investment',
        'Ready for institutional investors'
      ]
    },
    successMetrics: {
      primaryGoal: 'Secure major investment funding',
      successRate: 0, // Will be populated with real data
      averageOutcome: 'Investment funding secured',
      timeToResult: '12-24 weeks from program completion to funding'
    },
    discountFromPrevious: 20, // ₵500 discount for completing growth capital
    recommended: false
  }
];

// Helper functions for pathway recommendations
export const getRecommendedPathway = (
  annualRevenue: number,
  businessAge: number,
  assessmentScore: number
): FundingPathway => {
  if (annualRevenue < 100000 || businessAge < 2 || assessmentScore < 60) {
    return FUNDING_PATHWAYS.find(p => p.id === 'crowdfunding_starter')!;
  }

  if (annualRevenue < 500000 || assessmentScore < 75) {
    return FUNDING_PATHWAYS.find(p => p.id === 'growth_capital')!;
  }

  return FUNDING_PATHWAYS.find(p => p.id === 'investment_readiness')!;
};

export const getPathwayById = (id: string): FundingPathway | undefined => {
  return FUNDING_PATHWAYS.find(pathway => pathway.id === id);
};

export const getNextPathway = (currentPathwayId: string): FundingPathway | undefined => {
  const currentPathway = getPathwayById(currentPathwayId);
  if (currentPathway?.nextStep) {
    return getPathwayById(currentPathway.nextStep);
  }
  return undefined;
};

export const getUserDiscountedPrice = (
  pathwayId: string,
  completedPathways: string[]
): number => {
  const pathway = getPathwayById(pathwayId);
  if (!pathway) return 0;

  // Check if user completed prerequisite pathway
  if (pathway.prerequisites) {
    const hasPrerequisite = pathway.prerequisites.some(prereq =>
      completedPathways.includes(prereq)
    );

    if (hasPrerequisite && pathway.discountFromPrevious) {
      const discountAmount = (pathway.originalPrice || pathway.price) * (pathway.discountFromPrevious / 100);
      return pathway.price - discountAmount;
    }
  }

  return pathway.price;
};