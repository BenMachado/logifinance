"use client";

import { api } from "@/lib/api";

export interface SubscriptionData {
  id: number;
  company_id: number;
  plan: "trial" | "starter" | "professional";
  status: "trial" | "active" | "past_due" | "cancelled" | "expired";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  trial_ends_at: string | null;
  fleet_size: number;
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface PlanPricing {
  plan: "starter" | "professional";
  name: string;
  price_cents: number;
  price_brl: number;
  currency: string;
  max_trucks: number | null;
  description: string;
}

export async function fetchSubscription(): Promise<SubscriptionData> {
  const { data } = await api.get("/payments/subscription");
  return data;
}

export async function fetchPlans(): Promise<PlanPricing[]> {
  const { data } = await api.get("/payments/plans");
  return data;
}

export async function createCheckout(payload: {
  success_url: string;
  cancel_url: string;
  plan?: string;
}): Promise<{ checkout_url: string; session_id: string }> {
  const { data } = await api.post("/payments/checkout", payload);
  return data;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function subscriptionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    trial: "Período de teste",
    active: "Ativa",
    past_due: "Pagamento pendente",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return labels[status] || status;
}

export function subscriptionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    trial: "info",
    active: "profit",
    past_due: "warning",
    cancelled: "destructive",
    expired: "destructive",
  };
  return colors[status] || "neutral";
}
