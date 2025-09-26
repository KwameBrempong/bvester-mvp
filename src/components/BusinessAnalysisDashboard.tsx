import React, { useState, useEffect } from 'react';

interface BusinessAnalysisDashboardProps {
  user: { username: string };
  onClose: () => void;
}

interface AnalysisData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  profitMargin: number;
  avgDailyRevenue: number;
  topCategory: string;
  insights: string[];
  recommendations: string[];
  healthScore: number;
  trend: 'up' | 'down' | 'stable';
}

const BusinessAnalysisDashboard: React.FC<BusinessAnalysisDashboardProps> = ({ user, onClose }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    generateAnalysis();
  }, [selectedPeriod]);

  const generateAnalysis = () => {
    setIsLoading(true);

    // Get transactions from localStorage
    const stored = localStorage.getItem(`transactions_${user?.username}`);
    const transactions = stored ? JSON.parse(stored) : [];

    // Filter by selected period
    const now = new Date();
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filteredTransactions = transactions.filter((t: any) => {
      const transactionDate = new Date(t.timestamp);
      return transactionDate >= startDate;
    });

    // Calculate metrics
    const revenue = filteredTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const netProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const avgDailyRevenue = revenue / days;

    // Find top expense category
    const expensesByCategory = filteredTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: any, t: any) => {
        const category = t.category || 'other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {});

    const topCategory = Object.entries(expensesByCategory)
      .sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || 'none';

    // Generate insights
    const insights = generateInsights({
      revenue,
      expenses,
      netProfit,
      profitMargin,
      transactionCount: filteredTransactions.length,
      topCategory
    });

    // Generate recommendations
    const recommendations = generateRecommendations({
      revenue,
      expenses,
      netProfit,
      profitMargin,
      topCategory,
      expensesByCategory
    });

    // Calculate health score (0-100)
    let healthScore = 50; // Base score
    if (netProfit > 0) healthScore += 20;
    if (profitMargin > 20) healthScore += 15;
    if (revenue > expenses * 1.2) healthScore += 10;
    if (filteredTransactions.length > 10) healthScore += 5;

    // Determine trend (simplified)
    const trend = netProfit > 0 ? 'up' : netProfit < 0 ? 'down' : 'stable';

    setAnalysis({
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      transactionCount: filteredTransactions.length,
      profitMargin,
      avgDailyRevenue,
      topCategory,
      insights,
      recommendations,
      healthScore: Math.min(100, Math.max(0, healthScore)),
      trend
    });

    setIsLoading(false);
  };

  const generateInsights = (data: any): string[] => {
    const insights = [];

    if (data.revenue === 0) {
      insights.push("💡 No revenue recorded yet. Focus on customer acquisition and sales.");
    } else {
      if (data.netProfit > 0) {
        insights.push("✅ Your business is profitable this period!");
      } else {
        insights.push("⚠️ Expenses exceed revenue. Review spending priorities.");
      }
    }

    if (data.profitMargin > 30) {
      insights.push("🎯 Excellent profit margins! Your pricing strategy is working well.");
    } else if (data.profitMargin > 15) {
      insights.push("👍 Good profit margins. Consider ways to optimize further.");
    } else if (data.profitMargin > 0) {
      insights.push("📈 Positive margins but room for improvement. Review costs.");
    }

    if (data.transactionCount < 5) {
      insights.push("📊 Low transaction volume. Focus on increasing business activity.");
    } else if (data.transactionCount > 20) {
      insights.push("🚀 High transaction volume shows active business operations!");
    }

    return insights;
  };

  const generateRecommendations = (data: any): string[] => {
    const recommendations = [];

    if (data.revenue < 1000) {
      recommendations.push("🎯 Focus on revenue growth: Expand marketing efforts or introduce new products/services.");
    }

    if (data.expenses > data.revenue * 0.8) {
      recommendations.push("💰 Reduce expenses: Review your largest expense categories for optimization opportunities.");
    }

    if (data.topCategory && data.expensesByCategory[data.topCategory] > data.expenses * 0.4) {
      recommendations.push(`📋 Your ${data.topCategory} expenses are high (40%+ of total). Consider negotiating better rates or finding alternatives.`);
    }

    if (data.profitMargin < 15) {
      recommendations.push("📈 Improve profit margins: Consider raising prices or reducing costs of goods sold.");
    }

    recommendations.push("📱 Keep recording transactions regularly to get better insights over time.");

    return recommendations;
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} GHS`;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#2E8B57';
    if (score >= 60) return '#32CD32';
    if (score >= 40) return '#FFD700';
    if (score >= 20) return '#FF8C00';
    return '#DC143C';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➖';
    }
  };

  const periodLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days'
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔍</div>
          <div>Analyzing your business...</div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

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
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '500px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        marginTop: '20px'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              📊 Business Analysis
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              AI-powered insights for your business
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              width: '32px',
              height: '32px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Period Selector */}
        <div style={{ padding: '16px 20px 0 20px' }}>
          <div style={{
            display: 'flex',
            background: '#f0f0f0',
            borderRadius: '8px',
            padding: '4px'
          }}>
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as any)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: selectedPeriod === key ? '#2E8B57' : 'transparent',
                  color: selectedPeriod === key ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Health Score */}
          <div style={{
            background: `linear-gradient(90deg, ${getHealthColor(analysis.healthScore)}20, ${getHealthColor(analysis.healthScore)}10)`,
            border: `1px solid ${getHealthColor(analysis.healthScore)}40`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {analysis.healthScore >= 80 ? '🎉' : analysis.healthScore >= 60 ? '👍' : analysis.healthScore >= 40 ? '⚠️' : '🚨'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: getHealthColor(analysis.healthScore), marginBottom: '4px' }}>
              {analysis.healthScore}/100
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Business Health Score {getTrendIcon(analysis.trend)}
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563EB', marginBottom: '4px' }}>
                {formatCurrency(analysis.totalRevenue)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Revenue</div>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '4px' }}>
                {formatCurrency(analysis.totalExpenses)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Expenses</div>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#059669',
                marginBottom: '4px'
              }}>
                {formatCurrency(analysis.netProfit)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Net Profit</div>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3498db', marginBottom: '4px' }}>
                {analysis.profitMargin.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Profit Margin</div>
            </div>
          </div>

          {/* Insights */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
              💡 Key Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                    color: '#333'
                  }}
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
              🎯 Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, #2E8B5710, #3CB37110)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #2E8B5730',
                    fontSize: '14px',
                    color: '#333'
                  }}
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #2E8B57, #3CB371)',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              🚀 Ready to grow your business?
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '12px' }}>
              Get personalized growth strategies with our Growth Accelerator program
            </div>
            <button
              onClick={() => {
                onClose();
                // This would trigger the Growth Accelerator
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Start Growth Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalysisDashboard;