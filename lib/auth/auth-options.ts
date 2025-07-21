import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { GoogleAuth } from "google-auth-library";
import { config } from '@/lib/config/local-api-config';
import type { Credentials, SignupProvider, User, AuthType, LoginResponse } from '@/lib/types/auth';
import { serverApiClient } from "@/lib/api/client";
import { convertBackendUserToNextAuthUser, convertNextAuthUserToBackendUser } from './auth-utils';
import type { Session as NextAuthSession, User as NextAuthUser } from 'next-auth';
// Account and Profile types are not available, fallback to any
import type { JWT as NextAuthJWT } from 'next-auth/jwt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        provider: { label: "Provider", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password, name, provider } = credentials;
        try {
          if (provider === 'google') {
            // Should not hit here for Google, handled by Google provider
            return null;
          }
          // Login via backend
          const result = await serverApiClient.login({ email, password, provider, name });
          
          console.log('🔍 [NextAuth] Backend login result:', {
            success: result.success,
            hasData: !!result.data,
            dataKeys: result.data ? Object.keys(result.data) : null,
            error: result.error,
            status: result.status
          });
          
          // Handle backend response format: {success: true, data: {message: "Login successful", token: "..."}}
          if (result.success && result.data?.message && result.data?.token) {
            // Create a minimal user object for NextAuth
            return {
              id: result.data.user?.id || email, // Use user ID from backend or email as fallback
              email: email,
              name: result.data.user?.name || name || email,
              provider: provider || 'form',
              authType: result.data.user?.authType || 'existing'
            };
          } else {
            console.error('❌ [NextAuth] Backend login failed:', {
              success: result.success,
              data: result.data,
              error: result.error,
              status: result.status,
              expectedFormat: 'Expected {success: true, data: {message: string, token: string}}'
            });
            throw new Error(result.error || 'Invalid credentials');
          }
        } catch (error) {
          // Optionally log error
          console.error('Credentials authorize error:', error);
          return null;
        }
      }
    }),

    Google({
      clientId: config.GOOGLE_CLIENT_ID!,
      clientSecret: config.GOOGLE_CLIENT_SECRET!,
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      console.log('🔐 [NextAuth] signIn callback triggered', {
        provider: account?.provider,
        userEmail: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile
      });

      // For Google, if user does not exist, create it
      if (account?.provider === 'google') {
        try {
          console.log('🟢 [NextAuth] Processing Google authentication', {
            userEmail: user.email,
            userName: user.name,
            profileName: profile?.name
          });

          // Get the ID token from the account object
          const idToken = account.id_token;
          
          console.log('🔑 [NextAuth] ID Token check', {
            hasIdToken: !!idToken,
            idTokenLength: idToken ? idToken.length : 0,
            accountKeys: Object.keys(account || {})
          });
          
          if (!idToken) {
            console.error('❌ [NextAuth] No ID token available from Google OAuth', {
              account: account,
              accountProvider: account?.provider,
              accountType: account?.type
            });
            return false;
          }

          console.log('📤 [NextAuth] Attempting backend login with Google ID token');

          // Try to login first with the Google ID token
          const loginRes = await serverApiClient.login({
            email: user.email,
            password: '',
            provider: 'google',
            name: user.name || profile?.name || '',
            idToken: idToken  // Pass the ID token to backend
          });
          
          console.log('📥 [NextAuth] Backend login response', {
            success: loginRes.success,
            hasData: !!loginRes.data,
            hasUser: !!(loginRes.data?.user),
            error: loginRes.error,
            status: loginRes.status,
            // Add logging for actual response structure
            actualData: loginRes.data
          });
          
          // Handle backend response format: {message: "Google login successful", token: "..."}
          if (loginRes.success && loginRes.data?.message && loginRes.data?.token) {
            console.log('✅ [NextAuth] Google login successful via existing user');
            return true;
          }
          
          console.log('📤 [NextAuth] Login failed, attempting backend signup');

          // If login fails, try signup with the Google ID token
          const signupRes = await serverApiClient.signup({
            email: user.email,
            password: '',
            provider: 'google',
            name: user.name || profile?.name || '',
            idToken: idToken  // Pass the ID token to backend
          });
          
          console.log('📥 [NextAuth] Backend signup response', {
            success: signupRes.success,
            hasData: !!signupRes.data,
            hasUser: !!(signupRes.data?.user),
            error: signupRes.error,
            status: signupRes.status,
            // Add logging for actual response structure
            actualData: signupRes.data
          });
          
          // Handle backend response format: {message: "Google signup successful", token: "..."}
          if (signupRes.success && signupRes.data?.message && signupRes.data?.token) {
            console.log('✅ [NextAuth] Google signup successful for new user');
            return true;
          }
          
          console.error('❌ [NextAuth] Both login and signup failed for Google user', {
            loginError: loginRes.error,
            signupError: signupRes.error,
            loginStatus: loginRes.status,
            signupStatus: signupRes.status
          });
          return false;
        } catch (err) {
          console.error('💥 [NextAuth] Exception in Google authentication', {
            error: err,
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
            userEmail: user.email
          });
          return false;
        }
      }
      // For credentials, allow sign in if user is present
      const credentialsResult = !!user;
      console.log('🔐 [NextAuth] Credentials authentication result', {
        hasUser: !!user,
        result: credentialsResult
      });
      return credentialsResult;
    },
    
    async jwt({ token, user, account, profile }: { token: NextAuthJWT; user?: any; account?: any; profile?: any }) {
      // Attach user info to token on first login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.provider = user.provider;
        token.authType = user.authType || 'existing';
        token.role = user.role;
        token.organization_id = user.organization_id;
        token.account_id = user.account_id;
        token.response_email = user.response_email;
        token.login_count = user.login_count;
      }
      return token;
    },
    
    async session({ session, token }: { session: NextAuthSession; token: NextAuthJWT }) {
      // Attach token info to session
      if (token) {
        (session as any).user = {
          id: token.id,
          email: token.email,
          name: token.name,
          provider: token.provider,
          authType: token.authType,
          role: token.role,
          organization_id: token.organization_id,
          account_id: token.account_id,
          response_email: token.response_email,
          login_count: token.login_count,
        };
        (session as any).sessionId = (token as any).sessionId || null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
    verifyRequest: '/verify-email',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging
  logger: {
    error(code: any, metadata: any) {
      console.error('🚨 [NextAuth] Error:', { code, metadata });
    },
    warn(code: any) {
      console.warn('⚠️ [NextAuth] Warning:', code);
    },
    debug(code: any, metadata: any) {
      console.log('🔍 [NextAuth] Debug:', { code, metadata });
    }
  },
  events: {
    async signIn(message: any) {
      console.log('🔓 [NextAuth] signIn event:', message);
    },
    async signOut(message: any) {
      console.log('🔒 [NextAuth] signOut event:', message);
    },
    async createUser(message: any) {
      console.log('👤 [NextAuth] createUser event:', message);
    },
    async session(message: any) {
      console.log('📋 [NextAuth] session event:', message);
    }
  }
}; 