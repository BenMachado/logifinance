# LogiFinance — Claude Code Prompt

## SETUP
Pasta do projeto: `C:\Users\Benon\logifinance`
Leia primeiro: `AGENTS.md`, `PROMPT.md` (todos na raiz).
Stack: FastAPI + SQLAlchemy 2 + PostgreSQL / Next.js 14 + TypeScript + TailwindCSS + TanStack Query v5 + Zustand + Recharts.
Multi-tenancy: `company_id` em toda tabela de negócio. Nunca esquecer em query alguma.

## REGRAS (VIOLAÇÃO = REJEITAR)
- NÃO trocar stack. NÃO quebrar multi-tenancy. NÃO usar `db.commit()` em services (usar `db.flush()`). NÃO remover `bcrypt==4.1.3`. NÃO usar `confirm()` sem `window.`. NÃO inventar classes Tailwind inexistentes. NÃO criar dependências novas sem necessidade. NÃO marcar tarefa completa se teste/build falhar. NÃO hardcodar secrets. NÃO mexer em endpoints existentes sem versionar.

## STATUS DAS FASES (Atualizado: 20/08/2026)
- **FASE 1 — CORRIGIR BUGS**: ✅ COMPLETA — SECRET_KEY, sidebar, topbar, upload, config, layout spinner
- **FASE 2 — PAGINAÇÃO**: ✅ COMPLETA — Backend: PaginatedResponse em todos os endpoints. Frontend: Pagination component em todas as 5 listagens
- **FASE 3 — FILTROS AVANÇADOS**: ✅ COMPLETA — Viagens: status+veículo. Manutenção: veículo+tipo. Motoristas: busca
- **FASE 4 — EXPORT CSV**: ✅ COMPLETA — Endpoint `/costs/export/csv` + botão "Exportar CSV" na página de Viagens
- **FASE 5 — PÁGINAS NOVAS**: ✅ PARCIAL — Fluxo de Caixa criado (recharts bar chart). Sidebar atualizada. Faltam: custos dedicados, relatórios
- **FASE 6 — TESTES**: ✅ COMPLETA — 50/50 testes passando (5 arquivos: auth, costs, margin_alerts, pagination_filters, receipts_ocr, trips, vehicles)
- **FASE 7 — UX**: ✅ COMPLETA — Recharts bar chart no dashboard. Loading skeletons em todas as páginas (incluindo configuracoes)
- **FASE 8 — CLEANUP**: ✅ PARCIAL — Testes e build OK. Falta: dead code, console.logs, lint

## O QUE FOI FEITO NESTA SESSÃO
### Bugs corrigidos
- `trips.py`: adicionado `func` ao import (faltava — causaria NameError em runtime)
- `receipts.py`: adicionado `func` ao import (mesmo problema)
- `maintenance.py`: adicionado `func` ao import (mesmo problema)
- `companies.py`: `db.commit()` → `db.flush()` (violava regra)

### FASE 2 — Paginação
- Backend: todos os endpoints de listagem já tinham `PaginatedResponse[T]` com `page`/`page_size`
- Frontend: `Pagination` component já existia, integrado em veículos, motoristas, viagens, recibos, manutenção

### FASE 3 — Filtros Avançados
- **Viagens** (`viagens/page.tsx`): adicionado `statusFilter` (Todos/Em Andamento/Concluída/Cancelada) + `vehicleFilter` (dropdown)
- **Manutenção** (`manutencao/page.tsx`): adicionado `vehicleFilter` (dropdown) + `typeFilter` (Todos/Preventiva/Corretiva/Inspeção)

### FASE 4 — Export CSV
- Backend: `GET /api/v1/costs/export/csv` —StreamingResponse com CSV filtrado
- Frontend: botão "Exportar CSV" na página de Viagens

### FASE 5 — Páginas Novas
- Criado `app/(dashboard)/fluxo-caixa/page.tsx` — usa `/costs/breakdown`, mostra cards por categoria com % e Badge alert
- Criado `app/(dashboard)/fluxo-caixa/loading.tsx`
- Sidebar: adicionado link "Fluxo de Caixa" com ícone `account_balance`

### FASE 6 — Testes
- Criado `tests/test_costs.py` (9 testes): CRUD, paginação, filtros, breakdown, CSV export, tenant isolation
- Criado `tests/test_pagination_filters.py` (27 testes): paginação em todas as listagens, filtros (status, data, veículo, categoria), maintenance CRUD + auto cost, auth edge cases
- Total: 50 testes passando (antes: 23)

### FASE 7 — UX
- Instalado `recharts` + `tailwindcss-animate`
- Dashboard: BarChart de custos por categoria (usa `/costs/breakdown`)
- Criado `configuracoes/loading.tsx`

