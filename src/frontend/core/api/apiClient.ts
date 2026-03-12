import axios, { AxiosInstance } from "axios";
import { isOnServer } from "../utils/isOnServer";
import { BaseEndpoint } from "./endpoint";
import { IResponseData } from "../types/apiReponse";

const severAxios = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

severAxios.interceptors.request.use((config) => {
  if (!isOnServer) {
    const accessToken = localStorage.getItem("ACCESS_TOKEN");
    if (accessToken) {
      config.headers.Authorization =
        "Bearer " + localStorage.getItem("ACCESS_TOKEN");
    }
  }

  return config;
});

interface RequestApiProps {
  endPoint?: string;
  functionRequest?: AxiosInstance;
  handleData?: void;
  boundedTime?: number;
}
const requestApi = ({}: RequestApiProps) => {
  const handleRequest = async (
    requestFunc: (url: string) => Promise<{ data: IResponseData } | Response>,
    url = "",
  ): Promise<IResponseData> => {
    try {
      const response = await requestFunc(url);
      if (response instanceof Response) {
        return response.json();
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const data = await requestApi({
        requestFunc: () =>
          severAxios.get(BaseEndpoint.refreshToken, {
            withCredentials: true,
          }),
        handleData: (data) => data.data,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };
};

export default requestApi;
