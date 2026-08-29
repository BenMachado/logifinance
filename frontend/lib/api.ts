"use client";

import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type {
  SmartReadBatchImportItem,
  SmartReadBatchImportResponse,
  SmartReadResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

if (typeof window !== "undefined") {
  console.log("[LogiFinance] API_BASE_URL =", API_BASE_URL);
}

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original: any = error.config;

    // 402 = assinatura necessária (gate do SubscriptionGate)
    if (error.response?.status === 402) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("logifinance:payment_required"));
      }
    }

    if (error.response?.status === 401 && !original?._retry) {
      const refresh = useAuthStore.getState().refreshToken;
      if (!refresh) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push((newToken: string) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refresh,
        });
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
        pendingQueue.forEach((cb) => cb(data.access_token));
        pendingQueue = [];
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a human-friendly error message from any Axios/fetch error. */
export function errorMessage(err: unknown, fallback = "Algo deu errado"): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string | { msg: string }[] })?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/* ----------------------------------------------------------------------- */
/*  Leitura Inteligente de Arquivos                                       */
/* ----------------------------------------------------------------------- */

/**
 * Envia um arquivo para o endpoint /smart-read.
 * Recebe um único item ou um link remoto via parâmetro ``url``.
 */
export async function smartReadFile(
  payload: { file?: File; url?: string; onProgress?: (pct: number) => void }
): Promise<SmartReadResponse> {
  const form = new FormData();
  if (payload.file) form.append("file", payload.file);
  if (payload.url) form.append("url", payload.url);

  const resp = await api.post<SmartReadResponse>("/smart-read", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (payload.onProgress && e.total) {
        payload.onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return resp.data;
}

/**
 * Importa em lote os itens confirmados como CostEntry.
 */
export async function smartReadImport(
  items: SmartReadBatchImportItem[]
): Promise<SmartReadBatchImportResponse> {
  const resp = await api.post<SmartReadBatchImportResponse>("/smart-read/import", { items });
  return resp.data;
}
