# LogiFinance - Agent Instructions

## O que é o projeto
LogiFinance é um micro-SaaS de gestão financeira para transportadoras. Backend Python/FastAPI, frontend Next.js 14, Docker Compose para infraestrutura.

## Stack
- Backend: Python 3.12 / FastAPI / SQLAlchemy 2 / PostgreSQL 16 / Alembic / Pydantic v2 / OCR (Tesseract) / JWT
- Frontend: Next.js 14 (App Router) / TypeScript / TailwindCSS / TanStack Query v5 / Zustand / Recharts / Vitest
- Infra: Docker Compose (postgres:16-alpine + backend + frontend)
- Multi-tenancy: `company_id` em todas as tabelas de negócio

## Estrutura
```
logifinance/
├── backend/
│   ├── app/
│   │   ├── api/v1/        # Endpoints FastAPI
│   │   ├── core/           # config.py, database.py, security.py
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Lógica de negócio
│   │   ├── utils/          # file_upload.py
│   │   └── main.py         # Entrypoint com lifespan (create_all)
│   ├── tests/              # 64 testes passando (8 arquivos)
│   ├── alembic/            # Migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                # App Router pages
│   │   ├── (auth)/         # login, register
│   │   ├── (dashboard)/    # dashboard, frota, viagens, custos, fluxo-caixa, recibos, manutencao, notificacoes, configuracoes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/             # Reutilizáveis (button, dialog, table, badge, card, input, label, select, pagination, toaster)
│   │   ├── layout/         # Sidebar, Topbar, nav
│   │   └── dashboard/      # KpiCard, CostAlertCard, CostDonutChart, CostTrendChart, RecentTripsTable, VehiclePerformanceTable, WhatsAppOcrPanel
│   ├── hooks/              # useAuth.ts
│   ├── stores/             # authStore.ts (Zustand)
│   ├── lib/                # api.ts (axios), utils.ts
│   ├── types/              # index.ts (types compartilhados)
│   ├── tailwind.config.ts
│   ├── package.json
│   ├── vitest.config.ts    # Configuração Vitest
│   ├── vitest.setup.ts     # Setup Vitest (@testing-library/jest-dom)
│   └── Dockerfile
├── docker-compose.yml
└── AGENTS.md               # Este arquivo
```

## O que JÁ foi feito (NÃO refazer)

### Backend - Corrigido:
- `deps.py`: `db_session` usa `Depends(get_db)` em vez de chamar `get_db()` direto (era causa raiz de "no such table")
- `requirements.txt`: `email-validator==2.2.0` adicionado, `bcrypt==4.1.3` pinned (passlib 1.7.4 incompatível com bcrypt 5.x)
- `vehicle.py`: constraint único `UniqueConstraint("company_id", "plate")` (placa única por empresa)
- Migration `0002_plate_unique_per_company.py` criada
- `auth_service.py` e `whatsapp_service.py`: `db.commit()` trocado por `db.flush()` (double commit bug)
- `dashboard_service.py`: margem hardcoded substituída por `company.expected_margin`
- `ocr_service.py`: regex placa antiga `[A-Z]?\d{2,3}` → `\d{4}`
- `__init__.py` em `app/api/v1/`
- `maintenance.py` e `cost_entry.py`: relationships com back_populates
- `main.py`: lifespan com `Base.metadata.create_all`
- `.env`: PostgreSQL via Docker, SECRET_KEY gerado
- `trips.py`, `receipts.py`, `maintenance.py`: `func` adicionado ao import (faltava — causaria NameError)
- `companies.py`: `db.commit()` → `db.flush()` (violava regra)

### Backend - Funcionalidades completas:
- **Auth**: register, login, refresh (`/auth/refresh`), me (`/auth/me`) — JWT access + refresh tokens
- **Paginação**: `PaginatedResponse[T]` (items, total, page, page_size, total_pages) em TODOS os GETs de listagem
- **Filtros**: vehicles (status), drivers (q), trips (q, status, vehicle_id, date_from, date_to), costs (vehicle_id, trip_id, category, date_from, date_to), receipts (status, vehicle_id), maintenance (vehicle_id, type), alerts (include_resolved)
- **Export CSV**: `GET /costs/export/csv` e `GET /trips/export/csv` (csv stdlib, text/csv, Content-Disposition)
- **Multi-tenancy**: company_id em toda tabela de negócio, validado em GET/POST/PATCH/DELETE
- **Companies**: `GET /companies/me`, `PATCH /companies/me`, `GET /companies/me/users`
- **Alerts**: list + `POST /alerts/{id}/resolve`, geração automática em `trips/{id}/complete` quando margem < esperado
- **WhatsApp OCR**: simulate + webhook endpoints, confirm/reject receipts
- **Maintenance**: CRUD + auto-gera CostEntry

### Backend - Testes (8 arquivos, 64 testes):
- `test_auth.py` (7 testes): register, login, me, refresh token (3 cenários), duplicate, edge cases
- `test_vehicles.py` (5 testes): CRUD, search, plate uniqueness, tenant isolation
- `test_trips.py` (4 testes): create+complete, healthy trip sem alert, export CSV, export tenant isolation
- `test_costs.py` (9 testes): CRUD, paginação, filtros (categoria/data/veículo), breakdown, CSV export, tenant isolation
- `test_margin_alerts.py` (5 testes): _safe_margin, dashboard KPIs, vehicle performance, alerts count/resolve
- `test_receipts_ocr.py` (7 testes): OCR helpers, simulate, confirm/reject
- `test_pagination_filters.py` (18 testes): paginação em todas listagens, filtros, maintenance CRUD+cost auto, auth edge cases
- `test_tenant_isolation.py` (9 testes): isolamento company_id em drivers/trips/receipts/maintenance/alerts (list + get-by-id)

