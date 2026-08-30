"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { Driver, PaginatedResponse } from "@/types";

export default function MotoristasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", license_number: "", is_active: true });

  const drivers = useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", search, page],
    queryFn: async () => {
      const q = search ? `&q=${encodeURIComponent(search)}` : "";
      return (await api.get(`/drivers?page=${page}&page_size=10${q}`)).data;
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({ full_name: "", phone: "", license_number: "", is_active: true });
    setDialogOpen(true);
  }

  function openEdit(d: Driver) {
    setEditing(d);
    setForm({
      full_name: d.full_name,
      phone: d.phone,
      license_number: d.license_number || "",
      is_active: d.is_active,
    });
    setDialogOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        return (
          await api.patch(`/drivers/${editing.id}`, {
            full_name: form.full_name,
            phone: form.phone,
            license_number: form.license_number || null,
            is_active: form.is_active,
          })
        ).data;
      }
      return (
        await api.post("/drivers", {
          full_name: form.full_name,
          phone: form.phone,
          license_number: form.license_number || null,
          is_active: form.is_active,
        })
      ).data;
    },
    onSuccess: () => {
      toast.success(editing ? "Motorista atualizado" : "Motorista criado");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao salvar")),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/drivers/${id}`),
    onSuccess: () => {
      toast.success("Motorista removido");
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao remover")),
  });

  return (
    <section className="flex flex-col gap-margin text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-white m-0">Motoristas</h1>
          <p className="text-data-mono-sm text-[#888888]">Telefone é o que conecta o motorista ao bot do WhatsApp</p>
        </div>
        <Button onClick={openCreate}>+ Novo Motorista</Button>
      </div>

      <div className="card-level-1 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-md border-b border-white/10">
          <Input
            placeholder="Buscar por nome ou telefone..."
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
                <TH>Nome</TH>
                <TH>Telefone</TH>
                <TH>CNH</TH>
                <TH>Status</TH>
                <TH className="text-right">Ações</TH>
              </tr>
            </THead>
            <TBody>
              {drivers.data?.items?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-md text-center text-[#888888] font-body">Nenhum motorista cadastrado.</td>
                </tr>
              )}
              {drivers.data?.items?.map((d) => (
                <TR key={d.id}>
                  <TD className="font-bold text-white">{d.full_name}</TD>
                  <TD className="font-body text-[#aaa]">{d.phone}</TD>
                  <TD className="font-body text-[#aaa]">{d.license_number || "—"}</TD>
                  <TD>
                    <Badge variant={d.is_active ? "profit" : "neutral"}>
                      {d.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TD>
                  <TD className="text-right font-body">
                    <button onClick={() => openEdit(d)} className="text-[hsl(217,91%,60%)] font-bold mr-md hover:underline">
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Remover este motorista?")) remove.mutate(d.id);
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
          totalPages={drivers.data?.total_pages ?? 1}
          total={drivers.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar motorista" : "Novo motorista"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label>Nome completo</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="flex flex-col gap-xs">
            <Label>Telefone (com DDD)</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+55 11 9..." required />
          </div>
          <div className="flex flex-col gap-xs">
            <Label>CNH (opcional)</Label>
            <Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
          </div>
          <label className="flex items-center gap-sm font-body text-body-md">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span>Motorista ativo</span>
          </label>
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
