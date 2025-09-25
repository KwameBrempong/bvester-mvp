/**
 * Assessment Helper Utilities
 * Common utility functions for assessment processing
 */

import { Question, ValidationRule } from '../types/assessment.types';

export class AssessmentHelpers {
  /**
   * Validates user input based on question rules
   */
  static validateInput(value: any, question: Question): { isValid: boolean; error?: string } {
    if (!question.validators) {
      return { isValid: true };
    }

    for (const validator of question.validators) {
      const result = this.runValidation(value, validator);
      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  }

  private static runValidation(value: any, rule: ValidationRule): { isValid: boolean; error?: string } {
    switch (rule.type) {
      case 'range':
        const numValue = Number(value);
        const [min, max] = rule.rule as [number, number];
        if (isNaN(numValue) || numValue < min || numValue > max) {
          return { isValid: false, error: rule.message };
        }
        break;

      case 'pattern':
        const pattern = new RegExp(rule.rule as string);
        if (!pattern.test(String(value))) {
          return { isValid: false, error: rule.message };
        }
        break;

      case 'custom':
        const customFn = rule.rule as (value: any) => boolean;
        if (!customFn(value)) {
          return { isValid: false, error: rule.message };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Formats percentage input
   */
  static formatPercentage(value: string): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    return Math.min(100, Math.max(0, numValue)).toString();
  }

  /**
   * Formats currency input (GHS)
   */
  static formatCurrency(value: string): string {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(numValue)) return '0';
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }

  /**
   * Calculates progress percentage
   */
  static calculateProgress(currentIndex: number, totalQuestions: number): number {
    return Math.round(((currentIndex + 1) / totalQuestions) * 100);
  }

  /**
   * Gets risk color based on level
   */
  static getRiskColor(riskLevel: string): string {
    const colors = {
      low: '#2E8B57',
      medium: '#FFA500',
      high: '#FF6B35',
      critical: '#DC143C'
    };

    return colors[riskLevel as keyof typeof colors] || colors.medium;
  }

  /**
   * Generates insight based on answer
   */
  static generateInsight(question: Question, answer: any): string {
    if (question.type === 'multiple' && question.options) {
      const selectedOption = question.options.find(opt => opt.text === answer);
      return selectedOption?.insight || question.insight;
    }

    return question.insight;
  }

  /**
   * Saves assessment progress to localStorage
   */
  static saveProgress(userId: string, data: any): void {
    try {
      const key = `bvester_assessment_${userId}`;
      const progressData = {
        ...data,
        timestamp: Date.now(),
        version: '2.0'
      };
      localStorage.setItem(key, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Failed to save assessment progress:', error);
    }
  }

  /**
   * Loads assessment progress from localStorage
   */
  static loadProgress(userId: string): any | null {
    try {
      const key = `bvester_assessment_${userId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        const data = JSON.parse(saved);

        // Only return progress from last 24 hours
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }

        // Clean up old progress
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to load assessment progress:', error);
    }

    return null;
  }

  /**
   * Clears assessment progress
   */
  static clearProgress(userId: string): void {
    try {
      const key = `bvester_assessment_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear assessment progress:', error);
    }
  }

  /**
   * Debounces function calls
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Generates unique assessment ID
   */
  static generateAssessmentId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Analyzes completion time for insights
   */
  static analyzeCompletionTime(startTime: number, endTime: number): {
    duration: number;
    quality: 'rushed' | 'normal' | 'thoughtful';
    reliability: number;
  } {
    const duration = Math.round((endTime - startTime) / 1000); // seconds
    const avgTimePerQuestion = duration / 12; // assuming 12 questions

    let quality: 'rushed' | 'normal' | 'thoughtful';
    let reliability: number;

    if (avgTimePerQuestion < 15) {
      quality = 'rushed';
      reliability = 0.6;
    } else if (avgTimePerQuestion > 120) {
      quality = 'thoughtful';
      reliability = 0.9;
    } else {
      quality = 'normal';
      reliability = 0.8;
    }

    return { duration, quality, reliability };
  }

  /**
   * Tracks analytics events
   */
  static trackEvent(event: string, data?: any): void {
    try {
      // This would integrate with actual analytics service
      console.log(`Assessment Event: ${event}`, data);

      // Store locally for now
      const events = JSON.parse(localStorage.getItem('bvester_analytics') || '[]');
      events.push({
        event,
        data,
        timestamp: Date.now()
      });

      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem('bvester_analytics', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }
}