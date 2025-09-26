// Dashboard Data Persistence Service
import enhancedTransactionService from './enhancedTransactionService';

interface DashboardData {
  kpis: {
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
  };
  profile: {
    businessName: string;
    industry: string;
    founded: string;
    employees: string;
    location: string;
    revenue: string;
    description: string;
  };
  assessment: {
    overallScore: number;
    categories: {
      businessModel: number;
      financialHealth: number;
      marketOpportunity: number;
      teamLeadership: number;
    };
    lastUpdated: string;
  };
  bootcamp: {
    modules: Array<{
      id: string;
      name: string;
      progress: number;
      completed: number;
      total: number;
      locked: boolean;
    }>;
  };
  settings: {
    notifications: {
      email: boolean;
      assessmentReminders: boolean;
      marketingUpdates: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
}

class DashboardDataService {
  private storageKey = 'bvester_dashboard_data';
  private data: DashboardData | null = null;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.data = this.getDefaultData();
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.data = this.getDefaultData();
    }
  }

  private saveData(): void {
    try {
      if (this.data) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      }
    } catch (error) {
      console.error('Error saving dashboard data:', error);
    }
  }

  private getDefaultData(): DashboardData {
    return {
      kpis: {
        revenue: 35000,
        growth: 25,
        customers: 105,
        readinessScore: 72,
        monthlyData: [
          { month: 'Jan', revenue: 12000, customers: 45, transactions: 320 },
          { month: 'Feb', revenue: 15000, customers: 52, transactions: 380 },
          { month: 'Mar', revenue: 18000, customers: 61, transactions: 420 },
          { month: 'Apr', revenue: 22000, customers: 73, transactions: 490 },
          { month: 'May', revenue: 28000, customers: 89, transactions: 560 },
          { month: 'Jun', revenue: 35000, customers: 105, transactions: 640 },
        ],
        categoryBreakdown: [
          { name: 'Products', value: 45, color: '#D4AF37' },
          { name: 'Services', value: 30, color: '#FFD700' },
          { name: 'Subscriptions', value: 15, color: '#B8960F' },
          { name: 'Other', value: 10, color: '#F4E4B1' },
        ]
      },
      profile: {
        businessName: 'Your Business Name',
        industry: 'Technology & Innovation',
        founded: '2022',
        employees: '10-25',
        location: 'Accra, Ghana',
        revenue: 'GHS 500K - 1M',
        description: 'Add your business description here to help investors understand your value proposition and market opportunity.'
      },
      assessment: {
        overallScore: 72,
        categories: {
          businessModel: 85,
          financialHealth: 70,
          marketOpportunity: 75,
          teamLeadership: 60
        },
        lastUpdated: new Date().toISOString()
      },
      bootcamp: {
        modules: [
          {
            id: 'foundation',
            name: 'Foundation Module',
            progress: 30,
            completed: 3,
            total: 10,
            locked: false
          },
          {
            id: 'financial',
            name: 'Financial Management',
            progress: 0,
            completed: 0,
            total: 8,
            locked: false
          },
          {
            id: 'growth',
            name: 'Advanced Growth',
            progress: 0,
            completed: 0,
            total: 12,
            locked: true
          }
        ]
      },
      settings: {
        notifications: {
          email: true,
          assessmentReminders: true,
          marketingUpdates: false
        },
        theme: 'light'
      }
    };
  }

  // Generate real KPI data from actual transactions
  private generateRealKPIData() {
    try {
      const transactions = enhancedTransactionService.getAllTransactions();
      const analytics = enhancedTransactionService.getAnalytics();

      if (transactions.length === 0) {
        // No real data available, return defaults with indicator
        return {
          ...this.getDefaultData().kpis,
          isRealData: false
        };
      }

      // Calculate real metrics from actual transactions
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Filter current month transactions
      const currentMonthTransactions = transactions.filter(t => {
        const transDate = new Date(t.timestamp);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
      });

      // Calculate revenue from real transactions
      const currentMonthRevenue = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate previous month for growth
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const prevMonthTransactions = transactions.filter(t => {
        const transDate = new Date(t.timestamp);
        return transDate.getMonth() === prevMonth && transDate.getFullYear() === prevYear;
      });

      const prevMonthRevenue = prevMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const growth = prevMonthRevenue > 0
        ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : 0;

      // Generate monthly data from last 6 months
      const monthlyData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentYear, currentMonth - i, 1);
        const month = targetDate.getMonth();
        const year = targetDate.getFullYear();

        const monthTransactions = transactions.filter(t => {
          const transDate = new Date(t.timestamp);
          return transDate.getMonth() === month && transDate.getFullYear() === year;
        });

        const monthRevenue = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const uniqueCustomers = new Set(monthTransactions.map(t => t.id.split('-')[0])).size;

        monthlyData.push({
          month: monthNames[month],
          revenue: monthRevenue,
          customers: uniqueCustomers || Math.floor(monthRevenue / 500), // Estimate customers
          transactions: monthTransactions.length
        });
      }

      // Generate category breakdown from real data
      const categoryBreakdown = analytics.categoryBreakdown.slice(0, 4).map((cat, index) => ({
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
        value: Math.round(cat.percentage),
        color: ['#D4AF37', '#FFD700', '#B8960F', '#F4E4B1'][index] || '#D4AF37'
      }));

      // Estimate readiness score based on data quality and volume
      const readinessScore = Math.min(90, Math.max(40,
        50 + (transactions.length * 2) + (categoryBreakdown.length * 5)
      ));

      return {
        revenue: currentMonthRevenue,
        growth: growth,
        customers: new Set(transactions.map(t => t.id.split('-')[0])).size || Math.floor(analytics.totalIncome / 500),
        readinessScore,
        monthlyData,
        categoryBreakdown,
        isRealData: true
      };

    } catch (error) {
      console.warn('Error generating real KPI data, falling back to defaults:', error);
      return {
        ...this.getDefaultData().kpis,
        isRealData: false
      };
    }
  }

  // Public methods for data access and updates
  getKPIData() {
    // Try to get real data first, fallback to stored/default data
    const realKPIData = this.generateRealKPIData();

    if (realKPIData.isRealData) {
      // Update stored data with real data for persistence
      if (this.data) {
        this.data.kpis = { ...realKPIData };
        delete (this.data.kpis as any).isRealData; // Remove the flag before saving
        this.saveData();
      }
      return realKPIData;
    }

    // Fallback to stored or default data
    return this.data?.kpis || this.getDefaultData().kpis;
  }

  updateKPIData(updates: Partial<DashboardData['kpis']>) {
    if (this.data) {
      this.data.kpis = { ...this.data.kpis, ...updates };
      this.saveData();
    }
  }

  // Generate real profile data from actual user profile
  private generateRealProfileData() {
    try {
      // Try to get real profile data from localStorage or other sources
      const userProfile = localStorage.getItem('sme_profile');
      const businessProfile = localStorage.getItem('business_profile');

      if (userProfile || businessProfile) {
        const profile = userProfile ? JSON.parse(userProfile) : null;
        const business = businessProfile ? JSON.parse(businessProfile) : null;

        return {
          businessName: business?.businessName || profile?.businessName || 'Your Business Name',
          industry: business?.businessType || profile?.businessType || 'Technology & Innovation',
          founded: business?.yearEstablished || profile?.yearEstablished || new Date().getFullYear().toString(),
          employees: business?.numberOfEmployees || profile?.numberOfEmployees || '1-10',
          location: `${business?.location || profile?.location || 'Accra'}, Ghana`,
          revenue: business?.monthlyRevenue || profile?.monthlyRevenue || 'GHS 10K - 50K',
          description: business?.businessDescription || profile?.businessDescription || 'Add your business description here to help investors understand your value proposition and market opportunity.',
          isRealData: true
        };
      }

      return {
        ...this.getDefaultData().profile,
        isRealData: false
      };

    } catch (error) {
      console.warn('Error generating real profile data, falling back to defaults:', error);
      return {
        ...this.getDefaultData().profile,
        isRealData: false
      };
    }
  }

  getProfileData() {
    // Try to get real data first, fallback to stored/default data
    const realProfileData = this.generateRealProfileData();

    if ((realProfileData as any).isRealData) {
      // Update stored data with real data for persistence
      if (this.data) {
        this.data.profile = { ...realProfileData };
        delete (this.data.profile as any).isRealData; // Remove the flag before saving
        this.saveData();
      }
      return realProfileData;
    }

    // Fallback to stored or default data
    return this.data?.profile || this.getDefaultData().profile;
  }

  updateProfileData(updates: Partial<DashboardData['profile']>) {
    if (this.data) {
      this.data.profile = { ...this.data.profile, ...updates };
      this.saveData();
    }
  }

  getAssessmentData() {
    return this.data?.assessment || this.getDefaultData().assessment;
  }

  updateAssessmentData(updates: Partial<DashboardData['assessment']>) {
    if (this.data) {
      this.data.assessment = { ...this.data.assessment, ...updates, lastUpdated: new Date().toISOString() };
      this.saveData();
    }
  }

  getBootcampData() {
    return this.data?.bootcamp || this.getDefaultData().bootcamp;
  }

  updateBootcampProgress(moduleId: string, progress: number, completed: number) {
    if (this.data) {
      const module = this.data.bootcamp.modules.find(m => m.id === moduleId);
      if (module) {
        module.progress = progress;
        module.completed = completed;
        
        // Unlock next module if current is completed
        if (progress === 100) {
          const currentIndex = this.data.bootcamp.modules.findIndex(m => m.id === moduleId);
          if (currentIndex < this.data.bootcamp.modules.length - 1) {
            this.data.bootcamp.modules[currentIndex + 1].locked = false;
          }
        }
        
        this.saveData();
      }
    }
  }

  getSettingsData() {
    return this.data?.settings || this.getDefaultData().settings;
  }

  updateSettingsData(updates: Partial<DashboardData['settings']>) {
    if (this.data) {
      this.data.settings = { ...this.data.settings, ...updates };
      this.saveData();
    }
  }

  // Add transaction data
  addTransaction(transaction: { date: string; amount: number; type: string; description: string }) {
    // This would integrate with your existing transaction service
    // Adding transaction
    // Update KPIs based on new transaction
    if (this.data) {
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
      const monthData = this.data.kpis.monthlyData.find(m => m.month === currentMonth);
      if (monthData) {
        monthData.revenue += transaction.amount;
        monthData.transactions += 1;
        this.data.kpis.revenue = monthData.revenue;
        this.saveData();
      }
    }
  }

  // Export data for reports
  exportData(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.data, null, 2);
    }
    // CSV export would be implemented here
    return '';
  }

  // Reset to defaults
  resetData() {
    this.data = this.getDefaultData();
    this.saveData();
  }
}

// Export singleton instance
export const dashboardDataService = new DashboardDataService();
export default dashboardDataService;