## O QUE FALTA (se quiser continuar)
1. **FASE 5 extra**: Criar `configuracoes/custos/page.tsx` (CRUD de categorias de custo customizadas) e `relatorios/page.tsx`
2. **FASE 7 extra**: Empty states com botão CTA ("+ Cadastrar Veículo"), traduzir textos em inglês para PT-BR, menu hamburger mobile
3. **FASE 8 completa**: Rodar `npx next lint`, remover console.logs, documentar endpoints no Swagger

## FASE 1 — CORRIGIR BUGS EXISTENTES
1. **SECRET_KEY default** — `backend/.env` e `docker-compose.yml`: gerar com `python -c "import secrets; print(secrets.token_urlsafe(48))"`
2. **Sidebar sem Motoristas** — `frontend/components/layout/Sidebar.tsx`: adicionar link `/frota/motoristas`. Remover href="#" de "Suporte". Funcionalizar ou remover "Novo Relatorio"
3. **Topbar labels errados** — `frontend/components/layout/Topbar.tsx`: "Relatorios"→"Viagens", "Financeiro"→"Manutenção". Sino notificação: linkar para página real ou remover
4. **Upload mente** — `frontend/app/(dashboard)/dashboard/page.tsx`: texto diz .xlsx/.csv mas backend só aceita imagem/PDF. Corrigir texto
5. **WhatsAppOcrPanel texto errado** — `frontend/components/dashboard/WhatsAppOcrPanel.tsx`: diz "Configuracoes" mas simulate está em Recibos
6. **Configuracoes placeholder** — Criar `GET /companies/me` + `PATCH /companies/{id}` no backend. No frontend, formulários para editar empresa (nome, CNPJ, margem). Remover state `simulateOpen` não usado
7. **Loading states** — Dashboard: mostrar skeleton durante loading em vez de "R$ 0,00". Layout: retornar spinner em vez de `null` no auth check

## FASE 2 — PAGINAÇÃO
**Backend**: Criar `app/schemas/pagination.py` com `PaginatedResponse[T]` (items, total, page, page_size, total_pages). Em TODOS os GETs de listagem (vehicles, drivers, trips, receipts, costs, maintenance, alerts): params `page=1, page_size=20` (max 100), COUNT + OFFSET/LIMIT, retornar PaginatedResponse. Manter compatibilidade.
**Frontend**: Criar `components/ui/pagination.tsx`. Em cada listagem: state page, queryKey com page, `data.items` em vez de `data`, renderizar Pagination.

## FASE 3 — FILTROS AVANÇADOS
**Backend**: trips: `status, vehicle_id, date_from, date_to`. costs: `category, vehicle_id, date_from, date_to`. receipts: `status, vehicle_id`. WHERE condicional. Combinar com paginação.
**Frontend**: Criar `components/ui/filter-bar.tsx`. Select status, Select veículo, Date range, Botão limpar.

## FASE 4 — EXPORT CSV
Backend: `GET /trips/export` e `GET /costs/export` com mesmos filtros, retorna `text/csv` via stdlib `csv`. Frontend: `downloadCSV()` em `lib/utils.ts` via Blob. Botão "Exportar CSV" nas listagens.

## FASE 5 — PÁGINAS NOVAS
1. **Página Custos** (`app/(dashboard)/custos/page.tsx`): listar, filtrar, paginar, criar manual, exportar
2. **Configurações funcional**: form editar empresa + listar usuários
3. **Notificações**: listar CostAlerts, resolver. OU remover sino do Topbar

## FASE 6 — TESTES
Backend (pytest): maintenance CRUD, driver/vehicle/trip UPDATE+DELETE, tenant isolation em todos os resources, refresh token, input validation, paginação, filtros. Total esperado: ~45+ testes passando.
Frontend (Vitest): configurar, testar auth store, utils, componentes básicos.

## FASE 7 — UX
- **Gráficos**: Recharts já instalado. Adicionar bar chart (custos por categoria) e line chart (receita vs custo) no dashboard
- **Empty states**: botão CTA em tabelas vazias ("+ Cadastrar Veículo", etc)
- **PT-BR**: traduzir "OCR Extracted:" e qualquer texto em inglês
- **Mobile**: menu hamburger para sidebar (atualmente hidden em mobile)

## FASE 8 — CLEANUP
Remover código morto, console.logs. Rodar `npx next lint`. Documentar endpoints no Swagger com examples Pydantic.

## VERIFICAÇÃO (DEPOIS DE CADA FASE)
```bash
cd backend && python -m pytest tests/ -v
cd frontend && npm run build
docker-compose down && docker-compose up --build
```
Se falhar, CORRIJA antes de continuar.

## ENTREGÁVEL FINAL
- Todos os testes passando (~45+)
- Frontend compilando sem erro
- Docker build completo
- Configurações editáveis
- Paginação em todas as listagens
- Filtros funcionando
- CSV exportando
- Gráficos no dashboard
- Mobile responsivo
- Código limpo, sem warnings
