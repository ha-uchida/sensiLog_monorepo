import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );
          
          const { accessToken } = response.data;
          localStorage.setItem('token', accessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return AXIOS_INSTANCE(originalRequest);
        }
      } catch (refreshError) {
        // リフレッシュ失敗時はログアウト処理
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// APIユーティリティ
export const apiUtils = {
  getAuthToken: () => localStorage.getItem('token'),
  setAuthToken: (token: string) => localStorage.setItem('token', token),
  removeAuthToken: () => localStorage.removeItem('token'),
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setRefreshToken: (token: string) => localStorage.setItem('refreshToken', token),
  removeRefreshToken: () => localStorage.removeItem('refreshToken'),
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;