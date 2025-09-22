import React, { useState, useEffect, useRef } from 'react';
import { useUsageLimits } from '../hooks/useUsageLimits';

interface Transaction {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
  timestamp: string;
  category: string;
  confidence: number;
  aiSuggestion?: string;
}

interface ChatTransactionRecorderProps {
  user: { username: string };
  onClose: () => void;
}

const ChatTransactionRecorder: React.FC<ChatTransactionRecorderProps> = ({ user, onClose }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Partial<Transaction> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { checkUsageLimit, consumeUsage, getUsageWarningComponent } = useUsageLimits();
  const [usageLimitResult, setUsageLimitResult] = useState<any>(null);

  useEffect(() => {
    loadTransactions();
    checkUsage();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [transactions]);

  const loadTransactions = () => {
    const saved = localStorage.getItem(`transactions_${user?.username}`);
    if (saved) {
      try {
        const loadedTransactions = JSON.parse(saved);
        setTransactions(loadedTransactions.slice(0, 50)); // Keep last 50 for performance
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  };

  const checkUsage = () => {
    if (user?.username) {
      const limitCheck = checkUsageLimit({ type: 'transactions', userId: user.username });
      setUsageLimitResult(limitCheck);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Enhanced AI-powered transaction parsing
  const parseTransactionWithAI = (text: string): Partial<Transaction> => {
    const lowerText = text.toLowerCase();

    // Enhanced amount extraction with multiple patterns
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

    // Enhanced transaction type detection
    const incomeKeywords = [
      'sold', 'sale', 'revenue', 'income', 'received', 'payment received',
      'earned', 'profit', 'customer paid', 'client paid', 'invoice paid',
      'deposit', 'credit', 'refund received'
    ];

    const expenseKeywords = [
      'bought', 'purchase', 'expense', 'spent', 'paid', 'cost',
      'bill', 'invoice', 'fee', 'charge', 'subscription', 'rent',
      'salary', 'wages', 'utilities', 'insurance'
    ];

    let type: 'income' | 'expense' = 'expense'; // Default to expense
    let confidence = 0.5;

    for (const keyword of incomeKeywords) {
      if (lowerText.includes(keyword)) {
        type = 'income';
        confidence = 0.9;
        break;
      }
    }

    if (type === 'expense') {
      for (const keyword of expenseKeywords) {
        if (lowerText.includes(keyword)) {
          confidence = 0.9;
          break;
        }
      }
    }

    // Enhanced category detection
    const categories = {
      sales: ['sale', 'sold', 'customer', 'client', 'product', 'service'],
      transport: ['fuel', 'gas', 'petrol', 'transport', 'taxi', 'uber', 'bus', 'car'],
      food: ['food', 'lunch', 'breakfast', 'dinner', 'restaurant', 'catering'],
      office: ['rent', 'office', 'utilities', 'electricity', 'water', 'internet'],
      supplies: ['supplies', 'equipment', 'materials', 'inventory', 'stock'],
      marketing: ['advertising', 'marketing', 'promotion', 'social media', 'ads'],
      professional: ['consultant', 'lawyer', 'accountant', 'service', 'professional'],
      utilities: ['electricity', 'water', 'gas', 'internet', 'phone', 'utilities']
    };

    let category = 'other';
    for (const [cat, keywords] of Object.entries(categories)) {
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
      `Looks like you ${parsed.type === 'income' ? 'earned' : 'spent'} ${parsed.amount} GHS on ${parsed.category}.`,
      `Recording ${parsed.amount} GHS ${parsed.type} for ${parsed.category}. Is this correct?`
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleInputSubmit = async () => {
    if (!inputText.trim() || isProcessing) return;
    if (!user?.username) return;

    setIsProcessing(true);

    // Check usage limits first
    const limitResult = await consumeUsage({ type: 'transactions', userId: user.username });
    setUsageLimitResult(limitResult);

    if (!limitResult.canProceed) {
      setIsProcessing(false);
      return;
    }

    // Parse transaction with AI
    const parsed = parseTransactionWithAI(inputText);
    const aiSuggestion = generateAISuggestion(parsed, inputText);

    if (parsed.confidence && parsed.confidence < 0.7) {
      // Show suggestion for confirmation
      setCurrentSuggestion({
        text: inputText,
        amount: parsed.amount || 0,
        type: parsed.type || 'expense',
        category: parsed.category || 'other',
        confidence: parsed.confidence || 0.5,
        aiSuggestion
      });
      setShowSuggestions(true);
    } else {
      // Auto-add with high confidence
      await addTransaction(parsed, inputText);
    }

    setInputText('');
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
      aiSuggestion: parsed.confidence && parsed.confidence < 0.9 ? generateAISuggestion(parsed, originalText) : undefined
    };

    const updated = [transaction, ...transactions];
    setTransactions(updated);

    try {
      localStorage.setItem(`transactions_${user?.username}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving transaction:', error);
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

  const quickActions = [
    { text: "Sold product for 50 GHS", icon: "💰" },
    { text: "Bought fuel for 30 GHS", icon: "⛽" },
    { text: "Lunch expense 15 GHS", icon: "🍽️" },
    { text: "Office rent 200 GHS", icon: "🏢" }
  ];

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} GHS`;
  };

  const getTransactionIcon = (type: string, category: string) => {
    if (type === 'income') return '💰';

    const icons: Record<string, string> = {
      transport: '🚗',
      food: '🍽️',
      office: '🏢',
      supplies: '📦',
      marketing: '📢',
      professional: '👨‍💼',
      utilities: '⚡',
      sales: '💰',
      other: '📝'
    };

    return icons[category] || '📝';
  };

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
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '400px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              💬 Quick Record
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
              Just tell me what happened
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
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Usage Warning */}
        {usageLimitResult && getUsageWarningComponent(usageLimitResult)}

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}
        >
          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Start Recording</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Type things like "Sold product for 50 GHS" or use quick actions below
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.slice(0, 20).map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {getTransactionIcon(transaction.type, transaction.category)}
                      </span>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: transaction.type === 'income' ? '#2E8B57' : '#e74c3c'
                      }}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      color: '#999',
                      background: '#f0f0f0',
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>
                      {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>
                    "{transaction.text}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                    <span>#{transaction.category}</span>
                    {transaction.confidence && transaction.confidence < 0.9 && (
                      <span style={{ color: '#f39c12' }}>
                        ⚡ AI Assisted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Modal */}
        {showSuggestions && currentSuggestion && (
          <div style={{
            position: 'absolute',
            bottom: '140px',
            left: '16px',
            right: '16px',
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                🤖 AI Suggestion
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                {currentSuggestion.aiSuggestion}
              </div>
            </div>

            {/* Editable fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Amount (GHS)
                </label>
                <input
                  type="number"
                  value={currentSuggestion.amount || 0}
                  onChange={(e) => editSuggestion('amount', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Type
                </label>
                <select
                  value={currentSuggestion.type}
                  onChange={(e) => editSuggestion('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={confirmSuggestion}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#2E8B57',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✓ Looks Good
              </button>
              <button
                onClick={() => setShowSuggestions(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!showSuggestions && transactions.length === 0 && (
          <div style={{
            padding: '12px 16px',
            background: 'white',
            borderTop: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Quick actions:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(action.text)}
                  style={{
                    padding: '8px',
                    background: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div style={{
          padding: '16px',
          background: 'white',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
              placeholder="Type what happened... e.g., 'Sold product for 50 GHS'"
              disabled={isProcessing || usageLimitResult?.isAtLimit}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none',
                background: usageLimitResult?.isAtLimit ? '#f5f5f5' : 'white'
              }}
            />
            <button
              onClick={handleInputSubmit}
              disabled={!inputText.trim() || isProcessing || usageLimitResult?.isAtLimit}
              style={{
                padding: '12px',
                background: inputText.trim() && !isProcessing && !usageLimitResult?.isAtLimit ? '#2E8B57' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: inputText.trim() && !isProcessing && !usageLimitResult?.isAtLimit ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isProcessing ? '⏳' : '🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTransactionRecorder;