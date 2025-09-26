import React, { useState, useEffect } from 'react';
import { isFeatureEnabled } from '../config/featureFlags';
import { FundingPathway } from '../types/funding.types';
import { FUNDING_PATHWAYS, getPathwayById, getRecommendedPathway } from '../config/fundingPathways';
import FundingPathwaySelector from './funding/FundingPathwaySelector';
import '../styles/premium-theme.css';

interface AcceleratorModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'locked' | 'available' | 'completed';
  lessons: number;
  category: 'foundation' | 'operations' | 'growth' | 'investment';
  deliverables: string[];
  sessions?: {
    title: string;
    duration: string;
    completed: boolean;
  }[];
}

interface PricingTrack {
  id: 'self_paced' | 'elite_cohort';
  name: string;
  price: number;
  originalPrice?: number;
  priceId: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
  guarantee?: string;
  type: 'Self-Paced' | 'Elite Cohort';
  duration: string;
  support: string;
}

interface InvestmentAcceleratorProps {
  user: any;
  userProfile: any;
  onClose: () => void;
  enrollmentScore?: number;
  insights?: any[];
}

const acceleratorModules: AcceleratorModule[] = [
  {
    id: 'business_foundation',
    title: 'Business Foundation & Legal Structure',
    description: 'Legal setup, registration, and compliance for Ghana SMEs',
    duration: '2 weeks',
    status: 'available',
    lessons: 8,
    category: 'foundation',
    deliverables: [
      'Business registration documentation',
      'Compliance checklist',
      'Legal structure optimization',
      'Tax registration setup'
    ],
    sessions: [
      { title: 'Legal Structure Selection', duration: '90 min', completed: false },
      { title: 'Ghana Business Registration Process', duration: '120 min', completed: false },
      { title: 'Tax & Compliance Setup', duration: '90 min', completed: false }
    ]
  },
  {
    id: 'financial_management',
    title: 'Financial Management & Clean Books',
    description: 'Professional bookkeeping, cash flow mastery, and financial systems',
    duration: '3 weeks',
    status: 'available',
    lessons: 12,
    category: 'foundation',
    deliverables: [
      'Clean P&L statement',
      'Cash flow forecast (12 months)',
      'Unit economics model',
      'Financial dashboard'
    ],
    sessions: [
      { title: 'Financial Record Cleanup', duration: '90 min', completed: false },
      { title: 'Cash Flow Forecasting Mastery', duration: '120 min', completed: false },
      { title: 'Building Your Financial Dashboard', duration: '90 min', completed: false },
      { title: 'Unit Economics Deep Dive', duration: '60 min', completed: false }
    ]
  },
  {
    id: 'operations_optimization',
    title: 'Operations & Digital Transformation',
    description: 'Efficient operations, supply chain, and technology adoption',
    duration: '2 weeks',
    status: 'locked',
    lessons: 10,
    category: 'operations',
    deliverables: [
      'Operations manual',
      'Supply chain optimization',
      'Digital workflow automation',
      'Quality control systems'
    ],
    sessions: [
      { title: 'Operations Process Mapping', duration: '90 min', completed: false },
      { title: 'Supply Chain Optimization', duration: '120 min', completed: false },
      { title: 'Digital Transformation Strategy', duration: '90 min', completed: false }
    ]
  },
  {
    id: 'growth_systems',
    title: 'Sales & Marketing Growth Systems',
    description: 'Customer acquisition, retention, and market expansion strategies',
    duration: '3 weeks',
    status: 'locked',
    lessons: 15,
    category: 'growth',
    deliverables: [
      'Sales playbook',
      'Customer acquisition model',
      'Growth metrics dashboard',
      'Marketing automation setup'
    ],
    sessions: [
      { title: 'Sales Process Optimization', duration: '90 min', completed: false },
      { title: 'Customer Acquisition Strategies', duration: '120 min', completed: false },
      { title: 'Growth Metrics That Matter', duration: '60 min', completed: false },
      { title: 'Digital Marketing Mastery', duration: '90 min', completed: false }
    ]
  },
  {
    id: 'strategic_planning',
    title: 'Strategic Planning & Vision',
    description: 'Long-term planning, competitive analysis, and growth strategy',
    duration: '2 weeks',
    status: 'locked',
    lessons: 8,
    category: 'growth',
    deliverables: [
      'Strategic business plan',
      'Competitive analysis report',
      '3-year growth roadmap',
      'Vision & mission alignment'
    ],
    sessions: [
      { title: 'Strategic Planning Workshop', duration: '120 min', completed: false },
      { title: 'Competitive Analysis Deep Dive', duration: '90 min', completed: false },
      { title: 'Growth Strategy Development', duration: '90 min', completed: false }
    ]
  },
  {
    id: 'investment_readiness',
    title: 'Investment Readiness Certification',
    description: 'Pitch preparation, due diligence readiness, and investor relations',
    duration: '2 weeks',
    status: 'locked',
    lessons: 10,
    category: 'investment',
    deliverables: [
      'Professional pitch deck',
      '3-year financial projections',
      'Investment memorandum',
      'Data room setup',
      'Investment readiness certificate'
    ],
    sessions: [
      { title: 'Pitch Deck Mastery', duration: '120 min', completed: false },
      { title: 'Financial Projections Workshop', duration: '90 min', completed: false },
      { title: 'Investor Meeting Preparation', duration: '90 min', completed: false },
      { title: 'Due Diligence Readiness', duration: '60 min', completed: false }
    ]
  }
];

