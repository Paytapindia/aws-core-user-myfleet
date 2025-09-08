/**
 * Feature flags configuration
 * Controls feature availability based on environment variables
 */

export const FEATURES = {
  // AWS Services
  USE_AMPLIFY_AUTH: import.meta.env.VITE_USE_AMPLIFY_AUTH === 'true',
  USE_AWS_S3: import.meta.env.VITE_USE_AWS_S3 === 'true',
  
  // External Integrations
  ENABLE_LOVABLE_FEATURES: import.meta.env.VITE_ENABLE_LOVABLE_FEATURES === 'true',
  
  // Development Features
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
} as const;

export const CONFIG = {
  // AWS Configuration
  AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  AWS_COGNITO_USER_POOL_ID: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '',
  AWS_COGNITO_CLIENT_ID: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || '',
  AWS_S3_BUCKET: import.meta.env.VITE_AWS_S3_BUCKET || '',
  
  // API Configuration
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
} as const;