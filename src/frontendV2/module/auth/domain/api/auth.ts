import apiClient from "@/frontendV2/lib/api/request";
import { LoginDTO, RegisterDTO } from "../dto/auth";
import { AuthEndpoint } from "../../endpointUrl";

export const AuthApi = {
  async login(data: LoginDTO) {
    return apiClient.post(AuthEndpoint.login(), data);
  },
  async register(data: RegisterDTO) {
    return apiClient.post(AuthEndpoint.register(), data);
  },
  async getMe() {
    return apiClient.get(AuthEndpoint.login());
  },
};
