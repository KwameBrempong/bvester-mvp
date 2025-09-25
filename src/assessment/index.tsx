/**
 * Business Assessment - Main Export
 * Phase 1: Basic implementation with new architecture
 */

export { default as BusinessAssessmentV2 } from './components/BusinessAssessmentV2';
export { useAssessmentFlow } from './hooks/useAssessmentFlow';
export { AssessmentEngine } from './core/AssessmentEngine';
export { AssessmentHelpers } from './utils/assessmentHelpers';
export type {
  Question,
  AssessmentResult,
  BusinessIssue,
  AssessmentProps,
  AssessmentState
} from './types/assessment.types';

// For backward compatibility with existing components
export { default } from './components/BusinessAssessmentV2';