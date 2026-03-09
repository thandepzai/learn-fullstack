"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginView() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }

    window.location.href = "/";
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
          />
        </div>

        <div>
          <label className="block mb-1">Mật khẩu</label>
          <input
            name="password"
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập mật khẩu"
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded bg-black py-2 text-white"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
