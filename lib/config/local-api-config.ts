const isDev = process.env.NEXT_PUBLIC_STAGE === 'dev';


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
  API_URL: isDev
    ? process.env.GCP_DEV_URL
    : process.env.GCP_PROD_URL,

  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY
}; 