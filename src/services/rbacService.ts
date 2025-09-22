import { UserProfile } from './dataService';
import { logger } from '../config/environment';

export type Permission =
  | 'view_dashboard'
  | 'manage_transactions'
  | 'view_transactions'
  | 'edit_transactions'
  | 'delete_transactions'
  | 'view_reports'
  | 'generate_reports'
  | 'manage_users'
  | 'view_business_assessment'
  | 'take_business_assessment'
  | 'access_growth_accelerator'
  | 'manage_subscription'
  | 'view_subscription'
  | 'manage_profile'
  | 'view_profile'
  | 'manage_verification'
  | 'export_data'
  | 'admin_access';

export type Role = 'owner' | 'accountant' | 'viewer';

// Role-based permissions matrix
const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    'view_dashboard',
    'manage_transactions',
    'view_transactions',
    'edit_transactions',
    'delete_transactions',
    'view_reports',
    'generate_reports',
    'manage_users',
    'view_business_assessment',
    'take_business_assessment',
    'access_growth_accelerator',
    'manage_subscription',
    'view_subscription',
    'manage_profile',
    'view_profile',
    'manage_verification',
    'export_data'
  ],
  accountant: [
    'view_dashboard',
    'manage_transactions',
    'view_transactions',
    'edit_transactions',
    'view_reports',
    'generate_reports',
    'view_business_assessment',
    'view_subscription',
    'view_profile',
    'export_data'
  ],
  viewer: [
    'view_dashboard',
    'view_transactions',
    'view_reports',
    'view_business_assessment',
    'view_subscription',
    'view_profile'
  ]
};

// Feature access levels based on subscription
export type FeatureAccess = {
  maxTransactions: number;
  maxReports: number;
  maxUsers: number;
  canExportData: boolean;
  hasAdvancedAnalytics: boolean;
  hasAcceleratorAccess: boolean;
  hasPhoneSupport: boolean;
  hasCustomBranding: boolean;
};

const subscriptionFeatures: Record<'free' | 'pro' | 'business', FeatureAccess> = {
  free: {
    maxTransactions: 20,
    maxReports: 3,
    maxUsers: 1,
    canExportData: false,
    hasAdvancedAnalytics: false,
    hasAcceleratorAccess: false,
    hasPhoneSupport: false,
    hasCustomBranding: false
  },
  pro: {
    maxTransactions: 500,
    maxReports: 20,
    maxUsers: 3,
    canExportData: true,
    hasAdvancedAnalytics: true,
    hasAcceleratorAccess: true,
    hasPhoneSupport: false,
    hasCustomBranding: false
  },
  business: {
    maxTransactions: Infinity,
    maxReports: Infinity,
    maxUsers: 10,
    canExportData: true,
    hasAdvancedAnalytics: true,
    hasAcceleratorAccess: true,
    hasPhoneSupport: true,
    hasCustomBranding: true
  }
};

