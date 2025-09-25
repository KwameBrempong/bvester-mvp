/**
 * Assessment Flow Hook
 * Manages assessment state, navigation, and progress
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AssessmentState,
  Question,
  AssessmentResult,
  OnboardingData
} from '../types/assessment.types';
import { AssessmentEngine } from '../core/AssessmentEngine';
import { AssessmentHelpers } from '../utils/assessmentHelpers';
import ghanaBusinessQuestions from '../data/questionBank';

export const useAssessmentFlow = (userId: string) => {
  const [state, setState] = useState<AssessmentState>({
    currentQuestionIndex: 0,
    answers: {},
    showResults: false,
    assessmentResult: null,
    isProcessing: false,
    startTime: Date.now(),
    progress: 0
  });

  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessmentEngine = AssessmentEngine.getInstance();
  const questions = ghanaBusinessQuestions;

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = AssessmentHelpers.loadProgress(userId);
    if (savedProgress) {
      setState(prev => ({
        ...prev,
        ...savedProgress,
        isProcessing: false // Reset processing state
      }));

      if (savedProgress.onboardingData) {
        setOnboardingData(savedProgress.onboardingData);
        setIsOnboardingComplete(true);
      }
    }
  }, [userId]);

  // Save progress whenever state changes
  useEffect(() => {
    if (Object.keys(state.answers).length > 0) {
      const progressData = {
        ...state,
        onboardingData,
        isOnboardingComplete
      };

      AssessmentHelpers.saveProgress(userId, progressData);
    }
  }, [state, onboardingData, isOnboardingComplete, userId]);

  // Update progress percentage
  useEffect(() => {
    if (questions.length > 0) {
      const progress = AssessmentHelpers.calculateProgress(
        state.currentQuestionIndex,
        questions.length
      );

      setState(prev => ({ ...prev, progress }));
    }
  }, [state.currentQuestionIndex, questions.length]);

  const completeOnboarding = useCallback((data: OnboardingData) => {
    setOnboardingData(data);
    setIsOnboardingComplete(true);

    // Track onboarding completion
    AssessmentHelpers.trackEvent('onboarding_completed', data);
  }, []);

  const answerQuestion = useCallback((answer: any) => {
    const currentQuestion = questions[state.currentQuestionIndex];

    if (!currentQuestion) {
      console.error('No current question found');
      return;
    }

    // Validate answer
    const validation = AssessmentHelpers.validateInput(answer, currentQuestion);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    setError(null);

    // Update answers
    const newAnswers = {
      ...state.answers,
      [currentQuestion.id]: answer
    };

    // Track answer
    AssessmentHelpers.trackEvent('question_answered', {
      questionId: currentQuestion.id,
      answer,
      timeSpent: Date.now() - state.startTime
    });

    // Determine next question
    const nextIndex = assessmentEngine.getNextQuestion(
      questions,
      state.currentQuestionIndex,
      newAnswers
    );

    if (nextIndex >= questions.length) {
      // Assessment complete
      processAssessment(newAnswers);
    } else {
      // Move to next question
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIndex
      }));
    }
  }, [state, questions, assessmentEngine]);

  const processAssessment = useCallback(async (finalAnswers: Record<string, any>) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Calculate assessment result
      const result = assessmentEngine.calculateScore(questions, finalAnswers);

      // Track completion
      const completionData = AssessmentHelpers.analyzeCompletionTime(
        state.startTime,
        Date.now()
      );

      AssessmentHelpers.trackEvent('assessment_completed', {
        score: result.overallScore,
        riskLevel: result.riskLevel,
        criticalIssues: result.criticalIssues.length,
        ...completionData
      });

      // Save to database (with error handling to not break flow)
      try {
        await saveAssessmentToDatabase(userId, finalAnswers, result);
      } catch (dbError) {
        console.warn('Failed to save to database, continuing with local storage:', dbError);
      }

      // Clear progress since assessment is complete
      AssessmentHelpers.clearProgress(userId);

      setState(prev => ({
        ...prev,
        answers: finalAnswers,
        assessmentResult: result,
        showResults: true,
        isProcessing: false
      }));

    } catch (error) {
      console.error('Failed to process assessment:', error);
      setError('Failed to process assessment. Please try again.');

      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.startTime, userId, assessmentEngine, questions]);

  const goToPreviousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));

      AssessmentHelpers.trackEvent('navigation_back', {
        fromIndex: state.currentQuestionIndex,
        toIndex: state.currentQuestionIndex - 1
      });
    }
  }, [state.currentQuestionIndex]);

  const restartAssessment = useCallback(() => {
    AssessmentHelpers.clearProgress(userId);

    setState({
      currentQuestionIndex: 0,
      answers: {},
      showResults: false,
      assessmentResult: null,
      isProcessing: false,
      startTime: Date.now(),
      progress: 0
    });

    setOnboardingData(null);
    setIsOnboardingComplete(false);
    setError(null);

    AssessmentHelpers.trackEvent('assessment_restarted');
  }, [userId]);

  const skipQuestion = useCallback(() => {
    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));

      AssessmentHelpers.trackEvent('question_skipped', {
        questionId: questions[state.currentQuestionIndex].id
      });
    }
  }, [state.currentQuestionIndex, questions]);

  return {
    // State
    ...state,
    onboardingData,
    isOnboardingComplete,
    error,

    // Current question info
    currentQuestion: questions[state.currentQuestionIndex] || null,
    totalQuestions: questions.length,
    questionsRemaining: questions.length - state.currentQuestionIndex - 1,

    // Actions
    completeOnboarding,
    answerQuestion,
    goToPreviousQuestion,
    restartAssessment,
    skipQuestion,
    clearError: () => setError(null)
  };
};

// Helper function to save to database (with fallback)
async function saveAssessmentToDatabase(
  userId: string,
  answers: Record<string, any>,
  result: AssessmentResult
): Promise<void> {
  try {
    // Try to use the existing assessment service
    const { assessmentService } = await import('../../services/dataService');

    await assessmentService.create({
      userId,
      assessmentId: AssessmentHelpers.generateAssessmentId(),
      marketScore: result.categoryScores.market_position,
      financialScore: result.categoryScores.financial_health,
      operationsScore: result.categoryScores.operational_resilience,
      teamScore: result.categoryScores.growth_readiness,
      growthScore: result.categoryScores.growth_readiness,
      totalScore: result.overallScore,
      responses: answers,
      recommendations: {
        financialRecommendations: result.nextSteps.immediate,
        operationsRecommendations: result.nextSteps.shortTerm,
        priorityActions: result.nextSteps.strategic
      },
      completedAt: new Date().toISOString(),
      reportGenerated: false
    });
  } catch (error) {
    // Fallback to localStorage if database fails
    console.warn('Database save failed, using localStorage fallback:', error);

    const key = `bvester_assessment_result_${userId}`;
    localStorage.setItem(key, JSON.stringify({
      answers,
      result,
      timestamp: Date.now()
    }));

    throw error; // Re-throw to let caller handle
  }
}