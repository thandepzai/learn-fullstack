import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { isOnServer } from "../utils/isOnServer";
import { BaseEndpoint } from "./endpoint";

/**
 * Kiểu response chung từ backend
 * Bạn có thể chỉnh lại theo format API thực tế của dự án
 */
export interface IResponseData<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  statusCode?: number;
}

/**
 * Mở rộng config để đánh dấu request đã retry sau refresh token
 */
interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Storage abstraction để dễ đổi localStorage -> cookie -> memory
 */
export interface TokenStorage {
  getAccessToken: () => string | null;
  setAccessToken?: (token: string) => void;
  clearAccessToken?: () => void;
}

/**
 * Cấu hình khởi tạo API client
 */
export interface CreateApiClientOptions {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
  refreshEndpoint?: string;
  tokenStorage?: TokenStorage;
  onUnauthorized?: () => void;
  /**
   * Nếu backend trả access token sau khi refresh:
   * ví dụ { data: { accessToken: "..." } }
   * thì dùng hàm này để extract token
   */
  getAccessTokenFromRefreshResponse?: (
    response: AxiosResponse<IResponseData<any>>,
  ) => string | null;
  /**
   * Nếu muốn return full response thay vì response.data
   */
  returnFullResponse?: boolean;
}

const defaultTokenStorage: TokenStorage = {
  getAccessToken: () => {
    if (isOnServer) return null;
    return localStorage.getItem("ACCESS_TOKEN");
  },
  setAccessToken: (token: string) => {
    if (isOnServer) return;
    localStorage.setItem("ACCESS_TOKEN", token);
  },
  clearAccessToken: () => {
    if (isOnServer) return;
    localStorage.removeItem("ACCESS_TOKEN");
  },
};

export const createApiClient = (options: CreateApiClientOptions = {}) => {
  const {
    baseURL = "",
    timeout = 30000,
    withCredentials = true,
    refreshEndpoint = BaseEndpoint.refreshToken,
    tokenStorage = defaultTokenStorage,
    onUnauthorized,
    getAccessTokenFromRefreshResponse,
    returnFullResponse = false,
  } = options;

  const api: AxiosInstance = axios.create({
    baseURL,
    timeout,
    withCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });

  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string | null) => void> = [];

  const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
    refreshSubscribers.push(callback);
  };

  const notifyTokenRefreshed = (token: string | null) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
  };

  /**
   * Gắn access token vào request
   */
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = tokenStorage.getAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  /**
   * Hàm refresh token
   */
  const refreshAccessToken = async (): Promise<string | null> => {
    const response = await axios.get<IResponseData<any>>(refreshEndpoint, {
      baseURL,
      withCredentials,
      timeout,
    });

    const newAccessToken =
      getAccessTokenFromRefreshResponse?.(response) ??
      response.data?.data?.accessToken ??
      null;

    if (newAccessToken && tokenStorage.setAccessToken) {
      tokenStorage.setAccessToken(newAccessToken);
    }

    return newAccessToken;
  };

  /**
   * Interceptor response:
   * - Nếu 401 -> refresh token
   * - Retry request cũ sau khi refresh thành công
   * - Nếu refresh fail -> clear token + callback logout
   */
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryAxiosRequestConfig;

      const isUnauthorized = error.response?.status === 401;
      const isRefreshRequest =
        originalRequest?.url?.includes(refreshEndpoint) ?? false;

      if (
        !isUnauthorized ||
        !originalRequest ||
        originalRequest._retry ||
        isRefreshRequest
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        notifyTokenRefreshed(newToken);

        if (!newToken) {
          tokenStorage.clearAccessToken?.();
          onUnauthorized?.();
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        notifyTokenRefreshed(null);
        tokenStorage.clearAccessToken?.();
        onUnauthorized?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  /**
   * Core request method
   */
  const request = async <TResponse = unknown>(
    config: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const response = await api.request<IResponseData<TResponse>>(config);

    if (returnFullResponse) {
      return response as TResponse;
    }

    return response.data.data;
  };

  /**
   * Các method tiện dụng
   */
  const get = <TResponse = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<TResponse>({
      ...config,
      method: "GET",
      url,
    });

  const post = <TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) =>
    request<TResponse>({
      ...config,
      method: "POST",
      url,
      data: body,
    });

  const put = <TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) =>
    request<TResponse>({
      ...config,
      method: "PUT",
      url,
      data: body,
    });

  const patch = <TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) =>
    request<TResponse>({
      ...config,
      method: "PATCH",
      url,
      data: body,
    });

  const remove = <TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ) =>
    request<TResponse>({
      ...config,
      method: "DELETE",
      url,
    });

  return {
    instance: api,
    request,
    get,
    post,
    put,
    patch,
    delete: remove,
  };
};

export default createApiClient;