export const rbacService = {
  // Check if user has specific permission
  hasPermission(userProfile: UserProfile, permission: Permission): boolean {
    const userRole = userProfile.role;
    const permissions = rolePermissions[userRole] || [];

    logger.debug('Permission check', {
      userId: userProfile.userId,
      role: userRole,
      permission,
      hasPermission: permissions.includes(permission)
    });

    return permissions.includes(permission);
  },

  // Check multiple permissions
  hasAnyPermission(userProfile: UserProfile, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userProfile, permission));
  },

  hasAllPermissions(userProfile: UserProfile, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userProfile, permission));
  },

  // Get all permissions for a role
  getRolePermissions(role: Role): Permission[] {
    return rolePermissions[role] || [];
  },

  // Get feature access based on subscription
  getFeatureAccess(subscriptionTier: 'free' | 'pro' | 'business'): FeatureAccess {
    return subscriptionFeatures[subscriptionTier];
  },

  // Check if user can access feature based on subscription
  canAccessFeature(
    userProfile: UserProfile,
    subscriptionTier: 'free' | 'pro' | 'business',
    feature: keyof FeatureAccess
  ): boolean {
    const featureAccess = this.getFeatureAccess(subscriptionTier);
    const hasPermission = this.hasPermission(userProfile, 'view_dashboard'); // Basic check

    return hasPermission && featureAccess[feature] === true;
  },

  // Check usage limits
  checkUsageLimit(
    subscriptionTier: 'free' | 'pro' | 'business',
    limitType: 'transactions' | 'reports' | 'users',
    currentUsage: number
  ): { withinLimit: boolean; limit: number; remaining: number } {
    const features = this.getFeatureAccess(subscriptionTier);

    let limit: number;
    switch (limitType) {
      case 'transactions':
        limit = features.maxTransactions;
        break;
      case 'reports':
        limit = features.maxReports;
        break;
      case 'users':
        limit = features.maxUsers;
        break;
      default:
        limit = 0;
    }

    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - currentUsage);
    const withinLimit = currentUsage < limit;

    return { withinLimit, limit, remaining };
  },

  // Middleware function for route protection
  requirePermission(permission: Permission) {
    return (userProfile: UserProfile | null) => {
      if (!userProfile) {
        logger.warn('Access denied: No user profile', { permission });
        return false;
      }

      if (!this.hasPermission(userProfile, permission)) {
        logger.warn('Access denied: Insufficient permissions', {
          userId: userProfile.userId,
          role: userProfile.role,
          permission
        });
        return false;
      }

      return true;
    };
  },

  // Check if profile completion is sufficient for action
  requireProfileCompletion(minimumPercentage: number) {
    return (userProfile: UserProfile | null) => {
      if (!userProfile) {
        return false;
      }

      const isComplete = userProfile.profileCompletionPercentage >= minimumPercentage;

      if (!isComplete) {
        logger.warn('Action denied: Profile completion insufficient', {
          userId: userProfile.userId,
          currentCompletion: userProfile.profileCompletionPercentage,
          required: minimumPercentage
        });
      }

      return isComplete;
    };
  },

  // Get user access summary
  getUserAccessSummary(
    userProfile: UserProfile,
    subscriptionTier: 'free' | 'pro' | 'business'
  ): {
    role: Role;
    permissions: Permission[];
    features: FeatureAccess;
    profileCompletion: number;
    verificationStatus: {
      email: boolean;
      phone: boolean;
      business: boolean;
    };
  } {
    return {
      role: userProfile.role,
      permissions: this.getRolePermissions(userProfile.role),
      features: this.getFeatureAccess(subscriptionTier),
      profileCompletion: userProfile.profileCompletionPercentage,
      verificationStatus: {
        email: userProfile.isEmailVerified,
        phone: userProfile.isPhoneVerified,
        business: userProfile.isBusinessVerified,
      }
    };
  },

  // Helper to get human-readable role name
  getRoleDisplayName(role: Role): string {
    const roleNames = {
      owner: 'Business Owner',
      accountant: 'Accountant',
      viewer: 'Viewer'
    };
    return roleNames[role];
  },

  // Helper to get permission display name
  getPermissionDisplayName(permission: Permission): string {
    const permissionNames: Record<Permission, string> = {
      view_dashboard: 'View Dashboard',
      manage_transactions: 'Manage Transactions',
      view_transactions: 'View Transactions',
      edit_transactions: 'Edit Transactions',
      delete_transactions: 'Delete Transactions',
      view_reports: 'View Reports',
      generate_reports: 'Generate Reports',
      manage_users: 'Manage Users',
      view_business_assessment: 'View Business Assessment',
      take_business_assessment: 'Take Business Assessment',
      access_growth_accelerator: 'Access Growth Accelerator',
      manage_subscription: 'Manage Subscription',
      view_subscription: 'View Subscription',
      manage_profile: 'Manage Profile',
      view_profile: 'View Profile',
      manage_verification: 'Manage Verification',
      export_data: 'Export Data',
      admin_access: 'Admin Access'
    };
    return permissionNames[permission];
  }
};

export default rbacService;