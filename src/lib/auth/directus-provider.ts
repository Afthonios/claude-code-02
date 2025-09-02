import CredentialsProvider from 'next-auth/providers/credentials';
import DirectusAuthService from '@/lib/directus-auth';
import { UserRole, getRoleFromId } from '@/lib/roles';

// Directus profile interface (for potential future use)
// interface DirectusProfile {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   avatar?: string;
//   role?: string;
// }

/**
 * Custom Directus provider for NextAuth.js
 * This provider authenticates users against your Directus instance
 */
export function DirectusProvider() {
  return CredentialsProvider({
    id: 'directus',
    name: 'Directus',
    credentials: {
      email: { 
        label: 'Email', 
        type: 'email',
        placeholder: 'your@email.com'
      },
      password: { 
        label: 'Password', 
        type: 'password' 
      }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }

      try {
        // Use our Directus auth service to login
        const result = await DirectusAuthService.loginUser({
          email: credentials.email,
          password: credentials.password,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Authentication failed');
        }

        const { user, tokens } = result.data;

        // Transform Directus user to NextAuth user format
        // Use Record type to allow dynamic properties
        const authUser: Record<string, unknown> = {
          id: user.id,
          email: user.email || '',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        };
        
        // Add optional fields if they exist
        if (user.first_name) authUser.firstName = user.first_name;
        if (user.last_name) authUser.lastName = user.last_name;
        if (typeof user.avatar === 'string') authUser.avatar = user.avatar;
        
        // Handle role information
        if (typeof user.role === 'string') {
          authUser.roleId = user.role;
          authUser.role = getRoleFromId(user.role);
        }
        
        // Store role name for easy access
        if (user.role_name) authUser.roleName = user.role_name;
        
        if (tokens.access_token) authUser.accessToken = tokens.access_token;
        if (tokens.refresh_token) authUser.refreshToken = tokens.refresh_token;
        if (tokens.expires) authUser.tokenExpires = tokens.expires;
        
        return authUser;
      } catch (error) {
        console.error('Directus authentication error:', error);
        
        // Return null to indicate authentication failure
        // NextAuth will handle this gracefully
        return null;
      }
    }
  });
}

// Export JWT and session callback helpers for Directus integration
export const DirectusCallbacks = {
  async jwt({ token, user, account }) {
    // Initial sign in
    if (account && user) {
      return {
        ...token,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role, // UserRole enum value
        roleId: user.roleId, // Directus role UUID
        roleName: user.roleName, // User-friendly role name
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        tokenExpires: user.tokenExpires,
      };
    }

    // Return previous token if the access token has not expired yet
    if (token.tokenExpires && Date.now() < token.tokenExpires * 1000) {
      return token;
    }

    // Access token has expired, try to update it
    if (token.refreshToken) {
      try {
        const refreshResult = await DirectusAuthService.refreshToken(token.refreshToken as string);
        
        if (refreshResult.success && refreshResult.data) {
          return {
            ...token,
            accessToken: refreshResult.data.access_token,
            refreshToken: refreshResult.data.refresh_token ?? token.refreshToken,
            tokenExpires: refreshResult.data.expires,
          };
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    // Return token (this will trigger a redirect to login)
    return token;
  },

  async session({ session, token }) {
    // Add Directus user data to session
    if (token) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        avatar: token.avatar as string,
        role: token.role as UserRole,
        roleId: token.roleId as string,
        roleName: token.roleName as string,
      };
      
      // Add access token to session (be careful with this in production)
      session.accessToken = token.accessToken as string;
    }

    return session;
  },
};

// Type augmentation for NextAuth to include our custom fields
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: UserRole;
    roleId?: string;
    roleName?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpires?: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      role?: UserRole;
      roleId?: string;
      roleName?: string;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: UserRole;
    roleId?: string;
    roleName?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpires?: number;
  }
}