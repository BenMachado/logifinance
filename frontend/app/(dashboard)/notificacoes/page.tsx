"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatPercent, formatDate, formatTime } from "@/lib/utils";
import type { CostAlert, PaginatedResponse } from "@/types";

const SEVERITY_TONE: Record<CostAlert["severity"], "alert" | "warning"> = {
  critical: "alert",
  warning: "warning",
};

const SEVERITY_LABELS: Record<CostAlert["severity"], string> = {
  critical: "Crítico",
  warning: "Atenção",
};

export default function NotificacoesPage() {
  const qc = useQueryClient();
  const [showResolved, setShowResolved] = useState(false);
  const [page, setPage] = useState(1);

  const alerts = useQuery<PaginatedResponse<CostAlert>>({
    queryKey: ["alerts", showResolved, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), page_size: "10", include_resolved: showResolved.toString() });
      return (await api.get(`/alerts?${params.toString()}`)).data;
    },
  });

  const resolve = useMutation({
    mutationFn: async (id: number) => api.post(`/alerts/${id}/resolve`),
    onSuccess: () => {
      toast.success("Alerta resolvido");
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Falha ao resolver alerta"),
  });

  return (
    <section className="flex flex-col gap-margin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Notificações</h1>
          <p className="text-data-mono-sm text-secondary">Alertas de margem e custos das viagens</p>
        </div>
      </div>

      <div className="flex gap-sm">
        <button
          onClick={() => { setShowResolved(false); setPage(1); }}
          className={`px-md py-xs rounded font-bold text-data-mono-sm ${
            !showResolved ? "bg-primary text-primary-foreground" : "bg-surfaceContainer-low text-secondary"
          }`}
        >
          Ativos
        </button>
        <button
          onClick={() => { setShowResolved(true); setPage(1); }}
          className={`px-md py-xs rounded font-bold text-data-mono-sm ${
            showResolved ? "bg-primary text-primary-foreground" : "bg-surfaceContainer-low text-secondary"
          }`}
        >
          Todos
        </button>
      </div>

      <div className="flex flex-col gap-sm">
        {alerts.data?.items?.length === 0 && (
          <div className="card-level-1 rounded p-lg text-center text-secondary font-body">
            <span className="material-symbols-outlined text-4xl text-success mb-sm block">check_circle</span>
            Nenhum alerta no momento.
          </div>
        )}
        {alerts.data?.items?.map((alert) => (
          <div key={alert.id} className="card-level-1 rounded p-md flex items-start gap-md">
            <span className={`material-symbols-outlined text-2xl mt-xs ${
              alert.severity === "critical" ? "text-error" : "text-yellow-600"
            }`}>
              {alert.severity === "critical" ? "error" : "warning"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-sm mb-xs">
                <span className="font-display font-bold text-tertiary">{alert.title}</span>
                <Badge variant={SEVERITY_TONE[alert.severity]}>{SEVERITY_LABELS[alert.severity]}</Badge>
                {alert.is_resolved && <Badge variant="profit">Resolvido</Badge>}
              </div>
              <p className="text-body-sm text-secondary mb-xs">{alert.message}</p>
              <div className="flex gap-lg text-data-mono-sm text-secondary">
                <span>Margem real: <strong className="text-error">{formatPercent(alert.actual_margin)}</strong></span>
                <span>Esperada: <strong>{formatPercent(alert.expected_margin)}</strong></span>
                <span>{formatDate(alert.created_at)} {formatTime(alert.created_at)}</span>
              </div>
            </div>
            {!alert.is_resolved && (
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm("Marcar este alerta como resolvido?")) resolve.mutate(alert.id);
                }}
                disabled={resolve.isPending}
              >
                Resolver
              </Button>
            )}
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={alerts.data?.total_pages ?? 1}
        total={alerts.data?.total ?? 0}
        pageSize={10}
        onPageChange={setPage}
      />
    </section>
  );
}