### Frontend - Corrigido:
- `register/page.tsx`: usa dados reais do response do backend
- `Sidebar.tsx`: logout com `authStore.logout()` + navegação, links reais
- `Topbar.tsx`: links reais, `<Link>` em vez de `<a>`, sino linka para `/notificacoes`
- `dialog.tsx`: acessibilidade (Escape, focus trap, aria-modal)
- `dashboard/page.tsx`: upload com react-dropzone, KPI hardcoded removido, link morto removido, Recharts BarChart por categoria
- `globals.css`: Google Fonts `@import` removido, `text-on-primary` → `text-white`, spacing tokens
- `layout.tsx`: Material Symbols via `<link>` no `<head>`
- `tailwind.config.ts`: spacing xs/sm/md/lg/xl
- `types/index.ts`: `MaintenanceType` e `CostCategory` exports
- `recibos/page.tsx`: `confirm()` → `window.confirm()` (shadowed por useMutation)
- `package.json`: 6 deps não usados removidos, Vitest deps adicionadas
- `loading.tsx`: skeleton pages (dashboard, configuracoes, frota/veiculos, frota/motoristas, viagens, recibos, manutencao, fluxo-caixa, custos, notificacoes)
- `viagens/page.tsx`: filtros status+veículo, export CSV de custos
- `manutencao/page.tsx`: filtros vehicle+type

### Frontend - Funcionalidades completas:
- **Dashboard**: KPIs, BarChart custos por categoria (`/costs/breakdown`), tabela performance veículos, painel OCR, contagem alertas
- **Veículos** (`/frota/veiculos`): listar+filtrar+paginar+CRUD
- **Motoristas** (`/frota/motoristas`): listar+buscar+paginar+CRUD
- **Viagens** (`/viagens`): listar+filtrar+paginar+CRUD+concluir+export CSV
- **Custos** (`/custos`): listar+filtrar (veículo/categoria/data)+paginar+criar manual+export CSV
- **Fluxo de Caixa** (`/fluxo-caixa`): cards por categoria com % e badge alert
- **Recibos** (`/recibos`): OCR simulate+confirm/reject+paginados
- **Manutenção** (`/manutencao`): listar+filtrar+paginar+CRUD (gera CostEntry automaticamente)
- **Notificações** (`/notificacoes`): listar CostAlerts + resolver + toggle resolvidos
- **Configurações** (`/configuracoes`): form editar empresa (nome/CNPJ/telefone/margem) + listar usuários
- **Auth**: login (`/login`), register (`/register`), refresh token via interceptor axios

### Frontend - Testes (Vitest):
- `vitest.config.ts` + `vitest.setup.ts` configurados (jsdom + @vitejs/plugin-react + @testing-library/jest-dom)
- `lib/utils.test.ts` (23 testes): cn, formatBRL, formatPercent, formatDate, formatTime
- `stores/authStore.test.ts` (6 testes): estado inicial, setTokens/setUser/logout, fluxo completo
- `components/ui/badge.test.tsx` (7 testes): variantes (neutral/profit/alert/warning/info) + className merge
- `components/ui/button.test.tsx` (13 testes): variantes, sizes, onClick, disabled, type, className merge
- Total: **49 testes passando**

## O que PRECISA ser feito

### Prioridade BAIXA:
1. **Empty states com CTA**: botões "+ Cadastrar Veículo" / "+ Nova Viagem" quando tabelas estão vazias
2. **Mobile**: menu hamburger (parcial — já existe no Topbar mas sidebar ainda hidden em mobile)
3. **PT-BR**: revisar textos remanescentes em inglês
4. **Rate limiting**: middleware no backend
5. **Logging estruturado**: structlog ou loguru
6. **Alembic**: manter como source of truth em prod (create_all é para dev)
7. **Documentação Swagger**: examples Pydantic nos endpoints
8. **Lint cleanup**: `npx next lint`, remover console.logs remanescentes

## Regras e restrições

### NÃO fazer:
- NÃO trocar o stack (FastAPI + SQLAlchemy + Next.js)
- NÃO quebrar multi-tenancy: toda query DEVE filtrar por `company_id`
- NÃO usar `db.commit()` direto nos services: usar `db.flush()`, deixar `get_db()` fazer commit
- NÃO remover pin `bcrypt==4.1.3`: passlib 1.7.4 incompatível com bcrypt 5.x
- NÃO usar `lru_cache` sem `cache_clear()` em testes
- NÃO mudar endpoints da API existente sem versionar (v2)
- NÃO usar `confirm()` do browser sem `window.` (pode ser shadowed)
- NÃO hardcodar secrets em código

### Convenções:
- Código em inglês, comentários e mensagens de erro em português
- Schemas Pydantic separados em `app/schemas/`
- Lógica de negócio em `app/services/`, não nos endpoints
- Componentes UI reutilizáveis em `components/ui/`
- App Router (não Pages Router)
- TanStack Query v5 para data fetching
- Zustand em `stores/` para estado global
- Vitest em `*.test.ts(x)` na raiz do módulo testado

## Ambiente de teste
```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Backend coverage
cd backend && python -m pytest tests/ --cov=app --cov-report=term-missing

# Frontend tests
cd frontend && npm test

# Frontend build
cd frontend && npm run build

# Docker
docker-compose up --build
```

## Dependências críticas
- `passlib[bcrypt]==1.7.4` + `bcrypt==4.1.3` (juntos, sempre)
- `email-validator==2.2.0` (Pydantic EmailStr)
- `aiosqlite` (testes SQLite in-memory)
- `asyncpg` (PostgreSQL assíncrono prod)
- `vitest@^2.1.x` + `@vitejs/plugin-react` + `jsdom` + `@testing-library/react` (testes frontend)