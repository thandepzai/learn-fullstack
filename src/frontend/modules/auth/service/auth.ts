import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "../api/auth";
import { LoginDTO, RegisterDTO } from "../dto/auth";

const AUTH_KEY = "AUTH_KEY";

const useAuthAction = () => {
    const queryClient = useQueryClient();

    const registerMutation = useMutation({
        mutationFn: ({ registerData }: { registerData: RegisterDTO }) => AuthApi.register(registerData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
        }
    });

    const loginMutation = useMutation({
        mutationFn: ({ loginData }: { loginData: LoginDTO }) => AuthApi.login(loginData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AUTH_KEY] });
        }
    });

    return { registerMutation, loginMutation };
};

export const AuthService = { useAuthAction };
