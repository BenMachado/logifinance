"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchSubscription,
  createCheckout,
  formatPrice,
  formatDate,
  subscriptionStatusLabel,
  subscriptionStatusColor,
  type SubscriptionData,
} from "@/lib/payments";
import { useAuthStore } from "@/stores/authStore";

const PLANS = [
  {
    id: "starter",
    name: "Essencial",
    price: "R$ 579",
    period: "/mês",
    maxTrucks: 15,
    description: "Até 15 caminhões",
    features: [
      "Até 15 veículos na frota",
      "Controle completo de custos",
      "Leitura inteligente de recibos",
      "Dashboard financeiro",
      "Alertas de margem",
      "Suporte por email",
    ],
  },
  {
    id: "professional",
    name: "Premium",
    price: "R$ 799",
    period: "/mês",
    maxTrucks: null,
    description: "Mais de 15 caminhões",
    features: [
      "Veículos ilimitados na frota",
      "Tudo do plano Starter",
      "Relatórios avançados",
      "Exportação CSV",
      "Suporte prioritário",
      "Acesso a novos recursos",
    ],
  },
] as const;

export default function AssinaturaPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: subscription, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (plan: string) => {
      const origin = window.location.origin;
      return createCheckout({
        success_url: `${origin}/assinatura?success=true`,
        cancel_url: `${origin}/assinatura?canceled=true`,
        plan,
      });
    },
    onSuccess: (data) => {
      if (data.session_id === "portal") {
        window.location.href = data.checkout_url;
      } else {
        window.location.href = data.checkout_url;
      }
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail || "Erro ao criar sessão de pagamento");
    },
  });

  const isActive = subscription?.status === "active" || subscription?.status === "trial";
  const isTrial = subscription?.status === "trial";
  const isPastDue = subscription?.status === "past_due";
  const isCancelled = subscription?.status === "cancelled" || subscription?.status === "expired";

  return (
    <section className="flex flex-col gap-margin">
      <div>
        <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">
          Assinatura
        </h1>
        <p className="text-data-mono-sm text-secondary">
          Gerencie seu plano e pagamento
        </p>
      </div>

      {/* Current Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Status da Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            <div className="flex flex-wrap items-center gap-md">
              <div className="flex flex-col gap-xs">
                <span className="text-data-mono-sm text-secondary">Plano atual</span>
                <span className="text-body-lg font-bold text-tertiary capitalize">
                  {subscription.plan === "professional"
                    ? "Premium"
                    : subscription.plan === "starter"
                    ? "Essencial"
                    : "Trial"}
                </span>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="text-data-mono-sm text-secondary">Status</span>
                <Badge variant={subscriptionStatusColor(subscription.status) as any}>
                  {subscriptionStatusLabel(subscription.status)}
                </Badge>
              </div>
              {subscription.price_cents > 0 && (
                <div className="flex flex-col gap-xs">
                  <span className="text-data-mono-sm text-secondary">Valor mensal</span>
                  <span className="text-body-lg font-bold text-tertiary">
                    {formatPrice(subscription.price_cents)}
                  </span>
                </div>
              )}
              {subscription.current_period_end && (
                <div className="flex flex-col gap-xs">
                  <span className="text-data-mono-sm text-secondary">
                    {isCancelled ? "Encerra em" : "Próxima cobrança"}
                  </span>
                  <span className="text-body-lg font-bold text-tertiary">
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-xs">
                <span className="text-data-mono-sm text-secondary">Frota atual</span>
                <span className="text-body-lg font-bold text-tertiary">
                  {subscription.fleet_size} veículo{subscription.fleet_size !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {isPastDue && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-sm">
                <p className="text-sm text-yellow-400 m-0">
                  ⚠️ Pagamento pendente. Atualize sua forma de pagamento para manter o acesso.
                </p>
              </div>
            )}

            {isCancelled && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-sm">
                <p className="text-sm text-red-400 m-0">
                  Sua assinatura foi cancelada. Escolha um plano abaixo para reativar.
                </p>
              </div>
            )}

            {isActive && (
              <div className="flex gap-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => checkoutMutation.mutate(subscription.plan)}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Redirecionando..." : "Gerenciar no Stripe"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Selection */}
      <div>
        <h2 className="font-display text-headline-sm font-bold text-tertiary m-0 mb-md">
          {isActive ? "Mudar de plano" : "Escolha seu plano"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-margin">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isRecommended =
              plan.id === "professional" && (subscription?.fleet_size ?? 0) > 15;

            return (
              <Card
                key={plan.id}
                className={isCurrentPlan ? "border-[hsl(226,71%,40%)]" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {isRecommended && (
                      <Badge variant="profit">Recomendado</Badge>
                    )}
                    {isCurrentPlan && (
                      <Badge variant="info">Plano atual</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-md">
                  <p className="text-data-mono-sm text-secondary m-0">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-heading">{plan.price}</span>
                    <span className="text-sm text-[#666]">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#aaa]">
                        <span className="mt-0.5 text-[hsl(217,91%,60%)]">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={isCurrentPlan ? "outline" : "default"}
                    size="lg"
                    disabled={isCurrentPlan || checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate(plan.id)}
                  >
                    {isCurrentPlan
                      ? "Plano atual"
                      : checkoutMutation.isPending
                      ? "Redirecionando..."
                      : "Assinar agora"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="flex flex-col gap-sm pt-6">
          <p className="text-sm text-secondary m-0">
            💳 Pagamento via <strong>PIX</strong> (sem taxas) ou <strong>cartão de crédito</strong> (taxa de 3,99% + R$ 0,39 por transação).
          </p>
          <p className="text-sm text-secondary m-0">
            🔒 Pagamentos processados pela <strong>Stripe</strong>. Não armazenamos dados do seu cartão.
          </p>
          <p className="text-sm text-secondary m-0">
            ❓ Dúvidas? Entre em contato: <strong>suporte@logifinance.com.br</strong>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
