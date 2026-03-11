import bcrypt from "bcrypt";
import prisma from "@/backend/lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  TIME_REFRESH_TOKEN_DAY,
} from "@/backend/lib/jwt";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult =
  | {
      success: true;
      message: string;
      status: 200;
      data: {
        user: {
          id: number;
          email: string;
          name: string | null;
        };
        accessToken: string;
        refreshToken: string;
      };
    }
  | {
      success: false;
      message: string;
      status: 400 | 401 | 404 | 500;
      data: null;
    };

export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  try {
    const email = String(payload.email || "")
      .trim()
      .toLowerCase();
    const password = String(payload.password || "");

    if (!email || !password) {
      return {
        success: false,
        message: "Thiếu email hoặc password",
        status: 400,
        data: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Không tìm thấy tài khoản",
        status: 404,
        data: null,
      };
    }

    if (!user.password) {
      return {
        success: false,
        message: "Tài khoản không hợp lệ",
        status: 401,
        data: null,
      };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return {
        success: false,
        message: "Sai mật khẩu",
        status: 401,
        data: null,
      };
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    const refreshTokenExpiresAt = new Date(
      Date.now() + TIME_REFRESH_TOKEN_DAY * 24 * 60 * 60 * 1000,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpiresAt,
      },
    });

    return {
      success: true,
      message: "Đăng nhập thành công",
      status: 200,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    console.error("LOGIN_USER_ERROR:", error);

    return {
      success: false,
      message: "Lỗi server",
      status: 500,
      data: null,
    };
  }
}
