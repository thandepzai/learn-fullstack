import { NextRequest, NextResponse } from "next/server";
import { me } from "@/backend/module/auth/me";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    const result = await me({
      authorization: authHeader || "",
    });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("ME_ROUTE_ERROR:", error);

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
