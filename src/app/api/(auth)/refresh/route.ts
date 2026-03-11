import { NextResponse } from "next/server";
import { refreshToken } from "@/backend/module/auth/refresh";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await refreshToken({ refreshToken: body.refreshToken });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("REFRESH_ROUTE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server",
        status: 500,
        data: null,
      },
      { status: 500 },
    );
  }
}
