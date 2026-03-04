# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a multi-repo project. The four services live in sibling directories:

```
docvault/
├── docvault-frontend/          # React SPA (this repo)
├── docvault-bff/               # Node.js BFF (port 4000)
├── documentservice/
│   └── docvault-document-service/   # Spring Boot (port 8080)
└── docvault-search-service/    # Spring Boot (port 8081)
```

## Commands

### Frontend (React / CRA)
```bash
npm install          # install deps
npm start            # dev server on :3000 (proxies /api → :4000)
npm run build        # production build → build/
```

### BFF (Node.js / Express)
```bash
npm install
npm run dev          # nodemon, auto-reload
npm start            # production
npm test             # jest
```

### Document Service & Search Service (Spring Boot / Maven)
```bash
mvn test             # run tests
mvn package -DskipTests   # build JAR
mvn spring-boot:run  # run locally (requires Azure env vars)

# Run a single test class
mvn test -Dtest=DocumentServiceTest
```

## Architecture

### Request Flow
```
Browser → React SPA (3000)
       → BFF /api/... (4000)
         → Document Service /v1/documents (8080)
         → Search Service /v1/search (8081)
```

The React SPA **never** calls microservices directly — all traffic goes through the BFF. The `"proxy": "http://localhost:4000"` in `package.json` handles this in development.

### BFF Path Routing
The BFF mounts routes at `/api/documents` and `/api/search`. When forwarding to microservices it strips the service prefix so the downstream path matches the Spring controller:
- `POST /api/documents/upload` → `POST http://DOCUMENT_SERVICE_URL/v1/documents/upload`
- `GET /api/search?q=foo` → `GET http://SEARCH_SERVICE_URL/v1/search?q=foo`

BFF env vars:
- `DOCUMENT_SERVICE_URL` (default: `http://localhost:8080`)
- `SEARCH_SERVICE_URL` (default: `http://localhost:8081`)
- `FRONTEND_URL` (CORS origin, default: `http://localhost:3000`)

### Document Upload Flow (important ordering)
1. BFF receives multipart form: `file` + `metadata` (must have `Content-Type: application/json`)
2. Document Service: call `file.getBytes()` **before** `blobService.uploadDocument()` — the blob upload consumes `getInputStream()` and subsequent `getBytes()` returns empty
3. Blob upload → Cosmos DB save → return `DocumentDto` immediately
4. `CompletableFuture.runAsync()` fires Tika text extraction + AI Search indexing (non-blocking)

### Azure Infrastructure
- **Cosmos DB**: Spring Data, container = `documents`, partition key = `/department`
- **Blob Storage**: containers `documents-hot` (Hot tier) + `documents-cold` (Cool/Archive). Only Hot and Archive tiers are surfaced in the UI.
- **Azure AI Search**: index `documents` — auto-created at startup by `AzureSearchService.ensureIndex()` if it doesn't exist
- **Container Apps**: resource group `docvault-dev-rg`, apps: `docvault-frontend`, `docvault-bff`, `docvault-document-service`, `docvault-search-service`

### Authentication
- Test login: `admin` / `docvault123` stored as `sessionStorage.getItem('dv_auth') === '1'`
- Microsoft SSO: `@azure/msal-browser` popup flow, config in `src/auth/msalConfig.js`
- Env vars needed: `REACT_APP_AZURE_CLIENT_ID`, `REACT_APP_AZURE_TENANT_ID`

### Frontend Structure
- `src/pages/` — Dashboard, LoginPage, SearchPage
- `src/components/` — DocumentTable, DocumentDrawer, StatsCards, UploadModal
- `src/auth/msalConfig.js` — MSAL config
- State: `react-query` v3 (`useQuery`, `useMutation`) for all server state
- Theme: Delta Dental green `#006B45`, CSS custom properties (`--accent`, `--bg`, `--surface`, `--muted`, `--text`)
- Spring Data `Page<T>` response shape is `{ content: [], totalElements: N }` — **not** `documents[]`/`total`

### Document Service Java Patterns
- `@RequestMapping("/v1/documents")` on `DocumentController`
- Upload endpoint: `@RequestPart("file") MultipartFile` + `@RequestPart("metadata") @Valid UploadMetadataDto`
- Text extraction: Apache Tika 2.9.1 — use `meta.add("Content-Type", value)` (not `Metadata.CONTENT_TYPE` which was removed in Tika 2.x)
- Search indexing: `POST {SEARCH_SERVICE_URL}/v1/search/index` with document map including `extractedText`

### Search Service Java Patterns
- `@RequestMapping("/v1/search")` on `SearchController`
- `AzureSearchService.ensureIndex()` runs at `@PostConstruct` — creates the `documents` index with suggester if absent
- Index endpoint: `POST /v1/search/index`
- Query endpoint: `GET /v1/search?q=...`

## CI/CD

GitHub Actions → GHCR → Azure Container Apps. Each repo has `.github/workflows/ci.yml`.

**Required GitHub Secrets** (per repo):
| Secret | Description |
|---|---|
| `AZURE_CREDENTIALS` | JSON from `az ad sp create-for-rbac --sdk-auth` |
| `AZURE_RESOURCE_GROUP` | `docvault-dev-rg` |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` + `write:packages` |
| `DOCUMENT_SERVICE_URL` | BFF + Document Service: URL of Document Service Container App |
| `SEARCH_SERVICE_URL` | BFF + Document Service: URL of Search Service Container App |

After deploy, CI runs `az containerapp update --set-env-vars` to inject service URLs. The step is guarded: it only runs if the secrets are non-empty, so missing secrets are a warning, not a failure.

GHCR image names:
- Frontend: `ghcr.io/vvaddineni/docvault-frontend`
- BFF: `ghcr.io/vvaddineni/docvault-bff`
- Document Service: `ghcr.io/<repo-owner>/docvault-document-service`
- Search Service: `ghcr.io/<repo-owner>/docvault-search-service`