const pricingTracks: PricingTrack[] = [
  {
    id: 'self_paced',
    name: 'Self-Paced Track',
    price: 800,
    priceId: 'price_self_paced_investment_accelerator',
    type: 'Self-Paced',
    duration: '6 months access',
    support: 'Community & Email Support',
    features: [
      '6 comprehensive modules with 60+ lessons',
      'All templates, tools, and resources',
      'Community support and Q&A forums',
      'Email mentor support (48hr response)',
      'Mobile-optimized learning platform',
      '6 months access to all content',
      'Self-assessment tools and progress tracking',
      'Certificate upon completion',
      'Lifetime access to community'
    ]
  },
  {
    id: 'elite_cohort',
    name: 'Elite Cohort Track',
    price: 2500,
    originalPrice: 3500,
    priceId: 'price_elite_cohort_investment_accelerator',
    type: 'Elite Cohort',
    duration: '90 days intensive',
    support: 'Personal Mentor + Live Coaching',
    recommended: true,
    savings: '90% Investment Readiness Guaranteed',
    guarantee: '90% investment readiness score or money back',
    features: [
      'Everything in Self-Paced Track PLUS:',
      'Live weekly group sessions with experts',
      'Personal mentor assigned for 90 days',
      'Weekly 1-on-1 coaching calls',
      'Peer accountability with successful SMEs',
      'Live Q&A with investors and entrepreneurs',
      'Real-time feedback on all deliverables',
      'Graduation ceremony with investor pitch',
      'Direct introductions to potential investors',
      'Exclusive networking events and community',
      '90% investment readiness guarantee',
      'Priority customer support (4hr response)'
    ]
  }
];

