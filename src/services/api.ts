/**
 * Centralized API service for AWS integration
 * Handles all HTTP requests and prepares for AWS API Gateway
 */

import { CONFIG, FEATURES } from '@/config/flags';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.timeout = CONFIG.API_TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    if (FEATURES.DEBUG_MODE) {
      console.log(`API Request: ${options.method || 'GET'} ${url}`, config);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (FEATURES.DEBUG_MODE) {
        console.log(`API Response: ${url}`, data);
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown API error',
        status: error instanceof Error && 'status' in error ? (error as any).status : undefined,
      };

      if (FEATURES.DEBUG_MODE) {
        console.error(`API Error: ${url}`, apiError);
      }

      throw apiError;
    }
  }

  private getAuthToken(): string | null {
    // For now, get token from localStorage
    // This will be replaced with AWS Cognito integration
    return localStorage.getItem('auth_token');
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload with presigned URLs (AWS S3 compatible)
  async getUploadUrl(fileName: string, contentType: string): Promise<ApiResponse<{
    uploadUrl: string;
    fileUrl: string;
  }>> {
    return this.post('/upload-url', {
      fileName,
      contentType,
    });
  }

  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  }

  // Helper method for complete file upload flow
  async uploadFileComplete(file: File): Promise<string> {
    try {
      // Get presigned URL
      const { data: urlData } = await this.getUploadUrl(file.name, file.type);
      
      // Upload file to S3
      await this.uploadFile(urlData.uploadUrl, file);
      
      // Return the file URL
      return urlData.fileUrl;
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience
export const { get, post, put, patch, delete: del, getUploadUrl, uploadFile, uploadFileComplete } = apiService;