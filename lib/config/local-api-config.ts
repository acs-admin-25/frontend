const isDev = process.env.NODE_ENV === 'development';

// Next Auth Needs these 'translations' from the local env file to work because it loads on the server side. 
// It doesn't have access to the local env file on the server side, so we load in any necessary env variables here

// Get the current stage (dev, staging, prod)
export const STAGE = process.env.NEXT_PUBLIC_STAGE || 'dev';

// Validate required environment variables for each stage
function validateEnvVars() {
  const requiredVars = [
    { key: 'GCP_DEV_URL', value: process.env.GCP_DEV_URL },
    { key: 'GCP_STAGING_URL', value: process.env.GCP_STAGING_URL },
    { key: 'GCP_PROD_URL', value: process.env.GCP_PROD_URL }
  ];
  const missing = requiredVars.filter(v => !v.value);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.map(v => v.key).join(', ')}`;
    if (typeof window === 'undefined') {
      // Server-side: throw error to fail fast
      throw new Error(message);
    } else {
      // Client-side: log warning
      // eslint-disable-next-line no-console
      console.warn(message);
    }
  }
}

validateEnvVars();

// Only use prod client IDs and NEXTAUTH_URL for prod; use dev for dev and staging
const isProd = STAGE === 'prod';

// Dynamically generate the API Gateway URL
export const config = {
  NEXTAUTH_URL: isProd
    ? process.env.NEXTAUTH_URL_PROD
    : process.env.NEXTAUTH_URL_DEV,
  GOOGLE_CLIENT_ID: isProd
    ? process.env.GOOGLE_CLIENT_ID_PROD
    : process.env.GOOGLE_CLIENT_ID_DEV,
  GOOGLE_CLIENT_SECRET: isProd
    ? process.env.GOOGLE_CLIENT_SECRET_PROD
    : process.env.GOOGLE_CLIENT_SECRET_DEV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  // Dynamically generated API Gateway URL
  API_URL: isProd
    ? process.env.GCP_PROD_URL
    : STAGE === 'staging'
      ? process.env.GCP_STAGING_URL
      : process.env.GCP_DEV_URL,
  // print the api url for testing
}; 

if (isDev) {
  // eslint-disable-next-line no-console
  console.log('Local API Config:', config);
  // eslint-disable-next-line no-console
  console.log('API URL:', config.API_URL);
}