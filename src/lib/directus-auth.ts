import { 
  createDirectus, 
  rest, 
  authentication,
  registerUser,
  login,
  readMe,
  refresh,
  logout,
  readUsers,
  updateUser,
  type DirectusUser,
  type AuthenticationData
} from '@directus/sdk';
import { UserRole, getRoleId, getRoleFromId } from '@/lib/roles';

// Separate Directus client for authentication
// This uses server-side authentication with proper token management
const directusAuth = createDirectus(
  process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com'
).with(rest()).with(authentication('json'));

// Types for our user management
interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface DirectusAuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Enhanced user data with role information
interface EnhancedDirectusUser extends DirectusUser {
  role_name?: UserRole;
  role_display?: string;
}

export class DirectusAuthService {
  /**
   * Register a new user in Directus with role management
   */
  static async registerUser(userData: CreateUserData): Promise<DirectusAuthResult<EnhancedDirectusUser>> {
    try {
      // Determine the role ID to use
      const roleId = userData.role 
        ? getRoleId(userData.role)
        : process.env.DIRECTUS_DEFAULT_USER_ROLE || getRoleId(UserRole.AUTHENTICATED);

      const result = await directusAuth.request(
        registerUser(userData.email, userData.password, {
          first_name: userData.first_name,
          last_name: userData.last_name,
        })
      );

      // Enhance the result with role information
      const enhancedResult: EnhancedDirectusUser = {
        ...result,
        role_name: userData.role || UserRole.AUTHENTICATED,
        role_display: userData.role || UserRole.AUTHENTICATED,
      };

      return {
        success: true,
        data: enhancedResult,
      };
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;
        if (errorObj.errors && Array.isArray(errorObj.errors)) {
          // Handle Directus validation errors
          const firstError = errorObj.errors[0] as Record<string, unknown>;
          if (firstError?.message && typeof firstError.message === 'string') {
            errorMessage = firstError.message;
          }
        } else if (errorObj.message && typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Authenticate user with Directus and enhance with role information
   */
  static async loginUser(credentials: LoginCredentials): Promise<DirectusAuthResult<{ user: EnhancedDirectusUser; tokens: AuthenticationData }>> {
    try {
      // Authenticate with Directus using direct API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const authResult = await response.json();

      if (!authResult.access_token) {
        throw new Error('No access token received');
      }

      // Get user profile with role information
      const user = await directusAuth.request(readMe({
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'avatar',
          'role',
          'status',
          'date_created',
          'date_updated',
        ],
      }));

      // Enhance user data with role information  
      const userRole = getRoleFromId(user.role as string);
      const enhancedUser: EnhancedDirectusUser = {
        ...user,
        role_name: userRole,
        role_display: userRole,
      };

      return {
        success: true,
        data: {
          user: enhancedUser,
          tokens: authResult,
        },
      };
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;
        if (errorObj.errors && Array.isArray(errorObj.errors)) {
          const firstError = errorObj.errors[0] as Record<string, unknown>;
          if (firstError?.message === 'Invalid user credentials.') {
            errorMessage = 'Invalid email or password';
          } else if (firstError?.message && typeof firstError.message === 'string') {
            errorMessage = firstError.message;
          }
        } else if (errorObj.message && typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<DirectusAuthResult<AuthenticationData>> {
    try {
      const result = await directusAuth.request(
        refresh('json', { refresh_token: refreshToken })
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }

  /**
   * Get enhanced user profile by access token
   */
  static async getUserProfile(accessToken: string): Promise<DirectusAuthResult<EnhancedDirectusUser>> {
    try {
      // Create authenticated client for this request
      const client = this.createAuthenticatedClient(accessToken);
      
      const user = await client.request(readMe({
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'avatar',
          'role',
          'status',
          'date_created',
          'date_updated',
        ],
      }));

      // Enhance user data with role information  
      const userRole = getRoleFromId(user.role as string);
      const enhancedUser: EnhancedDirectusUser = {
        ...user,
        role_name: userRole,
        role_display: userRole,
      };

      return {
        success: true,
        data: enhancedUser,
      };
    } catch (error: unknown) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch user profile',
      };
    }
  }

  /**
   * Logout user (invalidate token)
   */
  static async logoutUser(_refreshToken: string): Promise<DirectusAuthResult<void>> {
    try {
      await directusAuth.request(logout());
      return {
        success: true,
      };
    } catch (error: unknown) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Failed to logout',
      };
    }
  }

  /**
   * Validate if an email already exists in Directus
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // This would require a custom endpoint or admin privileges
      // For now, we'll let the registration attempt handle duplicate emails
      console.log(`Email check requested for: ${email}`);
      return false;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  }

  /**
   * Create a new instance with authentication token
   */
  static createAuthenticatedClient(accessToken: string) {
    const client = createDirectus(
      process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.afthonios.com'
    ).with(rest()).with(authentication('json'));
    
    // Set token manually in the client
    const clientWithAuth = client as Record<string, unknown>;
    clientWithAuth.globals = { 
      ...(clientWithAuth.globals as Record<string, unknown> || {}),
      access_token: accessToken 
    };
    
    return client;
  }

  /**
   * Update user role (admin function)
   */
  static async updateUserRole(
    userId: string, 
    newRole: UserRole,
    adminToken: string
  ): Promise<DirectusAuthResult<EnhancedDirectusUser>> {
    try {
      const adminClient = this.createAuthenticatedClient(adminToken);
      const roleId = getRoleId(newRole);

      const result = await adminClient.request(
        updateUser(userId, {
          role: roleId,
        })
      );

      // Enhance result with role information
      const enhancedResult: EnhancedDirectusUser = {
        ...result,
        role_name: newRole,
        role_display: newRole,
      };

      return {
        success: true,
        data: enhancedResult,
      };
    } catch (error: unknown) {
      console.error('Role update error:', error);
      return {
        success: false,
        error: 'Failed to update user role',
      };
    }
  }

  /**
   * Get users by role (admin function)
   */
  static async getUsersByRole(
    role: UserRole,
    adminToken: string
  ): Promise<DirectusAuthResult<EnhancedDirectusUser[]>> {
    try {
      const adminClient = this.createAuthenticatedClient(adminToken);
      const roleId = getRoleId(role);

      const result = await adminClient.request(
        readUsers({
          filter: {
            role: { _eq: roleId },
            status: { _eq: 'active' },
          },
          fields: [
            'id',
            'first_name',
            'last_name',
            'email',
            'avatar',
            'role',
            'status',
            'date_created',
            'date_updated',
          ],
        })
      );

      // Enhance all users with role information
      const enhancedUsers: EnhancedDirectusUser[] = result.map(user => ({
        ...user,
        role_name: role,
        role_display: role,
      }));

      return {
        success: true,
        data: enhancedUsers,
      };
    } catch (error: unknown) {
      console.error('Get users by role error:', error);
      return {
        success: false,
        error: 'Failed to fetch users by role',
      };
    }
  }

  /**
   * Create admin client using environment credentials
   */
  static async createAdminClient(): Promise<DirectusAuthResult<ReturnType<typeof this.createAuthenticatedClient>>> {
    try {
      if (!process.env.DIRECTUS_ADMIN_EMAIL || !process.env.DIRECTUS_ADMIN_PASSWORD) {
        throw new Error('Admin credentials not configured');
      }

      const loginResult = await this.loginUser({
        email: process.env.DIRECTUS_ADMIN_EMAIL,
        password: process.env.DIRECTUS_ADMIN_PASSWORD,
      });

      if (!loginResult.success || !loginResult.data?.tokens.access_token) {
        throw new Error('Failed to authenticate admin user');
      }

      const adminClient = this.createAuthenticatedClient(loginResult.data.tokens.access_token);

      return {
        success: true,
        data: adminClient,
      };
    } catch (error: unknown) {
      console.error('Admin client creation error:', error);
      return {
        success: false,
        error: 'Failed to create admin client',
      };
    }
  }

  /**
   * Invite user with specific role (admin function)
   */
  static async inviteUser(
    userData: Omit<CreateUserData, 'password'> & { inviteRole: UserRole }
  ): Promise<DirectusAuthResult<EnhancedDirectusUser>> {
    try {
      // Generate a temporary password (user will be prompted to change)
      const tempPassword = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await this.registerUser({
        ...userData,
        password: tempPassword,
        role: userData.inviteRole,
      });

      if (!result.success) {
        return result;
      }

      // TODO: Send invitation email with password reset link
      // This would typically be handled by Directus workflows or external email service

      return result;
    } catch (error: unknown) {
      console.error('User invitation error:', error);
      return {
        success: false,
        error: 'Failed to invite user',
      };
    }
  }
}

// Export the service as default
export default DirectusAuthService;

// Export types for use in other files
export type { CreateUserData, LoginCredentials, DirectusAuthResult, EnhancedDirectusUser };