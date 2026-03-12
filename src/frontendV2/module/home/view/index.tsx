"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  name: string | null;
};

const HomeView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getMe = async () => {
      try {
        let accessToken = localStorage.getItem("ACCESS_TOKEN");
        const refreshToken = localStorage.getItem("REFRESH_TOKEN");

        if (!accessToken) {
          setError("Chưa đăng nhập");
          return;
        }

        let res = await fetch("/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let data = await res.json();

        if (!res.ok && data.code === "TOKEN_EXPIRED") {
          if (!refreshToken) {
            setError("Phiên đăng nhập đã hết hạn");
            return;
          }

          const refreshRes = await fetch("/api/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken,
            }),
          });

          const refreshData = await refreshRes.json();

          if (!refreshRes.ok) {
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("REFRESH_TOKEN");
            localStorage.removeItem("USER_INFO");
            setError(refreshData.message || "Phiên đăng nhập đã hết hạn");
            return;
          }

          accessToken = refreshData.data.accessToken;
          const newRefreshToken = refreshData.data.refreshToken;

          localStorage.setItem("ACCESS_TOKEN", accessToken);
          localStorage.setItem("REFRESH_TOKEN", newRefreshToken);

          res = await fetch("/api/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          data = await res.json();
        }

        if (!res.ok) {
          setError(data.message || "Không lấy được thông tin user");
          return;
        }

        setUser(data.data);
        localStorage.setItem("USER_INFO", JSON.stringify(data.data));
      } catch (err) {
        setError("Có lỗi xảy ra");
      }
    };

    getMe();
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}

      {user && (
        <div>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
