import jwt from "jsonwebtoken";
import prisma from "@/backend/lib/prisma";

type MePayload = {
  authorization: string;
};

type AccessTokenPayload = {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
};

type MeResult =
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
      status: 401 | 404 | 500;
      data: null;
      code?: string;
    };

export async function me(payload: MePayload): Promise<MeResult> {
  try {
    const authorization = String(payload.authorization || "").trim();

    if (!authorization) {
      return {
        success: false,
        message: "Thiếu authorization header",
        status: 401,
        data: null,
      };
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return {
        success: false,
        message: "Authorization không hợp lệ",
        status: 401,
        data: null,
      };
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as AccessTokenPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Không tìm thấy tài khoản",
        status: 404,
        data: null,
      };
    }

    return {
      success: true,
      message: "Lấy thông tin thành công",
      status: 200,
      data: user,
    };
  } catch (error) {
    console.error("ME_ERROR:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message: "Access token đã hết hạn",
        status: 401,
        data: null,
        code: "TOKEN_EXPIRED",
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        message: "Access token không hợp lệ",
        status: 401,
        data: null,
        code: "INVALID_TOKEN",
      };
    }

    return {
      success: false,
      message: "Lỗi server",
      status: 500,
      data: null,
    };
  }
}
