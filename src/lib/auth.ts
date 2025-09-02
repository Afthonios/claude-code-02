import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DirectusProvider, DirectusCallbacks } from '@/lib/auth/directus-provider';
import { z } from 'zod';

// Schema for credentials validation
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// NextAuth type augmentations are handled in directus-provider.ts

export const authOptions: NextAuthOptions = {
  providers: [
    // Primary Directus provider for real user authentication
    DirectusProvider(),
    
    // Keep demo credentials provider for development/testing
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Account',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'user@afthonios.com'
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

          // Demo users for development/testing
          const demoUsers = [
            {
              id: 'demo-1',
              email: 'user@afthonios.com',
              name: 'Demo User',
              password: 'password123',
              role: 'user'
            },
            {
              id: 'demo-2',
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
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Demo authentication error:', error);
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
    jwt: DirectusCallbacks.jwt,
    session: DirectusCallbacks.session,
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