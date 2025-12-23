const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://backand-f86g.onrender.com';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  tg_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  video_limit: number;
  free_used: boolean;
  created_at: string;
}

export interface UserLimits {
  video_limit: number;
  free_used: boolean;
  videos_processed: number;
}

export interface VideoTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  download_url?: string;
  error?: string;
}

export interface UploadResponse {
  task_id: string;
  status: string;
}

export interface TelegramInvoiceResponse {
  success: boolean;
  message: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Telegram Auth - validates initData and returns JWT
  async authenticateWithTelegram(initData: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ init_data: initData }),
    });
    this.setToken(response.token);
    return response;
  }

  // User endpoints
  async getUser(): Promise<User> {
    return this.request('/user/me');
  }

  async getUserLimits(): Promise<UserLimits> {
    return this.request('/user/limits');
  }

  async deleteAccount(): Promise<void> {
    await this.request('/user/delete', { method: 'DELETE' });
    this.setToken(null);
  }

  // Video endpoints
  async uploadVideo(
    file: File,
    targetLanguage: string,
    userId?: number,
    voiceId?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_language', targetLanguage);
    
    if (userId) {
      formData.append('user_id', userId.toString());
    }
    
    if (voiceId) {
      formData.append('voice_id', voiceId);
    }

    // For progress tracking, we use XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.statusText || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      
      xhr.open('POST', `${this.baseUrl}/videos/upload`);
      
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      
      xhr.send(formData);
    });
  }

  async getTaskStatus(taskId: string): Promise<VideoTask> {
    return this.request(`/task-status?task_id=${taskId}`);
  }

  async getVideoHistory(): Promise<VideoTask[]> {
    return this.request('/videos/history');
  }

  // Telegram Bot Payment - sends invoice to user via Telegram Bot
  async requestTelegramInvoice(planId: string, telegramUserId: number): Promise<TelegramInvoiceResponse> {
    return this.request('/payments/telegram-invoice', {
      method: 'POST',
      body: JSON.stringify({ 
        plan_id: planId,
        telegram_user_id: telegramUserId 
      }),
    });
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const api = new ApiClient(API_URL);
