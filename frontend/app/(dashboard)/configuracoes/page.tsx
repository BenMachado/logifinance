"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Company, CompanyUser } from "@/types";

export default function ConfiguracoesPage() {
  const qc = useQueryClient();

  const companyQuery = useQuery<Company>({
    queryKey: ["companies", "me"],
    queryFn: async () => (await api.get("/companies/me")).data,
  });

  const usersQuery = useQuery<CompanyUser[]>({
    queryKey: ["companies", "me", "users"],
    queryFn: async () => (await api.get("/companies/me/users")).data,
  });

  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    phone: "",
    expected_margin_pct: "20",
  });

  useEffect(() => {
    if (companyQuery.data) {
      setForm({
        name: companyQuery.data.name || "",
        cnpj: companyQuery.data.cnpj || "",
        phone: companyQuery.data.phone || "",
        expected_margin_pct: (companyQuery.data.expected_margin * 100).toFixed(0),
      });
    }
  }, [companyQuery.data]);

  const updateCompany = useMutation({
    mutationFn: async () => {
      const marginPct = parseFloat(form.expected_margin_pct || "20");
      const payload = {
        name: form.name,
        cnpj: form.cnpj || null,
        phone: form.phone || null,
        expected_margin: Math.max(0, Math.min(100, marginPct)) / 100,
      };
      return (await api.patch("/companies/me", payload)).data;
    },
    onSuccess: () => {
      toast.success("Dados da empresa atualizados com sucesso!");
      qc.invalidateQueries({ queryKey: ["companies", "me"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Falha ao salvar dados da empresa")),
  });

  return (
    <section className="flex flex-col gap-margin">
      <div>
        <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Configurações</h1>
        <p className="text-data-mono-sm text-secondary">Dados da empresa, usuários e integração WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-margin">
        <Card>
          <CardHeader>
            <CardTitle>Dados da empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Nome da transportadora</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Transportes Silva Ltda"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>CNPJ</Label>
              <Input
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Telefone de Contato</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+55 (11) 98765-4321"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Margem Esperada Mínima (%)</Label>
              <div className="flex items-center gap-xs">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.expected_margin_pct}
                  onChange={(e) => setForm({ ...form, expected_margin_pct: e.target.value })}
                  placeholder="20"
                />
                <span className="font-bold text-secondary">%</span>
              </div>
              <p className="text-data-mono-sm text-secondary mt-1">
                Viagens concluídas com margem abaixo deste limite geram alertas de custo automáticos.
              </p>
            </div>
            <Button
              className="mt-2 self-start"
              onClick={() => updateCompany.mutate()}
              disabled={updateCompany.isPending || !form.name}
            >
              {updateCompany.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integração WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-whatsapp text-3xl">smart_toy</span>
              <div>
                <p className="font-display font-bold text-tertiary m-0">Bot LogiFinance</p>
                <p className="text-data-mono-sm text-secondary m-0">Status atual</p>
              </div>
              <Badge variant="warning" className="ml-auto">Simulado</Badge>
            </div>
            <p className="text-data-mono-sm text-secondary">
              No MVP, o envio de recibos é simulado via tela <a href="/recibos" className="text-primary font-bold hover:underline">Recibos (OCR)</a> → botão &quot;Simular Recebimento&quot;.
              Quando a integração real com a WhatsApp Business API for configurada, este card mostrará <strong>Conectado 🟢</strong> e o webhook substituirá a simulação automaticamente.
            </p>
            <div className="border border-outline-variant rounded p-sm bg-surfaceContainer-low text-data-mono-sm">
              <strong className="text-tertiary">Endpoint do webhook:</strong> <code className="font-mono">POST /api/v1/receipts/whatsapp/webhook</code>
              <br />
              <strong className="text-tertiary">Endpoint de simulação:</strong> <code className="font-mono">POST /api/v1/receipts/whatsapp/simulate</code>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <tr>
                  <TH>Nome</TH>
                  <TH>Email</TH>
                  <TH>Papel</TH>
                  <TH>Status</TH>
                  <TH>Cadastrado em</TH>
                </tr>
              </THead>
              <TBody>
                {usersQuery.data?.map((u) => (
                  <TR key={u.id}>
                    <TD className="font-bold">{u.full_name}</TD>
                    <TD className="font-body">{u.email}</TD>
                    <TD>
                      <Badge variant={u.is_admin ? "profit" : "info"}>
                        {u.is_admin ? "Administrador" : "Operador"}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge variant={u.is_active ? "profit" : "neutral"}>
                        {u.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TD>
                    <TD className="font-body">{formatDate(u.created_at)}</TD>
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
