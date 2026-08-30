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
import { Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatBRL, formatTime, formatDate } from "@/lib/utils";
import type { Driver, PaginatedResponse, Receipt, Vehicle, CostCategory } from "@/types";

const STATUS_TONE: Record<Receipt["status"], "info" | "profit" | "neutral"> = {
  pending: "info",
  confirmed: "profit",
  rejected: "neutral",
};
const STATUS_LABELS: Record<Receipt["status"], string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  rejected: "Rejeitado",
};

export default function RecibosPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Receipt["status"] | "all">("pending");
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<Receipt | null>(null);
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [simForm, setSimForm] = useState({
    sender_name: "Motorista Carlos",
    sender_phone: "+5511999990000",
    vehicle_plate: "",
    text: "Posto Ipiranga\nDiesel S-10\nTotal: R$ 850,00",
    amount: "850",
    suggested_category: "fuel" as CostCategory,
  });
  const [confirmForm, setConfirmForm] = useState({
    vehicle_id: "",
    category: "fuel" as CostCategory,
    amount: "",
    description: "",
    incurred_on: new Date().toISOString().slice(0, 10),
  });

  const receipts = useQuery<PaginatedResponse<Receipt>>({
    queryKey: ["receipts", statusFilter, page],
    queryFn: async () => {
      const qs = statusFilter === "all" ? "" : `&status=${statusFilter}`;
      return (await api.get(`/receipts?page=${page}&page_size=10${qs}`)).data;
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

  const simulate = useMutation({
    mutationFn: async () => {
      return (
        await api.post("/receipts/whatsapp/simulate", {
          sender_name: simForm.sender_name,
          sender_phone: simForm.sender_phone,
          vehicle_plate: simForm.vehicle_plate || null,
          text: simForm.text,
          amount: simForm.amount ? parseFloat(simForm.amount) : null,
          suggested_category: simForm.suggested_category,
        })
      ).data;
    },
    onSuccess: () => {
      toast.success("Recibo simulado criado — entre na fila para revisar");
      setSimulateOpen(false);
      qc.invalidateQueries({ queryKey: ["receipts"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao simular")),
  });

  function openConfirm(r: Receipt) {
    setConfirmDialog(r);
    setConfirmForm({
      vehicle_id: r.vehicle_id?.toString() || vehicles.data?.items?.[0]?.id.toString() || "",
      category: (r.suggested_category as CostCategory) || "fuel",
      amount: r.extracted_amount?.toString() || "",
      description: `Recibo de ${r.sender_name}`,
      incurred_on: new Date().toISOString().slice(0, 10),
    });
  }

  const confirm = useMutation({
    mutationFn: async () => {
      if (!confirmDialog) return;
      return (
        await api.post(`/receipts/${confirmDialog.id}/confirm`, {
          vehicle_id: parseInt(confirmForm.vehicle_id),
          category: confirmForm.category,
          amount: parseFloat(confirmForm.amount || "0"),
          description: confirmForm.description || null,
          incurred_on: confirmForm.incurred_on,
        })
      ).data;
    },
    onSuccess: () => {
      toast.success("Recibo confirmado → custo gerado");
      setConfirmDialog(null);
      qc.invalidateQueries({ queryKey: ["receipts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao confirmar")),
  });

  const reject = useMutation({
    mutationFn: async (id: number) => api.post(`/receipts/${id}/reject`),
    onSuccess: () => {
      toast.success("Recibo rejeitado");
      qc.invalidateQueries({ queryKey: ["receipts"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao rejeitar")),
  });

  return (
    <section className="flex flex-col gap-margin text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-white m-0">Fila de Recibos</h1>
          <p className="text-data-mono-sm text-[#888888]">Recibos capturados via WhatsApp — revise e aprove para gerar o custo</p>
        </div>
        <Button onClick={() => setSimulateOpen(true)}>+ Simular Recebimento WhatsApp</Button>
      </div>

      <div className="flex gap-sm">
        {(["all", "pending", "confirmed", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-md py-xs rounded-xl font-bold text-data-mono-sm transition-colors ${
              statusFilter === s ? "bg-[hsl(226,71%,40%)] text-white" : "bg-white/5 border border-white/10 text-[#aaa] hover:text-white"
            }`}
          >
            {s === "all" ? "Todos" : STATUS_LABELS[s as Receipt["status"]]}
          </button>
        ))}
      </div>

      <div className="card-level-1 rounded-2xl flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Motorista</TH>
                <TH>Arquivo</TH>
                <TH>Recebido</TH>
                <TH className="text-right">Valor OCR</TH>
                <TH>Placa</TH>
                <TH>Categoria</TH>
                <TH>Status</TH>
                <TH className="text-right">Ações</TH>
              </tr>
            </THead>
            <TBody>
              {receipts.data?.items?.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-md text-center text-[#888888] font-body">Nenhum recibo.</td>
                </tr>
              )}
              {receipts.data?.items?.map((r) => (
                <TR key={r.id}>
                  <TD className="font-body">
                    <div className="font-bold text-white">{r.sender_name}</div>
                    <div className="text-data-mono-sm text-[#888888]">{r.sender_phone || "—"}</div>
                  </TD>
                  <TD className="font-body text-[#aaa]">{r.original_filename}</TD>
                  <TD className="font-body text-[#888888]">{formatDate(r.received_at)} {formatTime(r.received_at)}</TD>
                  <TD className="text-right font-mono text-white">{formatBRL(r.extracted_amount ?? 0)}</TD>
                  <TD className="font-bold text-white">{r.extracted_plate || "—"}</TD>
                  <TD className="font-body text-[#aaa]">{r.suggested_category}</TD>
                  <TD><Badge variant={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</Badge></TD>
                  <TD className="text-right font-body">
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => openConfirm(r)} className="text-[hsl(217,91%,60%)] font-bold mr-md hover:underline">
                          Confirmar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Rejeitar este recibo?")) reject.mutate(r.id);
                          }}
                          className="text-error font-bold hover:underline"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <Pagination
          page={page}
          totalPages={receipts.data?.total_pages ?? 1}
          total={receipts.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      {/* Simulate WhatsApp dialog */}
      <Dialog open={simulateOpen} onOpenChange={setSimulateOpen}>
        <DialogHeader>
          <DialogTitle>Simular Recebimento WhatsApp</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          <p className="text-data-mono-sm text-secondary">
            Sem precisar do WhatsApp real: este formulário finge o motorista enviando uma foto/mensagem e dispara o mesmo fluxo de OCR.
          </p>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Nome do motorista</Label>
              <Input value={simForm.sender_name} onChange={(e) => setSimForm({ ...simForm, sender_name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Telefone</Label>
              <Input value={simForm.sender_phone} onChange={(e) => setSimForm({ ...simForm, sender_phone: e.target.value })} />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Placa (opcional)</Label>
              <Input value={simForm.vehicle_plate} onChange={(e) => setSimForm({ ...simForm, vehicle_plate: e.target.value })} placeholder="ABC-1D23" />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Categoria</Label>
              <Select value={simForm.suggested_category} onChange={(e) => setSimForm({ ...simForm, suggested_category: e.target.value as CostCategory })}>
                <option value="fuel">Combustível</option>
                <option value="toll">Pedágio</option>
                <option value="maintenance">Manutenção</option>
                <option value="food">Diária</option>
                <option value="other">Outro</option>
              </Select>
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Texto do recibo (OCR)</Label>
              <Textarea
                value={simForm.text}
                onChange={(e) => setSimForm({ ...simForm, text: e.target.value })}
                rows={5}
              />
            </div>
            <div className="flex flex-col gap-xs col-span-2">
              <Label>Valor (opcional — se vazio, OCR extrai)</Label>
              <Input type="number" step="0.01" value={simForm.amount} onChange={(e) => setSimForm({ ...simForm, amount: e.target.value })} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSimulateOpen(false)}>Cancelar</Button>
          <Button onClick={() => simulate.mutate()} disabled={simulate.isPending}>
            {simulate.isPending ? "Enviando..." : "Simular"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(o) => !o && setConfirmDialog(null)}>
        <DialogHeader>
          <DialogTitle>Confirmar e gerar custo</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-md">
          {confirmDialog && (
            <>
              {confirmDialog.image_path && (
                <div className="border border-outline-variant rounded p-sm bg-surfaceContainer-low">
                  <p className="text-data-mono-sm text-secondary mb-xs">Imagem do recibo:</p>
                  <p className="text-data-mono-sm font-mono">{confirmDialog.image_path}</p>
                </div>
              )}
              {confirmDialog.ocr_text && (
                <details className="border border-outline-variant rounded p-sm">
                  <summary className="cursor-pointer text-data-mono-sm font-bold">Texto OCR bruto</summary>
                  <pre className="text-data-mono-sm font-mono whitespace-pre-wrap mt-xs">{confirmDialog.ocr_text}</pre>
                </details>
              )}
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs col-span-2">
                  <Label>Veículo</Label>
                  <Select value={confirmForm.vehicle_id} onChange={(e) => setConfirmForm({ ...confirmForm, vehicle_id: e.target.value })}>
                    <option value="">Selecione...</option>
                    {vehicles.data?.items?.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
                  </Select>
                </div>
                <div className="flex flex-col gap-xs">
                  <Label>Categoria</Label>
                  <Select value={confirmForm.category} onChange={(e) => setConfirmForm({ ...confirmForm, category: e.target.value as CostCategory })}>
                    <option value="fuel">Combustível</option>
                    <option value="toll">Pedágio</option>
                    <option value="maintenance">Manutenção</option>
                    <option value="food">Diária</option>
                    <option value="insurance">Seguro</option>
                    <option value="tax">Imposto</option>
                    <option value="other">Outro</option>
                  </Select>
                </div>
                <div className="flex flex-col gap-xs">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={confirmForm.amount} onChange={(e) => setConfirmForm({ ...confirmForm, amount: e.target.value })} />
                </div>
                <div className="flex flex-col gap-xs col-span-2">
                  <Label>Descrição</Label>
                  <Input value={confirmForm.description} onChange={(e) => setConfirmForm({ ...confirmForm, description: e.target.value })} />
                </div>
                <div className="flex flex-col gap-xs col-span-2">
                  <Label>Data do custo</Label>
                  <Input type="date" value={confirmForm.incurred_on} onChange={(e) => setConfirmForm({ ...confirmForm, incurred_on: e.target.value })} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancelar</Button>
          <Button onClick={() => confirm.mutate()} disabled={confirm.isPending}>
            {confirm.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </section>
  );
}
