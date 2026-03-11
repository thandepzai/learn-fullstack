import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type ApiErrorResponse = {
  success?: false;
  message?: string;
  status?: number;
  code?: string;
  data?: null;
};

type RetryAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const BASE_URL = process.env.mapStudyHost ?? "/api";

const isOnServer = () => typeof window === "undefined";

/* ==== Khởi tạo ==== */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===== Setup Request ===== */
apiClient.interceptors.request.use(
  (config) => {
    if (!isOnServer()) {
      const accessToken = localStorage.getItem("ACCESS_TOKEN");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ===== Setup Response ===== */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const errorCode = error.response.data?.code;

    const isTokenExpired =
      errorCode === "TOKEN_EXPIRED" && !originalRequest._retry;

    if (!isTokenExpired || isOnServer()) return Promise.reject(error);

    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");

      if (!refreshToken) {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER_INFO");
      }

      const refreshResponse = await apiClient.post(
        `${BASE_URL}/refresh`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const newAccessToken = refreshResponse.data?.data?.accessToken;
      const newRefreshToken = refreshResponse.data?.data?.refreshToken;

      if (!newAccessToken || !newRefreshToken) {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER_INFO");
        return Promise.reject(error);
      }

      localStorage.setItem("ACCESS_TOKEN", newAccessToken);
      localStorage.setItem("REFRESH_TOKEN", newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      if (!isOnServer()) {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER_INFO");
      }

      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
