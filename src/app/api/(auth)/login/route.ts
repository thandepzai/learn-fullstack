import { NextResponse } from "next/server";
import { loginUser } from "@/backend/module/auth/login";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await loginUser({
      email: body.email,
      password: body.password,
    });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("LOGIN_ROUTE_ERROR:", error);

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
