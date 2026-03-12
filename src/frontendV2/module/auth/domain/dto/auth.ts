export interface UserDTO {
  id: string;
  name: string;
  email: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
