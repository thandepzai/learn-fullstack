import { isOnServer } from "../utils/isOnServer";
import axios, { AxiosRequestConfig } from "axios";
import { getAccessToken } from "../utils/localAccessToken";
import { ISuccessResponse } from "../types/apiReponse";

/* ===== 1. Khởi tạo Axios ===== */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    if (!isOnServer) {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/* ===== 2. Xây dựng request ===== */
type RequestConfig<TData> = AxiosRequestConfig & {
    transform?: (data: ISuccessResponse) => TData;
};

export const apiRequest = async <TData = unknown>(config: RequestConfig<TData>): Promise<TData> => {
    const { transform = (data) => data as TData, ...axiosConfig } = config;

    const response = await api.request<ISuccessResponse>(axiosConfig);

    return transform(response.data);
};
