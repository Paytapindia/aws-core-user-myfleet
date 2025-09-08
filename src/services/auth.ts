/**
 * Authentication service adapter
 * Provides a consistent interface for auth operations
 * Currently uses localStorage, will be replaced with AWS Cognito
 */

import { CONFIG, FEATURES } from '@/config/flags';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isOnboarded: boolean;
  subscribed: boolean;
  subscriptionEnd?: string;
  emailUnverified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

class AuthService {
  private readonly STORAGE_KEYS = {
    USER: 'auth_user',
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'auth_refresh_token',
  } as const;

  constructor() {
    // Initialize auth state
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);

    if (userData && token) {
      if (FEATURES.DEBUG_MODE) {
        console.log('User session found in localStorage');
      }
    }
  }

  /**
   * Login with email and password
   * TODO: Replace with AWS Cognito authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (FEATURES.USE_AMPLIFY_AUTH) {
        // TODO: Implement AWS Cognito login
        throw new Error('AWS Cognito authentication not yet implemented');
      }

      // Placeholder implementation for development
      const user: User = {
        id: 'placeholder-user-id',
        email: credentials.email,
        fullName: 'John Doe',
        phone: '+1234567890',
        isOnboarded: true,
        subscribed: true,
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        emailUnverified: false,
      };

      const accessToken = `placeholder-token-${Date.now()}`;
      const refreshToken = `placeholder-refresh-${Date.now()}`;

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      if (FEATURES.DEBUG_MODE) {
        console.log('User logged in:', user);
      }

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign up new user
   * TODO: Replace with AWS Cognito user registration
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      if (FEATURES.USE_AMPLIFY_AUTH) {
        // TODO: Implement AWS Cognito sign up
        throw new Error('AWS Cognito registration not yet implemented');
      }

      // Placeholder implementation for development
      const user: User = {
        id: `placeholder-user-${Date.now()}`,
        email: data.email,
        fullName: data.fullName || '',
        phone: data.phone || '',
        isOnboarded: false,
        subscribed: false,
        emailUnverified: true,
      };

      const accessToken = `placeholder-token-${Date.now()}`;
      const refreshToken = `placeholder-refresh-${Date.now()}`;

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      if (FEATURES.DEBUG_MODE) {
        console.log('User signed up:', user);
      }

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logout user
   * TODO: Implement AWS Cognito sign out
   */
  async logout(): Promise<void> {
    try {
      if (FEATURES.USE_AMPLIFY_AUTH) {
        // TODO: Implement AWS Cognito sign out
        // await Auth.signOut();
      }

      // Clear localStorage
      localStorage.removeItem(this.STORAGE_KEYS.USER);
      localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);

      if (FEATURES.DEBUG_MODE) {
        console.log('User logged out');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear localStorage even if AWS logout fails
      localStorage.removeItem(this.STORAGE_KEYS.USER);
      localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    const token = this.getAccessToken();
    return !!(user && token);
  }

  /**
   * Refresh access token
   * TODO: Implement AWS Cognito token refresh
   */
  async refreshToken(): Promise<string> {
    try {
      if (FEATURES.USE_AMPLIFY_AUTH) {
        // TODO: Implement AWS Cognito token refresh
        throw new Error('AWS Cognito token refresh not yet implemented');
      }

      // Placeholder implementation
      const newToken = `placeholder-token-refreshed-${Date.now()}`;
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, newToken);

      if (FEATURES.DEBUG_MODE) {
        console.log('Token refreshed');
      }

      return newToken;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send password reset email
   * TODO: Implement with AWS Cognito
   */
  async resetPassword(email: string): Promise<void> {
    try {
      if (FEATURES.USE_AMPLIFY_AUTH) {
        // TODO: Implement AWS Cognito password reset
        throw new Error('AWS Cognito password reset not yet implemented');
      }

      // Placeholder implementation
      if (FEATURES.DEBUG_MODE) {
        console.log('Password reset email sent to:', email);
      }
    } catch (error) {
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify email
   * TODO: Implement with AWS Cognito
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      if (FEATURES.USE_AMPLIFY_AUTH) {
        // TODO: Implement AWS Cognito email verification
        throw new Error('AWS Cognito email verification not yet implemented');
      }

      // Placeholder implementation
      const user = this.getCurrentUser();
      if (user) {
        user.emailUnverified = false;
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      }

      if (FEATURES.DEBUG_MODE) {
        console.log('Email verified');
      }
    } catch (error) {
      throw new Error(`Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export individual methods for convenience
export const { 
  login, 
  signUp, 
  logout, 
  getCurrentUser, 
  getAccessToken, 
  isLoggedIn, 
  refreshToken, 
  resetPassword, 
  verifyEmail 
} = authService;