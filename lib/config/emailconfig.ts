// Environment variables configuration
const config = {
    email: {
      smtp: {
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.ZOHO_EMAIL_USER?.trim(),
          pass: process.env.ZOHO_EMAIL_PASS?.trim(),
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
        rateDelta: 1000,
        rateLimit: 3
      },
      from: {
        name: 'ACS Contact Form',
        address: process.env.ZOHO_EMAIL_USER?.trim() || '',
      },
      to: 'support@automatedconsultancy.com',
    },
    site: {
      name: 'ACS',
    },
    env: process.env.NODE_ENV || 'development',
  } as const;
  
  // Validate required environment variables
  const validateConfig = () => {
    const requiredEnvVars = {
      'ZOHO_EMAIL_USER': config.email.smtp.auth.user,
      'ZOHO_EMAIL_PASS': config.email.smtp.auth.pass,
    };
  
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
  
    if (missingVars.length > 0) {
      const error = `Missing required environment variables: ${missingVars.join(', ')}`;
      console.error(error);
      if (config.env === 'production') {
        throw new Error(error);
      }
    }
  
    // Additional validation for production
    if (config.env === 'production') {
      if (!config.email.smtp.auth.user?.includes('@')) {
        throw new Error('ZOHO_EMAIL_USER must be a valid email address');
      }
      const passLength = config.email.smtp.auth.pass?.length ?? 0;
      if (passLength < 6) {
        throw new Error('ZOHO_EMAIL_PASS must be at least 6 characters');
      }
      if (config.email.from.address !== config.email.smtp.auth.user) {
        throw new Error('From address must match the authenticated user email');
      }
    }
  };
  
  // Validate on import
  validateConfig();
  
  export default config; 