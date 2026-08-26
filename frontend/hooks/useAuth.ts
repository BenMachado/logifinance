"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthUser } from "@/stores/authStore";
import { api, errorMessage } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const { accessToken, user, setUser, setTokens, logout } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    if (user) return;
    api
      .get<AuthUser>("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => {
        logout();
        router.push("/login");
      });
  }, [accessToken, user, setUser, logout, router]);

  return {
    accessToken,
    user,
    isAuthenticated: !!accessToken,
    setUser,
    setTokens,
    logout,
  };
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  setTokensExternal(data.access_token, data.refresh_token);
  return data as { access_token: string; refresh_token: string; token_type: string };
}

export async function registerRequest(payload: {
  company_name: string;
  full_name: string;
  username?: string;
  cpf?: string;
  email: string;
  password: string;
  cnpj?: string;
  phone?: string;
  accept_terms?: boolean;
}) {
  const { data } = await api.post("/auth/register", payload);
  return data as {
    user: AuthUser;
    company_id: number;
    company_name: string;
  };
}

function setTokensExternal(access: string, refresh: string) {
  useAuthStore.getState().setTokens(access, refresh);
}
