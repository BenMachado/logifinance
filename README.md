# LogiFinance

SaaS financeiro para transportadoras — gestão de receita de fretes, custos operacionais e margem por veículo/rota, com **captura de custos via WhatsApp + OCR** e **alertas de margem**.

## Stack

- **Backend:** Python 3.12 · FastAPI (async) · SQLAlchemy 2 · PostgreSQL 16 · Alembic · Pydantic v2 · pytesseract (OCR) · JWT (access + refresh)
- **Frontend:** Next.js 14 (App Router) · TypeScript · TailwindCSS · shadcn-style UI · TanStack Query · Zustand · Recharts · Material Symbols Outlined
- **Multi-tenancy:** `company_id` em todas as tabelas de negócio + dependency `get_current_company`

## Layout do monorepo

```
logifinance/
├── backend/            # FastAPI
│   ├── app/
│   │   ├── core/       # config, database, security (JWT/bcrypt)
│   │   ├── models/     # SQLAlchemy 2.0 models
│   │   ├── schemas/    # Pydantic v2 schemas
│   │   ├── api/v1/     # Endpoints REST
│   │   ├── services/   # auth, ocr, whatsapp (simulado), margin, dashboard
│   │   └── utils/      # file_upload
│   ├── alembic/        # Migrações
│   ├── tests/          # pytest
│   ├── storage/        # Arquivos de recibos (dev)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # Next.js 14
│   ├── app/            # rotas (login, register, dashboard, frota, viagens, ...)
│   ├── components/     # ui, layout, dashboard widgets
│   ├── lib/            # api client, utils (cn, formatBRL, ...)
│   ├── stores/         # Zustand auth
│   ├── hooks/
│   ├── types/
│   ├── tailwind.config.ts
│   └── Dockerfile
└── docker-compose.yml
```

## Subir tudo com Docker (recomendado)

```bash
cd logifinance
docker-compose up --build
```

- Frontend: <http://localhost:3000>
- Backend (Swagger): <http://localhost:8000/docs>
- Postgres: `localhost:5432` (user `logifinance` / pass `logifinance`)

A migração inicial é aplicada automaticamente no `CMD` do backend (`alembic upgrade head`).

## Setup local (sem Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# PostgreSQL local (ou ajuste DATABASE_URL no .env)
cp .env.example .env

