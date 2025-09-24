import { useSubscription } from './useSubscription';
import { useUsageLimits } from './hooks/useUsageLimits';
import React, { useState, useEffect } from 'react';
import { transactionService, Transaction as PersistedTransaction } from './services/dataService';

interface Transaction {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
  timestamp: string;
  category?: string;
}

interface TransactionRecorderProps {
  user: { username: string };
  onClose: () => void;
}

export default function TransactionRecorder({ user, onClose }: TransactionRecorderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState('');
  const [usageLimitResult, setUsageLimitResult] = useState<any>(null);

  const { checkUsageLimit, consumeUsage, getUsageWarningComponent } = useUsageLimits();
  const subscriptionStatus = useSubscription(user?.username);

  useEffect(() => {
    // Load existing transactions
    const saved = localStorage.getItem(`transactions_${user?.username}`);
    if (saved) {
      try {
        const loadedTransactions = JSON.parse(saved);
        setTransactions(loadedTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      }
    }

    // Check usage limits
    if (user?.username) {
      const limitCheck = checkUsageLimit({ type: 'transactions', userId: user.username });
      setUsageLimitResult(limitCheck);
    }
  }, [user, checkUsageLimit]);

  const parseTransaction = (text: string): Partial<Transaction> => {
    // Simple parsing for common transaction formats
    const lowerText = text.toLowerCase();
    
    // Extract amount (look for numbers with GHS or just numbers)
    const amountMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:ghs|cedis|₵)?/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    // Determine transaction type
    const isIncome = lowerText.includes('sale') || lowerText.includes('received') || 
                    lowerText.includes('payment received') || lowerText.includes('income') ||
                    lowerText.includes('sold') || lowerText.includes('revenue');
    
    // Default to expense if unclear
    const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';

    // Simple category detection
    let category = 'other';
    if (lowerText.includes('fuel') || lowerText.includes('transport')) category = 'transport';
    else if (lowerText.includes('food') || lowerText.includes('lunch')) category = 'food';
    else if (lowerText.includes('supplies') || lowerText.includes('equipment')) category = 'supplies';
    else if (lowerText.includes('rent') || lowerText.includes('office')) category = 'office';
    else if (lowerText.includes('sale') || lowerText.includes('product')) category = 'sales';

    return { amount, type, category };
  };

  const addTransaction = async () => {
    if (!newTransaction.trim() || !user?.username) {
      return;
    }

    const limitResult = await consumeUsage({ type: 'transactions', userId: user.username });
    setUsageLimitResult(limitResult);

    if (!limitResult.canProceed) {
      return;
    }

    const parsed = parseTransaction(newTransaction);
    const timestamp = new Date().toISOString();
    const transaction: Transaction = {
      id: Date.now().toString(),
      text: newTransaction,
      amount: parsed.amount || 0,
      type: parsed.type || 'expense',
      category: parsed.category || 'other',
      timestamp,
    };

    const updated = [transaction, ...transactions];
    setTransactions(updated);

    try {
      localStorage.setItem(`transactions_${user.username}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving transactions locally:', error);
    }

    try {
      await transactionService.create({
        userId: user.username,
        transactionId: transaction.id,
        date: timestamp,
        type: transaction.type,
        category: transaction.category ?? 'other',
        amount: transaction.amount,
        description: transaction.text,
        paymentMethod: 'unspecified',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to sync transaction to backend, continuing with local cache', error);
    }

    setNewTransaction('');
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);

    try {
      localStorage.setItem(`transactions_${user?.username}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving transactions locally:', error);
    }

    if (user?.username) {
      try {
        await transactionService.delete(id, user.username);
      } catch (error) {
        console.warn('Failed to remove transaction from backend', error);
      }

      const limitCheck = checkUsageLimit({ type: 'transactions', userId: user.username });
      setUsageLimitResult(limitCheck);
    }
  };

  const getTotals = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const totals = getTotals();

  // Fixed: Add error boundary for rendering
  if (!user) {
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
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px',
          borderRadius: '12px', 
          textAlign: 'center'
        }}>
          <p>User not found. Please try again.</p>
          <button onClick={onClose}>Close</button>
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
      justifyContent: 'center'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '0',
        borderRadius: '12px', 
        width: '90%', 
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }}>
        
        {/* Header */}
        <div style={{ 
          background: '#2E8B57', 
          color: 'white', 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Transaction Record</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              Simple business bookkeeping
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              padding: '8px 12px', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ padding: '20px 20px 0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f0f9f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Income</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2E8B57' }}>
                {totals.income.toLocaleString()} GHS
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#fff0f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Expenses</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#DC143C' }}>
                {totals.expenses.toLocaleString()} GHS
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f0f0ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Balance</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: totals.balance >= 0 ? '#2E8B57' : '#DC143C' }}>
                {totals.balance.toLocaleString()} GHS
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div style={{ padding: '0 20px 20px 20px' }}>
          {/* Usage Warning */}
          {usageLimitResult && getUsageWarningComponent(usageLimitResult)}

          {usageLimitResult?.isAtLimit ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}>
              <p>You've reached your transaction limit for this month.</p>
              <p style={{ fontSize: '14px' }}>Please upgrade your plan to continue recording transactions.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newTransaction}
                  onChange={(e) => setNewTransaction(e.target.value)}
                  placeholder="e.g., 'Sale 500 GHS' or 'Paid fuel 50 GHS'"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addTransaction()}
                />
                <button
                  onClick={addTransaction}
                  style={{ 
                    background: '#2E8B57', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 20px', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                Examples: "Sale 1000 GHS", "Bought supplies 200 GHS", "Received payment 500 GHS"
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          padding: '0 20px 20px 20px',
          borderTop: '1px solid #eee'
        }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>No transactions recorded yet.</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                Start by adding your first transaction above.
              </p>
            </div>
          ) : (
            <div style={{ paddingTop: '15px' }}>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 15px', 
                    marginBottom: '8px',
                    background: transaction.type === 'income' ? '#f0f9f0' : '#fff5f5', 
                    borderRadius: '8px',
                    border: `1px solid ${transaction.type === 'income' ? '#d4edda' : '#f8d7da'}`
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {transaction.text}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {transaction.timestamp} • {transaction.category}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: transaction.type === 'income' ? '#2E8B57' : '#DC143C',
                    marginRight: '10px'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} GHS
                  </div>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#999', 
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
