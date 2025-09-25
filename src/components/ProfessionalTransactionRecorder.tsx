import React, { useState, useEffect, useRef } from 'react';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { transactionService, Transaction as PersistedTransaction } from '../services/dataService';
import { useSubscriptionTier } from '../store/hooks';
import Icon from './Icons';
import { SkeletonLoader } from './LoadingStates';
import '../styles/transaction-recorder.css';

interface Transaction {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
  timestamp: string;
  category: string;
  confidence: number;
  aiSuggestion?: string;
  audioUrl?: string;
  transcription?: string;
}

interface ProfessionalTransactionRecorderProps {
  user: { username: string };
  onClose: () => void;
}

const ProfessionalTransactionRecorder: React.FC<ProfessionalTransactionRecorderProps> = ({
  user,
  onClose
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Partial<Transaction> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  const { checkUsageLimit, consumeUsage, getUsageWarningComponent } = useUsageLimits();
  const subscriptionTier = useSubscriptionTier();
  const [usageLimitResult, setUsageLimitResult] = useState<any>(null);

  const isPremiumUser = subscriptionTier === 'business';

  useEffect(() => {
    const initialize = async () => {
      await loadTransactions();
      checkUsage();
      if (inputRef.current) {
        inputRef.current.focus();
      }
      initializeSpeechRecognition();
      setLoading(false);
    };

    initialize();
  }, []);

  const loadTransactions = async () => {
    if (!user?.username) {
      setTransactions([]);
      return;
    }

    const username = user.username;
    let hydratedTransactions: Transaction[] = [];

    try {
      const remoteTransactions = await transactionService.list(username, 50);
      if (remoteTransactions?.length) {
        hydratedTransactions = remoteTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((item) => ({
            id: item.transactionId,
            text: item.description || '',
            amount: item.amount,
            type: item.type,
            category: item.category,
            timestamp: item.date,
            confidence: 1,
          }));
      }
    } catch (error) {
      // Fallback to local storage
      const saved = localStorage.getItem(`transactions_${username}`);
      if (saved) {
        try {
          hydratedTransactions = JSON.parse(saved);
        } catch (parseError) {
          console.error('Error parsing cached transactions:', parseError);
        }
      }
    }

    const trimmed = hydratedTransactions.slice(0, 50);
    setTransactions(trimmed);
    localStorage.setItem(`transactions_${username}`, JSON.stringify(trimmed));
  };

  const checkUsage = () => {
    if (user?.username) {
      const limitCheck = checkUsageLimit({ type: 'transactions', userId: user.username });
      setUsageLimitResult(limitCheck);
    }
  };

  const initializeSpeechRecognition = () => {
    if (!isPremiumUser) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscription(finalTranscript || interimTranscript);

        if (finalTranscript) {
          setInputText(finalTranscript);
          handleInputSubmit(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const startVoiceRecording = () => {
    if (!isPremiumUser || !recognitionRef.current) return;

    setTranscription('');
    recognitionRef.current.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const enhancedTransactionParsing = (text: string): Partial<Transaction> => {
    const lowerText = text.toLowerCase();

    // Advanced amount extraction
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

    // Enhanced transaction type detection with context
    const incomeIndicators = [
      'sold', 'sale', 'revenue', 'income', 'received', 'payment received',
      'earned', 'profit', 'customer paid', 'client paid', 'invoice paid',
      'deposit', 'credit', 'refund received', 'commission', 'bonus',
      'dividend', 'interest earned', 'rental income'
    ];

    const expenseIndicators = [
      'bought', 'purchase', 'expense', 'spent', 'paid', 'cost',
      'bill', 'invoice', 'fee', 'charge', 'subscription', 'rent',
      'salary', 'wages', 'utilities', 'insurance', 'tax', 'loan',
      'maintenance', 'repair', 'fuel', 'transport'
    ];

    let type: 'income' | 'expense' = 'expense';
    let confidence = 0.5;

    // Check for income indicators
    for (const indicator of incomeIndicators) {
      if (lowerText.includes(indicator)) {
        type = 'income';
        confidence = 0.9;
        break;
      }
    }

    // If not income, check for expense indicators
    if (type === 'expense') {
      for (const indicator of expenseIndicators) {
        if (lowerText.includes(indicator)) {
          confidence = 0.9;
          break;
        }
      }
    }

    // Enhanced category detection
    const categoryMappings = {
      sales: ['sale', 'sold', 'customer', 'client', 'product', 'service', 'commission'],
      transport: ['fuel', 'gas', 'petrol', 'transport', 'taxi', 'uber', 'bus', 'car', 'vehicle'],
      food: ['food', 'lunch', 'breakfast', 'dinner', 'restaurant', 'catering', 'meal'],
      office: ['rent', 'office', 'workspace', 'coworking'],
      utilities: ['electricity', 'water', 'gas', 'internet', 'phone', 'utilities', 'wifi'],
      supplies: ['supplies', 'equipment', 'materials', 'inventory', 'stock', 'tools'],
      marketing: ['advertising', 'marketing', 'promotion', 'social media', 'ads', 'campaign'],
      professional: ['consultant', 'lawyer', 'accountant', 'service', 'professional', 'advisory'],
      salary: ['salary', 'wages', 'payroll', 'staff', 'employee'],
      insurance: ['insurance', 'policy', 'premium', 'coverage'],
      tax: ['tax', 'vat', 'duty', 'levy', 'assessment'],
      maintenance: ['maintenance', 'repair', 'fix', 'service', 'upkeep']
    };

    let category = 'other';
    for (const [cat, keywords] of Object.entries(categoryMappings)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }

    return { amount, type, category, confidence };
  };

  const generateAISuggestion = (parsed: Partial<Transaction>, originalText: string): string => {
    const suggestions = [
      `I detected a ${parsed.type} of ${parsed.amount} GHS in the ${parsed.category} category.`,
      `This looks like a ${parsed.type} transaction of ${parsed.amount} GHS for ${parsed.category}.`,
      `Recording ${parsed.amount} GHS ${parsed.type} under ${parsed.category}. Does this look correct?`,
      `I found a ${parsed.type} of ${parsed.amount} GHS. Should I categorize this as ${parsed.category}?`
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleInputSubmit = async (textInput?: string) => {
    const text = textInput || inputText;
    if (!text.trim() || isProcessing) return;
    if (!user?.username) return;

    setIsProcessing(true);

    // Check usage limits
    const limitResult = await consumeUsage({ type: 'transactions', userId: user.username });
    setUsageLimitResult(limitResult);

    if (!limitResult.canProceed) {
      setIsProcessing(false);
      return;
    }

    // Parse with enhanced AI
    const parsed = enhancedTransactionParsing(text);
    const aiSuggestion = generateAISuggestion(parsed, text);

    if (parsed.confidence && parsed.confidence < 0.8) {
      // Show suggestion for confirmation
      setCurrentSuggestion({
        text: text,
        amount: parsed.amount || 0,
        type: parsed.type || 'expense',
        category: parsed.category || 'other',
        confidence: parsed.confidence || 0.5,
        aiSuggestion,
        transcription: activeTab === 'voice' ? transcription : undefined
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
    setIsProcessing(false);
  };

  const addTransaction = async (parsed: Partial<Transaction>, originalText: string) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      text: originalText,
      amount: parsed.amount || 0,
      type: parsed.type || 'expense',
      category: parsed.category || 'other',
      confidence: parsed.confidence || 0.5,
      timestamp: new Date().toISOString(),
      aiSuggestion: parsed.confidence && parsed.confidence < 0.9 ? generateAISuggestion(parsed, originalText) : undefined,
      transcription: parsed.transcription
    };

    const updated = [transaction, ...transactions];
    setTransactions(updated);

    // Save locally
    try {
      localStorage.setItem(`transactions_${user?.username}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving transaction locally:', error);
    }

    // Sync to backend
    if (user?.username) {
      try {
        await transactionService.create({
          userId: user.username,
          transactionId: transaction.id,
          date: transaction.timestamp,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.text,
          paymentMethod: 'unspecified',
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Failed to sync transaction to backend:', error);
      }
    }

    setShowSuggestions(false);
    setCurrentSuggestion(null);
  };

  const confirmSuggestion = () => {
    if (currentSuggestion) {
      addTransaction(currentSuggestion, currentSuggestion.text || '');
    }
  };

  const editSuggestion = (field: string, value: any) => {
    if (currentSuggestion) {
      setCurrentSuggestion({ ...currentSuggestion, [field]: value });
    }
  };

  const deleteTransaction = (transactionId: string) => {
    const updated = transactions.filter(t => t.id !== transactionId);
    setTransactions(updated);
    localStorage.setItem(`transactions_${user?.username}`, JSON.stringify(updated));
  };

  const editTransaction = (transactionId: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t =>
      t.id === transactionId ? { ...t, ...updates } : t
    );
    setTransactions(updated);
    localStorage.setItem(`transactions_${user?.username}`, JSON.stringify(updated));
  };

  const quickActions = [
    { text: "Sold product for 50 GHS", category: "sales", icon: "cash" },
    { text: "Bought fuel for 30 GHS", category: "transport", icon: "car" },
    { text: "Lunch expense 15 GHS", category: "food", icon: "food" },
    { text: "Office rent 200 GHS", category: "office", icon: "building" },
    { text: "Utilities bill 80 GHS", category: "utilities", icon: "lightning" },
    { text: "Marketing campaign 100 GHS", category: "marketing", icon: "megaphone" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
      salary: 'team',
      insurance: 'shield',
      tax: 'receipt',
      maintenance: 'settings',
      other: 'file-text'
    };
    return iconMap[category] || 'file-text';
  };

  if (loading) {
    return (
      <div className="transaction-modal-overlay">
        <div className="transaction-modal">
          <div className="transaction-header">
            <div>
              <h3>Loading Transactions...</h3>
            </div>
          </div>
          <div className="transaction-content" style={{ padding: 'var(--space-xl)' }}>
            <SkeletonLoader height="300px" />
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
              Financial Records
            </h3>
            <p>Track your business transactions</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Usage Warning */}
        {usageLimitResult && getUsageWarningComponent(usageLimitResult)}

        {/* Tabs */}
        <div className="transaction-tabs">
          <button
            className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <Icon name="edit" size={16} />
            Text Input
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
          {/* Transaction List */}
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Icon name="transactions" size={24} color="var(--gold-primary)" />
                </div>
                <h4>No Transactions Yet</h4>
                <p>Start recording your business transactions using the input below or try the quick actions.</p>
              </div>
            ) : (
              <div>
                {transactions.slice(0, 20).map((transaction) => (
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

                    <div className="transaction-description">"{transaction.text}"</div>

                    <div className="transaction-meta">
                      <span className="transaction-category">#{transaction.category}</span>
                      {transaction.confidence && transaction.confidence < 0.9 && (
                        <span className="ai-assisted">
                          <Icon name="brain" size={12} />
                          AI Assisted
                        </span>
                      )}
                    </div>

                    <div className="transaction-actions">
                      <button
                        className="action-button"
                        onClick={() => editTransaction(transaction.id, {
                          amount: prompt('Enter new amount:', transaction.amount.toString())
                            ? parseFloat(prompt('Enter new amount:', transaction.amount.toString()) || '0')
                            : transaction.amount
                        })}
                      >
                        <Icon name="edit" size={12} />
                        Edit
                      </button>
                      <button
                        className="action-button"
                        onClick={() => {
                          if (confirm('Delete this transaction?')) {
                            deleteTransaction(transaction.id);
                          }
                        }}
                      >
                        <Icon name="trash" size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions - only show when no transactions */}
          {transactions.length === 0 && activeTab === 'text' && (
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

        {/* Voice Recording Controls */}
        {activeTab === 'voice' && isPremiumUser && (
          <div className="voice-recording-controls">
            <button
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isProcessing || usageLimitResult?.isAtLimit}
            >
              <Icon name={isRecording ? 'stop' : 'microphone'} size={24} />
            </button>
            <div className="voice-status">
              <h6>{isRecording ? 'Listening...' : 'Tap to record'}</h6>
              <p>{isRecording ? 'Speak your transaction details' : 'Voice-to-text transaction recording'}</p>
            </div>
          </div>
        )}

        {/* Transcription Area */}
        {activeTab === 'voice' && isPremiumUser && (
          <div className={`transcription-area ${!transcription ? 'empty' : ''}`}>
            {transcription || 'Your speech will appear here...'}
          </div>
        )}

        {/* Text Input */}
        {activeTab === 'text' && (
          <div className="input-section">
            <div className="input-group">
              <div className="input-field">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                  placeholder="Type transaction... e.g., 'Sold product for 50 GHS'"
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
        )}

        {/* AI Suggestion Modal */}
        {showSuggestions && currentSuggestion && (
          <div className="suggestion-modal">
            <div className="suggestion-header">
              <Icon name="brain" size={16} color="var(--gold-primary)" />
              <h6>AI Suggestion</h6>
            </div>

            <div className="suggestion-content">
              {currentSuggestion.aiSuggestion}
            </div>

            <div className="suggestion-fields">
              <div className="suggestion-field">
                <label>Amount (GHS)</label>
                <input
                  type="number"
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
            </div>

            <div className="suggestion-actions">
              <button className="btn btn-primary" onClick={confirmSuggestion}>
                <Icon name="check" size={16} />
                Confirm
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

export default ProfessionalTransactionRecorder;