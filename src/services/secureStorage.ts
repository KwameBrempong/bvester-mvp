// Secure Storage Service - Encrypted localStorage replacement
// Provides secure storage for sensitive user data

import { environment } from '../config/environment';

interface SecureStorageData {
  encryptedData: string;
  timestamp: number;
  version: string;
}

class SecureStorageService {
  private readonly STORAGE_PREFIX = 'bvester_secure_';
  private readonly ENCRYPTION_KEY = environment.security.encryptionKey;

  // Simple encryption for client-side storage (not for production secrets)
  private encrypt(data: string): string {
    if (!this.ENCRYPTION_KEY || this.ENCRYPTION_KEY === 'dev-key-not-secure') {
      console.warn('Using insecure encryption key. Set VITE_ENCRYPTION_KEY for production.');
    }

    // Basic XOR cipher for demonstration (use crypto library in production)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
      );
    }
    return btoa(encrypted);
  }

  private decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return '';
    }
  }

  // Store encrypted data
  setItem<T>(key: string, data: T, userId?: string): boolean {
    try {
      const storageKey = userId
        ? `${this.STORAGE_PREFIX}${userId}_${key}`
        : `${this.STORAGE_PREFIX}${key}`;

      const payload: SecureStorageData = {
        encryptedData: this.encrypt(JSON.stringify(data)),
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  // Retrieve and decrypt data
  getItem<T>(key: string, userId?: string): T | null {
    try {
      const storageKey = userId
        ? `${this.STORAGE_PREFIX}${userId}_${key}`
        : `${this.STORAGE_PREFIX}${key}`;

      const item = localStorage.getItem(storageKey);
      if (!item) return null;

      const payload: SecureStorageData = JSON.parse(item);
      const decryptedData = this.decrypt(payload.encryptedData);

      if (!decryptedData) return null;

      return JSON.parse(decryptedData) as T;
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  // Remove specific item
  removeItem(key: string, userId?: string): boolean {
    try {
      const storageKey = userId
        ? `${this.STORAGE_PREFIX}${userId}_${key}`
        : `${this.STORAGE_PREFIX}${key}`;

      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to remove encrypted data:', error);
      return false;
    }
  }

  // Clear all user data (for logout)
  clearUserData(userId: string): boolean {
    try {
      const keysToRemove: string[] = [];
      const userPrefix = `${this.STORAGE_PREFIX}${userId}_`;

      // Find all keys for this user
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userPrefix)) {
          keysToRemove.push(key);
        }
      }

      // Remove all user keys
      keysToRemove.forEach(key => localStorage.removeItem(key));

      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }

  // Clear all app data
  clearAllData(): boolean {
    try {
      const keysToRemove: string[] = [];

      // Find all app keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // Remove all app keys
      keysToRemove.forEach(key => localStorage.removeItem(key));

      return true;
    } catch (error) {
      console.error('Failed to clear all app data:', error);
      return false;
    }
  }

  // Check if data exists and is valid
  hasValidData(key: string, userId?: string): boolean {
    const data = this.getItem(key, userId);
    return data !== null;
  }

  // Get data age in milliseconds
  getDataAge(key: string, userId?: string): number | null {
    try {
      const storageKey = userId
        ? `${this.STORAGE_PREFIX}${userId}_${key}`
        : `${this.STORAGE_PREFIX}${key}`;

      const item = localStorage.getItem(storageKey);
      if (!item) return null;

      const payload: SecureStorageData = JSON.parse(item);
      return Date.now() - payload.timestamp;
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
export const secureStorage = new SecureStorageService();

// Utility functions for common use cases
export const userStorage = {
  saveProfile: (userId: string, profile: any) =>
    secureStorage.setItem('profile', profile, userId),

  getProfile: (userId: string) =>
    secureStorage.getItem('profile', userId),

  saveAssessment: (userId: string, assessment: any) =>
    secureStorage.setItem('assessment', assessment, userId),

  getAssessment: (userId: string) =>
    secureStorage.getItem('assessment', userId),

  saveTransactions: (userId: string, transactions: any) =>
    secureStorage.setItem('transactions', transactions, userId),

  getTransactions: (userId: string) =>
    secureStorage.getItem('transactions', userId),

  clearUser: (userId: string) =>
    secureStorage.clearUserData(userId),
};

export default secureStorage;