import { ISuccessResponse } from "@/frontend/core/types/apiReponse";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export type LoginResponseDTO = ISuccessResponse<{
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}>;
