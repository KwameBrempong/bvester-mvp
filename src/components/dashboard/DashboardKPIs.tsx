import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import Icon from '../Icons';
import { SkeletonLoader, Spinner } from '../LoadingStates';
import dashboardDataService from '../../services/dashboardDataService';
import '../../styles/dashboard-kpis.css';

interface KPIData {
  revenue: number;
  growth: number;
  customers: number;
  readinessScore: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    customers: number;
    transactions: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const DashboardKPIs: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadKPIData();
  }, [selectedPeriod]);

  const loadKPIData = async () => {
    setLoading(true);
    // Simulate API call delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 500));

    // Load persisted data
    const persistedData = dashboardDataService.getKPIData();

    setKpiData(persistedData);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-kpis-loading">
        <div className="kpi-cards-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="kpi-card">
              <SkeletonLoader height="120px" variant="rectangular" />
            </div>
          ))}
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <SkeletonLoader height="300px" variant="rectangular" />
          </div>
          <div className="chart-card">
            <SkeletonLoader height="300px" variant="rectangular" />
          </div>
        </div>
      </div>
    );
  }

  if (!kpiData) return null;

  return (
    <div className="dashboard-kpis animate-fadeIn">
      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card hover-lift">
          <div className="kpi-icon">
            <Icon name="cash" size={24} color="#D4AF37" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Monthly Revenue</p>
            <h3 className="kpi-value">{formatCurrency(kpiData.revenue)}</h3>
            <div className="kpi-trend positive">
              <Icon name="trending-up" size={16} />
              <span>+{kpiData.growth}%</span>
            </div>
          </div>
        </div>

        <div className="kpi-card hover-lift">
          <div className="kpi-icon">
            <Icon name="team" size={24} color="#D4AF37" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Customers</p>
            <h3 className="kpi-value">{kpiData.customers}</h3>
            <div className="kpi-trend positive">
              <Icon name="arrow-up" size={16} />
              <span>+12 this month</span>
            </div>
          </div>
        </div>

        <div className="kpi-card hover-lift">
          <div className="kpi-icon">
            <Icon name="chart-bar" size={24} color="#D4AF37" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Investment Readiness</p>
            <h3 className="kpi-value">{kpiData.readinessScore}%</h3>
            <div className="kpi-progress">
              <div
                className="kpi-progress-bar"
                style={{ width: `${kpiData.readinessScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="kpi-card hover-lift">
          <div className="kpi-icon">
            <Icon name="rocket" size={24} color="#D4AF37" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Growth Stage</p>
            <h3 className="kpi-value">Scaling</h3>
            <div className="kpi-badge">
              <span className="badge badge-gold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="period-selector">
        <button
          className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('week')}
        >
          Week
        </button>
        <button
          className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('month')}
        >
          Month
        </button>
        <button
          className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('year')}
        >
          Year
        </button>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenue Trend Chart */}
        <div className="chart-card hover-lift">
          <div className="chart-header">
            <h4 className="chart-title">Revenue Trend</h4>
            <button className="chart-action">
              <Icon name="download" size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={kpiData.monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#707070" />
              <YAxis stroke="#707070" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #D4AF37',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#D4AF37"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card hover-lift">
          <div className="chart-header">
            <h4 className="chart-title">Revenue by Category</h4>
            <button className="chart-action">
              <Icon name="info" size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kpiData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {kpiData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Growth */}
        <div className="chart-card hover-lift">
          <div className="chart-header">
            <h4 className="chart-title">Customer Growth</h4>
            <button className="chart-action">
              <Icon name="refresh" size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpiData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#707070" />
              <YAxis stroke="#707070" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #D4AF37',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: '#D4AF37', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Volume */}
        <div className="chart-card hover-lift">
          <div className="chart-header">
            <h4 className="chart-title">Transaction Volume</h4>
            <button className="chart-action">
              <Icon name="calendar" size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#707070" />
              <YAxis stroke="#707070" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #D4AF37',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="transactions" fill="#D4AF37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4 className="section-title">Quick Actions</h4>
        <div className="action-buttons">
          <button className="action-btn">
            <Icon name="add" size={20} />
            <span>Add Transaction</span>
          </button>
          <button className="action-btn">
            <Icon name="upload" size={20} />
            <span>Upload Document</span>
          </button>
          <button className="action-btn">
            <Icon name="analytics" size={20} />
            <span>View Analytics</span>
          </button>
          <button className="action-btn">
            <Icon name="download" size={20} />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPIs;