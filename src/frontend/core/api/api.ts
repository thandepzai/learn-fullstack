import axios, { AxiosRequestConfig } from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../utils/accessToken";
import { BaseEndpoint } from "./endpoint";
import { isOnServer } from "../utils/isOnServer";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  statusCode?: number;
}

type Transform<TData, TResult> = (data: TData) => TResult;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

const refreshToken = async () => {
  const response = await axios.get<ApiResponse<{ accessToken: string }>>(
    BaseEndpoint.refreshToken(),
    { withCredentials: true },
  );

  const newToken = response.data.data.accessToken;

  if (newToken) setAccessToken(newToken);

  return newToken;
};


const request = async <TData = unknown, TResult = TData>(
  config: AxiosRequestConfig,
  transform?: Transform<TData, TResult>,
): Promise<TResult> => {
  const response = await api.request<ApiResponse<TData>>(config);
  const data = response.data.data;

  return transform ? transform(data) : (data as TResult);
};

export const apiClient = {
  get: <TData = unknown, TResult = TData>(
    url: string,
    config?: AxiosRequestConfig,
    transform?: Transform<TData, TResult>,
  ) =>
    request<TData, TResult>(
      {
        ...config,
        method: "GET",
        url,
      },
      transform,
    ),

  post: <TData = unknown, TBody = unknown, TResult = TData>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
    transform?: Transform<TData, TResult>,
  ) =>
    request<TData, TResult>(
      {
        ...config,
        method: "POST",
        url,
        data: body,
      },
      transform,
    ),

  put: <TData = unknown, TBody = unknown, TResult = TData>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
    transform?: Transform<TData, TResult>,
  ) =>
    request<TData, TResult>(
      {
        ...config,
        method: "PUT",
        url,
        data: body,
      },
      transform,
    ),

  patch: <TData = unknown, TBody = unknown, TResult = TData>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
    transform?: Transform<TData, TResult>,
  ) =>
    request<TData, TResult>(
      {
        ...config,
        method: "PATCH",
        url,
        data: body,
      },
      transform,
    ),

  delete: <TData = unknown, TResult = TData>(
    url: string,
    config?: AxiosRequestConfig,
    transform?: Transform<TData, TResult>,
  ) =>
    request<TData, TResult>(
      {
        ...config,
        method: "DELETE",
        url,
      },
      transform,
    ),

  upload: <TData = unknown, TResult = TData>(
    url: string,
    formData: FormData,
    transform?: Transform<TData, TResult>,
  ) =>
    request<TData, TResult>(
      {
        method: "POST",
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      transform,
    ),
};
