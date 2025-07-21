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
      credentials
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
export async function getAuthenticatedHeaders(functionUrl: string): Promise<HeadersInit> {
  try {
    const auth = await initializeGoogleAuth();
    
    // Use the full function URL as the target audience
    const client = await auth.getIdTokenClient(functionUrl);
    
    // Fetch the raw ID token for inspection
    const idToken = await client.idTokenProvider.fetchIdToken(functionUrl);
    console.log('🔑 ID TOKEN:', idToken);
    
    // Get the ID token
    const headers = await client.getRequestHeaders();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': headers.get('Authorization') || '',
    };
  } catch (error) {
    console.error('❌ Failed to get authenticated headers:', error);
    throw error;
  }
}

/**
 * Make authenticated request to Cloud Function using Google Auth client
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  try {
    const auth = await initializeGoogleAuth();
    
    // Use the full function URL as the target audience
    const client = await auth.getIdTokenClient(url);
    
    // Fetch the raw ID token for inspection
    const idToken = await client.idTokenProvider.fetchIdToken(url);
    console.log('🔑 ID TOKEN:', idToken);
    
    // Parse the request body if it exists
    let data = undefined;
    if (options.body) {
      try {
        data = JSON.parse(options.body as string);
      } catch (e) {
        console.warn('Could not parse request body as JSON');
      }
    }
    
    // Use client.request() which automatically handles the correct Bearer token
    const response = await client.request({
      url,
      method: options.method || 'GET',
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.status || response.status >= 400) {
      console.log(`❌ BACKEND ERROR: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('❌ Authenticated fetch failed:', error);
    throw error;
  }
} 