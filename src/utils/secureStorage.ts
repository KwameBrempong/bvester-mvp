// SECURITY FIX: Secure storage utility with encryption for sensitive data
import { environment } from '../config/environment';

interface StorageItem {
  value: unknown;
  timestamp: number;
  userId: string;
  encrypted: boolean;
}

// Simple encryption/decryption (for production, use a proper crypto library)
const encryptData = (text: string, key: string): string => {
  try {
    // Basic XOR encryption (for demo - use AES in production)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  } catch {
    return text; // Fallback to plain text if encryption fails
  }
};

const decrypt = (encryptedText: string, key: string): string => {
  try {
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return encryptedText; // Fallback if decryption fails
  }
};

class SecureStorage {
  private encryptionKey: string;
  private currentUserId: string | null = null;

  constructor() {
    this.encryptionKey = environment.security.encryptionKey;
  }

  // Set current user for session isolation
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  // Generate secure storage key with user isolation
  private getStorageKey(key: string): string {
    const userId = this.currentUserId || 'anonymous';
    return `bvester_${userId}_${key}`;
  }

  // Store data with optional encryption
  setItem(key: string, value: unknown, encrypt: boolean = false): boolean {
    try {
      if (!this.currentUserId) {
        console.warn('No current user set for secure storage');
        return false;
      }

      const storageItem: StorageItem = {
        value: encrypt ? encryptData(JSON.stringify(value), this.encryptionKey) : value,
        timestamp: Date.now(),
        userId: this.currentUserId,
        encrypted: encrypt
      };

      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(storageItem));
      return true;
    } catch (error) {
      console.error('SecureStorage setItem failed:', error);
      return false;
    }
  }

  // Retrieve data with automatic decryption
  getItem<T>(key: string): T | null {
    try {
      if (!this.currentUserId) {
        console.warn('No current user set for secure storage');
        return null;
      }

      const storageKey = this.getStorageKey(key);
      const item = localStorage.getItem(storageKey);

      if (!item) {
        return null;
      }

      const storageItem: StorageItem = JSON.parse(item);

      // Verify the item belongs to current user
      if (storageItem.userId !== this.currentUserId) {
        console.warn('Storage item belongs to different user, removing');
        this.removeItem(key);
        return null;
      }

      // Check if item has expired (optional - 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - storageItem.timestamp > maxAge) {
        console.log('Storage item expired, removing');
        this.removeItem(key);
        return null;
      }

      if (storageItem.encrypted) {
        const decryptedValue = decrypt(storageItem.value, this.encryptionKey);
        return JSON.parse(decryptedValue);
      }

      return storageItem.value;
    } catch (error) {
      console.error('SecureStorage getItem failed:', error);
      return null;
    }
  }

  // Remove specific item
  removeItem(key: string): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('SecureStorage removeItem failed:', error);
      return false;
    }
  }

  // Clear all items for current user
  clearUserData(): boolean {
    try {
      if (!this.currentUserId) {
        return false;
      }

      const prefix = `bvester_${this.currentUserId}_`;
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith(prefix)
      );

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Cleared ${keysToRemove.length} items for user ${this.currentUserId}`);
      return true;
    } catch (error) {
      console.error('SecureStorage clearUserData failed:', error);
      return false;
    }
  }

  // Clear all Bvester data (emergency cleanup)
  clearAllData(): boolean {
    try {
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('bvester_')
      );

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Emergency cleanup: removed ${keysToRemove.length} items`);
      return true;
    } catch (error) {
      console.error('SecureStorage clearAllData failed:', error);
      return false;
    }
  }

  // Get storage usage for current user
  getStorageInfo(): { itemCount: number; totalSize: number } {
    try {
      if (!this.currentUserId) {
        return { itemCount: 0, totalSize: 0 };
      }

      const prefix = `bvester_${this.currentUserId}_`;
      const userKeys = Object.keys(localStorage).filter(key =>
        key.startsWith(prefix)
      );

      let totalSize = 0;
      userKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      return {
        itemCount: userKeys.length,
        totalSize
      };
    } catch (error) {
      console.error('SecureStorage getStorageInfo failed:', error);
      return { itemCount: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Utility functions for common storage operations
export const storageUtils = {
  // Store user profile securely
  storeProfile: (profile: unknown) => {
    return secureStorage.setItem('profile', profile, true);
  },

  // Get user profile
  getProfile: () => {
    return secureStorage.getItem('profile');
  },

  // Store session data
  storeSession: (sessionData: unknown) => {
    return secureStorage.setItem('session', sessionData, false);
  },

  // Get session data
  getSession: () => {
    return secureStorage.getItem('session');
  },

  // Store subscription data
  storeSubscription: (subscription: unknown) => {
    return secureStorage.setItem('subscription', subscription, false);
  },

  // Get subscription data
  getSubscription: () => {
    return secureStorage.getItem('subscription');
  },

  // Initialize storage for user
  initForUser: (userId: string) => {
    secureStorage.setCurrentUser(userId);
    console.log('SecureStorage initialized for user:', userId);
  },

  // Cleanup on logout
  cleanup: () => {
    const info = secureStorage.getStorageInfo();
    console.log('Cleaning up storage:', info);
    return secureStorage.clearUserData();
  },

  // Emergency cleanup
  emergencyCleanup: () => {
    return secureStorage.clearAllData();
  }
};

export default secureStorage;