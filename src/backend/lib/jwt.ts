import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Thiếu ACCESS_TOKEN_SECRET hoặc REFRESH_TOKEN_SECRET");
}

export const TIME_REFRESH_TOKEN_DAY = 30;
export const TIME_TOKEN_MINUTE = 1;

type TokenPayload = {
  userId: number;
  email: string;
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: `${TIME_TOKEN_MINUTE}m`,
  });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: `${TIME_REFRESH_TOKEN_DAY}d`,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
}