# Tesseract é necessário para OCR (no Windows: instalar tesseract-ocr + pacote português;
# no Linux: apt-get install tesseract-ocr tesseract-ocr-por)
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local        # ajustar se backend não estiver em localhost:8000
npm install
npm run dev
```

## Fluxos disponíveis (MVP ponta a ponta)

1. **Registro** em `/register` → cria `Company` + primeiro `User` admin.
2. **Login** em `/login` → JWT (access + refresh, refresh automático via interceptor Axios).
3. **Cadastro de Frota** em `/frota/veiculos` e `/frota/motoristas`.
4. **Cadastro de Viagem** em `/viagens`. Ao **Concluir** uma viagem:
   - Soma `CostEntry` vinculados
   - Calcula margem
   - Se < margem esperada (default 20%), gera `CostAlert` automaticamente
5. **Recibos via WhatsApp** em `/recibos`:
   - Botão **"Simular Recebimento WhatsApp"** → cria um `Receipt` em `PENDING` (como se o motorista tivesse enviado)
   - OCR (Tesseract) extrai **valor**, **placa** e **categoria** do texto
   - Gestor revisa (corrige valor, escolhe veículo), clica **Confirmar** → gera `CostEntry` vinculado
   - Rejeitar descarta
6. **Dashboard** em `/dashboard`:
   - 4 KPIs: Receita Bruta, Custo Total, Lucro Líquido, Margem Média (com barra de progresso)
   - Tabela **Desempenho por Veículo & Rota** com badge Lucrativo/Alerta
   - Painel **Bot de WhatsApp** (histórico OCR)
   - Card **Alertas de Custo** (vermelho, border preto `card-level-2`)
7. **Manutenção** em `/manutencao` → registra custo que entra automaticamente no cálculo total
8. **Configurações** em `/configuracoes` → status da integração WhatsApp (atualmente "Simulado")

## Endpoints principais

| Método | Rota | Função |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Cria empresa + admin |
| `POST` | `/api/v1/auth/login` | Retorna access + refresh |
| `POST` | `/api/v1/auth/refresh` | Renova access token |
| `GET`  | `/api/v1/auth/me` | Usuário atual |
| `GET/POST/PATCH/DELETE` | `/api/v1/drivers` | CRUD motoristas |
| `GET/POST/PATCH/DELETE` | `/api/v1/vehicles` | CRUD veículos |
| `GET/POST/PATCH/DELETE` | `/api/v1/trips` | CRUD viagens |
| `POST` | `/api/v1/trips/{id}/complete` | Concluir → dispara alerta |
| `GET/POST` | `/api/v1/costs` | Custos |
| `GET` | `/api/v1/costs/breakdown` | Breakdown por categoria |
| `GET/POST` | `/api/v1/receipts` | Lista de recibos |
| `POST` | `/api/v1/receipts/whatsapp/simulate` | Simula envio de motorista |
| `POST` | `/api/v1/receipts/whatsapp/webhook` | Webhook real (multipart) |
| `POST` | `/api/v1/receipts/{id}/confirm` | Aprovar → gera custo |
| `POST` | `/api/v1/receipts/{id}/reject` | Rejeitar |
| `GET/POST/PATCH/DELETE` | `/api/v1/maintenance` | Manutenção |
| `GET` | `/api/v1/alerts` | Alertas de margem |
| `POST` | `/api/v1/alerts/{id}/resolve` | Marcar como resolvido |
| `GET` | `/api/v1/dashboard/kpis` | KPIs agregados |
| `GET` | `/api/v1/dashboard/vehicle-performance` | Linhas da tabela |
| `GET` | `/api/v1/dashboard/whatsapp-receipts` | Histórico do bot |
| `GET` | `/api/v1/dashboard/alerts` | Alertas ativos |

## Testes

```bash
cd backend
pip install -r requirements.txt
pytest
```

Cobertura:

- `test_auth.py` — registro, login, refresh, `/me`
- `test_vehicles.py` — CRUD + isolamento de tenant + busca + unicidade de placa
- `test_trips.py` — criação, conclusão, alertas ao cruzar margem
- `test_receipts_ocr.py` — parsers pt-BR (valor, placa, categoria) + fluxo WhatsApp simulado + confirmação
- `test_margin_alerts.py` — `_safe_margin`, KPIs do dashboard, performance, contagem de alertas

## Design System

Extraído do export oficial do Stitch (Apêndice A da spec). Tokens replicados em:

- **Backend:** sem CSS próprio — design é responsabilidade do frontend.
- **Frontend:** `frontend/tailwind.config.ts` contém as cores, fontes, espaçamentos e tokens de raio.

Regras de ouro:

- **Plus Jakarta Sans** → headings / display
- **Inter** → corpo
- **JetBrains Mono** → **todos os valores R$, placas e percentuais**
- **Material Symbols Outlined** → ícones
- Cards: `card-level-1` (borda cinza 1px) / `card-level-2` (borda preta 2px — alertas)
- Badges: verde `bg-success-background` para lucrativo, `bg-error-container` para alerta
- `text-data-mono-sm` para metadados secundários

## Arquitetura-chave

### Multi-tenancy
Toda tabela de negócio tem `company_id` (FK em `companies` com `ondelete="CASCADE"`). O backend injeta `company_id` automaticamente via `Depends(get_current_company_id)`. Nenhum endpoint de leitura/escrita aceita `company_id` do cliente.

### OCR plugável
`app/services/ocr_service.py` define `OCRServiceProtocol` e uma implementação `TesseractOCRService`. Para trocar por Google Vision / Textract basta criar outra classe e injetar via `set_ocr_service(...)` — nenhuma chamada precisa mudar.

### WhatsApp simulado
`POST /api/v1/receipts/whatsapp/simulate` é o atalho de dev. Quando a integração real for ligada, o webhook aponta para `POST /api/v1/receipts/whatsapp/webhook` (multipart), e ambos terminam criando um `Receipt` em `PENDING` — o fluxo de revisão é o mesmo.

### Margem & alertas
`app/services/margin_service.py` centraliza:
- Cálculo de margem
- Geração/atualização de `CostAlert` quando margem < threshold (configurável via `MARGIN_ALERT_THRESHOLD` no `.env` ou `Company.expected_margin`).
- Idempotência: ao reexecutar, atualiza o alerta existente em vez de duplicar.

## Variáveis de ambiente

`backend/.env.example` lista todas. Principais:

| Variável | Default | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | URL do Postgres (async) |
| `SECRET_KEY` | `change-me-...` | Chave JWT (**gerar com `secrets.token_urlsafe(48)`**) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 1 dia |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Origens permitidas |
| `STORAGE_DIR` | `./storage` | Onde salvar uploads (dev) |
| `MARGIN_ALERT_THRESHOLD` | `0.20` | Margem mínima (20%) |
| `TESSERACT_LANG` | `por+eng` | Idiomas OCR |

`frontend/.env.local`:

| Variável | Default | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | URL do backend |

## Próximos passos sugeridos (fora do MVP)

- Edição da empresa + convite de outros usuários
- Upload de planilhas (CT-e, Excel) com parser próprio
- Relatórios por período + gráficos de Fluxo de Caixa (Recharts já está instalado)
- Webhook real da WhatsApp Business API
- Troca do Tesseract por Google Cloud Vision (melhor acurácia)
- Storage S3/GCS em vez de disco local (atrás de `FileStorageService`)
