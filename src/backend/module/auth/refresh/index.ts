import prisma from "@/backend/lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  TIME_REFRESH_TOKEN_DAY,
  verifyRefreshToken,
} from "@/backend/lib/jwt";

type RefreshResult =
  | {
      success: true;
      message: string;
      status: 200;
      data: {
        accessToken: string;
        refreshToken: string;
      };
    }
  | {
      success: false;
      message: string;
      status: 401 | 404 | 500;
      data: null;
    };

export async function refreshToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<RefreshResult> {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return {
        success: false,
        message: "Không tìm thấy user",
        status: 404,
        data: null,
      };
    }

    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      return {
        success: false,
        message: "Refresh token không hợp lệ",
        status: 401,
        data: null,
      };
    }

    if (
      user.refreshTokenExpiresAt &&
      user.refreshTokenExpiresAt.getTime() < Date.now()
    ) {
      return {
        success: false,
        message: "Refresh token đã hết hạn",
        status: 401,
        data: null,
      };
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    const refreshTokenExpiresAt = new Date(
      Date.now() + TIME_REFRESH_TOKEN_DAY * 24 * 60 * 60 * 1000,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt,
      },
    });

    return {
      success: true,
      message: "Refresh token thành công",
      status: 200,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  } catch {
    return {
      success: false,
      message: "Refresh token không hợp lệ hoặc đã hết hạn",
      status: 401,
      data: null,
    };
  }
}
