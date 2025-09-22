import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { assessmentService, BusinessAssessment, AssessmentResponses } from '../../services/dataService';
import { logger } from '../../config/environment';

interface AssessmentState {
  assessments: BusinessAssessment[];
  currentAssessment: BusinessAssessment | null;
  loading: boolean;
  error: string | null;
  inProgress: boolean;
  currentResponses: AssessmentResponses;
}

const initialState: AssessmentState = {
  assessments: [],
  currentAssessment: null,
  loading: false,
  error: null,
  inProgress: false,
  currentResponses: {},
};

// Async thunks
export const fetchAssessments = createAsyncThunk(
  'assessment/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      logger.info('Fetching assessments', { userId });
      const assessments = await assessmentService.list(userId);
      return assessments;
    } catch (error) {
      logger.error('Failed to fetch assessments', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch assessments');
    }
  }
);

export const fetchLatestAssessment = createAsyncThunk(
  'assessment/fetchLatest',
  async (userId: string, { rejectWithValue }) => {
    try {
      logger.info('Fetching latest assessment', { userId });
      const assessment = await assessmentService.getLatest(userId);
      return assessment;
    } catch (error) {
      logger.error('Failed to fetch latest assessment', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch latest assessment');
    }
  }
);

export const createAssessment = createAsyncThunk(
  'assessment/create',
  async (assessmentData: Omit<BusinessAssessment, 'id'>, { rejectWithValue }) => {
    try {
      logger.info('Creating assessment', { userId: assessmentData.userId });
      const assessment = await assessmentService.create(assessmentData);
      return assessment;
    } catch (error) {
      logger.error('Failed to create assessment', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create assessment');
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    startAssessment: (state) => {
      state.inProgress = true;
      state.currentResponses = {};
      state.error = null;
    },
    updateResponse: (state, action: PayloadAction<{ questionId: string; response: string | number | boolean | string[] }>) => {
      state.currentResponses[action.payload.questionId] = action.payload.response;
    },
    updateMultipleResponses: (state, action: PayloadAction<AssessmentResponses>) => {
      state.currentResponses = { ...state.currentResponses, ...action.payload };
    },
    clearCurrentAssessment: (state) => {
      state.inProgress = false;
      state.currentResponses = {};
      state.currentAssessment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    calculateScores: (state, action: PayloadAction<AssessmentResponses>) => {
      // This would contain the business logic for calculating assessment scores
      // For now, we'll just store the responses
      state.currentResponses = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch assessments
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch latest assessment
    builder
      .addCase(fetchLatestAssessment.fulfilled, (state, action) => {
        state.currentAssessment = action.payload;
      })
      .addCase(fetchLatestAssessment.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create assessment
    builder
      .addCase(createAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments.push(action.payload);
        state.currentAssessment = action.payload;
        state.inProgress = false;
        state.currentResponses = {};
      })
      .addCase(createAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  startAssessment,
  updateResponse,
  updateMultipleResponses,
  clearCurrentAssessment,
  clearError,
  calculateScores,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;