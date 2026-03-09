import bcrypt from "bcrypt";
import prisma from "@/backend/lib/prisma";

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
        id: number;
        email: string;
        name: string | null;
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

    return {
      success: true,
      message: "Đăng nhập thành công",
      status: 200,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
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
