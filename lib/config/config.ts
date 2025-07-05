/**
 * File: lib/config.ts
 * Purpose: Configuration file containing demo access codes and other system constants
 * Author: Assistant
 * Date: 12/19/24
 * Version: 1.0.0
 */

export const config = {
  // Demo access configuration
  DEMO: {
    CODE: "acs_demoS25",
    ENABLED: true
  },
  
  // API configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000',
    TIMEOUT: 10000
  },
  
  // Application settings
  APP: {
    NAME: "ACS",
    VERSION: "1.0.0",
    SUPPORT_EMAIL: "support@automatedconsultancy.com"
  }
};

export default config; 