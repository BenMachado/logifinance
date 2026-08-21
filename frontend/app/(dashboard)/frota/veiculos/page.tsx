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
import type { Driver, PaginatedResponse, Vehicle } from "@/types";

const STATUS_LABELS: Record<Vehicle["status"], string> = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
};

const STATUS_TONE: Record<Vehicle["status"], "profit" | "warning" | "neutral"> = {
  active: "profit",
  maintenance: "warning",
  inactive: "neutral",
};

export default function VeiculosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    plate: "",
    model: "",
    year: "",
    driver_id: "",
    status: "active" as Vehicle["status"],
  });

  const vehicles = useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ["vehicles", search, page],
    queryFn: async () => {
      const q = search ? `&q=${encodeURIComponent(search)}` : "";
      return (await api.get(`/vehicles?page=${page}&page_size=10${q}`)).data;
    },
  });

  const drivers = useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", "all"],
    queryFn: async () => (await api.get(`/drivers?page=1&page_size=100`)).data,
  });

  function openCreate() {
    setEditing(null);
    setForm({ plate: "", model: "", year: "", driver_id: "", status: "active" });
    setDialogOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    setForm({
      plate: v.plate,
      model: v.model,
      year: v.year?.toString() || "",
      driver_id: v.driver_id?.toString() || "",
      status: v.status,
    });
    setDialogOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        plate: form.plate.toUpperCase(),
        model: form.model,
        year: form.year ? parseInt(form.year) : null,
        driver_id: form.driver_id ? parseInt(form.driver_id) : null,
        status: form.status,
      };
      if (editing) {
        return (await api.patch(`/vehicles/${editing.id}`, payload)).data;
      }
      return (await api.post("/vehicles", payload)).data;
    },
    onSuccess: () => {
      toast.success(editing ? "Veículo atualizado" : "Veículo criado");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao salvar")),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      toast.success("Veículo removido");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao remover")),
  });

  return (
    <section className="flex flex-col gap-margin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Veículos</h1>
          <p className="text-data-mono-sm text-secondary">Gerencie a frota da sua transportadora</p>
        </div>
        <Button onClick={openCreate}>+ Novo Veículo</Button>
      </div>

      <div className="card-level-1 rounded flex flex-col overflow-hidden">
        <div className="p-md border-b border-outline-variant">
          <Input
            placeholder="Buscar por placa ou modelo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Placa</TH>
                <TH>Modelo</TH>
                <TH>Ano</TH>
                <TH>Motorista</TH>
                <TH>Status</TH>
                <TH className="text-right">Ações</TH>
              </tr>
            </THead>
            <TBody>
              {vehicles.data?.items?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-md text-center text-secondary font-body">
                    Nenhum veículo cadastrado.
                  </td>
                </tr>
              )}
              {vehicles.data?.items?.map((v) => (
                <TR key={v.id}>
                  <TD className="font-bold">{v.plate}</TD>
                  <TD className="font-body">{v.model}</TD>
                  <TD className="font-body">{v.year ?? "—"}</TD>
                  <TD className="font-body">
                    {drivers.data?.items?.find((d) => d.id === v.driver_id)?.full_name || "—"}
                  </TD>
                  <TD>
                    <Badge variant={STATUS_TONE[v.status]}>{STATUS_LABELS[v.status]}</Badge>
                  </TD>
                  <TD className="text-right font-body">
                    <button onClick={() => openEdit(v)} className="text-primary font-bold mr-md hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Remover este veículo?")) remove.mutate(v.id);
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
          totalPages={vehicles.data?.total_pages ?? 1}
          total={vehicles.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar veículo" : "Novo veículo"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Placa</Label>
              <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="ABC-1D23" required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Modelo</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Ano (opcional)</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Motorista</Label>
              <Select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">— sem motorista —</option>
                {drivers.data?.items?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Vehicle["status"] })}>
                <option value="active">Ativo</option>
                <option value="maintenance">Manutenção</option>
                <option value="inactive">Inativo</option>
              </Select>
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
