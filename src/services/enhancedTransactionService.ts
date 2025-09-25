// Enhanced Transaction Management Service

import { transactionService } from './dataService';

export interface EnhancedTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  timestamp: string;
  paymentMethod: string;
  tags: string[];
  location?: string;
  receipt?: {
    url: string;
    filename: string;
    fileSize: number;
  };
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
    nextDue?: string;
  };
  tax?: {
    deductible: boolean;
    category: string;
    rate: number;
  };
  notes?: string;
  confidence: number;
  source: 'manual' | 'voice' | 'ocr' | 'import';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilter {
  type?: 'income' | 'expense';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string;
  tags?: string[];
  search?: string;
  verified?: boolean;
  recurring?: boolean;
}

export interface TransactionAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  averageTransaction: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  topExpenses: EnhancedTransaction[];
  recurringTransactions: EnhancedTransaction[];
  cashFlow: Array<{
    date: string;
    runningBalance: number;
  }>;
}

export interface BudgetAlert {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  status: 'warning' | 'danger' | 'exceeded';
  message: string;
}

export interface RecurringTransactionTemplate {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  tags: string[];
  active: boolean;
}

class EnhancedTransactionService {
  private transactions: EnhancedTransaction[] = [];
  private budgets: Record<string, number> = {};
  private recurringTemplates: RecurringTransactionTemplate[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Advanced Transaction CRUD Operations
  async createTransaction(data: Partial<EnhancedTransaction>): Promise<EnhancedTransaction> {
    const transaction: EnhancedTransaction = {
      id: this.generateId(),
      userId: data.userId!,
      amount: data.amount || 0,
      type: data.type || 'expense',
      category: data.category || 'other',
      subcategory: data.subcategory,
      description: data.description || '',
      date: data.date || new Date().toISOString().split('T')[0],
      timestamp: data.timestamp || new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'cash',
      tags: data.tags || [],
      location: data.location,
      receipt: data.receipt,
      recurring: data.recurring,
      tax: data.tax,
      notes: data.notes,
      confidence: data.confidence || 1.0,
      source: data.source || 'manual',
      verified: data.verified || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.transactions.unshift(transaction);
    await this.saveToStorage();
    await this.syncToBackend(transaction);

    // Check for budget alerts
    this.checkBudgetAlerts(transaction);

    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<EnhancedTransaction>): Promise<EnhancedTransaction> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveToStorage();
    return this.transactions[index];
  }

  async deleteTransaction(id: string): Promise<void> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }

