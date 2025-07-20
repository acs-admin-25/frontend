import { GoogleAuth } from 'google-auth-library';

// Initialize Google Auth client
let authClient: GoogleAuth | null = null;

/**
 * Initialize Google Auth client with service account credentials
 */
export async function initializeGoogleAuth() {
  if (authClient) return authClient;

  try {
    // Get service account key from environment variable
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
    }

    // Parse the service account key
    const credentials = JSON.parse(serviceAccountKey);
    
    // Initialize Google Auth client
    authClient = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    console.log('✅ Google Auth client initialized successfully');
    return authClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Auth client:', error);
    throw error;
  }
}

/**
 * Get authenticated headers for Cloud Functions requests
 */
export async function getAuthenticatedHeaders(): Promise<HeadersInit> {
  try {
    const auth = await initializeGoogleAuth();
    const client = await auth.getIdTokenClient('https://us-central1-acs-dev-464702.cloudfunctions.net');
    
    // Get the ID token
    const headers = await client.getRequestHeaders();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': headers.Authorization || '',
    };
  } catch (error) {
    console.error('❌ Failed to get authenticated headers:', error);
    throw error;
  }
}

/**
 * Make authenticated request to Cloud Function
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  try {
    const headers = await getAuthenticatedHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('❌ Authenticated fetch failed:', error);
    throw error;
  }
} 