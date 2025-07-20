import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from '@/lib/config/local-api-config';
import type { Credentials, SignupProvider, User, AuthType, LoginResponse } from '@/lib/types/auth';
import { serverApiClient } from "@/lib/api/client";

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
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const creds: Credentials = {
            email: credentials.email,
            password: credentials.password,
            name: credentials.name,
            provider: (credentials.provider || 'form') as SignupProvider
          };

          const response = await serverApiClient.login(creds);

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Authentication failed');
          }

          const data = response.data;

          const user: User = {
            id: data.user?.id || data.id || '',
            email: creds.email,
            name: data.user?.name || data.name || creds.name || '',
            provider: creds.provider,
            authType: data.authType || data.user?.authType || 'existing',
          };
          
          if (creds.provider === 'google' && data.accessToken) {
            user.accessToken = data.accessToken;
          }

          // Extract session_id from the response if available
          if (data.sessionId) {
            (user as any).sessionId = data.sessionId;
          }

          return user;
        } catch (error) {
          console.error('Authorize - Error:', error);
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
    async signIn({ user, account }: any) {
      console.log('🔍 NextAuth signIn callback - Starting...');
      console.log('🔍 NextAuth signIn callback - User:', { email: user?.email, name: user?.name });
      console.log('🔍 NextAuth signIn callback - Account:', { provider: account?.provider, type: account?.type });
      
      const appUser = user as User;
      
      if (account?.provider === "credentials") {
        console.log('✅ NextAuth signIn callback - Credentials provider, returning true');
        return true;
      }
      
      if (account?.provider === "google") {
        console.log('🔍 NextAuth signIn callback - Google provider detected');
        appUser.provider = 'google';
        if (account.access_token) {
            appUser.accessToken = account.access_token;
        }

        try {
          console.log('🔍 NextAuth Google - Starting authentication for:', appUser.email);
          
          // First, try to login with the Google user
          // Backend expects only email and password for login
          const loginData = {
            email: appUser.email,
            password: "" // Google users don't have passwords
          };

          console.log('🚀 NextAuth Google - Calling Cloud Function for login');
          const loginResponse = await fetch(config.LOGIN_FUNCTION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
          });

          const loginResponseData = await loginResponse.json();
          console.log('📥 NextAuth Google - Login response:', { status: loginResponse.status, data: loginResponseData });

          if (loginResponse.ok && loginResponseData.success && loginResponseData.data) {
            // User exists, set authType and return true
            appUser.authType = loginResponseData.data.user?.authType || loginResponseData.data.authType || 'existing';
            appUser.id = loginResponseData.data.user?.id || loginResponseData.data.user?.id || '';
            appUser.accessToken = account.access_token;
            
            // Extract session_id from the response if available
            if (loginResponseData.data.sessionId) {
              (appUser as any).sessionId = loginResponseData.data.sessionId;
            }
            
            return true;
          }

          // If login fails (user doesn't exist), try to sign up
          console.log('User not found, attempting signup...');
          
          // Parse name into first_name and last_name for backend
          const nameParts = appUser.name?.trim().split(' ') || [];
          const first_name = nameParts[0] || '';
          const last_name = nameParts.slice(1).join(' ') || '';
          
          // Backend expects: email, password, first_name, last_name, phone_number?, organization?
          const signupData = {
            email: appUser.email,
            password: '', // Google users don't have passwords
            first_name,
            last_name,
            phone_number: undefined,
            organization: undefined
          };

          console.log('🚀 NextAuth Google - Calling Cloud Function for signup');
          const signupResponse = await fetch(config.SIGNUP_FUNCTION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
          });

          const signupResponseData = await signupResponse.json();
          console.log('📥 NextAuth Google - Signup response:', { status: signupResponse.status, data: signupResponseData });
          
          if (signupResponse.ok && signupResponseData.success && signupResponseData.data) {
            // Signup successful
            appUser.authType = signupResponseData.data.user?.authType || 'new';
            appUser.id = signupResponseData.data.user?.id || '';
            
            // Extract session_id from the response if available
            if (signupResponseData.data.sessionId) {
              (appUser as any).sessionId = signupResponseData.data.sessionId;
            }
            
            return true;
          } else if (signupResponse.status === 409) {
            // User already exists (race condition), try login again
            console.log('User already exists, retrying login...');
            const retryLoginResponse = await fetch(config.LOGIN_FUNCTION, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loginData)
            });
            
            const retryLoginResponseData = await retryLoginResponse.json();
            if (retryLoginResponse.ok && retryLoginResponseData.success && retryLoginResponseData.data) {
              appUser.authType = retryLoginResponseData.data.user?.authType || retryLoginResponseData.data.authType || 'existing';
              appUser.id = retryLoginResponseData.data.user?.id || retryLoginResponseData.data.user?.id || '';
              appUser.accessToken = account.access_token;
              
              // Extract session_id from the response if available
              if (retryLoginResponseData.data.sessionId) {
                (appUser as any).sessionId = retryLoginResponseData.data.sessionId;
              }
              
              return true;
            }
          }

          // If we get here, both login and signup failed
          console.error('Google auth failed - login response:', { status: loginResponse.status, data: loginResponseData });
          console.error('Google auth failed - signup response:', { status: signupResponse.status, data: signupResponseData });
          return false;
          
        } catch (err: any) {
          console.error('💥 NextAuth Google authentication error:', err);
          console.error('💥 NextAuth Google authentication error stack:', err.stack);
          return false;
        }
      }
      console.log('✅ NextAuth signIn callback - Default case, returning true');
      return true;
    },
    
    async jwt({ token, user, account }: any) {
        console.log('🔍 NextAuth JWT callback - Starting...');
        console.log('🔍 NextAuth JWT callback - Token:', { id: token?.id, email: token?.email });
        console.log('🔍 NextAuth JWT callback - User:', { id: user?.id, email: user?.email, name: user?.name });
        console.log('🔍 NextAuth JWT callback - Account:', { provider: account?.provider, type: account?.type });
        
        if (account) {
            console.log('🔍 NextAuth JWT callback - Setting access token from account');
            token.accessToken = account.access_token;
        }
        if (user) {
            console.log('🔍 NextAuth JWT callback - Processing user data');
            const appUser = user as User;
            token.id = appUser.id;
            token.email = appUser.email;
            token.name = appUser.name;
            token.provider = appUser.provider;
            token.authType = appUser.authType;
            // Preserve accessToken from user object if it exists
            if (appUser.accessToken) {
                token.accessToken = appUser.accessToken;
            }
            // Preserve sessionId from user object if it exists
            if ((appUser as any).sessionId) {
                token.sessionId = (appUser as any).sessionId;
            }
        }
        console.log('🔍 NextAuth JWT callback - Final token:', { id: token?.id, email: token?.email, provider: token?.provider });
        return token;
    },
    
    async session({ session, token }: any) {
        console.log('🔍 NextAuth session callback - Starting...');
        console.log('🔍 NextAuth session callback - Token:', { id: token?.id, email: token?.email, provider: token?.provider });
        
        if (session.user) {
            console.log('🔍 NextAuth session callback - Processing session user');
            session.user.id = token.id;
            session.user.name = token.name as string;
            session.user.email = token.email as string;
            session.user.provider = token.provider;
            session.user.authType = token.authType;
            session.user.accessToken = token.accessToken;
            // Pass through sessionId to the session
            if (token.sessionId) {
                (session as any).sessionId = token.sessionId;
            }
            console.log('🔍 NextAuth session callback - Final session user:', { 
                id: session.user.id, 
                email: session.user.email, 
                provider: session.user.provider 
            });
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
}; 