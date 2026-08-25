"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchSubscription, type SubscriptionData } from "@/lib/payments";

export function SubscriptionBanner() {
  const { data: subscription } = useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!subscription) return null;

  const isActive = subscription.status === "active";
  const isTrial = subscription.status === "trial";

  if (isActive || isTrial) return null;

  const messages: Record<string, { text: string; color: string }> = {
    past_due: {
      text: "⚠️ Pagamento pendente. Atualize sua assinatura para manter o acesso.",
      color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    },
    cancelled: {
      text: "🚫 Sua assinatura foi cancelada. Escolha um plano para reativar.",
      color: "bg-red-500/10 border-red-500/30 text-red-400",
    },
    expired: {
      text: "⏰ Sua assinatura expirou. Escolha um plano para continuar.",
      color: "bg-red-500/10 border-red-500/30 text-red-400",
    },
  };

  const msg = messages[subscription.status];
  if (!msg) return null;

  return (
    <Link href="/assinatura">
      <div
        className={`flex items-center justify-between rounded-lg border p-sm cursor-pointer transition-opacity hover:opacity-90 ${msg.color}`}
      >
        <p className="text-sm font-medium m-0">{msg.text}</p>
        <span className="text-sm font-bold underline">Ver planos →</span>
      </div>
    </Link>
  );
}
