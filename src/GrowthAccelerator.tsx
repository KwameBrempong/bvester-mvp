import React, { useState, useEffect } from 'react';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'locked' | 'available' | 'completed';
  lessons: number;
  category: 'foundation' | 'operations' | 'growth' | 'investment';
}

interface GrowthAcceleratorProps {
  user: any;
  userProfile: any;
  onClose: () => void;
}

const modules: Module[] = [
  {
    id: 'business_foundation',
    title: 'Business Foundation & Structure',
    description: 'Legal structure, registration, and compliance for Ghana SMEs',
    duration: '2 weeks',
    status: 'available',
    lessons: 8,
    category: 'foundation'
  },
  {
    id: 'financial_management',
    title: 'Financial Management & Records',
    description: 'Bookkeeping, cash flow, and financial planning essentials',
    duration: '3 weeks',
    status: 'available',
    lessons: 12,
    category: 'foundation'
  },
  {
    id: 'digital_transformation',
    title: 'Digital Business Transformation',
    description: 'Technology adoption and digital marketing for Ghana SMEs',
    duration: '2 weeks',
    status: 'available',
    lessons: 10,
    category: 'operations'
  },
  {
    id: 'sales_marketing',
    title: 'Sales & Marketing Strategy',
    description: 'Customer acquisition and market expansion in Ghana',
    duration: '3 weeks',
    status: 'locked',
    lessons: 15,
    category: 'growth'
  },
  {
    id: 'operations_management',
    title: 'Operations & Supply Chain',
    description: 'Efficient operations and supplier management',
    duration: '2 weeks',
    status: 'locked',
    lessons: 9,
    category: 'operations'
  },
  {
    id: 'strategic_planning',
    title: 'Strategic Planning & Vision',
    description: 'Business planning and growth strategy development',
    duration: '2 weeks',
    status: 'locked',
    lessons: 8,
    category: 'growth'
  },
  {
    id: 'investment_readiness',
    title: 'Investment Readiness Certification',
    description: 'Prepare for investor meetings and funding applications',
    duration: '1 week',
    status: 'locked',
    lessons: 6,
    category: 'investment'
  }
];

export default function GrowthAccelerator({ user, userProfile, onClose }: GrowthAcceleratorProps) {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Load user progress
    const saved = localStorage.getItem(`accelerator_progress_${user?.username}`);
    if (saved) {
      setUserProgress(JSON.parse(saved));
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [user?.username]);

  const calculateOverallProgress = () => {
    const totalModules = modules.length;
    const completedModules = Object.values(userProgress).filter(progress => progress >= 100).length;
    return Math.round((completedModules / totalModules) * 100);
  };

  const getProgressLevel = (progress: number) => {
    if (progress >= 80) return { level: 'Investment Ready', color: '#2E8B57' };
    if (progress >= 60) return { level: 'Advanced', color: '#3498db' };
    if (progress >= 30) return { level: 'Intermediate', color: '#f39c12' };
    return { level: 'Beginner', color: '#e74c3c' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'foundation': return '#3498db';
      case 'operations': return '#f39c12';
      case 'growth': return '#2E8B57';
      case 'investment': return '#9b59b6';
      default: return '#7f8c8d';
    }
  };

  const startModule = (module: Module) => {
    if (module.status === 'locked') {
      alert('Complete previous modules to unlock this one.');
      return;
    }
    setSelectedModule(module);
  };

  const overallProgress = calculateOverallProgress();
  const progressLevel = getProgressLevel(overallProgress);

  if (selectedModule) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: getCategoryColor(selectedModule.category),
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px' }}>{selectedModule.title}</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>{selectedModule.description}</p>
          </div>

          <div style={{ 
            padding: '30px', 
            textAlign: 'center',
            flex: 1,
            overflowY: 'auto'
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#2E8B57', marginBottom: '15px' }}>Coming in Full Version</h3>
              <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                This module will include interactive lessons, practical exercises, and Ghana-specific case studies.
              </p>
              <div style={{ marginBottom: '15px' }}>
                <strong>Module Contents:</strong>
                <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                  <li>Video lessons with local experts</li>
                  <li>Downloadable templates and tools</li>
                  <li>Interactive quizzes and assessments</li>
                  <li>Real Ghana SME case studies</li>
                  <li>Progress tracking and certification</li>
                </ul>
              </div>
            </div>

            <div style={{
              background: '#e8f5e8',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2E8B57' }}>
                Be among the first 100 SMEs to get FREE access when we launch!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedModule(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2E8B57',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2E8B57, #3498db)',
          color: 'white',
          padding: '25px 30px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Growth Accelerator Program</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
                World-class business development for Ghana SMEs
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div style={{
          padding: '25px 30px',
          background: '#f8f9fa',
          borderBottom: '2px solid #e9ecef',
          flexShrink: 0
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: progressLevel.color }}>
                {overallProgress}%
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Overall Progress</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: progressLevel.color }}>
                {progressLevel.level}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Current Level</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2E8B57' }}>
                {modules.length} Modules
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Program</div>
            </div>
          </div>
          
          <div style={{
            background: '#e0e0e0',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: progressLevel.color,
              height: '100%',
              width: `${overallProgress}%`,
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Modules Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '25px 30px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {modules.map((module, index) => (
              <div
                key={module.id}
                style={{
                  background: 'white',
                  border: `2px solid ${module.status === 'locked' ? '#e0e0e0' : getCategoryColor(module.category)}`,
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: module.status === 'locked' ? 'not-allowed' : 'pointer',
                  opacity: module.status === 'locked' ? 0.6 : 1,
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => startModule(module)}
                onMouseEnter={(e) => {
                  if (module.status !== 'locked') {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'inline-block',
                    background: getCategoryColor(module.category),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}>
                    {module.category.toUpperCase()}
                  </div>
                  <div style={{
                    float: 'right',
                    background: module.status === 'locked' ? '#e0e0e0' : '#2E8B57',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {module.status === 'locked' ? 'LOCKED' : 'AVAILABLE'}
                  </div>
                </div>

                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '18px',
                  color: module.status === 'locked' ? '#999' : '#333'
                }}>
                  {module.title}
                </h3>
                
                <p style={{ 
                  margin: '0 0 15px 0', 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  color: '#666'
                }}>
                  {module.description}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#888'
                }}>
                  <span>{module.lessons} lessons</span>
                  <span>{module.duration}</span>
                </div>

                {userProgress[module.id] && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      height: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: getCategoryColor(module.category),
                        height: '100%',
                        width: `${userProgress[module.id]}%`,
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Coming Soon Features */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#2E8B57', marginBottom: '15px' }}>Coming Soon in Full Launch</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}>
                <strong>AI Business Advisor</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>24/7 personalized guidance</div>
              </div>
              <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}>
                <strong>Mentor Matching</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>Expert entrepreneur mentors</div>
              </div>
              <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}>
                <strong>SME Community</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>Networking & peer support</div>
              </div>
            </div>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
              Join now to be first in line when these features launch!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}