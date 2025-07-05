import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from '@/lib/config/local-api-config';
import type { Credentials, SignupProvider, User, AuthType, LoginResponse } from '@/types/auth';
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
      const appUser = user as User;
      
      if (account?.provider === "credentials") {
        return true;
      }
      
      if (account?.provider === "google") {
        appUser.provider = 'google';
        if (account.access_token) {
            appUser.accessToken = account.access_token;
        }

        try {
          // First, try to login with the Google user
          const loginData = {
            email: appUser.email,
            password: "",
            provider: 'google' as SignupProvider,
            name: appUser.name
          };

          const loginResponse = await serverApiClient.login(loginData);

          if (loginResponse.success && loginResponse.data) {
            // User exists, set authType and return true
            appUser.authType = loginResponse.data.user?.authType || loginResponse.data.authType || 'existing';
            appUser.id = loginResponse.data.user?.id || loginResponse.data.user?.id || '';
            appUser.accessToken = account.access_token;
            
            // Extract session_id from the response if available
            if (loginResponse.data.sessionId) {
              (appUser as any).sessionId = loginResponse.data.sessionId;
            }
            
            return true;
          }

          // If login fails (user doesn't exist), try to sign up
          console.log('User not found, attempting signup...');
          
          // Use the full name for signup
          const signupData = {
            name: appUser.name,
            email: appUser.email,
            provider: 'google' as SignupProvider,
            captchaToken: '' // this is empty because we don't need it for google signup
          };

          const signupResponse = await serverApiClient.signup(signupData);
          
          if (signupResponse.success && signupResponse.data) {
            // Signup successful
            appUser.authType = signupResponse.data.user?.authType || 'new';
            appUser.id = signupResponse.data.user?.id || '';
            
            // Extract session_id from the response if available
            if (signupResponse.data.sessionId) {
              (appUser as any).sessionId = signupResponse.data.sessionId;
            }
            
            return true;
          } else if (signupResponse.status === 409) {
            // User already exists (race condition), try login again
            console.log('User already exists, retrying login...');
            const retryLoginResponse = await serverApiClient.login(loginData);
            if (retryLoginResponse.success && retryLoginResponse.data) {
              appUser.authType = retryLoginResponse.data.user?.authType || retryLoginResponse.data.authType || 'existing';
              appUser.id = retryLoginResponse.data.user?.id || retryLoginResponse.data.user?.id || '';
              appUser.accessToken = account.access_token;
              
              // Extract session_id from the response if available
              if (retryLoginResponse.data.sessionId) {
                (appUser as any).sessionId = retryLoginResponse.data.sessionId;
              }
              
              return true;
            }
          }

          // If we get here, both login and signup failed
          console.error('Google auth failed - login response:', loginResponse);
          console.error('Google auth failed - signup response:', signupResponse);
          return false;
          
        } catch (err) {
          console.error('NextAuth Google authentication error:', err);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user, account }: any) {
        if (account) {
            token.accessToken = account.access_token;
        }
        if (user) {
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
        return token;
    },
    
    async session({ session, token }: any) {
        if (session.user) {
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