const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://backand-ycca.onrender.com';

// Storage keys
const CODE_STORAGE_KEY = 'user_code';

// Helper to get stored code
export function getStoredCode(): string | null {
  return localStorage.getItem(CODE_STORAGE_KEY);
}

// Helper to save code
export function saveCode(code: string): void {
  localStorage.setItem(CODE_STORAGE_KEY, code);
}

// Helper to clear code
export function clearCode(): void {
  localStorage.removeItem(CODE_STORAGE_KEY);
}

// API Response types
export interface GenerateCodeResponse {
  code: string;
}

export interface StatusResponse {
  minutes_left: number;
  is_active: boolean;
}

export interface TranslateResponse {
  task_id: string;
  status: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  download_url?: string;
  error?: string;
}

export interface ConnectTelegramResponse {
  success: boolean;
  minutes_left: number;
  message?: string;
}

// 1. Generate a new user code
export async function generateCode(): Promise<GenerateCodeResponse> {
  const response = await fetch(`${API_URL}/generate-code`);
  if (!response.ok) {
    throw new Error('Failed to generate code');
  }
  const data = await response.json();
  // Auto-save the generated code
  if (data.code) {
    saveCode(data.code);
  }
  return data;
}

// 2. Check user status
export async function checkStatus(code: string): Promise<StatusResponse> {
  const response = await fetch(`${API_URL}/status?code=${code}`);
  if (!response.ok) {
    throw new Error('Failed to check status');
  }
  return response.json();
}

// 3. Translate video
export async function translateVideo(
  file: File,
  code: string,
  targetLanguage: string,
  onProgress?: (progress: number) => void
): Promise<TranslateResponse> {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('code', code);
  formData.append('target_language', targetLanguage);

  // Use XMLHttpRequest for progress tracking
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

    xhr.open('POST', `${API_URL}/translate`);
    xhr.send(formData);
  });
}

// 4. Get task status
export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await fetch(`${API_URL}/task-status?task_id=${taskId}`);
  if (!response.ok) {
    throw new Error('Failed to get task status');
  }
  return response.json();
}

// 5. Connect Telegram (auth)
export async function connectTelegram(code: string, initData: string): Promise<ConnectTelegramResponse> {
  const response = await fetch(`${API_URL}/auth-telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, init_data: initData }),
  });
  if (!response.ok) {
    throw new Error('Failed to connect Telegram');
  }
  return response.json();
}

// Legacy API client for backward compatibility (if needed)
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
  minutes_left?: number;
}

// Utility to check if user is connected
export async function isUserConnected(): Promise<boolean> {
  const code = getStoredCode();
  if (!code) return false;
  
  try {
    const status = await checkStatus(code);
    return status.is_active;
  } catch {
    return false;
  }
}

// Get user limits using the new API
export async function getUserLimits(): Promise<UserLimits> {
  const code = getStoredCode();
  if (!code) {
    throw new Error('No user code found');
  }
  
  const status = await checkStatus(code);
  return {
    video_limit: status.minutes_left,
    free_used: false,
    videos_processed: 0,
    minutes_left: status.minutes_left,
  };
}
