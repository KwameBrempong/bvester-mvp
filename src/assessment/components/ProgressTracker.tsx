/**
 * Progress Tracker Component
 * Visual progress indicator with insights
 */

import React from 'react';

interface ProgressTrackerProps {
  progress: number;
  currentIndex: number;
  totalQuestions: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  currentIndex,
  totalQuestions
}) => {
  return (
    <div className="progress-tracker">
      {/* Main progress bar */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
          }}
        />
      </div>

      {/* Progress text */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        opacity: 0.9
      }}>
        <span>{progress}% complete</span>
        <span>~{Math.max(1, Math.ceil((totalQuestions - currentIndex - 1) * 0.5))} min remaining</span>
      </div>

      {/* Milestone indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
        fontSize: '10px',
        opacity: 0.8
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          opacity: progress >= 25 ? 1 : 0.5
        }}>
          <span style={{ marginRight: '4px' }}>
            {progress >= 25 ? '✓' : '○'}
          </span>
          Financial Health
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          opacity: progress >= 50 ? 1 : 0.5
        }}>
          <span style={{ marginRight: '4px' }}>
            {progress >= 50 ? '✓' : '○'}
          </span>
          Operations
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          opacity: progress >= 75 ? 1 : 0.5
        }}>
          <span style={{ marginRight: '4px' }}>
            {progress >= 75 ? '✓' : '○'}
          </span>
          Market Position
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          opacity: progress >= 100 ? 1 : 0.5
        }}>
          <span style={{ marginRight: '4px' }}>
            {progress >= 100 ? '✓' : '○'}
          </span>
          Growth Ready
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;