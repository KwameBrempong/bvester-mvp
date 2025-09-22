import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService, Transaction } from '../../services/dataService';
import { logger } from '../../config/environment';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalIncome: number;
  totalExpenses: number;
  transactionLimit: number;
  hasReachedLimit: boolean;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
  totalIncome: 0,
  totalExpenses: 0,
  transactionLimit: 20, // Free tier limit
  hasReachedLimit: false,
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      logger.info('Fetching transactions', { userId });
      const transactions = await transactionService.list(userId);
      return transactions;
    } catch (error) {
      logger.error('Failed to fetch transactions', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData: Omit<Transaction, 'id'>, { rejectWithValue, getState }) => {
    try {
      logger.info('Creating transaction', { userId: transactionData.userId });

      // Check transaction limit for free users
      const state = getState() as { transactions: TransactionState };
      if (state.transactions.hasReachedLimit) {
        return rejectWithValue('Transaction limit reached. Please upgrade to Pro or Business plan.');
      }

      const transaction = await transactionService.create(transactionData);
      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ transactionId, userId, updates }: {
    transactionId: string;
    userId: string;
    updates: Partial<Transaction>
  }, { rejectWithValue }) => {
    try {
      logger.info('Updating transaction', { transactionId, userId });
      const transaction = await transactionService.update(transactionId, userId, updates);
      return { transactionId, transaction };
    } catch (error) {
      logger.error('Failed to update transaction', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async ({ transactionId, userId }: { transactionId: string; userId: string }, { rejectWithValue }) => {
    try {
      logger.info('Deleting transaction', { transactionId, userId });
      await transactionService.delete(transactionId, userId);
      return transactionId;
    } catch (error) {
      logger.error('Failed to delete transaction', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactionLimit: (state, action: PayloadAction<number>) => {
      state.transactionLimit = action.payload;
      state.hasReachedLimit = state.transactions.length >= action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.totalIncome = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      state.totalExpenses = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.hasReachedLimit = action.payload.length >= state.transactionLimit;
        // Recalculate totals
        transactionSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.push(action.payload);
        state.hasReachedLimit = state.transactions.length >= state.transactionLimit;
        // Recalculate totals
        transactionSlice.caseReducers.calculateTotals(state);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update transaction
    builder
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.transactionId === action.payload.transactionId);
        if (index !== -1) {
          state.transactions[index] = action.payload.transaction;
          // Recalculate totals
          transactionSlice.caseReducers.calculateTotals(state);
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete transaction
    builder
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.transactionId !== action.payload);
        state.hasReachedLimit = state.transactions.length >= state.transactionLimit;
        // Recalculate totals
        transactionSlice.caseReducers.calculateTotals(state);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setTransactionLimit, clearError, calculateTotals } = transactionSlice.actions;
export default transactionSlice.reducer;