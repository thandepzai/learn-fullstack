"use client";

import { useState } from "react";

type RegisterResponse = {
  success: boolean;
  message: string;
  status: number;
  data: {
    id: number;
    name: string | null;
    email: string;
  } | null;
};

export default function RegisterView() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data: RegisterResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại");
        return;
      }

      setSuccess(data.message || "Đăng ký thành công");
      window.location.href = "/login";
    } catch (error) {
      console.error("REGISTER_FE_ERROR:", error);
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Đăng ký</h1>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Tên</label>
          <input
            name="name"
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập tên"
            disabled={loading}
          />
        </div>

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
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