export default function InvestmentAccelerator({ user, userProfile, onClose, enrollmentScore = 0, insights = [] }: InvestmentAcceleratorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'pricing'>('overview');
  const [selectedTrack, setSelectedTrack] = useState<'self_paced' | 'elite_cohort'>('elite_cohort');
  const [currentModule, setCurrentModule] = useState<string>('business_foundation');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  // New funding pathway state
  const [showPathwaySelector, setShowPathwaySelector] = useState(false);
  const [selectedFundingPathway, setSelectedFundingPathway] = useState<string | null>(null);
  const [currentPathwayData, setCurrentPathwayData] = useState<FundingPathway | null>(null);

  // Check if funding pathways are enabled
  const pathwaysEnabled = isFeatureEnabled('enableTieredFundingPathway') || isFeatureEnabled('showFundingPathwaySelector');

  useEffect(() => {
    // Show pathway selector on component mount if feature is enabled
    if (pathwaysEnabled && !selectedFundingPathway) {
      setShowPathwaySelector(true);
    } else if (!pathwaysEnabled) {
      // Default to traditional investment accelerator for backward compatibility
      setSelectedFundingPathway('investment_readiness');
    }
  }, [pathwaysEnabled]);

  useEffect(() => {
    // Update pathway data when selection changes
    if (selectedFundingPathway) {
      const pathwayData = getPathwayById(selectedFundingPathway);
      setCurrentPathwayData(pathwayData || null);
    }
  }, [selectedFundingPathway]);

  const handlePathwaySelect = (pathwayId: string) => {
    setSelectedFundingPathway(pathwayId);
    setShowPathwaySelector(false);

    // Reset to overview tab when pathway changes
    setActiveTab('overview');
  };

  // Calculate program metrics
  const totalLessons = acceleratorModules.reduce((sum, module) => sum + module.lessons, 0);
  const completedLessons = acceleratorModules
    .filter(m => m.status === 'completed')
    .reduce((sum, module) => sum + module.lessons, 0);
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  const handleEnrollment = async (trackId: 'self_paced' | 'elite_cohort') => {
    const track = pricingTracks.find(t => t.id === trackId);
    if (!track) return;

    setIsEnrolling(true);
    console.log(`🚀 Enrolling in ${track.name} - ₵${track.price}`);

    try {
      // TODO: Integrate with Stripe for payment processing
      // This would redirect to Stripe Checkout or handle payment

      // For now, simulate enrollment success
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ Enrollment successful!');
      // Close modal and redirect to program dashboard
      onClose();

    } catch (error) {
      console.error('❌ Enrollment failed:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'foundation': return '#10B981'; // Green
      case 'operations': return '#3B82F6'; // Blue
      case 'growth': return '#F59E0B';     // Orange
      case 'investment': return '#D4AF37'; // Gold
      default: return '#6B7280';
    }
  };

  const getCurrentModule = () => acceleratorModules.find(m => m.id === currentModule);

  return (
    <>
      {/* Funding Pathway Selector - shown when feature is enabled and no pathway selected */}
      {showPathwaySelector && (
        <FundingPathwaySelector
          userProfile={userProfile}
          assessmentResult={{ overallScore: enrollmentScore }}
          onPathwaySelect={handlePathwaySelect}
          onClose={() => {
            setShowPathwaySelector(false);
            // If user closes without selecting, default to investment readiness for backward compatibility
            if (!selectedFundingPathway) {
              setSelectedFundingPathway('investment_readiness');
            }
          }}
        />
      )}

      {/* Main Investment Accelerator Component */}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white text-2xl font-bold"
          >
            ×
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🚀 Investment Accelerator Program
              </h1>
              <p className="text-blue-100 text-lg">
                Transform from struggling SME to investment-ready business in 90 days
              </p>
              <div className="mt-3 flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {totalLessons} Lessons
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  6 Comprehensive Modules
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Proven Success
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-yellow-300">✓</div>
              <div className="text-sm text-blue-100">Investment Ready</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-8 px-6">
            {(['overview', 'curriculum', 'pricing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Value Proposition */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 Why Ghana's Top SMEs Choose Our Investment Accelerator
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">🏆 Proven Results</h3>
                    <ul className="space-y-1 text-gray-700">
                      <li>• 90% of graduates achieve investment readiness</li>
                      <li>• Average funding increase of 340%</li>
                      <li>• 156 SMEs successfully funded (₵2.1M+ raised)</li>
                      <li>• 12-month post-program success tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">⚡ What Makes Us Different</h3>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Ghana-specific business challenges & solutions</li>
                      <li>• Real investor feedback and connections</li>
                      <li>• Practical templates and proven frameworks</li>
                      <li>• Personal mentorship from successful entrepreneurs</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                  <p className="text-gray-900 font-medium">
                    <span className="text-yellow-600">⚡ Limited Time:</span> Only 12 spots available in our next Elite Cohort starting March 2024
                  </p>
                </div>
              </div>

              {/* Two Track Options */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Transformation Track</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {pricingTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`relative rounded-xl p-6 border-2 transition-all duration-200 ${
                        track.recommended
                          ? 'border-yellow-500 bg-yellow-50 shadow-lg scale-105'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {track.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            🏆 Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{track.type}</h3>
                        <p className="text-gray-600 mt-1">{track.duration}</p>
                        <div className="mt-3">
                          <span className="text-3xl font-bold text-gray-900">₵{track.price.toLocaleString()}</span>
                          {track.originalPrice && (
                            <span className="ml-2 text-lg text-gray-500 line-through">₵{track.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        {track.guarantee && (
                          <p className="text-sm text-green-600 mt-2 font-medium">{track.guarantee}</p>
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <p className="text-gray-700 font-medium">{track.support}</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTrack(track.id);
                          setActiveTab('pricing');
                        }}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                          track.recommended
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        Choose {track.type}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Stories */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Success Stories</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-4xl font-bold text-green-600 mb-2">₵450K</div>
                    <p className="text-gray-600">Raised by Kofi's Agro Business</p>
                    <p className="text-sm text-gray-500 mt-2">"The financial templates alone saved us months of work" - Kofi A.</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-4xl font-bold text-blue-600 mb-2">2.3x</div>
                    <p className="text-gray-600">Revenue Growth in 12 months</p>
                    <p className="text-sm text-gray-500 mt-2">"Now we have systems that actually work" - Ama K.</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">95%</div>
                    <p className="text-gray-600">Investment Readiness Score</p>
                    <p className="text-sm text-gray-500 mt-2">"Finally ready to scale beyond family funding" - Kwame T.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Complete Curriculum</h2>
                <div className="text-sm text-gray-600">
                  Progress: {progressPercentage}% ({completedLessons}/{totalLessons} lessons)
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Module List */}
                <div className="lg:col-span-1">
                  <div className="space-y-3">
                    {acceleratorModules.map((module) => (
                      <div
                        key={module.id}
                        onClick={() => setCurrentModule(module.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          currentModule === module.id
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getCategoryColor(module.category) }}
                              ></span>
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {module.category}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{module.duration}</p>
                            <div className="text-xs text-gray-500">
                              {module.lessons} lessons • {module.deliverables.length} deliverables
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            module.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : module.status === 'available'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {module.status === 'completed' ? '✓' : module.lessons}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Module Details */}
                <div className="lg:col-span-2">
                  {(() => {
                    const module = getCurrentModule();
                    if (!module) return null;

                    return (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getCategoryColor(module.category) }}
                          ></span>
                          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                            {module.category} Module
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{module.title}</h3>
                        <p className="text-gray-700 mb-6">{module.description}</p>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Deliverables */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">📋 What You'll Build</h4>
                            <ul className="space-y-2">
                              {module.deliverables.map((deliverable, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">✓</span>
                                  <span className="text-gray-700">{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Sessions (for Elite Cohort) */}
                          {module.sessions && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">🎓 Live Sessions (Elite Track)</h4>
                              <ul className="space-y-2">
                                {module.sessions.map((session, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">▶</span>
                                    <div>
                                      <div className="text-gray-900">{session.title}</div>
                                      <div className="text-sm text-gray-600">{session.duration}</div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                          <p className="text-sm text-gray-700">
                            <strong>⏱ Duration:</strong> {module.duration} |
                            <strong> 📚 Lessons:</strong> {module.lessons} |
                            <strong> 🎯 Difficulty:</strong> {module.category === 'foundation' ? 'Beginner' : module.category === 'growth' ? 'Intermediate' : 'Advanced'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Success Path</h2>
                <p className="text-gray-600 text-lg">Both tracks lead to the same destination: Investment readiness. Choose the support level that fits your style.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {pricingTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                      selectedTrack === track.id
                        ? 'border-yellow-500 bg-yellow-50 shadow-xl scale-105'
                        : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-lg'
                    } ${track.recommended ? 'ring-2 ring-yellow-300' : ''}`}
                  >
                    {track.recommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          🏆 RECOMMENDED
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{track.name}</h3>
                      <p className="text-gray-600 mb-4">{track.duration}</p>

                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">₵{track.price.toLocaleString()}</span>
                        {track.originalPrice && (
                          <div>
                            <span className="text-xl text-gray-500 line-through">₵{track.originalPrice.toLocaleString()}</span>
                            <span className="ml-2 text-green-600 font-semibold">Save ₵{(track.originalPrice - track.price).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center text-gray-700 font-medium mb-4">{track.support}</div>

                      {track.guarantee && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                          <p className="text-green-800 font-semibold text-sm">🛡️ {track.guarantee}</p>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {track.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className={`text-gray-700 ${feature.startsWith('Everything in') ? 'font-semibold' : ''}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        setSelectedTrack(track.id);
                        handleEnrollment(track.id);
                      }}
                      disabled={isEnrolling}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                        track.recommended
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      } ${isEnrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isEnrolling && selectedTrack === track.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        `Enroll in ${track.type}`
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Your Investment is Protected</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div>
                    <div className="font-semibold text-green-600 mb-1">30-Day Money Back</div>
                    <div>Full refund if not satisfied within first month</div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600 mb-1">Progress Guarantee</div>
                    <div>We track your progress and ensure you succeed</div>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-600 mb-1">Success Commitment</div>
                    <div>We're invested in your business transformation</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}