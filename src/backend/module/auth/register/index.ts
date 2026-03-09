import bcrypt from "bcrypt";
import prisma from "@/backend/lib/prisma";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "")
    .trim()
    .toLowerCase();
  const password = String(payload.password || "");

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Thiếu name, email hoặc password",
      status: 400,
      data: null,
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "Mật khẩu phải có ít nhất 8 ký tự",
      status: 400,
      data: null,
    };
  }

  const existedUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existedUser) {
    return {
      success: false,
      message: "Email đã tồn tại",
      status: 409,
      data: null,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return {
    success: true,
    message: "Đăng ký thành công",
    status: 201,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  };
}
