import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { useSubscriptionTier } from '../store/hooks';
import enhancedTransactionService, {
  EnhancedTransaction,
  TransactionFilter,
  TransactionAnalytics,
  BudgetAlert
} from '../services/enhancedTransactionService';
import voiceRecordingService, { TranscriptionResult } from '../services/voiceRecordingService';
import Icon from './Icons';
import { SkeletonLoader } from './LoadingStates';
import '../styles/transaction-recorder.css';

interface TransactionHubProps {
  user: { username: string };
  onClose: () => void;
}

const TransactionHub: React.FC<TransactionHubProps> = ({ user, onClose }) => {
  // State management
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<EnhancedTransaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'analytics' | 'voice'>('add');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  // Input state
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Partial<EnhancedTransaction> | null>(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout>();

  // Hooks
  const { checkUsageLimit, consumeUsage, getUsageWarningComponent } = useUsageLimits();
  const subscriptionTier = useSubscriptionTier();
  const [usageLimitResult, setUsageLimitResult] = useState<any>(null);

  const isPremiumUser = subscriptionTier === 'business';

  // Load data on mount
  useEffect(() => {
    initializeData();
  }, [user.username]);

  // Update filtered transactions when filters change
  useEffect(() => {
    const filtered = enhancedTransactionService.filterTransactions({
      ...filters,
      search: searchTerm
    });
    setFilteredTransactions(filtered);
  }, [transactions, filters, searchTerm]);

  // Calculate analytics when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      const analyticsData = enhancedTransactionService.getAnalytics();
      setAnalytics(analyticsData);

      const alerts = enhancedTransactionService.getBudgetAlerts();
      setBudgetAlerts(alerts);
    }
  }, [transactions]);

  const initializeData = async () => {
    setLoading(true);
    try {
      // Load existing transactions
      const allTransactions = enhancedTransactionService.getAllTransactions();
      setTransactions(allTransactions);

      // Check usage limits
      if (user?.username) {
        const limitCheck = checkUsageLimit({ type: 'transactions', userId: user.username });
        setUsageLimitResult(limitCheck);
      }

      // Process any due recurring transactions
      const newRecurring = await enhancedTransactionService.processRecurringTransactions();
      if (newRecurring.length > 0) {
        const updated = enhancedTransactionService.getAllTransactions();
        setTransactions(updated);
      }

    } catch (error) {
      console.error('Failed to initialize transaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    if (!isPremiumUser) return;

    try {
      setIsRecording(true);
      setRecordingDuration(0);
      setTranscription('');

      // Start recording duration timer
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start transcription
      const result = await voiceRecordingService.startTranscription();
      setTranscription(result.text);

      if (result.text.trim()) {
        await handleInputSubmit(result.text);
      }

    } catch (error) {
      console.error('Voice recording failed:', error);
    } finally {
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const stopVoiceRecording = () => {
    voiceRecordingService.stopTranscription();
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  // Enhanced AI transaction parsing
  const parseTransactionWithAI = (text: string): Partial<EnhancedTransaction> => {
    // Extract amount with multiple patterns
    const amountPatterns = [
      /(?:ghs|gh₵|₵|ghc)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:ghs|gh₵|₵|ghc|cedis)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    ];

    let amount = 0;
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Enhanced context analysis
    const lowerText = text.toLowerCase();

    // Determine transaction type with context
    const incomeIndicators = [
      'sold', 'sale', 'revenue', 'income', 'received', 'payment received',
      'earned', 'profit', 'customer paid', 'client paid', 'invoice paid',
      'deposit', 'credit', 'refund received', 'commission', 'bonus'
    ];

    const expenseIndicators = [
      'bought', 'purchase', 'expense', 'spent', 'paid', 'cost',
      'bill', 'invoice', 'fee', 'charge', 'subscription', 'rent',
      'salary', 'wages', 'utilities', 'insurance', 'maintenance'
    ];

    let type: 'income' | 'expense' = 'expense';
    let confidence = 0.6;

    for (const indicator of incomeIndicators) {
      if (lowerText.includes(indicator)) {
        type = 'income';
        confidence = 0.9;
        break;
      }
    }

    if (type === 'expense') {
      for (const indicator of expenseIndicators) {
        if (lowerText.includes(indicator)) {
          confidence = 0.9;
          break;
        }
      }
    }

    // Enhanced category detection
    const categoryMapping = {
      sales: ['sale', 'sold', 'customer', 'client', 'product', 'service'],
      transport: ['fuel', 'gas', 'transport', 'taxi', 'uber', 'car'],
      food: ['food', 'lunch', 'dinner', 'restaurant', 'meal'],
      office: ['rent', 'office', 'utilities', 'electricity', 'water'],
      marketing: ['marketing', 'advertising', 'promotion', 'ads'],
      supplies: ['supplies', 'equipment', 'materials', 'inventory'],
      professional: ['consultant', 'lawyer', 'accountant', 'professional']
    };

    let category = 'other';
    for (const [cat, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Extract tags from text
    const tags: string[] = [];
    if (lowerText.includes('urgent')) tags.push('urgent');
    if (lowerText.includes('business')) tags.push('business');
    if (lowerText.includes('personal')) tags.push('personal');

    return {
      amount,
      type,
      category,
      confidence,
      tags,
      description: text,
      source: activeTab === 'voice' ? 'voice' : 'manual'
    };
  };

  const generateAISuggestion = (parsed: Partial<EnhancedTransaction>): string => {
    const suggestions = [
      `I detected a ${parsed.type} of ${parsed.amount} GHS in the ${parsed.category} category.`,
      `This looks like a ${parsed.type} transaction of ${parsed.amount} GHS for ${parsed.category}.`,
      `Recording ${parsed.amount} GHS ${parsed.type} under ${parsed.category}. Is this correct?`
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleInputSubmit = async (textInput?: string) => {
    const text = textInput || inputText;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      // Check usage limits
      const limitResult = await consumeUsage({ type: 'transactions', userId: user.username });
      setUsageLimitResult(limitResult);

      if (!limitResult.canProceed) {
        return;
      }

      // Parse transaction
      const parsed = parseTransactionWithAI(text);

      if (parsed.confidence && parsed.confidence < 0.8) {
        // Show suggestion for confirmation
        setCurrentSuggestion({
          ...parsed,
          userId: user.username,
          description: text
        });
        setShowSuggestions(true);
      } else {
        // Auto-add with high confidence
        await addTransaction(parsed, text);
      }

      if (!textInput) {
        setInputText('');
      }
      setTranscription('');

    } catch (error) {
      console.error('Failed to process transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addTransaction = async (parsed: Partial<EnhancedTransaction>, originalText: string) => {
    try {
      const transaction = await enhancedTransactionService.createTransaction({
        ...parsed,
        userId: user.username,
        description: originalText,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      });

      // Update local state
      const updated = enhancedTransactionService.getAllTransactions();
      setTransactions(updated);

      setShowSuggestions(false);
      setCurrentSuggestion(null);

    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const confirmSuggestion = () => {
    if (currentSuggestion) {
      addTransaction(currentSuggestion, currentSuggestion.description || '');
    }
  };

  const editSuggestion = (field: string, value: any) => {
    if (currentSuggestion) {
      setCurrentSuggestion({ ...currentSuggestion, [field]: value });
    }
  };

  // Transaction management functions
  const deleteTransaction = async (id: string) => {
    try {
      await enhancedTransactionService.deleteTransaction(id);
      const updated = enhancedTransactionService.getAllTransactions();
      setTransactions(updated);
      setSelectedTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const bulkDelete = async () => {
    if (selectedTransactions.size === 0) return;

    if (confirm(`Delete ${selectedTransactions.size} selected transactions?`)) {
      try {
        await enhancedTransactionService.bulkDelete(Array.from(selectedTransactions));
        const updated = enhancedTransactionService.getAllTransactions();
        setTransactions(updated);
        setSelectedTransactions(new Set());
      } catch (error) {
        console.error('Failed to bulk delete transactions:', error);
      }
    }
  };

  const exportTransactions = (format: 'csv' | 'json') => {
    try {
      const data = enhancedTransactionService.exportTransactions(format, filters);
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      sales: 'cash',
      transport: 'car',
      food: 'food',
      office: 'building',
      utilities: 'lightning',
      supplies: 'package',
      marketing: 'megaphone',
      professional: 'briefcase',
      other: 'file-text'
    };
    return iconMap[category] || 'file-text';
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick action templates
  const quickActions = [
    { text: "Sold product for 50 GHS", category: "sales", icon: "cash" },
    { text: "Bought fuel for 30 GHS", category: "transport", icon: "car" },
    { text: "Lunch expense 15 GHS", category: "food", icon: "food" },
    { text: "Office rent 200 GHS", category: "office", icon: "building" },
    { text: "Marketing campaign 100 GHS", category: "marketing", icon: "megaphone" },
    { text: "Equipment purchase 150 GHS", category: "supplies", icon: "package" }
  ];

  // Memoized filtered transaction count for performance
  const filteredCount = useMemo(() => filteredTransactions.length, [filteredTransactions]);

  if (loading) {
    return (
      <div className="transaction-modal-overlay">
        <div className="transaction-modal">
          <div className="transaction-header">
            <div>
              <h3>Loading Transaction Hub...</h3>
            </div>
          </div>
          <div className="transaction-content" style={{ padding: 'var(--space-xl)' }}>
            <SkeletonLoader height="400px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="transaction-modal">

        {/* Header */}
        <div className="transaction-header">
          <div>
            <h3>
              <Icon name="transactions" size={20} />
              Transaction Hub
            </h3>
            <p>Complete financial transaction management</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Usage Warning */}
        {usageLimitResult && getUsageWarningComponent(usageLimitResult)}

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div style={{ padding: 'var(--space-md)', backgroundColor: '#FFF3CD', borderBottom: '1px solid var(--gray-200)' }}>
            {budgetAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} style={{ fontSize: 'var(--text-sm)', color: '#856404', marginBottom: 'var(--space-xs)' }}>
                <Icon name="warning" size={14} /> {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="transaction-tabs">
          <button
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Icon name="add" size={16} />
            Add Transaction
          </button>
          <button
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Icon name="list" size={16} />
            Transactions ({filteredCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Icon name="chart-bar" size={16} />
            Analytics
          </button>
          <button
            className={`tab-button ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
            disabled={!isPremiumUser}
          >
            <Icon name="microphone" size={16} />
            Voice Input
            {!isPremiumUser && <span className="premium-badge">Premium</span>}
          </button>
        </div>

        <div className="transaction-content">
          {/* Add Transaction Tab */}
          {activeTab === 'add' && (
            <>
              <div className="tab-content">
                <div className="transaction-list" style={{ padding: 'var(--space-lg)' }}>
                  {transactions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Icon name="transactions" size={24} color="var(--gold-primary)" />
                      </div>
                      <h4>Start Recording Transactions</h4>
                      <p>Add your first business transaction using the input below or voice recording.</p>
                    </div>
                  ) : (
                    <div>
                      <h5 style={{ margin: '0 0 var(--space-md) 0', color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
                        Recent Transactions
                      </h5>
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                          <div className="transaction-item-header">
                            <div className="transaction-amount">
                              <div className="transaction-icon">
                                <Icon name={getCategoryIcon(transaction.category)} size={16} />
                              </div>
                              <span className={`transaction-amount-text ${transaction.type}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            <span className="transaction-time">
                              {new Date(transaction.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="transaction-description">"{transaction.description}"</div>
                          <div className="transaction-meta">
                            <span className="transaction-category">#{transaction.category}</span>
                            {transaction.source === 'voice' && (
                              <span className="ai-assisted">
                                <Icon name="microphone" size={12} />
                                Voice
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {transactions.length < 3 && (
                  <div className="quick-actions">
                    <h5>Quick Actions:</h5>
                    <div className="quick-actions-grid">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          className="quick-action-btn"
                          onClick={() => setInputText(action.text)}
                        >
                          <Icon name={action.icon} size={16} />
                          <span>{action.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Input - Always visible at bottom */}
              <div className="input-section">
                <div className="input-group">
                  <div className="input-field">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                      placeholder="Describe your transaction... e.g., 'Sold product for 50 GHS'"
                      disabled={isProcessing || usageLimitResult?.isAtLimit}
                    />
                  </div>
                  <button
                    className="send-button"
                    onClick={() => handleInputSubmit()}
                    disabled={!inputText.trim() || isProcessing || usageLimitResult?.isAtLimit}
                  >
                    {isProcessing ? (
                      <Icon name="loader" size={16} />
                    ) : (
                      <Icon name="send" size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Transactions List Tab */}
          {activeTab === 'list' && (
            <>
              {/* Search and Filters */}
              <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--gray-200)' }}>
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <div className="input-field">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search transactions..."
                    />
                  </div>
                  <button
                    className="send-button"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Icon name="filter" size={16} />
                  </button>
                </div>

                {/* Bulk Actions */}
                {selectedTransactions.size > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                      {selectedTransactions.size} selected
                    </span>
                    <button className="action-button" onClick={bulkDelete}>
                      <Icon name="trash" size={12} />
                      Delete Selected
                    </button>
                  </div>
                )}

                {/* Export Options */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                  <button className="action-button" onClick={() => exportTransactions('csv')}>
                    <Icon name="download" size={12} />
                    Export CSV
                  </button>
                  <button className="action-button" onClick={() => exportTransactions('json')}>
                    <Icon name="download" size={12} />
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Transaction List */}
              <div className="transaction-list">
                {filteredTransactions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Icon name="search" size={24} color="var(--gold-primary)" />
                    </div>
                    <h4>No Transactions Found</h4>
                    <p>Try adjusting your search terms or filters.</p>
                  </div>
                ) : (
                  <div>
                    {filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="transaction-item">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                          <input
                            type="checkbox"
                            checked={selectedTransactions.has(transaction.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedTransactions);
                              if (e.target.checked) {
                                newSet.add(transaction.id);
                              } else {
                                newSet.delete(transaction.id);
                              }
                              setSelectedTransactions(newSet);
                            }}
                            style={{ marginTop: 'var(--space-xs)' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div className="transaction-item-header">
                              <div className="transaction-amount">
                                <div className="transaction-icon">
                                  <Icon name={getCategoryIcon(transaction.category)} size={16} />
                                </div>
                                <span className={`transaction-amount-text ${transaction.type}`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </span>
                              </div>
                              <span className="transaction-time">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="transaction-description">"{transaction.description}"</div>
                            <div className="transaction-meta">
                              <span className="transaction-category">#{transaction.category}</span>
                              {transaction.tags.length > 0 && (
                                <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>
                                  Tags: {transaction.tags.join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="transaction-actions">
                              <button
                                className="action-button"
                                onClick={() => {
                                  // This would open an edit modal
                                  console.log('Edit transaction', transaction.id);
                                }}
                              >
                                <Icon name="edit" size={12} />
                                Edit
                              </button>
                              <button
                                className="action-button"
                                onClick={() => deleteTransaction(transaction.id)}
                              >
                                <Icon name="trash" size={12} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div className="kpi-card">
                  <h6 style={{ margin: '0 0 var(--space-sm) 0', fontSize: 'var(--text-sm)', color: 'var(--gray-700)', fontWeight: 'var(--font-medium)' }}>Total Income</h6>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--success-600)' }}>
                    {formatCurrency(analytics.totalIncome)}
                  </div>
                </div>
                <div className="kpi-card">
                  <h6 style={{ margin: '0 0 var(--space-sm) 0', fontSize: 'var(--text-sm)', color: 'var(--gray-700)', fontWeight: 'var(--font-medium)' }}>Total Expenses</h6>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--error-600)' }}>
                    {formatCurrency(analytics.totalExpenses)}
                  </div>
                </div>
                <div className="kpi-card">
                  <h6 style={{ margin: '0 0 var(--space-sm) 0', fontSize: 'var(--text-sm)', color: 'var(--gray-700)', fontWeight: 'var(--font-medium)' }}>Net Income</h6>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: analytics.netIncome >= 0 ? 'var(--success-600)' : 'var(--error-600)' }}>
                    {formatCurrency(analytics.netIncome)}
                  </div>
                </div>
                <div className="kpi-card">
                  <h6 style={{ margin: '0 0 var(--space-sm) 0', fontSize: 'var(--text-sm)', color: 'var(--gray-700)', fontWeight: 'var(--font-medium)' }}>Transactions</h6>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--black-primary)' }}>
                    {analytics.transactionCount}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h5 style={{ marginBottom: 'var(--space-md)', color: 'var(--black-primary)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>Top Categories</h5>
                {analytics.categoryBreakdown.slice(0, 5).map((cat) => (
                  <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--gray-800)', fontWeight: 'var(--font-medium)' }}>{cat.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div style={{
                        width: '100px',
                        height: '8px',
                        backgroundColor: 'var(--gray-200)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${cat.percentage}%`,
                          height: '100%',
                          backgroundColor: 'var(--gold-primary)'
                        }} />
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--black-primary)' }}>
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Input Tab */}
          {activeTab === 'voice' && isPremiumUser && (
            <>
              <div className="voice-recording-controls">
                <button
                  className={`voice-button ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isProcessing || usageLimitResult?.isAtLimit}
                >
                  <Icon name={isRecording ? 'stop' : 'microphone'} size={24} />
                </button>
                <div className="voice-status">
                  <h6>
                    {isRecording
                      ? `Recording... ${formatDuration(recordingDuration)}`
                      : 'Tap to start voice recording'
                    }
                  </h6>
                  <p>
                    {isRecording
                      ? 'Speak your transaction details clearly'
                      : 'Premium voice-to-text transaction recording'
                    }
                  </p>
                </div>
              </div>

              <div className={`transcription-area ${!transcription ? 'empty' : ''}`}>
                {transcription || 'Your speech will appear here...'}
              </div>

              {/* Voice Command Help */}
              <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--gray-50)' }}>
                <h6 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>Voice Command Examples:</h6>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)', fontSize: 'var(--text-xs)' }}>
                  <div>"Sold product for 50 cedis"</div>
                  <div>"Bought fuel for 30 GHS"</div>
                  <div>"Lunch expense 15 cedis"</div>
                  <div>"Received payment 200 GHS"</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI Suggestion Modal */}
        {showSuggestions && currentSuggestion && (
          <div className="suggestion-modal">
            <div className="suggestion-header">
              <Icon name="brain" size={16} color="var(--gold-primary)" />
              <h6>AI Transaction Analysis</h6>
            </div>

            <div className="suggestion-content">
              {generateAISuggestion(currentSuggestion)}
            </div>

            <div className="suggestion-fields">
              <div className="suggestion-field">
                <label>Amount (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentSuggestion.amount || 0}
                  onChange={(e) => editSuggestion('amount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="suggestion-field">
                <label>Type</label>
                <select
                  value={currentSuggestion.type}
                  onChange={(e) => editSuggestion('type', e.target.value)}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="suggestion-field">
                <label>Category</label>
                <select
                  value={currentSuggestion.category}
                  onChange={(e) => editSuggestion('category', e.target.value)}
                >
                  <option value="sales">Sales</option>
                  <option value="transport">Transport</option>
                  <option value="food">Food</option>
                  <option value="office">Office</option>
                  <option value="marketing">Marketing</option>
                  <option value="supplies">Supplies</option>
                  <option value="professional">Professional</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="suggestion-field">
                <label>Payment Method</label>
                <select
                  value={currentSuggestion.paymentMethod || 'cash'}
                  onChange={(e) => editSuggestion('paymentMethod', e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>

            <div className="suggestion-actions">
              <button className="btn btn-primary" onClick={confirmSuggestion}>
                <Icon name="check" size={16} />
                Add Transaction
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowSuggestions(false)}
              >
                <Icon name="x" size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHub;