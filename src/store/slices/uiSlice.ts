import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Error handling
  errors: Array<{
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: string;
  }>;

  // Modal and dialog states
  modals: {
    subscriptionManager: boolean;
    transactionRecorder: boolean;
    businessAssessment: boolean;
    growthAccelerator: boolean;
  };

  // Navigation state
  currentView: 'dashboard' | 'transactions' | 'assessment' | 'accelerator' | 'subscription';

  // Theme and preferences
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;

  // Network status
  isOnline: boolean;
  lastSync: string | null;
}

const initialState: UIState = {
  globalLoading: false,
  loadingStates: {},
  errors: [],
  modals: {
    subscriptionManager: false,
    transactionRecorder: false,
    businessAssessment: false,
    growthAccelerator: false,
  },
  currentView: 'dashboard',
  theme: 'light',
  sidebarCollapsed: false,
  isOnline: navigator.onLine,
  lastSync: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },

    // Error handling
    addError: (state, action: PayloadAction<{
      message: string;
      type?: 'error' | 'warning' | 'info';
    }>) => {
      const error = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: action.payload.message,
        type: action.payload.type || 'error',
        timestamp: new Date().toISOString(),
      };
      state.errors.push(error);

      // Limit to last 10 errors
      if (state.errors.length > 10) {
        state.errors = state.errors.slice(-10);
      }
    },
    removeError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    clearErrors: (state) => {
      state.errors = [];
    },

    // Modal states
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Navigation
    setCurrentView: (state, action: PayloadAction<UIState['currentView']>) => {
      state.currentView = action.payload;
    },

    // Theme and preferences
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Network status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    updateLastSync: (state) => {
      state.lastSync = new Date().toISOString();
    },
  },
});

export const {
  setGlobalLoading,
  setLoading,
  clearLoading,
  addError,
  removeError,
  clearErrors,
  openModal,
  closeModal,
  closeAllModals,
  setCurrentView,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setOnlineStatus,
  updateLastSync,
} = uiSlice.actions;

export default uiSlice.reducer;