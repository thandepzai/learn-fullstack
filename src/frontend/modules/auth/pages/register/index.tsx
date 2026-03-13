"use client";

import { useState } from "react";
import { AuthService } from "../../service/auth";
import { useRouter } from "next/navigation";

export default function RegisterView() {
    const router = useRouter();
    const [error, setError] = useState("");

    const { registerMutation } = AuthService.useAuthAction();

    async function handleSubmit(formData: FormData) {
        setError("");

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        registerMutation.mutate(
            { registerData: { name, email, password } },
            {
                onSuccess: () => {
                    router.push("/login");
                },
                onError: (error) => {
                    console.log("🚀 ~ handleSubmit ~ error:", error);
                    setError("Có lỗi xảy ra, vui lòng thử lại");
                }
            }
        );
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
                        disabled={registerMutation.isPending}
                    />
                </div>

                <div>
                    <label className="block mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Nhập email"
                        disabled={registerMutation.isPending}
                    />
                </div>

                <div>
                    <label className="block mb-1">Mật khẩu</label>
                    <input
                        name="password"
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Nhập mật khẩu"
                        disabled={registerMutation.isPending}
                    />
                </div>

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
                >
                    {registerMutation.isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
                </button>
            </form>
        </div>
    );
}
