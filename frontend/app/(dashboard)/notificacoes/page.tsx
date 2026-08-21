"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatPercent, formatDate } from "@/lib/utils";
import type { CostAlert, PaginatedResponse } from "@/types";

export default function NotificacoesPage() {
  const qc = useQueryClient();
  const [showResolved, setShowResolved] = useState(false);

  const alerts = useQuery<PaginatedResponse<CostAlert>>({
    queryKey: ["alerts", showResolved],
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", page_size: "50" });
      if (showResolved) params.set("include_resolved", "true");
      return (await api.get(`/alerts?${params.toString()}`)).data;
    },
  });

  const resolve = useMutation({
    mutationFn: async (id: number) => (await api.post(`/alerts/${id}/resolve`)).data,
    onSuccess: () => {
      toast.success("Alerta resolvido");
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao resolver")),
  });

  return (
    <section className="flex flex-col gap-margin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Notificações</h1>
          <p className="text-data-mono-sm text-secondary">Alertas de margem e custo das viagens concluídas</p>
        </div>
        <Button
          variant={showResolved ? "default" : "outline"}
          onClick={() => setShowResolved((v) => !v)}
        >
          {showResolved ? "Ocultar resolvidos" : "Mostrar resolvidos"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <tr>
                  <TH>Severidade</TH>
                  <TH>Título</TH>
                  <TH>Margem Real</TH>
                  <TH>Margem Esperada</TH>
                  <TH>Criado em</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Ações</TH>
                </tr>
              </THead>
              <TBody>
                {alerts.data?.items?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-md text-center text-secondary font-body">
                      Nenhum alerta {showResolved ? "" : "pendente"}. 🎉
                    </td>
                  </tr>
                )}
                {alerts.data?.items?.map((a) => (
                  <TR key={a.id}>
                    <TD>
                      <Badge variant={a.severity === "critical" ? "alert" : "warning"}>
                        {a.severity === "critical" ? "Crítico" : "Atenção"}
                      </Badge>
                    </TD>
                    <TD className="font-body">
                      <div className="font-bold">{a.title}</div>
                      <div className="text-secondary text-data-mono-sm">{a.message}</div>
                    </TD>
                    <TD className="font-bold">
                      <span className={a.actual_margin < a.expected_margin ? "text-error" : "text-success"}>
                        {formatPercent(a.actual_margin)}
                      </span>
                    </TD>
                    <TD className="font-body">{formatPercent(a.expected_margin)}</TD>
                    <TD className="font-body">{formatDate(a.created_at)}</TD>
                    <TD>
                      <Badge variant={a.is_resolved ? "profit" : "alert"}>
                        {a.is_resolved ? "Resolvido" : "Pendente"}
                      </Badge>
                    </TD>
                    <TD className="text-right font-body">
                      {!a.is_resolved && (
                        <button
                          onClick={() => resolve.mutate(a.id)}
                          className="text-success font-bold hover:underline"
                          disabled={resolve.isPending}
                        >
                          Marcar como resolvido
                        </button>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}