const isDev = process.env.NODE_ENV === 'development';

// Next Auth Needs these 'translations' from the local env file to work because it loads on the server side. 
// It doesn't have access to the local env file on the server side, so we load in any necessary env variables here

export const config = {
  NEXTAUTH_URL: isDev
    ? process.env.NEXTAUTH_URL_DEV
    : process.env.NEXTAUTH_URL_PROD,
  GOOGLE_CLIENT_ID: isDev
    ? process.env.GOOGLE_CLIENT_ID_DEV
    : process.env.GOOGLE_CLIENT_ID_PROD,
  GOOGLE_CLIENT_SECRET: isDev
    ? process.env.GOOGLE_CLIENT_SECRET_DEV
    : process.env.GOOGLE_CLIENT_SECRET_PROD,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  
  // Google Cloud Functions URLs
  API_URL: 'https://us-central1-acs-dev-464702.cloudfunctions.net',
  LOGIN_FUNCTION: 'https://us-central1-acs-dev-464702.cloudfunctions.net/login-dev',
  SIGNUP_FUNCTION: 'https://us-central1-acs-dev-464702.cloudfunctions.net/signup-dev',
  AUTH_MIDDLEWARE: 'https://us-central1-acs-dev-464702.cloudfunctions.net/auth-middleware-dev',
  
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY
}; 