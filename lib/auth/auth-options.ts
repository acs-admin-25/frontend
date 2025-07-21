import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { GoogleAuth } from "google-auth-library";
import { config } from '@/lib/config/local-api-config';
import type { Credentials, SignupProvider, User, AuthType, LoginResponse } from '@/lib/types/auth';
import { serverApiClient } from "@/lib/api/client";
import { convertBackendUserToNextAuthUser, convertNextAuthUserToBackendUser } from './auth-utils';

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

          // Convert backend user to NextAuth format
          const backendUser: User = data.user;
          const user: NextAuthUser = convertBackendUserToNextAuthUser(backendUser);
          
          if (creds.provider === 'google' && data.tokens?.access_token) {
            user.accessToken = data.tokens.access_token;
          }

          // Store tokens for client-side use
          if (data.tokens) {
            (user as any).tokens = data.tokens;
          }

          // Extract session_id from the response if available
          if (data.session?.session_id) {
            (user as any).sessionId = data.session.session_id;
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
          
          // Get the ID token from the Google account
          if (!account.id_token) {
            console.error('❌ NextAuth Google - No ID token available');
            throw new Error('Google ID token not available');
          }

          // Initialize GoogleAuth with frontend service account
          const auth = new GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
          });

          // Get a client that will fetch & attach the ID token as Bearer
          const client = await auth.getIdTokenClient(config.LOGIN_FUNCTION);

          console.log('🚀 NextAuth Google - Calling Cloud Function for login');
          const rawIdToken = await client.idTokenProvider.fetchIdToken(config.LOGIN_FUNCTION);
          const loginResponse = await client.request({
            url: config.LOGIN_FUNCTION,
            method: "POST",
            data: { id_token: rawIdToken },
          });

          const loginResponseData = loginResponse.data as any;
          console.log('📥 NextAuth Google - Login response:', { status: loginResponse.status, data: loginResponseData });

          if (loginResponse.status === 200 && loginResponseData?.success && loginResponseData?.data) {
            // User exists, set authType and return true
            (appUser as any).authType = loginResponseData.data.user?.authType || loginResponseData.data.authType || 'existing';
            (appUser as any).id = loginResponseData.data.user?.id || loginResponseData.data.user?.id || '';
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
          const signupClient = await auth.getIdTokenClient(config.SIGNUP_FUNCTION);
          const signupResponse = await signupClient.request({
            url: config.SIGNUP_FUNCTION,
            method: "POST",
            data: signupData,
          });

          const signupResponseData = signupResponse.data as any;
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
            const retryRawIdToken = await client.idTokenProvider.fetchIdToken(config.LOGIN_FUNCTION);
            const retryLoginResponse = await client.request({
              url: config.LOGIN_FUNCTION,
              method: "POST",
              data: { id_token: retryRawIdToken },
            });
            
            const retryLoginResponseData = retryLoginResponse.data as any;
            if (retryLoginResponse.status === 200 && retryLoginResponseData?.success && retryLoginResponseData?.data) {
              (appUser as any).authType = retryLoginResponseData.data.user?.authType || retryLoginResponseData.data.authType || 'existing';
              (appUser as any).id = retryLoginResponseData.data.user?.id || retryLoginResponseData.data.user?.id || '';
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