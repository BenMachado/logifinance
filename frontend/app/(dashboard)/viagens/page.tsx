"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatBRL, formatDate } from "@/lib/utils";
import type { Driver, PaginatedResponse, Trip, Vehicle } from "@/types";

const STATUS_TONE: Record<Trip["status"], "info" | "profit" | "neutral"> = {
  in_progress: "info",
  completed: "profit",
  cancelled: "neutral",
};

const STATUS_LABELS: Record<Trip["status"], string> = {
  in_progress: "Em Andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export default function ViagensPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Trip["status"] | "all">("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState({
    vehicle_id: "",
    driver_id: "",
    origin: "",
    destination: "",
    gross_revenue: "",
    distance_km: "",
    scheduled_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const trips = useQuery<PaginatedResponse<Trip>>({
    queryKey: ["trips", search, statusFilter, vehicleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), page_size: "10" });
      if (search) params.set("q", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (vehicleFilter !== "all") params.set("vehicle_id", vehicleFilter);
      return (await api.get(`/trips?${params.toString()}`)).data;
    },
  });

  const vehicles = useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ["vehicles", "all"],
    queryFn: async () => (await api.get(`/vehicles?page=1&page_size=100`)).data,
  });

  const drivers = useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", "all"],
    queryFn: async () => (await api.get(`/drivers?page=1&page_size=100`)).data,
  });

  function openCreate() {
    setEditing(null);
    setForm({
      vehicle_id: vehicles.data?.items?.[0]?.id.toString() || "",
      driver_id: "",
      origin: "",
      destination: "",
      gross_revenue: "",
      distance_km: "",
      scheduled_date: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setDialogOpen(true);
  }

  function openEdit(t: Trip) {
    setEditing(t);
    setForm({
      vehicle_id: t.vehicle_id.toString(),
      driver_id: t.driver_id?.toString() || "",
      origin: t.origin,
      destination: t.destination,
      gross_revenue: t.gross_revenue.toString(),
      distance_km: t.distance_km?.toString() || "",
      scheduled_date: t.scheduled_date,
      notes: t.notes || "",
    });
    setDialogOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        vehicle_id: parseInt(form.vehicle_id),
        driver_id: form.driver_id ? parseInt(form.driver_id) : null,
        origin: form.origin,
        destination: form.destination,
        gross_revenue: parseFloat(form.gross_revenue || "0"),
        distance_km: form.distance_km ? parseInt(form.distance_km) : null,
        scheduled_date: form.scheduled_date,
        notes: form.notes || null,
      };
      if (editing) {
        return (await api.patch(`/trips/${editing.id}`, payload)).data;
      }
      return (await api.post("/trips", payload)).data;
    },
    onSuccess: () => {
      toast.success(editing ? "Viagem atualizada" : "Viagem criada");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao salvar")),
  });

  const complete = useMutation({
    mutationFn: async (id: number) => (await api.post(`/trips/${id}/complete`)).data,
    onSuccess: () => {
      toast.success("Viagem concluída — margem recalculada");
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao concluir")),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/trips/${id}`),
    onSuccess: () => {
      toast.success("Viagem removida");
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao remover")),
  });

  return (
    <section className="flex flex-col gap-margin text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-white m-0">Viagens</h1>
          <p className="text-data-mono-sm text-[#888888]">Cadastre rotas e conclua para calcular margem automaticamente</p>
        </div>
        <div className="flex gap-sm">
          <Button
            variant="outline"
            onClick={() => {
              const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
              const params = new URLSearchParams();
              if (vehicleFilter !== "all") params.set("vehicle_id", vehicleFilter);
              window.open(`${base}/api/v1/costs/export/csv?${params.toString()}`, "_blank");
            }}
          >
            Exportar CSV
          </Button>
          <Button onClick={openCreate}>+ Nova Viagem</Button>
        </div>
      </div>

      <div className="card-level-1 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-md border-b border-white/10 flex flex-col gap-sm">
          <Input
            placeholder="Buscar por origem ou destino..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex gap-sm flex-wrap">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as Trip["status"] | "all"); setPage(1); }}>
              <option value="all">Todos os status</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </Select>
            <Select value={vehicleFilter} onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }}>
              <option value="all">Todos os veículos</option>
              {vehicles.data?.items?.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Veículo</TH>
                <TH>Rota</TH>
                <TH>Data</TH>
                <TH className="text-right">Frete</TH>
                <TH>Status</TH>
                <TH className="text-right">Ações</TH>
              </tr>
            </THead>
            <TBody>
              {trips.data?.items?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-md text-center text-[#888888] font-body">Nenhuma viagem cadastrada.</td>
                </tr>
              )}
              {trips.data?.items?.map((t) => (
                <TR key={t.id}>
                  <TD className="font-bold text-white">{vehicles.data?.items?.find((v) => v.id === t.vehicle_id)?.plate || "—"}</TD>
                  <TD className="font-body text-[#aaa]">{t.origin} → {t.destination}</TD>
                  <TD className="font-body text-[#888888]">{formatDate(t.scheduled_date)}</TD>
                  <TD className="text-right font-mono text-white">{formatBRL(t.gross_revenue)}</TD>
                  <TD><Badge variant={STATUS_TONE[t.status]}>{STATUS_LABELS[t.status]}</Badge></TD>
                  <TD className="text-right font-body">
                    {t.status === "in_progress" && (
                      <button
                        onClick={() => complete.mutate(t.id)}
                        className="text-[hsl(217,91%,60%)] font-bold mr-md hover:underline"
                      >
                        Concluir
                      </button>
                    )}
                    <button onClick={() => openEdit(t)} className="text-[hsl(217,91%,60%)] font-bold mr-md hover:underline">Editar</button>
                    <button
                      onClick={() => {
                        if (window.confirm("Remover esta viagem?")) remove.mutate(t.id);
                      }}
                      className="text-error font-bold hover:underline"
                    >
                      Remover
                    </button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <Pagination
          page={page}
          totalPages={trips.data?.total_pages ?? 1}
          total={trips.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar viagem" : "Nova viagem"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Veículo</Label>
              <Select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">Selecione...</option>
                {vehicles.data?.items?.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Motorista</Label>
              <Select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">— opcional —</option>
                {drivers.data?.items?.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Origem</Label>
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Destino</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Frete Bruto (R$)</Label>
              <Input type="number" step="0.01" value={form.gross_revenue} onChange={(e) => setForm({ ...form, gross_revenue: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Distância (km)</Label>
              <Input type="number" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} />
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Data agendada</Label>
              <Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} required />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </section>
  );
}
