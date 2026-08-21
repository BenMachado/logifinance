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
import type { Maintenance, PaginatedResponse, Vehicle, MaintenanceType } from "@/types";

const TYPE_TONE: Record<MaintenanceType, "profit" | "warning" | "info"> = {
  preventive: "profit",
  corrective: "warning",
  inspection: "info",
};
const TYPE_LABELS: Record<MaintenanceType, string> = {
  preventive: "Preventiva",
  corrective: "Corretiva",
  inspection: "Inspeção",
};

export default function ManutencaoPage() {
  const qc = useQueryClient();
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | "all">("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [form, setForm] = useState({
    vehicle_id: "",
    type: "preventive" as MaintenanceType,
    description: "",
    cost: "0",
    performed_on: new Date().toISOString().slice(0, 10),
    next_due: "",
  });

  const records = useQuery<PaginatedResponse<Maintenance>>({
    queryKey: ["maintenance", vehicleFilter, typeFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), page_size: "10" });
      if (vehicleFilter !== "all") params.set("vehicle_id", vehicleFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      return (await api.get(`/maintenance?${params.toString()}`)).data;
    },
  });

  const vehicles = useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ["vehicles", "all"],
    queryFn: async () => (await api.get(`/vehicles?page=1&page_size=100`)).data,
  });

  function openCreate() {
    setEditing(null);
    setForm({
      vehicle_id: vehicles.data?.items?.[0]?.id.toString() || "",
      type: "preventive",
      description: "",
      cost: "0",
      performed_on: new Date().toISOString().slice(0, 10),
      next_due: "",
    });
    setDialogOpen(true);
  }

  function openEdit(m: Maintenance) {
    setEditing(m);
    setForm({
      vehicle_id: m.vehicle_id.toString(),
      type: m.type,
      description: m.description,
      cost: m.cost.toString(),
      performed_on: m.performed_on,
      next_due: m.next_due || "",
    });
    setDialogOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        vehicle_id: parseInt(form.vehicle_id),
        type: form.type,
        description: form.description,
        cost: parseFloat(form.cost || "0"),
        performed_on: form.performed_on,
        next_due: form.next_due || null,
      };
      if (editing) return (await api.patch(`/maintenance/${editing.id}`, payload)).data;
      return (await api.post("/maintenance", payload)).data;
    },
    onSuccess: () => {
      toast.success(editing ? "Manutenção atualizada" : "Manutenção registrada");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao salvar")),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/maintenance/${id}`),
    onSuccess: () => {
      toast.success("Manutenção removida");
      qc.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao remover")),
  });

  return (
    <section className="flex flex-col gap-margin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Manutenção</h1>
          <p className="text-data-mono-sm text-secondary">Os custos de manutenção entram automaticamente no cálculo de margem</p>
        </div>
        <Button onClick={openCreate}>+ Nova Manutenção</Button>
      </div>

      <div className="card-level-1 rounded flex flex-col overflow-hidden">
        <div className="p-md border-b border-outline-variant flex gap-sm flex-wrap">
          <Select value={vehicleFilter} onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }}>
            <option value="all">Todos os veículos</option>
            {vehicles.data?.items?.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
          </Select>
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as MaintenanceType | "all"); setPage(1); }}>
            <option value="all">Todos os tipos</option>
            <option value="preventive">Preventiva</option>
            <option value="corrective">Corretiva</option>
            <option value="inspection">Inspeção</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Veículo</TH>
                <TH>Tipo</TH>
                <TH>Descrição</TH>
                <TH>Data</TH>
                <TH>Próxima</TH>
                <TH className="text-right">Custo</TH>
                <TH className="text-right">Ações</TH>
              </tr>
            </THead>
            <TBody>
              {records.data?.items?.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-md text-center text-secondary font-body">Nenhuma manutenção registrada.</td>
                </tr>
              )}
              {records.data?.items?.map((m) => (
                <TR key={m.id}>
                  <TD className="font-bold">{vehicles.data?.items?.find((v) => v.id === m.vehicle_id)?.plate || "—"}</TD>
                  <TD><Badge variant={TYPE_TONE[m.type]}>{TYPE_LABELS[m.type]}</Badge></TD>
                  <TD className="font-body">{m.description}</TD>
                  <TD className="font-body">{formatDate(m.performed_on)}</TD>
                  <TD className="font-body">{m.next_due ? formatDate(m.next_due) : "—"}</TD>
                  <TD className="text-right">{formatBRL(m.cost)}</TD>
                  <TD className="text-right font-body">
                    <button onClick={() => openEdit(m)} className="text-primary font-bold mr-md hover:underline">Editar</button>
                    <button
                      onClick={() => {
                        if (window.confirm("Remover esta manutenção?")) remove.mutate(m.id);
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
          totalPages={records.data?.total_pages ?? 1}
          total={records.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar manutenção" : "Nova manutenção"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Veículo</Label>
              <Select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">Selecione...</option>
                {vehicles.data?.items?.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Tipo</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceType })}>
                <option value="preventive">Preventiva</option>
                <option value="corrective">Corretiva</option>
                <option value="inspection">Inspeção</option>
              </Select>
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Custo (R$)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Realizada em</Label>
              <Input type="date" value={form.performed_on} onChange={(e) => setForm({ ...form, performed_on: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Próxima revisão</Label>
              <Input type="date" value={form.next_due} onChange={(e) => setForm({ ...form, next_due: e.target.value })} />
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
