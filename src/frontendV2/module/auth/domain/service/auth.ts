import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginDTO, RegisterDTO, UserDTO } from "../dto/auth";
import { AuthApi } from "../api/auth";
import { IFetcherOptions, useFetcher } from "@/frontendV2/lib/hook/useFetcher";

interface UseMeOptions {
  fetcherOptions?: IFetcherOptions<UserDTO>;
}

export class AuthService {
  static AUTH_KEY = "AUTH_KEY";

  static useMe = ({ fetcherOptions = {} }: UseMeOptions) => {
    const { data, isPending, isFetching, isError, error } = useFetcher(
      [AuthService.AUTH_KEY],
      () => AuthApi.getMe(),
      fetcherOptions,
    );

    return {
      data,
      isPending,
      isFetching,
      isError,
      error,
    };
  };

  static useAuthAction = () => {
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
      mutationFn: (data: LoginDTO) => AuthApi.login(data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [AuthService.AUTH_KEY],
        });
      },
    });

    const registerMutation = useMutation({
      mutationFn: (data: RegisterDTO) => AuthApi.register(data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [AuthService.AUTH_KEY],
        });
      },
    });

    return {
      loginMutation,
      registerMutation,
    };
  };
}
