import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// 環境に応じたベースURL
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // ブラウザ環境
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  // サーバー環境
  return process.env.API_URL || 'http://localhost:3001';
};

// Axiosインスタンス作成
export const customInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// トークン管理
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// リクエストインターセプター
customInstance.interceptors.request.use(
  (config) => {
    // 認証トークンを自動で付与
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      );
      if (config.data) {
        console.log('📤 Request Data:', config.data);
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

// レスポンスインターセプター
customInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      );
      console.log('📥 Response Data:', response.data);
    }

    return response;
  },
  (error) => {
    // エラーログ
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // 認証エラー処理
    if (error.response?.status === 401) {
      // トークンを削除
      removeAuthToken();

      // ログインページにリダイレクト（ブラウザ環境のみ）
      if (typeof window !== 'undefined') {
        // React Router や Next.js Router を使用する場合は適切にリダイレクト
        window.location.href = '/login';
      }
    }

    // レート制限エラー処理
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`⏰ Rate limited. Retry after ${retryAfter} seconds`);
    }

    // ネットワークエラー処理
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network Error: Unable to connect to the API');
    }

    return Promise.reject(error);
  },
);

// カスタムインスタンス関数（Orval用）
export default <T = any>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = customInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore - Orvalが期待する形式
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// ユーティリティ関数をエクスポート
export const apiUtils = {
  setAuthToken,
  removeAuthToken,
  getAuthToken,

  // 手動でトークンをリフレッシュ
  async refreshToken(): Promise<boolean> {
    try {
      const response = await customInstance.post('/auth/refresh');
      const { token } = response.data;
      setAuthToken(token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      removeAuthToken();
      return false;
    }
  },

  // API接続テスト
  async testConnection(): Promise<boolean> {
    try {
      await customInstance.get('/health');
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  },

  // エラーメッセージの抽出
  extractErrorMessage(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // エラーコードの抽出
  extractErrorCode(error: any): string | null {
    return error.response?.data?.code || null;
  },
};
