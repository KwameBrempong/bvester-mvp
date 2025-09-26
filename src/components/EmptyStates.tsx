import React from 'react';
import Icon from './Icons';
import '../styles/empty-states.css';

interface EmptyStateProps {
  type?: 'no-data' | 'error' | 'coming-soon' | 'no-results' | 'success';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'no-data':
        return 'database';
      case 'error':
        return 'error';
      case 'coming-soon':
        return 'clock';
      case 'no-results':
        return 'xray';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const iconName = icon || getDefaultIcon();

  return (
    <div className={`empty-state empty-state-${type} animate-fadeIn`}>
      <div className="empty-state-icon">
        <Icon name={iconName} size={64} color="var(--gold-primary)" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Specific empty state components for different sections
export const NoTransactionsState: React.FC = () => (
  <EmptyState
    type="no-data"
    icon="transactions"
    title="No Transactions Yet"
    description="Start recording your business transactions to track your financial performance and generate insights."
    actionLabel="Add First Transaction"
    onAction={() => {/* Add transaction functionality */}}
  />
);

export const ComingSoonState: React.FC<{ feature: string }> = ({ feature }) => (
  <EmptyState
    type="coming-soon"
    icon="rocket"
    title={`${feature} Coming Soon`}
    description="We're working hard to bring you this feature. Stay tuned for updates!"
  />
);

export const NoResultsState: React.FC<{ searchTerm?: string }> = ({ searchTerm }) => (
  <EmptyState
    type="no-results"
    title="No Results Found"
    description={
      searchTerm
        ? `We couldn't find any results for "${searchTerm}". Try adjusting your search terms.`
        : "We couldn't find any matching results. Try adjusting your filters."
    }
  />
);

export const ErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    type="error"
    title="Something Went Wrong"
    description="We encountered an error while loading this content. Please try again."
    actionLabel="Retry"
    onAction={onRetry}
  />
);

export const SuccessState: React.FC<{ message: string }> = ({ message }) => (
  <EmptyState
    type="success"
    title="Success!"
    description={message}
  />
);