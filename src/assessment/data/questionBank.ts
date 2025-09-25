/**
 * Ghana SME Critical Questions Bank
 * Comprehensive questions designed to identify business-killing issues
 */

import { Question } from '../types/assessment.types';

export const ghanaBusinessQuestions: Question[] = [
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
      { text: '30-59 days - Concerning level', score: 50, riskLevel: 'medium' },
      { text: '15-29 days - High risk territory', score: 25, riskLevel: 'high' },
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
      regulatoryImplications: 'No legal framework for quick debt collection',
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

  // GHANA-SPECIFIC CRITICAL QUESTIONS
  {
    id: 'mobile_money_integration',
    question: 'What percentage of your customer payments do you accept via Mobile Money (MTN, Vodafone, AirtelTigo)?',
    type: 'percentage',
    category: 'growth_readiness',
    weight: 0.12,
    insight: '📱 Ghana has 40M+ mobile money users. Businesses not accepting mobile payments lose 30%+ potential customers',
    ghanaMeta: {
      localContext: 'Mobile Money is the dominant payment method in Ghana, with over 40 million active users',
      marketReality: 'Customers increasingly prefer mobile payments for convenience and security'
    }
  },

  {
    id: 'forex_exposure_risk',
    question: 'What percentage of your business costs (supplies, equipment, rent) are paid in foreign currency?',
    type: 'percentage',
    category: 'operational_resilience',
    businessKiller: true,
    weight: 0.13,
    criticalThreshold: 40,
    insight: '💱 Cedi depreciation can destroy businesses with high forex exposure - many SMEs lost 30-50% margins in 2022',
    ghanaMeta: {
      localContext: 'Ghana Cedi frequently depreciates against USD/EUR, creating major cost pressures',
      regulatoryImplications: 'Bank of Ghana policies can restrict forex access during crises',
      marketReality: 'Importers and businesses with dollar costs face severe margin pressure'
    }
  },

  {
    id: 'government_contract_readiness',
    question: 'Are you qualified and ready to bid for government contracts in your sector?',
    type: 'multiple',
    category: 'growth_readiness',
    options: [
      { text: 'Yes, fully qualified with all requirements met', score: 100, riskLevel: 'low' },
      { text: 'Partially qualified, missing some certifications', score: 70, riskLevel: 'medium' },
      { text: 'Not qualified but working towards it', score: 40, riskLevel: 'high' },
      { text: 'No interest or qualification for government contracts', score: 20, riskLevel: 'medium' }
    ],
    weight: 0.09,
    insight: '🏛️ Government contracts represent 25%+ of Ghana\'s economy - missing this opportunity limits growth',
    ghanaMeta: {
      localContext: 'Government is largest buyer in Ghana economy across all sectors',
      regulatoryImplications: 'Requires specific certifications, tax compliance, and local content requirements',
      marketReality: 'Government contracts provide stable, large-volume revenue opportunities'
    }
  },

  {
    id: 'local_content_compliance',
    question: 'Does your business meet Ghana\'s Local Content requirements for your industry?',
    type: 'multiple',
    category: 'compliance_risk',
    businessKiller: true,
    options: [
      { text: 'Yes, fully compliant with local content requirements', score: 100, riskLevel: 'low' },
      { text: 'Mostly compliant, minor gaps', score: 75, riskLevel: 'medium' },
      { text: 'Partially compliant, working on improvements', score: 50, riskLevel: 'high' },
      { text: 'Not compliant or unaware of requirements', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.08,
    insight: '🇬🇭 Local Content laws can exclude non-compliant businesses from major opportunities, especially oil & gas, mining',
    ghanaMeta: {
      localContext: 'Ghana Local Content Act requires minimum local participation in key industries',
      regulatoryImplications: 'Non-compliance excludes you from major contracts in oil, gas, mining sectors',
      marketReality: 'Local content creates opportunities for compliant Ghanaian businesses'
    }
  },

  {
    id: 'ecowas_afcfta_readiness',
    question: 'Is your business positioned to take advantage of ECOWAS and AfCFTA trade opportunities?',
    type: 'multiple',
    category: 'growth_readiness',
    options: [
      { text: 'Yes, actively exporting/importing within Africa', score: 100, riskLevel: 'low' },
      { text: 'Prepared but not yet trading regionally', score: 80, riskLevel: 'low' },
      { text: 'Exploring opportunities, some preparation', score: 60, riskLevel: 'medium' },
      { text: 'No awareness or preparation for regional trade', score: 30, riskLevel: 'high' }
    ],
    weight: 0.07,
    insight: '🌍 AfCFTA creates 1.2B person market - early movers gain significant competitive advantages',
    ghanaMeta: {
      localContext: 'Africa Continental Free Trade Area eliminates 90% of tariffs between African countries',
      marketReality: 'Massive market expansion opportunity for prepared businesses'
    }
  },

  {
    id: 'power_stability_management',
    question: 'How do you manage Ghana\'s power instability issues (dumsor) in your business?',
    type: 'multiple',
    category: 'operational_resilience',
    businessKiller: true,
    options: [
      { text: 'Multiple backup systems (generator, UPS, solar)', score: 100, riskLevel: 'low' },
      { text: 'One reliable backup system', score: 80, riskLevel: 'low' },
      { text: 'Basic backup, sometimes inadequate', score: 50, riskLevel: 'medium' },
      { text: 'No backup systems, operations stop during outages', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.08,
    insight: '⚡ Power instability kills productivity and customer confidence - backup systems are essential for business continuity',
    ghanaMeta: {
      localContext: 'Ghana faces periodic power instability affecting all sectors',
      marketReality: 'Businesses without backup power lose productivity, revenue, and customer trust'
    }
  },

  {
    id: 'cocoa_commodity_exposure',
    question: 'How exposed is your business to cocoa/commodity price fluctuations?',
    type: 'multiple',
    category: 'financial_health',
    options: [
      { text: 'Not exposed to commodity prices', score: 100, riskLevel: 'low' },
      { text: 'Indirectly exposed through customers/suppliers', score: 70, riskLevel: 'medium' },
      { text: 'Moderately exposed, some price hedging', score: 50, riskLevel: 'medium' },
      { text: 'Highly exposed, no price protection', score: 20, riskLevel: 'high' }
    ],
    weight: 0.06,
    insight: '🍫 Cocoa price swings affect entire Ghana economy - diversification reduces commodity risk',
    ghanaMeta: {
      localContext: 'Ghana is world\'s 2nd largest cocoa producer, price changes affect entire economy',
      marketReality: 'Commodity price volatility creates economic ripple effects throughout Ghana'
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
      { text: 'Fully compliant and up-to-date', score: 100, riskLevel: 'low' },
      { text: 'Minor delays but communicating with GRA', score: 70, riskLevel: 'medium' },
      { text: 'Several months behind on payments', score: 30, riskLevel: 'high' },
      { text: 'Significantly behind or not registered', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.12,
    insight: '🚫 GRA can freeze accounts and shut down non-compliant businesses without warning',
    ghanaMeta: {
      localContext: 'GRA enforcement has increased significantly',
      regulatoryImplications: 'Tax clearance certificates required for many business activities',
      marketReality: 'Non-compliance can result in immediate business closure'
    }
  },

  // OPERATIONAL RESILIENCE
  {
    id: 'key_person_dependency',
    question: 'If you (the owner) were unable to work for 3 months, what would happen to your business?',
    type: 'multiple',
    category: 'operational_resilience',
    businessKiller: true,
    options: [
      { text: 'Business would continue operating normally', score: 100, riskLevel: 'low' },
      { text: 'Some disruption but would survive', score: 70, riskLevel: 'medium' },
      { text: 'Significant problems but might survive', score: 40, riskLevel: 'high' },
      { text: 'Business would likely collapse', score: 10, riskLevel: 'critical' }
    ],
    weight: 0.14,
    insight: '👤 Over-dependence on owner is a major business killer in Ghana SMEs',
    ghanaMeta: {
      localContext: 'Family business culture creates single points of failure',
      marketReality: 'Owner illness or travel can destroy business operations'
    }
  },

  {
    id: 'supplier_dependency',
    question: 'How dependent are you on your top supplier? (% of total purchases)',
    type: 'percentage',
    category: 'operational_resilience',
    weight: 0.10,
    criticalThreshold: 70,
    insight: '📦 Over 70% supplier dependency creates dangerous vulnerability',
    ghanaMeta: {
      localContext: 'Limited supplier options in Ghana markets',
      marketReality: 'Supplier problems can immediately halt operations'
    }
  },

  // MARKET POSITION
  {
    id: 'competitive_differentiation',
    question: 'What makes your business different from competitors?',
    type: 'multiple',
    category: 'market_position',
    options: [
      { text: 'Unique product/service with strong brand', score: 100, riskLevel: 'low' },
      { text: 'Better quality or service than competitors', score: 80, riskLevel: 'low' },
      { text: 'Lower prices than competitors', score: 40, riskLevel: 'medium' },
      { text: 'Nothing significant - we compete on price only', score: 20, riskLevel: 'high' }
    ],
    weight: 0.08,
    insight: '🏆 Businesses competing only on price have no sustainable advantage',
    ghanaMeta: {
      localContext: 'Price competition is fierce in Ghana markets',
      marketReality: 'Differentiation is key to avoiding race-to-the-bottom pricing'
    }
  },

  // GROWTH READINESS
  {
    id: 'financial_records_quality',
    question: 'How would you rate your financial record-keeping?',
    type: 'multiple',
    category: 'growth_readiness',
    options: [
      { text: 'Professional accounting system with monthly reports', score: 100, riskLevel: 'low' },
      { text: 'Basic system with quarterly summaries', score: 70, riskLevel: 'low' },
      { text: 'Simple records, updated irregularly', score: 40, riskLevel: 'medium' },
      { text: 'Minimal or no formal record-keeping', score: 10, riskLevel: 'high' }
    ],
    weight: 0.10,
    insight: '📊 Poor financial records prevent growth funding and hide business problems',
    ghanaMeta: {
      localContext: 'Most Ghana SMEs have inadequate financial systems',
      marketReality: 'Investors require professional financial statements'
    }
  },

  {
    id: 'digital_payment_adoption',
    question: 'What percentage of customer payments do you receive through digital channels (Mobile Money, cards, bank transfers)?',
    type: 'percentage',
    category: 'growth_readiness',
    weight: 0.08,
    insight: '📱 Digital payment adoption is crucial for modern business growth',
    ghanaMeta: {
      localContext: 'Ghana has high mobile money adoption rates',
      marketReality: 'Digital payments improve cash flow and reduce theft risk'
    }
  },

  {
    id: 'inventory_management',
    question: 'How do you manage your inventory?',
    type: 'multiple',
    category: 'operational_resilience',
    options: [
      { text: 'Digital system with real-time tracking', score: 100, riskLevel: 'low' },
      { text: 'Regular manual counts and basic tracking', score: 70, riskLevel: 'low' },
      { text: 'Occasional counts, rough estimates', score: 40, riskLevel: 'medium' },
      { text: 'No formal inventory management', score: 20, riskLevel: 'high' }
    ],
    weight: 0.07,
    conditions: [
      { dependsOn: 'business_type', value: 'Retail', operator: 'contains' },
      { dependsOn: 'business_type', value: 'Manufacturing', operator: 'contains' }
    ],
    insight: '📦 Poor inventory management leads to stockouts and cash flow problems',
    ghanaMeta: {
      localContext: 'Theft and spoilage are major issues in Ghana',
      marketReality: 'Inventory represents significant cash tied up in business'
    }
  },

  {
    id: 'emergency_fund',
    question: 'Do you have emergency funds separate from working capital?',
    type: 'multiple',
    category: 'financial_health',
    options: [
      { text: 'Yes, 6+ months of expenses', score: 100, riskLevel: 'low' },
      { text: 'Yes, 3-6 months of expenses', score: 80, riskLevel: 'low' },
      { text: 'Yes, 1-3 months of expenses', score: 60, riskLevel: 'medium' },
      { text: 'No emergency fund', score: 20, riskLevel: 'high' }
    ],
    weight: 0.09,
    insight: '💰 Emergency funds are your business survival insurance',
    ghanaMeta: {
      localContext: 'Economic shocks are common in Ghana',
      marketReality: 'Businesses without emergency funds often collapse during crises'
    }
  }
];

// Onboarding questions to segment users
export const onboardingQuestions = [
  {
    id: 'business_type',
    question: 'What type of business do you operate?',
    type: 'multiple',
    options: [
      'Retail/Trading',
      'Manufacturing/Production',
      'Services/Consulting',
      'Agriculture/Farming',
      'Technology/Digital',
      'Food & Beverage',
      'Construction',
      'Transportation',
      'Other'
    ]
  },
  {
    id: 'years_in_business',
    question: 'How long have you been in business?',
    type: 'multiple',
    options: [
      'Less than 1 year',
      '1-3 years',
      '3-5 years',
      '5-10 years',
      'More than 10 years'
    ]
  },
  {
    id: 'monthly_revenue',
    question: 'What is your average monthly revenue?',
    type: 'multiple',
    options: [
      'Less than GHS 5,000',
      'GHS 5,000 - 20,000',
      'GHS 20,000 - 50,000',
      'GHS 50,000 - 100,000',
      'GHS 100,000 - 500,000',
      'More than GHS 500,000'
    ]
  },
  {
    id: 'location',
    question: 'Where is your business located?',
    type: 'multiple',
    options: [
      'Greater Accra',
      'Ashanti Region',
      'Western Region',
      'Central Region',
      'Eastern Region',
      'Northern Region',
      'Upper East Region',
      'Upper West Region',
      'Volta Region',
      'Brong Ahafo Region'
    ]
  }
];

export default ghanaBusinessQuestions;