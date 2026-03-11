"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginResponse = {
  success: boolean;
  message: string;
  status: number;
  data: {
    user: {
      id: number;
      name: string | null;
      email: string;
    };
    accessToken: string;
    refreshToken: string;
  } | null;
};

export default function LoginView() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);

    try {
      const email = String(formData.get("email") || "")
        .trim()
        .toLowerCase();
      const password = String(formData.get("password") || "");

      if (!email || !password) {
        setError("Vui lòng nhập email và mật khẩu");
        return;
      }

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok || !data || !data.data) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }

      localStorage.setItem("ACCESS_TOKEN", data.data.accessToken);
      localStorage.setItem("REFRESH_TOKEN", data.data.refreshToken);
      localStorage.setItem("USER_INFO", JSON.stringify(data.data.user));

      router.push("/");
    } catch (error) {
      console.error("LOGIN_FE_ERROR:", error);
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            name="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập email"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1">Mật khẩu</label>
          <input
            name="password"
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
