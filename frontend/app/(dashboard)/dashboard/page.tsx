"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { VehiclePerformanceTable } from "@/components/dashboard/VehiclePerformanceTable";
import { WhatsAppOcrPanel } from "@/components/dashboard/WhatsAppOcrPanel";
import { CostAlertCard } from "@/components/dashboard/CostAlertCard";
import { CostTrendChart, periodTotals } from "@/components/dashboard/CostTrendChart";
import { CostDonutChart } from "@/components/dashboard/CostDonutChart";
import { RecentTripsTable } from "@/components/dashboard/RecentTripsTable";
import { formatBRL, formatPercent } from "@/lib/utils";
import type {
  DashboardKPIs,
  VehiclePerformance,
  WhatsAppReceiptEntry,
  CostAlert,
  CostBreakdownItem,
  PaginatedResponse,
  CostEntry,
  Trip,
  Driver,
  Maintenance,
} from "@/types";

function deltaPercent(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return ((current - previous) / previous) * 100;
}

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender_name", "Upload Manual");
        await api.post("/receipts/whatsapp/webhook", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success(`${acceptedFiles.length} arquivo(s) enviado(s) com sucesso!`);
    } catch {
      toast.error("Erro ao enviar arquivos");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 50 * 1024 * 1024,
    disabled: uploading,
  });

  const kpis = useQuery<DashboardKPIs>({
    queryKey: ["dashboard", "kpis"],
    queryFn: async () => (await api.get("/dashboard/kpis")).data,
  });
  const performance = useQuery<VehiclePerformance>({
    queryKey: ["dashboard", "performance"],
    queryFn: async () => (await api.get("/dashboard/vehicle-performance")).data,
  });
  const whatsapp = useQuery<WhatsAppReceiptEntry[]>({
    queryKey: ["dashboard", "whatsapp"],
    queryFn: async () => (await api.get("/dashboard/whatsapp-receipts?limit=5")).data,
  });
  const alerts = useQuery<CostAlert[]>({
    queryKey: ["dashboard", "alerts"],
    queryFn: async () => (await api.get("/dashboard/alerts?limit=3")).data,
  });
  const costBreakdown = useQuery<CostBreakdownItem[]>({
    queryKey: ["dashboard", "costBreakdown"],
    queryFn: async () => (await api.get("/costs/breakdown")).data,
  });
  const costs = useQuery<PaginatedResponse<CostEntry>>({
    queryKey: ["dashboard", "costs"],
    queryFn: async () => (await api.get("/costs?page=1&page_size=100")).data,
  });
  const trips = useQuery<PaginatedResponse<Trip>>({
    queryKey: ["dashboard", "trips"],
    queryFn: async () => (await api.get("/trips?page=1&page_size=8")).data,
  });
  const drivers = useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", "all"],
    queryFn: async () => (await api.get("/drivers?page=1&page_size=100")).data,
  });
  const maintenance = useQuery<PaginatedResponse<Maintenance>>({
    queryKey: ["dashboard", "maintenance"],
    queryFn: async () => (await api.get("/maintenance?page=1&page_size=100")).data,
  });

  const costDelta = periodTotals(costs.data?.items ?? []);
  const costChange = deltaPercent(costDelta.current, costDelta.previous);

  const maintItems = maintenance.data?.items ?? [];
  const avgTicket =
    maintItems.length > 0 ? maintItems.reduce((sum, m) => sum + Number(m.cost), 0) / maintItems.length : 0;
  const mid = Math.floor(maintItems.length / 2);
  const newer = maintItems.slice(0, mid);
  const older = maintItems.slice(mid);
  const newerAvg = newer.length ? newer.reduce((s, m) => s + Number(m.cost), 0) / newer.length : 0;
  const olderAvg = older.length ? older.reduce((s, m) => s + Number(m.cost), 0) / older.length : 0;
  const ticketDelta = newer.length && older.length ? deltaPercent(newerAvg, olderAvg) : undefined;

  return (
    <>
      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Custo total"
          value={formatBRL(kpis.data?.total_cost ?? 0)}
          loading={kpis.isLoading}
          delta={costChange !== undefined ? { percent: costChange, invert: true } : undefined}
        />
        <KpiCard
          title="Viagens"
          value={String(trips.data?.total ?? kpis.data?.active_trips ?? 0)}
          loading={trips.isLoading}
          badge={{
            label: `${kpis.data?.active_trips ?? 0} em andamento`,
            tone: "neutral",
          }}
          breakdown="total no cadastro"
        />
        <KpiCard
          title="Ticket médio de manutenção"
          value={formatBRL(avgTicket)}
          loading={maintenance.isLoading}
          delta={ticketDelta !== undefined ? { percent: ticketDelta, invert: true } : undefined}
        />
        <KpiCard
          title="Margem média"
          value={formatPercent(kpis.data?.avg_margin ?? 0)}
          progressBar={kpis.data?.avg_margin ?? 0}
          loading={kpis.isLoading}
          badge={
            (kpis.data?.avg_margin ?? 0) >= 0
              ? { label: "frota", tone: "profit" }
              : { label: "atenção", tone: "alert" }
          }
          breakdown="média das viagens concluídas"
        />
      </section>

      <div className="grid grid-cols-1 gap-margin lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CostTrendChart items={costs.data?.items ?? []} />
        </div>
        <div className="lg:col-span-4">
          <CostDonutChart items={costBreakdown.data ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-margin lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RecentTripsTable trips={trips.data?.items ?? []} drivers={drivers.data?.items ?? []} />
        </div>
        <div className="flex flex-col gap-margin lg:col-span-4">
          <WhatsAppOcrPanel entries={whatsapp.data ?? []} />
          <CostAlertCard alerts={alerts.data ?? []} />
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-card">
        <div className="border-b border-outline-variant px-md py-sm">
          <h2 className="font-display text-headline-md font-bold text-tertiary">Desempenho por veículo</h2>
        </div>
        <VehiclePerformanceTable rows={performance.data?.rows ?? []} />
      </section>

      <section className="rounded-xl border border-outline-variant bg-white p-md shadow-card">
        <h2 className="mb-md font-display text-headline-md font-bold text-tertiary">Upload de recibos (OCR)</h2>
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-lg text-center transition-colors ${
            isDragActive ? "border-brand bg-brand/5" : "border-outline-variant bg-surfaceContainer-low hover:bg-surfaceContainer"
          } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <span className="material-symbols-outlined mb-sm text-3xl text-secondary">
            {uploading ? "hourglass_top" : "cloud_upload"}
          </span>
          <p className="text-body-md font-medium text-foreground">
            {isDragActive ? "Solte os arquivos aqui..." : "Arraste comprovantes (PDF, JPG, PNG) ou toque para enviar"}
          </p>
          <p className="mt-xs text-data-mono-sm text-secondary">Até 50MB · extração automática de valor e placa</p>
        </div>
      </section>
    </>
  );
}
