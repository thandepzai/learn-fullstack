import { apiRequest } from "@/frontend/core/api/api";
import { AuthEndpoint } from "./endpoint";
import { LoginDTO, LoginResponseDTO, RegisterDTO } from "../dto/auth";

export const AuthApi = {
    register: (body: RegisterDTO) =>
        apiRequest({
            method: "POST",
            url: AuthEndpoint.login,
            data: body,
            transform: (response) => response.data
        }),

    login: async (body: LoginDTO) =>
        await apiRequest({
            method: "POST",
            url: AuthEndpoint.login,
            data: body,
            transform: (response: LoginResponseDTO) => response.data
        })
};
