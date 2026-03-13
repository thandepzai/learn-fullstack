"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "../../service/auth";

const LoginView = () => {
    const router = useRouter();
    const [error, setError] = useState("");

    const { loginMutation } = AuthService.useAuthAction();

    async function handleSubmit(formData: FormData) {
        setError("");

        const email = String(formData.get("email") || "")
            .trim()
            .toLowerCase();
        const password = String(formData.get("password") || "");

        if (!email || !password) {
            setError("Vui lòng nhập email và mật khẩu");
            return;
        }
        loginMutation.mutate(
            { loginData: { email, password } },
            {
                onSuccess: (data) => {
                    localStorage.setItem("ACCESS_TOKEN", data.accessToken);
                    localStorage.setItem("REFRESH_TOKEN", data.refreshToken);
                    localStorage.setItem("USER_INFO", JSON.stringify(data.user));

                    router.push("/");
                },
                onError: (error) => {
                    console.log("🚀 ~ handleSubmit ~ error:", error);
                }
            }
        );
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
                        disabled={loginMutation.isPending}
                    />
                </div>

                <div>
                    <label className="block mb-1">Mật khẩu</label>
                    <input
                        name="password"
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Nhập mật khẩu"
                        disabled={loginMutation.isPending}
                    />
                </div>

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
                >
                    {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
};

export default LoginView;
