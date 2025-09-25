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
import jsPDF from 'jspdf';
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

  const generatePDFReport = () => {
    if (!kpiData) return;

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Header
    doc.setFillColor(212, 175, 55); // Gold color
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BUSINESS PERFORMANCE REPORT', 105, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Bvester - SME Business Analytics Platform', 105, 28, { align: 'center' });
    doc.text(`Generated on ${currentDate}`, 105, 35, { align: 'center' });

    // Reset colors for body
    doc.setTextColor(0, 0, 0);

    // Executive Summary
    let yPosition = 60;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPosition);

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Analysis`, 20, yPosition);

    // KPI Cards Section
    yPosition += 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 20, yPosition);

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // Revenue
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Revenue:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(kpiData.revenue), 70, yPosition);
    doc.setTextColor(0, 150, 0);
    doc.text(`+${kpiData.growth}% growth`, 140, yPosition);

    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Customers:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(kpiData.customers.toString(), 70, yPosition);
    doc.setTextColor(0, 150, 0);
    doc.text('+12 this month', 140, yPosition);

    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Readiness Score:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpiData.readinessScore}%`, 70, yPosition);

    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Growth Stage:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('Scaling (Active)', 70, yPosition);

    // Revenue Breakdown Section
    yPosition += 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue Category Breakdown', 20, yPosition);

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    kpiData.categoryBreakdown.forEach((category, index) => {
      if (index < 5 && yPosition < 250) { // Limit to 5 categories and check page height
        doc.setFont('helvetica', 'bold');
        doc.text(`${category.name}:`, 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${category.value}%`, 140, yPosition);
        yPosition += 8;
      }
    });

    // Monthly Performance Trends
    if (yPosition < 220) {
      yPosition += 15;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Performance Trends', 20, yPosition);

      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      kpiData.monthlyData.slice(0, 4).forEach((month, index) => {
        if (yPosition < 260) {
          doc.text(`${month.month}:`, 20, yPosition);
          doc.text(`Revenue: ${formatCurrency(month.revenue)}`, 50, yPosition);
          doc.text(`Customers: ${month.customers}`, 120, yPosition);
          doc.text(`Transactions: ${month.transactions}`, 160, yPosition);
          yPosition += 8;
        }
      });
    }

    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text('This report was generated by Bvester SME Analytics Platform', 105, 290, { align: 'center' });
    doc.text('For support, contact: support@bvester.com', 105, 295, { align: 'center' });

    // Generate filename with current date
    const filename = `business-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Download the PDF
    doc.save(filename);
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
          <button
            className="action-btn"
            onClick={() => {
              // Open Transaction Hub/Recorder
              const event = new CustomEvent('openTransactionHub');
              window.dispatchEvent(event);
            }}
          >
            <Icon name="add" size={20} />
            <span>Add Transaction</span>
          </button>
          <button
            className="action-btn"
            onClick={() => {
              // Open file upload dialog
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  alert(`Document "${file.name}" selected. Upload functionality will be implemented soon.`);
                }
              };
              input.click();
            }}
          >
            <Icon name="upload" size={20} />
            <span>Upload Document</span>
          </button>
          <button
            className="action-btn"
            onClick={() => {
              // Scroll to analytics section or show detailed analytics
              const analyticsSection = document.querySelector('.charts-grid');
              if (analyticsSection) {
                analyticsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <Icon name="analytics" size={20} />
            <span>View Analytics</span>
          </button>
          <button
            className="action-btn"
            onClick={generatePDFReport}
          >
            <Icon name="download" size={20} />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPIs;