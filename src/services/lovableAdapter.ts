/**
 * Lovable SDK adapter with safe fallbacks
 * Wraps Lovable-specific features to prevent runtime errors when SDK is not available
 */

import { FEATURES } from '@/config/flags';

interface LovableTag {
  tagName: string;
  attributes?: Record<string, string>;
}

interface LovableConfig {
  apiKey?: string;
  environment?: string;
}

class LovableAdapter {
  private isInitialized: boolean = false;
  private lovableSDK: any = null;

  constructor() {
    this.initializeLovable();
  }

  private initializeLovable(): void {
    try {
      // Check if Lovable features are enabled
      if (!FEATURES.ENABLE_LOVABLE_FEATURES) {
        if (FEATURES.DEBUG_MODE) {
          console.log('Lovable features disabled via feature flag');
        }
        return;
      }

      // Check if Lovable SDK is available globally
      if (typeof window !== 'undefined' && (window as any).Lovable) {
        this.lovableSDK = (window as any).Lovable;
        this.isInitialized = true;
        
        if (FEATURES.DEBUG_MODE) {
          console.log('Lovable SDK initialized');
        }
      } else {
        if (FEATURES.DEBUG_MODE) {
          console.log('Lovable SDK not available');
        }
      }
    } catch (error) {
      console.warn('Lovable SDK initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Configure Lovable SDK
   */
  configure(config: LovableConfig): void {
    try {
      if (!this.isAvailable()) {
        if (FEATURES.DEBUG_MODE) {
          console.log('Lovable SDK not available for configuration');
        }
        return;
      }

      if (this.lovableSDK.configure) {
        this.lovableSDK.configure(config);
        
        if (FEATURES.DEBUG_MODE) {
          console.log('Lovable SDK configured:', config);
        }
      }
    } catch (error) {
      console.warn('Lovable SDK configuration failed:', error);
    }
  }

  /**
   * Track user events
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    try {
      if (!this.isAvailable()) {
        if (FEATURES.DEBUG_MODE) {
          console.log(`Would track event: ${eventName}`, properties);
        }
        return;
      }

      if (this.lovableSDK.track) {
        this.lovableSDK.track(eventName, properties);
        
        if (FEATURES.DEBUG_MODE) {
          console.log(`Tracked event: ${eventName}`, properties);
        }
      }
    } catch (error) {
      console.warn('Event tracking failed:', error);
    }
  }

  /**
   * Tag UI components for Lovable
   */
  tagComponent(element: HTMLElement, tag: LovableTag): void {
    try {
      if (!this.isAvailable() || !element) {
        if (FEATURES.DEBUG_MODE) {
          console.log(`Would tag component: ${tag.tagName}`);
        }
        return;
      }

      if (this.lovableSDK.tagComponent) {
        this.lovableSDK.tagComponent(element, tag);
        
        if (FEATURES.DEBUG_MODE) {
          console.log(`Tagged component: ${tag.tagName}`, tag.attributes);
        }
      } else {
        // Fallback: add data attributes
        element.setAttribute('data-lovable-tag', tag.tagName);
        if (tag.attributes) {
          Object.entries(tag.attributes).forEach(([key, value]) => {
            element.setAttribute(`data-lovable-${key}`, value);
          });
        }
      }
    } catch (error) {
      console.warn('Component tagging failed:', error);
    }
  }

  /**
   * Get user insights
   */
  async getUserInsights(userId: string): Promise<any> {
    try {
      if (!this.isAvailable()) {
        if (FEATURES.DEBUG_MODE) {
          console.log(`Would fetch insights for user: ${userId}`);
        }
        return null;
      }

      if (this.lovableSDK.getUserInsights) {
        const insights = await this.lovableSDK.getUserInsights(userId);
        
        if (FEATURES.DEBUG_MODE) {
          console.log(`Fetched insights for user: ${userId}`, insights);
        }
        
        return insights;
      }
    } catch (error) {
      console.warn('Failed to fetch user insights:', error);
      return null;
    }
  }

  /**
   * Send feedback
   */
  async sendFeedback(feedback: {
    type: 'bug' | 'feature' | 'general';
    message: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        if (FEATURES.DEBUG_MODE) {
          console.log('Would send feedback:', feedback);
        }
        return false;
      }

      if (this.lovableSDK.sendFeedback) {
        await this.lovableSDK.sendFeedback(feedback);
        
        if (FEATURES.DEBUG_MODE) {
          console.log('Feedback sent:', feedback);
        }
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to send feedback:', error);
      return false;
    }

    return false;
  }

  /**
   * Initialize chat widget
   */
  initializeChatWidget(containerId?: string): void {
    try {
      if (!this.isAvailable()) {
        if (FEATURES.DEBUG_MODE) {
          console.log('Would initialize chat widget');
        }
        return;
      }

      if (this.lovableSDK.initChat) {
        this.lovableSDK.initChat(containerId);
        
        if (FEATURES.DEBUG_MODE) {
          console.log('Chat widget initialized');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize chat widget:', error);
    }
  }

  /**
   * Update user profile
   */
  updateUserProfile(profile: {
    userId: string;
    email?: string;
    name?: string;
    metadata?: Record<string, any>;
  }): void {
    try {
      if (!this.isAvailable()) {
        if (FEATURES.DEBUG_MODE) {
          console.log('Would update user profile:', profile);
        }
        return;
      }

      if (this.lovableSDK.updateProfile) {
        this.lovableSDK.updateProfile(profile);
        
        if (FEATURES.DEBUG_MODE) {
          console.log('User profile updated:', profile);
        }
      }
    } catch (error) {
      console.warn('Failed to update user profile:', error);
    }
  }

  /**
   * Check if Lovable SDK is available and initialized
   */
  isAvailable(): boolean {
    return this.isInitialized && this.lovableSDK !== null;
  }

  /**
   * Get SDK version
   */
  getVersion(): string | null {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      return this.lovableSDK.version || null;
    } catch (error) {
      console.warn('Failed to get SDK version:', error);
      return null;
    }
  }
}

// Export singleton instance
export const lovableAdapter = new LovableAdapter();

// Export individual methods for convenience
export const {
  configure,
  trackEvent,
  tagComponent,
  getUserInsights,
  sendFeedback,
  initializeChatWidget,
  updateUserProfile,
  isAvailable,
  getVersion
} = lovableAdapter;