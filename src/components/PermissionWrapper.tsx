import React from 'react';
import { useHasPermission, useUserRole } from '../store/hooks';
import { Permission } from '../services/rbacService';

interface PermissionWrapperProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireProfileCompletion?: number;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permission,
  children,
  fallback = null,
  requireProfileCompletion
}) => {
  const hasPermission = useHasPermission(permission);
  const userRole = useUserRole();

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div style={{
        padding: '16px',
        background: '#fff5f5',
        border: '1px solid #ffcdd2',
        borderRadius: '8px',
        color: '#d32f2f',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          🔒 Access Restricted
        </div>
        <div style={{ fontSize: '14px' }}>
          Your role ({userRole || 'Unknown'}) doesn't have permission to access this feature.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionWrapper;