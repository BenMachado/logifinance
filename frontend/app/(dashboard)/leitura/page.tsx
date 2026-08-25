"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage, smartReadFile, smartReadImport } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatBRL, cn } from "@/lib/utils";
import type {
  CostCategory,
  PaginatedResponse,
  SmartReadItem,
  SmartReadResponse,
  Vehicle,
} from "@/types";

const CATEGORY_LABELS: Record<CostCategory, string> = {
  fuel: "Combustível",
  toll: "Pedágio",
  maintenance: "Manutenção",
  food: "Alimentação",
  insurance: "Seguro",
  tax: "Impostos",
  other: "Outros",
};

const FILE_TYPE_LABEL: Record<SmartReadResponse["file_type"], string> = {
  spreadsheet: "Planilha",
  pdf: "PDF",
  image: "Imagem (OCR)",
  unknown: "Desconhecido",
};

interface EditableItem extends Omit<SmartReadItem, "amount"> {
  selected: boolean;
  vehicleId: number | null;
  // overrides editáveis pelo usuário
  category: CostCategory;
  amount: string; // string para edição controlada
  incurredOn: string; // yyyy-mm-dd
  description: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toEditable(item: SmartReadItem, defaultVehicleId: number | null): EditableItem {
  return {
    ...item,
    selected: true,
    vehicleId: defaultVehicleId,
    category: item.category,
    amount: item.amount != null ? String(item.amount) : "",
    incurredOn: item.incurred_on ?? todayStr(),
    description: item.description ?? "",
  };
}

export default function LeituraPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<SmartReadResponse | null>(null);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [defaultVehicleId, setDefaultVehicleId] = useState<string>("");
  const [showRaw, setShowRaw] = useState(false);

