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
  role?: string;
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

export class DirectusAuthService {
  /**
   * Register a new user in Directus
   */
  static async registerUser(userData: CreateUserData): Promise<DirectusAuthResult<DirectusUser>> {
    try {
      const result = await directusAuth.request(
        registerUser({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          password: userData.password,
          // Use default role from environment or fallback to a customer role UUID
          role: userData.role || process.env.DIRECTUS_DEFAULT_USER_ROLE || null,
        })
      );

      return {
        success: true,
        data: result,
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
   * Authenticate user with Directus
   */
  static async loginUser(credentials: LoginCredentials): Promise<DirectusAuthResult<{ user: DirectusUser; tokens: AuthenticationData }>> {
    try {
      // Authenticate with Directus
      const authResult = await directusAuth.request(
        login(credentials.email, credentials.password)
      );

      if (!authResult.access_token) {
        throw new Error('No access token received');
      }

      // Get user profile
      const user = await directusAuth.request(readMe());

      return {
        success: true,
        data: {
          user,
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
        refresh('json', refreshToken)
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
   * Get user profile by access token
   */
  static async getUserProfile(accessToken: string): Promise<DirectusAuthResult<DirectusUser>> {
    try {
      // Set the token for this request
      directusAuth.setToken(accessToken);
      
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

      return {
        success: true,
        data: user,
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
  static async logoutUser(refreshToken: string): Promise<DirectusAuthResult<void>> {
    try {
      await directusAuth.request(logout(refreshToken));
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
  static async checkEmailExists(_email: string): Promise<boolean> {
    try {
      // This would require a custom endpoint or admin privileges
      // For now, we'll let the registration attempt handle duplicate emails
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
    ).with(rest());
    
    client.setToken(accessToken);
    return client;
  }
}

// Export the service as default
export default DirectusAuthService;

// Export types for use in other files
export type { CreateUserData, LoginCredentials, DirectusAuthResult };