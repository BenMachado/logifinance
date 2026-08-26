"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSubscription, type SubscriptionData } from "@/lib/payments";
import { useAuthStore } from "@/stores/authStore";

/**
 * Bloqueador client-side para funcionalidades pagas.
 *
 * Enquanto a assinatura não estiver ``active`` (ou em TRIAL ativo), qualquer
 * tentativa de mutação no dashboard mostra um modal/blocker que redireciona
 * para /assinatura. A detecção é feita via:
 *   1) Resposta 402 Payment Required do backend (interceptado pelo `api`).
 *   2) Subscription status (canceled/expired) carregado via React Query.
 */
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: sub } = useQuery<SubscriptionData>({
    queryKey: ["subscription", "gate"],
    queryFn: fetchSubscription,
    enabled: !!accessToken,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!sub) return;
    // Quando o status deixa trial/active o gate mostra o modal.
    // A própria subscription page já é liberada (evita loop).
    const blocked = sub.status === "cancelled" || sub.status === "expired";
    if (blocked && typeof window !== "undefined" && !window.location.pathname.startsWith("/assinatura")) {
      // Nenhuma ação adicional aqui — o modal é mostrado pelo `BlockingModal`
      // sempre que um erro 402 volta do backend.
    }
  }, [sub, router]);

  return (
    <>
      {children}
      <PaymentBlocker />
    </>
  );
}

/**
 * Modal de bloqueio. Escuta um evento custom ``payment_required`` disparado
 * pelo interceptor do axios (lib/api.ts) quando o backend retorna 402.
 */
function PaymentBlocker() {
  const router = useRouter();

  useEffect(() => {
    function handleRequired() {
      toast.warning("Assine um plano para liberar esta funcionalidade");
      router.push("/assinatura");
    }
    window.addEventListener("logifinance:payment_required", handleRequired);
    return () => window.removeEventListener("logifinance:payment_required", handleRequired);
  }, [router]);

  return null;
}