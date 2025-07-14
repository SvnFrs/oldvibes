import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StorageService, UserData, UserRole } from '../utils/storage';

interface RoleContextType {
  // State
  currentRole: UserRole | null;
  userData: UserData | null;
  isLoading: boolean;

  // Role checking helpers
  isAdmin: boolean;
  isStaff: boolean;
  isUser: boolean;
  isGuest: boolean;

  // Methods
  checkRole: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  hasAnyPermission: (roles: UserRole[]) => boolean;
  refreshUserData: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed properties
  const isAdmin = currentRole === 'admin';
  const isStaff = currentRole === 'staff';
  const isUser = currentRole === 'user';
  const isGuest = currentRole === 'guest';

  // Check and set role from storage
  const checkRole = async () => {
    try {
      setIsLoading(true);
      const isLoggedIn = await StorageService.isLoggedIn();
      if (!isLoggedIn) {
        setCurrentRole(null);
        setUserData(null);
        setIsLoading(false);
        return;
      }
      const user = await StorageService.getUserData();
      if (user && user.role) {
        setCurrentRole(user.role);
        setUserData(user);
      } else {
        setCurrentRole(null);
        setUserData(null);
      }
    } catch (error) {
      setCurrentRole(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data from storage
  const refreshUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      setUserData(user);
      setCurrentRole(user?.role || null);
    } catch (error) {
      setUserData(null);
      setCurrentRole(null);
    }
  };

  // Check if user has required permission
  const hasPermission = (requiredRole: UserRole): boolean => {
    return currentRole === requiredRole;
  };

  // Check if user has any of the required roles
  const hasAnyPermission = (roles: UserRole[]): boolean => {
    return roles.includes(currentRole as UserRole);
  };

  useEffect(() => {
    checkRole();
  }, []);

  const value: RoleContextType = {
    currentRole,
    userData,
    isLoading,
    isAdmin,
    isStaff,
    isUser,
    isGuest,
    checkRole,
    hasPermission,
    hasAnyPermission,
    refreshUserData,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

// Custom hook to use role context
export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Higher-order component for role-based access control
export function withRoleAccess<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole: UserRole
) {
  return function RoleProtectedComponent(props: T) {
    const { hasPermission, isLoading } = useRole();

    if (isLoading) {
      return null; // or a loading component
    }

    if (!hasPermission(requiredRole)) {
      return null; // or an unauthorized component
    }

    return <Component {...props} />;
  };
}

// Hook for role-based conditional rendering
export function useRolePermissions() {
  const { isAdmin, isStaff, isUser, isGuest, hasPermission, hasAnyPermission, currentRole } =
    useRole();

  return {
    isAdmin,
    isStaff,
    isUser,
    isGuest,
    currentRole,
    hasPermission,
    hasAnyPermission,
    renderForAdmin: (component: React.ReactNode) => (isAdmin ? component : null),
    renderForStaff: (component: React.ReactNode) => (isStaff ? component : null),
    renderForUser: (component: React.ReactNode) => (isUser ? component : null),
    renderForGuest: (component: React.ReactNode) => (isGuest ? component : null),
    renderForRoles: (roles: UserRole[], component: React.ReactNode) =>
      hasAnyPermission(roles) ? component : null,
  };
}
