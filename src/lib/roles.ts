// Role management utilities for Directus integration
export enum UserRole {
  AUTHENTICATED = 'authenticated',
  B2B_ADMIN = 'b2b_admin', 
  B2B_MEMBER = 'b2b_member',
  CUSTOMER_PAID = 'customer_paid',
  ADMIN = 'admin' // For system administrators
}

// Map role IDs from environment to role names
export const ROLE_ID_MAP: Record<string, UserRole> = {
  [process.env.DIRECTUS_AUTHENTICATED_ROLE || '']: UserRole.AUTHENTICATED,
  [process.env.DIRECTUS_B2B_ADMIN_ROLE || '']: UserRole.B2B_ADMIN,
  [process.env.DIRECTUS_B2B_MEMBER_ROLE || '']: UserRole.B2B_MEMBER,
  [process.env.DIRECTUS_CUSTOMER_PAID_ROLE || '']: UserRole.CUSTOMER_PAID,
};

// Reverse mapping for role name to ID
export const ROLE_NAME_MAP: Record<UserRole, string> = {
  [UserRole.AUTHENTICATED]: process.env.DIRECTUS_AUTHENTICATED_ROLE || '',
  [UserRole.B2B_ADMIN]: process.env.DIRECTUS_B2B_ADMIN_ROLE || '',
  [UserRole.B2B_MEMBER]: process.env.DIRECTUS_B2B_MEMBER_ROLE || '',
  [UserRole.CUSTOMER_PAID]: process.env.DIRECTUS_CUSTOMER_PAID_ROLE || '',
  [UserRole.ADMIN]: 'admin', // This should match Directus admin role
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.AUTHENTICATED]: 1,
  [UserRole.CUSTOMER_PAID]: 2,
  [UserRole.B2B_MEMBER]: 3,
  [UserRole.B2B_ADMIN]: 4,
  [UserRole.ADMIN]: 5,
};

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.AUTHENTICATED]: 'Authenticated User',
  [UserRole.CUSTOMER_PAID]: 'Paid Customer',
  [UserRole.B2B_MEMBER]: 'B2B Member',
  [UserRole.B2B_ADMIN]: 'B2B Administrator',
  [UserRole.ADMIN]: 'System Administrator',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.AUTHENTICATED]: 'Basic authenticated user with limited access',
  [UserRole.CUSTOMER_PAID]: 'Customer with paid subscription access',
  [UserRole.B2B_MEMBER]: 'Business team member with collaborative features',
  [UserRole.B2B_ADMIN]: 'Business administrator with team management capabilities',
  [UserRole.ADMIN]: 'System administrator with full platform access',
};

/**
 * Convert Directus role ID to UserRole enum
 */
export function getRoleFromId(roleId: string | null): UserRole {
  if (!roleId) return UserRole.AUTHENTICATED;
  return ROLE_ID_MAP[roleId] || UserRole.AUTHENTICATED;
}

/**
 * Convert UserRole enum to Directus role ID
 */
export function getRoleId(role: UserRole): string {
  return ROLE_NAME_MAP[role] || process.env.DIRECTUS_DEFAULT_USER_ROLE || '';
}

/**
 * Check if a user has a specific role or higher
 */
export function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user can access a specific role level
 */
export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  return hasRoleOrHigher(userRole, targetRole);
}

/**
 * Get all roles that a user can access (equal or lower hierarchy)
 */
export function getAccessibleRoles(userRole: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level <= userLevel)
    .map(([role]) => role as UserRole);
}

/**
 * Check if user is a B2B user (admin or member)
 */
export function isB2BUser(role: UserRole): boolean {
  return role === UserRole.B2B_ADMIN || role === UserRole.B2B_MEMBER;
}

/**
 * Check if user is a paying customer
 */
export function isPayingCustomer(role: UserRole): boolean {
  return role === UserRole.CUSTOMER_PAID || isB2BUser(role);
}

/**
 * Check if user has administrative privileges
 */
export function hasAdminPrivileges(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.B2B_ADMIN;
}

/**
 * Get default role for user registration
 */
export function getDefaultUserRole(): UserRole {
  return UserRole.AUTHENTICATED;
}

/**
 * Validate if a role is valid for user assignment
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

// Type guard for checking if a user has a specific role
export function userHasRole(user: { role?: string }, requiredRole: UserRole): boolean {
  if (!user.role) return false;
  const userRole = getRoleFromId(user.role);
  return userRole === requiredRole;
}

// Type guard for checking if a user has role or higher
export function userHasRoleOrHigher(user: { role?: string }, requiredRole: UserRole): boolean {
  if (!user.role) return false;
  const userRole = getRoleFromId(user.role);
  return hasRoleOrHigher(userRole, requiredRole);
}