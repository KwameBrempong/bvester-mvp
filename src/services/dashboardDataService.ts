// Dashboard Data Persistence Service

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

  // Public methods for data access and updates
  getKPIData() {
    return this.data?.kpis || this.getDefaultData().kpis;
  }

  updateKPIData(updates: Partial<DashboardData['kpis']>) {
    if (this.data) {
      this.data.kpis = { ...this.data.kpis, ...updates };
      this.saveData();
    }
  }

  getProfileData() {
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
    console.log('Adding transaction:', transaction);
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