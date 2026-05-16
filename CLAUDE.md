# lotes-front — Frontend GestionAr Lotes

## Stack
- React 19 + TypeScript + Vite
- React Router DOM v7
- lucide-react (iconos)
- Sin UI library — CSS propio con clases `table-wrap`, `data-table`, etc.

## Estructura
```
src/
  api/
    apiClient.ts     — fetch wrapper, token, ApiError
    services.ts      — todos los métodos de API agrupados por dominio
  components/        — componentes reutilizables
  context/
    PermissionsContext.tsx — permisos RBAC + acceso a barrios
  pages/             — una página por ruta
  types.ts           — todos los tipos del dominio
  utils/
    format.ts        — getId, asBuyer, asLot, formatCurrency, formatDate, etc.
    labels.ts        — mapas de label para enums
```

## Cómo hacer llamadas a la API

Usar siempre las funciones de `apiClient.ts`. Nunca usar `fetch` directo.

```ts
import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient';

apiGet<T>(path, params?)        // GET con query params opcionales
apiPost<T>(path, body)          // POST JSON
apiPut<T>(path, body)           // PUT JSON
apiDelete<T>(path)              // DELETE
apiUpload<T>(path, formData)    // POST multipart
```

Todos los servicios van en `src/api/services.ts`, agrupados por módulo:
```ts
export const developmentsApi = { list, get, create, update, ... };
export const lotsApi = { ... };
// etc.
```

## Componentes reutilizables

| Componente | Props clave | Notas |
|---|---|---|
| `DataTable<T>` | `columns`, `rows`, `getRowKey` | `getRowKey` es **obligatorio** |
| `PageHeader` | `title`, `actions?` | Header de página estándar |
| `StatusBadge` | `status`, `type?` | Badges de color para estados |
| `LoadingState` | — | Spinner de carga |
| `ErrorMessage` | `message` | Mensaje de error inline |
| `DateDisplay` | `value` | Usa prop `value`, NO `date` |
| `CurrencyAmount` | `amount`, `currency` | Formatea con `Intl` |
| `EmptyState` | `title` | Estado vacío de tabla/lista |
| `ConfirmDialog` | `open`, `onConfirm`, `onCancel`, `message` | Dialog de confirmación |
| `FilterBar` | `children` | Wrapper de filtros |
| `SessionGate` | — | Guarda rutas admin (requiere token) |

## Tipos y utilidades

Todos los tipos del dominio están en `src/types.ts`. Los campos de MongoDB son `_id: Id` (string).

Las relaciones populadas son `Id | Tipo` (pueden venir como string o como objeto).
Usar helpers de `format.ts` para resolverlas:

```ts
import { getId, asBuyer, asLot, asDevelopment, asLead } from '../utils/format';

getId(sale.lotId)         // siempre string
asBuyer(sale.buyerId)     // Buyer | null
asLot(sale.lotId)         // Lot | null
```

Otras utilidades de `format.ts`:
```ts
formatCurrency(amount, currency)   // "$ 1.234,00" / "US$ 500,00"
formatDate(isoString)              // "15/05/2026"
toInputDate(isoString)             // "2026-05-15" para inputs date
buyerName(buyer)                   // "Juan Pérez"
lotLabel(lot)                      // "Mz. A · Lote 12"
```

## Permisos (RBAC)

```ts
import { usePermissions } from '../context/PermissionsContext';

const { hasPermission, canAccessDevelopment } = usePermissions();
hasPermission('sales', 'create')
canAccessDevelopment(developmentId)
```

## Auth

- Token JWT en `localStorage` bajo la clave `gestionar_lotes_token`
- `getToken()`, `saveToken(token)`, `clearToken()` en `apiClient.ts`
- `SessionGate` wrappea las rutas protegidas
- Portal comprador: rutas `/buyer/*`, layout `BuyerPortalLayout`

## Variable de entorno

```
VITE_API_BASE_URL=http://localhost:5001   # default si no está definida
```

## Convenciones

- Todos los textos UI en **español**
- Mensajes de error en español
- Formularios usan `FormData` + `e.currentTarget` o estado controlado
- Páginas de detalle: `useParams` → fetch → render
- Páginas de lista: `useEffect` → `apiGet` → `DataTable`
- Páginas de form: `handleSubmit` → `apiPost/apiPut` → `navigate(-1)`
- No hay estado global (Redux/Zustand) — solo React state local + context de permisos
- `organizationId` nunca se manda desde el frontend — el backend lo extrae del JWT

## Módulos implementados

| Área | Páginas |
|---|---|
| Core | Developments, Lots, Buyers, Sales |
| Comercial | Leads, Quotations, Reservations, CommercialDashboard |
| Finanzas | CashAccounts, CashMovements, Expenses, Suppliers, WorkProjects, FinanceDashboard |
| Legal | DelinquencyCases, RefinancingAgreements, LegalProcesses, DeedProcesses, LegalDashboard |
| Buyer Portal | Login, Dashboard, Sales, SaleDetail, Documents, Profile, PaymentRequests, Notifications |
| Admin | Payments, PaymentRequests, Alerts, AlertRules, Roles, OrgSettings, DevelopmentSettings, AuditLogs |
| Reports | Commercial, Lots, Financial, DeedsAndLegal, Delinquency, CashAndExpenses, Migration |
| Dashboards | Executive, Dashboard |
| Comunicaciones | Communications, CommunicationTemplates, CommunicationSettings, Notifications |
| Migración | MigrationsPage, MigrationDetailPage, DevelopmentMigrationPage |

## Comandos

```bash
npm run dev      # servidor dev en puerto 5173
npm run build    # tsc + vite build
npm run preview  # previsualizar build
```