  const vehicles = useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ["vehicles", "all"],
    queryFn: async () => (await api.get(`/vehicles?page=1&page_size=100`)).data,
  });

  const readFile = useMutation({
    mutationFn: async (vars: { file?: File; url?: string }) =>
      smartReadFile({ file: vars.file, url: vars.url, onProgress: setUploadProgress }),
    onMutate: () => setUploadProgress(1),
    onSuccess: (data) => {
      const firstVehicleId = vehicles.data?.items?.[0]?.id ?? null;
      const ed = data.items.map((it) => toEditable(it, firstVehicleId));
      setResult(data);
      setItems(ed);
      setUploadProgress(100);
      const total = data.summary.total_items;
      if (total === 0) toast.warning("Nenhum item identificado no arquivo");
      else toast.success(`${total} item(ns) extraído(s) — revise antes de importar`);
    },
    onError: (e) => {
      setUploadProgress(0);
      toast.error(errorMessage(e, "Falha ao processar arquivo"));
    },
    onSettled: () => {
      setTimeout(() => setUploadProgress(0), 800);
    },
  });

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile.mutate({ file });
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile.mutate({ file });
    e.target.value = "";
  }

  function handleUrl() {
    if (!urlInput.trim()) {
      toast.error("Cole um link válido");
      return;
    }
    readFile.mutate({ url: urlInput.trim() });
  }

  function reset() {
    setResult(null);
    setItems([]);
    setUploadProgress(0);
    setUrlInput("");
  }

  function updateItem(idx: number, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function toggleAll(value: boolean) {
    setItems((prev) => prev.map((it) => ({ ...it, selected: value })));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function applyDefaultVehicle(vehicleId: number | null) {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        vehicleId: it.vehicleId ?? vehicleId,
      }))
    );
  }

  const importMutation = useMutation({
    mutationFn: async () => {
      const sel = items.filter((it) => it.selected);
      if (sel.length === 0) {
        throw new Error("Selecione ao menos um item para importar");
      }
      const missingVehicle = sel.find((it) => !it.vehicleId);
      if (missingVehicle) {
        throw new Error("Defina um veículo em todos os itens selecionados");
      }
      const payload = sel.map((it) => ({
        vehicle_id: it.vehicleId!,
        category: it.category,
        source: "upload" as const,
        amount: parseFloat((it.amount || "0").replace(",", ".")),
        description: it.description || null,
        incurred_on: it.incurredOn,
      }));
      return smartReadImport(payload);
    },
    onSuccess: (data) => {
      if (data.created > 0) {
        toast.success(`${data.created} custo(s) importado(s)${data.failed ? `, ${data.failed} falharam` : ""}`);
        qc.invalidateQueries({ queryKey: ["costs"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        setItems((prev) => prev.filter((it) => !it.selected));
      } else if (data.failed > 0) {
        toast.error(`Falha: ${data.errors.slice(0, 2).join("; ") || "verifique os dados"}`);
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : errorMessage(e, "Falha ao importar")),
  });

  const isProcessing = readFile.isPending || uploadProgress > 0;
  const selectedCount = items.filter((i) => i.selected).length;
  const selectedTotal = items
    .filter((i) => i.selected)
    .reduce((acc, it) => acc + (parseFloat((it.amount || "0").replace(",", ".")) || 0), 0);

  return (
    <section className="flex flex-col gap-margin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-tertiary m-0">Leitura Inteligente</h1>
          <p className="text-data-mono-sm text-secondary">
            Envie uma planilha, PDF ou foto — o sistema identifica e classifica os custos automaticamente.
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={reset} disabled={isProcessing}>
            Novo arquivo
          </Button>
        )}
      </div>

      {!result && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar arquivo</CardTitle>
            <CardDescription>
              Aceita Excel (.xlsx/.xls), CSV, PDF e imagens (.jpg/.png/.webp) — ou cole um link público.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className={cn(
                "border-2 border-dashed border-outline-variant rounded-2xl bg-surfaceContainer-lowest",
                "px-lg py-xl flex flex-col items-center justify-center gap-sm text-center",
                "transition-colors duration-150 hover:border-brand hover:bg-brand/[0.03]"
              )}
            >
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/60">cloud_upload</span>
              <p className="font-display text-body-lg font-bold m-0">
                Arraste e solte aqui, ou
              </p>
              <p className="text-data-mono-sm text-secondary m-0">máx. 50MB</p>
              <div className="flex gap-sm mt-sm">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Escolher arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={onPickFile}
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <Label>Ou cole um link público (URL do arquivo)</Label>
              <div className="flex gap-sm">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/relatorio.pdf"
                  disabled={isProcessing}
                />
                <Button variant="outline" onClick={handleUrl} disabled={isProcessing}>
                  Processar link
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between text-data-mono-sm font-mono">
                  <span className="font-bold">Processando...</span>
                  <span className="text-secondary">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surfaceContainer-low overflow-hidden border border-outline-variant">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-md">
                <div>
                  <CardTitle>{result.filename}</CardTitle>
                  <CardDescription>
                    Detectado como{" "}
                    <Badge variant="info">{FILE_TYPE_LABEL[result.file_type]}</Badge>{" "}
                    <span className="font-mono ml-1">({result.detected_format})</span>
                  </CardDescription>
                </div>
                <div className="flex gap-md text-right">
                  <Stat label="Itens" value={String(result.summary.total_items)} />
                  <Stat label="Com valor" value={String(result.summary.items_with_amount)} />
                  <Stat label="Com data" value={String(result.summary.items_with_date)} />
                  <Stat
                    label="Total"
                    value={result.summary.total_amount != null ? formatBRL(result.summary.total_amount) : "—"}
                    highlight
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-md">
              {result.message_summary && (
                <div className="border border-outline-variant rounded-xl p-md bg-surfaceContainer-low">
                  <p className="text-data-mono-sm text-secondary m-0">{result.message_summary}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-xs">
                {Object.entries(result.summary.by_category).map(([cat, n]) => (
                  <Badge key={cat} variant="neutral">
                    {CATEGORY_LABELS[cat as CostCategory] || cat}: {n}
                  </Badge>
                ))}
              </div>

              {result.raw_text_preview && (
                <div>
                  <button
                    onClick={() => setShowRaw((v) => !v)}
                    className="text-data-mono-sm font-bold text-primary hover:underline"
                  >
                    {showRaw ? "Ocultar" : "Ver"} texto bruto extraído
                  </button>
                  {showRaw && (
                    <pre className="mt-xs border border-outline-variant rounded-xl bg-surfaceContainer-low p-md font-mono text-data-mono-sm whitespace-pre-wrap max-h-72 overflow-y-auto">
                      {result.raw_text_preview}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-md">
                <div>
                  <CardTitle>Revisar e importar</CardTitle>
                  <CardDescription>
                    Edite valor/data/categoria, escolha o veículo e confirme a importação.
                  </CardDescription>
                </div>
                <div className="flex gap-sm items-center">
                  <Select
                    value={defaultVehicleId}
                    onChange={(e) => {
                      setDefaultVehicleId(e.target.value);
                      applyDefaultVehicle(e.target.value ? parseInt(e.target.value) : null);
                    }}
                  >
                    <option value="">Veículo padrão...</option>
                    {vehicles.data?.items?.map((v) => (
                      <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
                    ))}
                  </Select>
                  <Button variant="ghost" onClick={() => toggleAll(true)} disabled={items.length === 0}>
                    Selecionar todos
                  </Button>
                  <Button variant="ghost" onClick={() => toggleAll(false)} disabled={items.length === 0}>
                    Limpar seleção
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-secondary py-xl m-0">
                  Nenhum item identificado para revisão.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <tr>
                        <TH className="w-10">
                          <input
                            type="checkbox"
                            checked={items.length > 0 && items.every((it) => it.selected)}
                            onChange={(e) => toggleAll(e.target.checked)}
                          />
                        </TH>
                        <TH>Linha</TH>
                        <TH>Data</TH>
                        <TH>Veículo</TH>
                        <TH>Categoria</TH>
                        <TH>Descrição</TH>
                        <TH>Placa</TH>
                        <TH className="text-right">Valor</TH>
                        <TH>Conf.</TH>
                        <TH className="text-right">Ações</TH>
                      </tr>
                    </THead>
                    <TBody>
                      {items.map((it, idx) => (
                        <TR key={`${it.line}-${idx}`}>
                          <TD>
                            <input
                              type="checkbox"
                              checked={it.selected}
                              onChange={(e) => updateItem(idx, { selected: e.target.checked })}
                            />
                          </TD>
                          <TD>{it.line}</TD>
                          <TD>
                            <Input
                              type="date"
                              value={it.incurredOn}
                              onChange={(e) => updateItem(idx, { incurredOn: e.target.value })}
                              className="h-8 w-36"
                            />
                          </TD>
                          <TD>
                            <Select
                              value={it.vehicleId?.toString() || ""}
                              onChange={(e) =>
                                updateItem(idx, { vehicleId: e.target.value ? parseInt(e.target.value) : null })
                              }
                              className="h-8 min-w-[140px]"
                            >
                              <option value="">Selecione...</option>
                              {vehicles.data?.items?.map((v) => (
                                <option key={v.id} value={v.id}>{v.plate}</option>
                              ))}
                            </Select>
                          </TD>
                          <TD>
                            <Select
                              value={it.category}
                              onChange={(e) => updateItem(idx, { category: e.target.value as CostCategory })}
                              className="h-8 min-w-[130px]"
                            >
                              {(Object.keys(CATEGORY_LABELS) as CostCategory[]).map((c) => (
                                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                              ))}
                            </Select>
                          </TD>
                          <TD>
                            <Input
                              value={it.description}
                              onChange={(e) => updateItem(idx, { description: e.target.value })}
                              className="h-8 min-w-[180px]"
                              placeholder="Descrição"
                            />
                          </TD>
                          <TD className="font-bold">{it.plate || "—"}</TD>
                          <TD className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.amount}
                              onChange={(e) => updateItem(idx, { amount: e.target.value })}
                              className="h-8 w-28 text-right font-bold"
                            />
                          </TD>
                          <TD>
                            <Badge
                              variant={it.confidence >= 0.7 ? "profit" : it.confidence >= 0.5 ? "info" : "neutral"}
                            >
                              {Math.round(it.confidence * 100)}%
                            </Badge>
                          </TD>
                          <TD className="text-right">
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-error hover:underline text-data-mono-sm font-bold"
                            >
                              remover
                            </button>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="sticky bottom-0 -mx-gutter md:-mx-margin px-gutter md:px-margin py-md bg-white border-t border-outline-variant flex items-center justify-between gap-md rounded-t-2xl">
            <div className="flex gap-md items-center font-mono text-data-mono">
              <span className="text-secondary">{selectedCount} selecionado(s)</span>
              <span className="font-bold">Total: {formatBRL(selectedTotal)}</span>
            </div>
            <div className="flex gap-sm">
              <Button variant="outline" onClick={reset}>
                Cancelar
              </Button>
              <Button
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending || selectedCount === 0}
              >
                {importMutation.isPending ? "Importando..." : `Importar ${selectedCount || ""} item(ns)`}
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "border border-outline-variant rounded-xl px-md py-xs",
        highlight && "bg-primary-container/10 border-primary-container"
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-secondary font-mono m-0">{label}</p>
      <p className={cn("font-display font-bold text-body-md m-0", highlight && "text-primary")}>{value}</p>
    </div>
  );
}