    this.transactions.splice(index, 1);
    await this.saveToStorage();
  }

  async bulkDelete(ids: string[]): Promise<void> {
    this.transactions = this.transactions.filter(t => !ids.includes(t.id));
    await this.saveToStorage();
  }

  async duplicateTransaction(id: string): Promise<EnhancedTransaction> {
    const original = this.transactions.find(t => t.id === id);
    if (!original) {
      throw new Error('Transaction not found');
    }

    const duplicate = {
      ...original,
      id: this.generateId(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.createTransaction(duplicate);
  }

  // Advanced Filtering and Search
  filterTransactions(filter: TransactionFilter): EnhancedTransaction[] {
    let filtered = [...this.transactions];

    if (filter.type) {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    if (filter.category) {
      filtered = filtered.filter(t => t.category === filter.category);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(t => t.date >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filtered = filtered.filter(t => t.date <= filter.dateTo!);
    }

    if (filter.amountMin !== undefined) {
      filtered = filtered.filter(t => t.amount >= filter.amountMin!);
    }

    if (filter.amountMax !== undefined) {
      filtered = filtered.filter(t => t.amount <= filter.amountMax!);
    }

    if (filter.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filter.paymentMethod);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(t =>
        filter.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm) ||
        t.notes?.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.verified !== undefined) {
      filtered = filtered.filter(t => t.verified === filter.verified);
    }

    if (filter.recurring !== undefined) {
      filtered = filtered.filter(t => !!t.recurring === filter.recurring);
    }

    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Analytics and Insights
  getAnalytics(dateFrom?: string, dateTo?: string): TransactionAnalytics {
    let transactions = [...this.transactions];

    if (dateFrom) {
      transactions = transactions.filter(t => t.date >= dateFrom);
    }

    if (dateTo) {
      transactions = transactions.filter(t => t.date <= dateTo);
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;
    const averageTransaction = transactions.length > 0
      ? (totalIncome + totalExpenses) / transactions.length
      : 0;

    // Category breakdown
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach(t => {
      const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: current.amount + t.amount,
        count: current.count + 1
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trends
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      const current = monthlyMap.get(month) || { income: 0, expenses: 0 };

      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expenses += t.amount;
      }

      monthlyMap.set(month, current);
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top expenses
    const topExpenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Recurring transactions
    const recurringTransactions = transactions
      .filter(t => t.recurring)
      .slice(0, 10);

    // Cash flow (running balance)
    const sortedTransactions = transactions
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let runningBalance = 0;
    const cashFlow = sortedTransactions.map(t => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      return {
        date: t.date,
        runningBalance
      };
    });

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      averageTransaction,
      transactionCount: transactions.length,
      categoryBreakdown,
      monthlyTrends,
      topExpenses,
      recurringTransactions,
      cashFlow
    };
  }

  // Budget Management
  setBudget(category: string, amount: number): void {
    this.budgets[category] = amount;
    this.saveToStorage();
  }

  getBudgetStatus(category: string): { budget: number; spent: number; remaining: number; percentage: number } {
    const budget = this.budgets[category] || 0;
    const currentMonth = new Date().toISOString().substring(0, 7);

    const spent = this.transactions
      .filter(t =>
        t.type === 'expense' &&
        t.category === category &&
        t.date.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = budget - spent;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    return { budget, spent, remaining, percentage };
  }

  getBudgetAlerts(): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];

    for (const [category, budget] of Object.entries(this.budgets)) {
      const status = this.getBudgetStatus(category);

      if (status.percentage >= 100) {
        alerts.push({
          id: `budget-${category}`,
          category,
          budgetAmount: budget,
          spentAmount: status.spent,
          percentage: status.percentage,
          status: 'exceeded',
          message: `Budget exceeded for ${category}! You've spent ${status.spent.toFixed(2)} GHS of your ${budget} GHS budget.`
        });
      } else if (status.percentage >= 90) {
        alerts.push({
          id: `budget-${category}`,
          category,
          budgetAmount: budget,
          spentAmount: status.spent,
          percentage: status.percentage,
          status: 'danger',
          message: `Warning: You've spent ${status.percentage.toFixed(1)}% of your ${category} budget.`
        });
      } else if (status.percentage >= 75) {
        alerts.push({
          id: `budget-${category}`,
          category,
          budgetAmount: budget,
          spentAmount: status.spent,
          percentage: status.percentage,
          status: 'warning',
          message: `You've spent ${status.percentage.toFixed(1)}% of your ${category} budget.`
        });
      }
    }

    return alerts;
  }

  // Recurring Transactions
  createRecurringTemplate(template: Omit<RecurringTransactionTemplate, 'id'>): RecurringTransactionTemplate {
    const newTemplate: RecurringTransactionTemplate = {
      ...template,
      id: this.generateId()
    };

    this.recurringTemplates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  processRecurringTransactions(): Promise<EnhancedTransaction[]> {
    const today = new Date().toISOString().split('T')[0];
    const createdTransactions: Promise<EnhancedTransaction>[] = [];

    this.recurringTemplates
      .filter(template => template.active)
      .forEach(template => {
        const nextDue = this.calculateNextDueDate(template);

        if (nextDue <= today) {
          const transactionData: Partial<EnhancedTransaction> = {
            userId: 'current-user', // This would come from context
            amount: template.amount,
            type: template.type,
            category: template.category,
            description: template.description,
            date: today,
            tags: [...template.tags, 'recurring'],
            recurring: {
              frequency: template.frequency,
              endDate: template.endDate,
              nextDue: this.calculateNextDueDate(template, new Date(today))
            },
            source: 'manual'
          };

          createdTransactions.push(this.createTransaction(transactionData));
        }
      });

    return Promise.all(createdTransactions);
  }

  // Export functionality
  exportTransactions(format: 'csv' | 'json' | 'pdf', filter?: TransactionFilter): string {
    const transactions = filter ? this.filterTransactions(filter) : this.transactions;

    switch (format) {
      case 'csv':
        return this.exportToCSV(transactions);
      case 'json':
        return this.exportToJSON(transactions);
      case 'pdf':
        // This would generate a PDF - placeholder for now
        return 'PDF export not implemented yet';
      default:
        throw new Error('Unsupported export format');
    }
  }

  private exportToCSV(transactions: EnhancedTransaction[]): string {
    const headers = [
      'Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method', 'Tags', 'Notes'
    ];

    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      t.amount.toString(),
      t.paymentMethod,
      t.tags.join('; '),
      t.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  private exportToJSON(transactions: EnhancedTransaction[]): string {
    return JSON.stringify(transactions, null, 2);
  }

  // Import functionality
  async importFromCSV(csvData: string): Promise<EnhancedTransaction[]> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const transactions: Promise<EnhancedTransaction>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
      const data: Partial<EnhancedTransaction> = {};

      headers.forEach((header, index) => {
        switch (header.toLowerCase()) {
          case 'date':
            data.date = values[index];
            break;
          case 'description':
            data.description = values[index];
            break;
          case 'category':
            data.category = values[index];
            break;
          case 'type':
            data.type = values[index] as 'income' | 'expense';
            break;
          case 'amount':
            data.amount = parseFloat(values[index]) || 0;
            break;
          case 'payment method':
            data.paymentMethod = values[index];
            break;
          case 'tags':
            data.tags = values[index].split('; ').filter(t => t.trim());
            break;
          case 'notes':
            data.notes = values[index];
            break;
        }
      });

      if (data.description && data.amount !== undefined) {
        data.userId = 'current-user'; // This would come from context
        data.source = 'import';
        transactions.push(this.createTransaction(data));
      }
    }

    return Promise.all(transactions);
  }

  // Utility methods
  private generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateNextDueDate(template: RecurringTransactionTemplate, fromDate?: Date): string {
    const date = fromDate || new Date(template.startDate);

    switch (template.frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.toISOString().split('T')[0];
  }

  private async saveToStorage(): Promise<void> {
    const data = {
      transactions: this.transactions,
      budgets: this.budgets,
      recurringTemplates: this.recurringTemplates
    };

    localStorage.setItem('enhanced_transactions', JSON.stringify(data));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('enhanced_transactions');
      if (stored) {
        const data = JSON.parse(stored);
        this.transactions = data.transactions || [];
        this.budgets = data.budgets || {};
        this.recurringTemplates = data.recurringTemplates || [];
      }
    } catch (error) {
      console.error('Error loading transactions from storage:', error);
    }
  }

  private async syncToBackend(transaction: EnhancedTransaction): Promise<void> {
    try {
      // Convert to the format expected by the existing service
      await transactionService.create({
        userId: transaction.userId,
        transactionId: transaction.id,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt
      });
    } catch (error) {
      console.warn('Failed to sync to backend:', error);
    }
  }

  private checkBudgetAlerts(transaction: EnhancedTransaction): void {
    if (transaction.type === 'expense') {
      const status = this.getBudgetStatus(transaction.category);
      if (status.percentage >= 90) {
        // This could trigger a notification or event
        console.warn(`Budget alert for ${transaction.category}: ${status.percentage.toFixed(1)}% used`);
      }
    }
  }

  // Public getters
  getAllTransactions(): EnhancedTransaction[] {
    return [...this.transactions];
  }

  getTransactionById(id: string): EnhancedTransaction | undefined {
    return this.transactions.find(t => t.id === id);
  }

  getCategories(): string[] {
    const categories = new Set(this.transactions.map(t => t.category));
    return Array.from(categories).sort();
  }

  getTags(): string[] {
    const tags = new Set(this.transactions.flatMap(t => t.tags));
    return Array.from(tags).sort();
  }

  getPaymentMethods(): string[] {
    const methods = new Set(this.transactions.map(t => t.paymentMethod));
    return Array.from(methods).sort();
  }
}

// Export singleton instance
export const enhancedTransactionService = new EnhancedTransactionService();
export default enhancedTransactionService;