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
import type { CostEntry, CostCategory, PaginatedResponse, Vehicle } from "@/types";

const CATEGORY_LABELS: Record<CostCategory, string> = {
  fuel: "Combustível",
  toll: "Pedágio",
  maintenance: "Manutenção",
  food: "Alimentação",
  insurance: "Seguro",
  tax: "Impostos",
  other: "Outros",
};

export default function CustosPage() {
  const qc = useQueryClient();
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: "",
    category: "fuel" as CostCategory,
    amount: "",
    description: "",
    incurred_on: new Date().toISOString().slice(0, 10),
  });

  const vehicles = useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ["vehicles", "all"],
    queryFn: async () => (await api.get(`/vehicles?page=1&page_size=100`)).data,
  });

  const costs = useQuery<PaginatedResponse<CostEntry>>({
    queryKey: ["costs", vehicleFilter, categoryFilter, dateFrom, dateTo, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), page_size: "10" });
      if (vehicleFilter !== "all") params.set("vehicle_id", vehicleFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      return (await api.get(`/costs?${params.toString()}`)).data;
    },
  });

  function openCreate() {
    setForm({
      vehicle_id: vehicles.data?.items?.[0]?.id.toString() || "",
      category: "fuel",
      amount: "",
      description: "",
      incurred_on: new Date().toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        vehicle_id: parseInt(form.vehicle_id),
        category: form.category,
        amount: parseFloat(form.amount || "0"),
        description: form.description || null,
        incurred_on: form.incurred_on,
      };
      return (await api.post("/costs", payload)).data;
    },
    onSuccess: () => {
      toast.success("Custo registrado");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["costs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao registrar custo")),
  });

  function exportCsv() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const params = new URLSearchParams();
    if (vehicleFilter !== "all") params.set("vehicle_id", vehicleFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    window.open(`${base}/api/v1/costs/export/csv?${params.toString()}`, "_blank");
  }

  function clearFilters() {
    setVehicleFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <section className="flex flex-col gap-margin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Custos</h1>
          <p className="text-data-mono-sm text-secondary">Registre e acompanhe os custos da operação</p>
        </div>
        <div className="flex gap-sm">
          <Button variant="outline" onClick={exportCsv}>Exportar CSV</Button>
          <Button onClick={openCreate}>+ Novo Custo</Button>
        </div>
      </div>

      <div className="card-level-1 rounded flex flex-col overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col gap-sm">
          <div className="flex gap-sm flex-wrap">
            <Select value={vehicleFilter} onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }}>
              <option value="all">Todos os veículos</option>
              {vehicles.data?.items?.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
              ))}
            </Select>
            <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="all">Todas categorias</option>
              {(Object.keys(CATEGORY_LABELS) as CostCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} placeholder="De" />
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} placeholder="Até" />
            <Button variant="ghost" onClick={clearFilters}>Limpar</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Data</TH>
                <TH>Veículo</TH>
                <TH>Categoria</TH>
                <TH>Descrição</TH>
                <TH className="text-right">Valor</TH>
                <TH>Origem</TH>
              </tr>
            </THead>
            <TBody>
              {costs.data?.items?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-md text-center text-secondary font-body">Nenhum custo registrado.</td>
                </tr>
              )}
              {costs.data?.items?.map((c) => (
                <TR key={c.id}>
                  <TD className="font-body">{formatDate(c.incurred_on)}</TD>
                  <TD className="font-bold">{vehicles.data?.items?.find((v) => v.id === c.vehicle_id)?.plate || "—"}</TD>
                  <TD><Badge variant="info">{CATEGORY_LABELS[c.category] || c.category}</Badge></TD>
                  <TD className="font-body">{c.description || "—"}</TD>
                  <TD className="text-right font-bold">{formatBRL(c.amount)}</TD>
                  <TD className="font-body text-secondary">{c.source}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <Pagination
          page={page}
          totalPages={costs.data?.total_pages ?? 1}
          total={costs.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Novo custo manual</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label>Veículo</Label>
            <Select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">Selecione...</option>
              {vehicles.data?.items?.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Categoria</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CostCategory })}>
                {(Object.keys(CATEGORY_LABELS) as CostCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Diesel posto Shell" />
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Data</Label>
              <Input type="date" value={form.incurred_on} onChange={(e) => setForm({ ...form, incurred_on: e.target.value })} required />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.vehicle_id || !form.amount}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </section>
  );
}