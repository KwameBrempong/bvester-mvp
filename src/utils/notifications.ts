/**
 * Production-ready notification system to replace alert() statements
 */

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persistent
}

class NotificationManager {
  private notifications: Map<string, NotificationConfig> = new Map();
  private container: HTMLElement | null = null;

  constructor() {
    this.initializeContainer();
  }

  private initializeContainer() {
    // Create notification container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  show(config: NotificationConfig): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.notifications.set(id, config);
    this.renderNotification(id, config);

    // Auto-remove after duration (default 5 seconds)
    const duration = config.duration !== undefined ? config.duration : 5000;
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  private renderNotification(id: string, config: NotificationConfig) {
    if (!this.container) return;

    const notification = document.createElement('div');
    notification.id = `notification-${id}`;
    notification.style.cssText = `
      background: white;
      border-left: 4px solid ${this.getTypeColor(config.type)};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      max-width: 400px;
      pointer-events: auto;
      animation: slideIn 0.3s ease;
    `;

    const icon = this.getTypeIcon(config.type);
    const title = config.title || this.getDefaultTitle(config.type);

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="color: ${this.getTypeColor(config.type)}; font-size: 20px; line-height: 1; margin-top: 2px;">
          ${icon}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px; font-size: 14px;">
            ${title}
          </div>
          <div style="color: #666; font-size: 13px; line-height: 1.4;">
            ${config.message}
          </div>
        </div>
        <button onclick="window.notificationManager.remove('${id}')"
                style="background: none; border: none; color: #999; cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">
          ×
        </button>
      </div>
    `;

    // Add animation styles to document if not already added
    if (!document.getElementById('notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }

    this.container.appendChild(notification);
  }

  remove(id: string) {
    const element = document.getElementById(`notification-${id}`);
    if (element) {
      element.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        element.remove();
        this.notifications.delete(id);
      }, 300);
    }
  }

  private getTypeColor(type: string): string {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  }

  private getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
      this.notifications.clear();
    }
  }
}

// Create global instance
const notificationManager = new NotificationManager();

// Make it available globally for inline onclick handlers
declare global {
  interface Window {
    notificationManager: NotificationManager;
  }
}
window.notificationManager = notificationManager;

// Export convenient methods
export const notify = {
  success: (message: string, title?: string, duration?: number) =>
    notificationManager.show({ type: 'success', message, title, duration }),

  error: (message: string, title?: string, duration?: number) =>
    notificationManager.show({ type: 'error', message, title, duration }),

  warning: (message: string, title?: string, duration?: number) =>
    notificationManager.show({ type: 'warning', message, title, duration }),

  info: (message: string, title?: string, duration?: number) =>
    notificationManager.show({ type: 'info', message, title, duration }),

  custom: (config: NotificationConfig) =>
    notificationManager.show(config),

  remove: (id: string) => notificationManager.remove(id),
  clear: () => notificationManager.clear()
};

export default notificationManager;