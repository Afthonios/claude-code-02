import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

// Schema for credentials validation
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// User type for TypeScript
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string | undefined;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role?: string | undefined;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'user@example.com'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const validatedCredentials = credentialsSchema.parse({
            email: credentials.email,
            password: credentials.password,
          });

          // TODO: Replace this with actual user authentication
          // This is a temporary implementation - in production, you should:
          // 1. Hash and compare passwords securely (bcrypt, scrypt, etc.)
          // 2. Query your actual user database (Directus, PostgreSQL, etc.)
          // 3. Validate user credentials against your auth system

          // Temporary demo users for development
          const demoUsers = [
            {
              id: '1',
              email: 'user@afthonios.com',
              name: 'Demo User',
              password: 'password123',
              role: 'user'
            },
            {
              id: '2',
              email: 'admin@afthonios.com',
              name: 'Admin User',
              password: 'admin123',
              role: 'admin'
            }
          ];

          const user = demoUsers.find(
            u => u.email === validatedCredentials.email && 
                 u.password === validatedCredentials.password
          );

          if (user) {
            // Return user object without password
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error', // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        if (user.role) {
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        if (token.role) {
          session.user.role = token.role;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
    async signOut() {
      console.log('User signed out');
    },
  },
  debug: process.env.NODE_ENV === 'development',
};