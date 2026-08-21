# LogiFinance - Agent Instructions

## O que é o projeto
LogiFinance é um micro-SaaS de gestão financeira para transportadoras. Backend Python/FastAPI, frontend Next.js 14, Docker Compose para infraestrutura.

## Stack
- Backend: Python 3.12 / FastAPI / SQLAlchemy 2 / PostgreSQL 16 / Alembic / Pydantic v2 / OCR (Tesseract) / JWT
- Frontend: Next.js 14 (App Router) / TypeScript / TailwindCSS / TanStack Query v5 / Zustand / Recharts
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
│   │   └── main.py         # Entrypoint com lifespan (create_all)
│   ├── tests/              # 23 testes passando
│   ├── alembic/            # Migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                # App Router pages
│   │   ├── (auth)/         # login, register
│   │   ├── (dashboard)/    # dashboard, frota, viagens, recibos, manutencao, configuracoes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/             # Reutilizáveis (button, dialog, table, badge, card, input, label, select)
│   │   ├── layout/         # Sidebar, Topbar
│   │   └── dashboard/      # KpiCard, CostAlertCard, WhatsAppOcrPanel
│   ├── hooks/              # useAuth.ts
│   ├── stores/             # authStore.ts (Zustand)
│   ├── lib/                # api.ts (axios), utils.ts
│   ├── types/              # index.ts (types compartilhados)
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── AGENTS.md               # Este arquivo
```

## O que JA foi feito (NÃO refazer)

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
- `.env`: PostgreSQL via Docker

### Backend - Testes corrigidos:
- `test_margin_alerts.py`: imports corrigidos, full_name "O" → "Owner", cost 8500 → 9500
- `test_receipts_ocr.py`: assertivas Decimal corrigidas, sender_phone "+5511" → "+5511999990000"
- `conftest.py`: `get_settings.cache_clear()`, StaticPool, env vars antes dos imports

### Frontend - Corrigido:
- `register/page.tsx`: usa dados reais do response do backend
- `Sidebar.tsx`: logout com `authStore.logout()` + navegação
- `Topbar.tsx`: links reais, `<Link>` em vez de `<a>`
- `dialog.tsx`: acessibilidade (Escape, focus trap, aria-modal)
- `dashboard/page.tsx`: upload com react-dropzone, KPI hardcoded removido, link morto removido
- `globals.css`: Google Fonts `@import` removido, `text-on-primary` → `text-white`, spacing tokens
- `layout.tsx`: Material Symbols via `<link>` no `<head>`
- `tailwind.config.ts`: spacing xs/sm/md/lg/xl
- `types/index.ts`: `MaintenanceType` e `CostCategory` exports
- `recibos/page.tsx`: `confirm()` → `window.confirm()` (shadowed por useMutation)
- `package.json`: 6 deps não usados removidos
- `loading.tsx`: 6 skeleton pages

## O que PRECISA ser feito

### Prioridade ALTA:
1. **Tabela de paginação**: implementar paginação real (offset/limit/page no backend + componente no frontend). Hoje usa `limit=200`.
2. **Testes do frontend**: criar com Vitest para componentes críticos.
3. **Testes E2E**: considerar Playwright para fluxo completo.

### Prioridade MÉDIA:
4. **Relatórios/Export**: CSV/Excel para custos e viagens.
5. **Notificações**: in-app notification center para CostAlerts.
6. **Filtros avançados**: período, veículo, categoria, status em viagens e custos.
7. **Dashboard responsivo**: KPIs e gráficos adaptados para mobile.

### Prioridade BAIXA:
8. **Refresh token**: testar flow existente no interceptor axios.
9. **Rate limiting**: middleware.
10. **Logging estruturado**: structlog ou loguru.
11. **Alembic**: manter como source of truth em prod (create_all é para dev).

## Regras e restrições

### NÃO fazer:
- NÃO trocar o stack (FastAPI + SQLAlchemy + Next.js)
- NÃO quebrar multi-tenancy: toda query DEVE filtrar por `company_id`
- NÃO usar `db.commit()` direto nos services: usar `db.flush()`, deixar `get_db()` fazer commit
- NÃO remover pin `bcrypt==4.1.3`: passlib 1.7.4 incompatível com bcrypt 5.x
- NÃO usar `lru_cache` sem `cache_clear()` em testes
- NÃO mudar endpoints da API existente sem versionar (v2)
- NÃO usar `confirm()` do browser sem `window.` (pode ser shadowed)

### Convenções:
- Código em inglês, comentários e mensagens de erro em português
- Schemas Pydantic separados em `app/schemas/`
- Lógica de negócio em `app/services/`, não nos endpoints
- Componentes UI reutilizáveis em `components/ui/`
- App Router (não Pages Router)
- TanStack Query v5 para data fetching
- Zustand em `stores/` para estado global

## Ambiente de teste
```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Backend coverage
cd backend && python -m pytest tests/ --cov=app --cov-report=term-missing

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
