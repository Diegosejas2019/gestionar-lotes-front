import { lazy, Suspense } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AlertTriangle, Archive, ArrowLeftRight, Bell, BarChart2, BellRing, Building, Building2, ChartNoAxesCombined, ClipboardList, CreditCard, Download, FileCheck, Gavel, HardHat, LayoutDashboard, Map, MessageSquare, Receipt, ReceiptText, RefreshCw, Scale, Send, Settings, Shield, TrendingUp, Upload, UserRoundSearch, Users, Wallet } from 'lucide-react';
import { PermissionsProvider } from './context/PermissionsContext';
import { SessionGate } from './components/SessionGate';
import { BuyerPortalLayout } from './components/BuyerPortalLayout';
import { SuperAdminLayout } from './components/SuperAdminLayout';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(({ DashboardPage }) => ({ default: DashboardPage })));
const DevelopmentsPage = lazy(() => import('./pages/DevelopmentsPage').then(({ DevelopmentsPage }) => ({ default: DevelopmentsPage })));
const DevelopmentFormPage = lazy(() => import('./pages/DevelopmentFormPage').then(({ DevelopmentFormPage }) => ({ default: DevelopmentFormPage })));
const LotsPage = lazy(() => import('./pages/LotsPage').then(({ LotsPage }) => ({ default: LotsPage })));
const LotsMapPage = lazy(() => import('./pages/LotsMapPage').then(({ LotsMapPage }) => ({ default: LotsMapPage })));
const LotFormPage = lazy(() => import('./pages/LotFormPage').then(({ LotFormPage }) => ({ default: LotFormPage })));
const BuyersPage = lazy(() => import('./pages/BuyersPage').then(({ BuyersPage }) => ({ default: BuyersPage })));
const BuyerFormPage = lazy(() => import('./pages/BuyerFormPage').then(({ BuyerFormPage }) => ({ default: BuyerFormPage })));
const BuyerDetailPage = lazy(() => import('./pages/BuyerDetailPage').then(({ BuyerDetailPage }) => ({ default: BuyerDetailPage })));
const SalesPage = lazy(() => import('./pages/SalesPage').then(({ SalesPage }) => ({ default: SalesPage })));
const SaleFormPage = lazy(() => import('./pages/SaleFormPage').then(({ SaleFormPage }) => ({ default: SaleFormPage })));
const SaleDetailPage = lazy(() => import('./pages/SaleDetailPage').then(({ SaleDetailPage }) => ({ default: SaleDetailPage })));
const CommercialDashboardPage = lazy(() => import('./pages/CommercialDashboardPage').then(({ CommercialDashboardPage }) => ({ default: CommercialDashboardPage })));
const LeadsPage = lazy(() => import('./pages/LeadsPage').then(({ LeadsPage }) => ({ default: LeadsPage })));
const LeadFormPage = lazy(() => import('./pages/LeadFormPage').then(({ LeadFormPage }) => ({ default: LeadFormPage })));
const LeadDetailPage = lazy(() => import('./pages/LeadDetailPage').then(({ LeadDetailPage }) => ({ default: LeadDetailPage })));
const QuotationsPage = lazy(() => import('./pages/QuotationsPage').then(({ QuotationsPage }) => ({ default: QuotationsPage })));
const QuotationFormPage = lazy(() => import('./pages/QuotationFormPage').then(({ QuotationFormPage }) => ({ default: QuotationFormPage })));
const QuotationDetailPage = lazy(() => import('./pages/QuotationDetailPage').then(({ QuotationDetailPage }) => ({ default: QuotationDetailPage })));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage').then(({ ReservationsPage }) => ({ default: ReservationsPage })));
const ReservationFormPage = lazy(() => import('./pages/ReservationFormPage').then(({ ReservationFormPage }) => ({ default: ReservationFormPage })));
const ReservationDetailPage = lazy(() => import('./pages/ReservationDetailPage').then(({ ReservationDetailPage }) => ({ default: ReservationDetailPage })));
const BuyerLoginPage = lazy(() => import('./pages/BuyerLoginPage').then(({ BuyerLoginPage }) => ({ default: BuyerLoginPage })));
const BuyerDashboardPage = lazy(() => import('./pages/BuyerDashboardPage').then(({ BuyerDashboardPage }) => ({ default: BuyerDashboardPage })));
const BuyerSalesPage = lazy(() => import('./pages/BuyerSalesPage').then(({ BuyerSalesPage }) => ({ default: BuyerSalesPage })));
const BuyerSaleDetailPage = lazy(() => import('./pages/BuyerSaleDetailPage').then(({ BuyerSaleDetailPage }) => ({ default: BuyerSaleDetailPage })));
const BuyerDocumentsPage = lazy(() => import('./pages/BuyerDocumentsPage').then(({ BuyerDocumentsPage }) => ({ default: BuyerDocumentsPage })));
const BuyerProfilePage = lazy(() => import('./pages/BuyerProfilePage').then(({ BuyerProfilePage }) => ({ default: BuyerProfilePage })));
const PaymentMethodsPage = lazy(() => import('./pages/PaymentMethodsPage').then(({ PaymentMethodsPage }) => ({ default: PaymentMethodsPage })));
const PaymentRequestsPage = lazy(() => import('./pages/PaymentRequestsPage').then(({ PaymentRequestsPage }) => ({ default: PaymentRequestsPage })));
const BuyerPaymentRequestsPage = lazy(() => import('./pages/BuyerPaymentRequestsPage').then(({ BuyerPaymentRequestsPage }) => ({ default: BuyerPaymentRequestsPage })));
const FinanceDashboardPage = lazy(() => import('./pages/FinanceDashboardPage').then(({ FinanceDashboardPage }) => ({ default: FinanceDashboardPage })));
const CashAccountsPage = lazy(() => import('./pages/CashAccountsPage').then(({ CashAccountsPage }) => ({ default: CashAccountsPage })));
const CashAccountFormPage = lazy(() => import('./pages/CashAccountFormPage').then(({ CashAccountFormPage }) => ({ default: CashAccountFormPage })));
const CashMovementsPage = lazy(() => import('./pages/CashMovementsPage').then(({ CashMovementsPage }) => ({ default: CashMovementsPage })));
const CashMovementFormPage = lazy(() => import('./pages/CashMovementFormPage').then(({ CashMovementFormPage }) => ({ default: CashMovementFormPage })));
const CashMovementDetailPage = lazy(() => import('./pages/CashMovementDetailPage').then(({ CashMovementDetailPage }) => ({ default: CashMovementDetailPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then(({ SuppliersPage }) => ({ default: SuppliersPage })));
const SupplierFormPage = lazy(() => import('./pages/SupplierFormPage').then(({ SupplierFormPage }) => ({ default: SupplierFormPage })));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then(({ ExpensesPage }) => ({ default: ExpensesPage })));
const ExpenseFormPage = lazy(() => import('./pages/ExpenseFormPage').then(({ ExpenseFormPage }) => ({ default: ExpenseFormPage })));
const ExpenseDetailPage = lazy(() => import('./pages/ExpenseDetailPage').then(({ ExpenseDetailPage }) => ({ default: ExpenseDetailPage })));
const WorkProjectsPage = lazy(() => import('./pages/WorkProjectsPage').then(({ WorkProjectsPage }) => ({ default: WorkProjectsPage })));
const WorkProjectFormPage = lazy(() => import('./pages/WorkProjectFormPage').then(({ WorkProjectFormPage }) => ({ default: WorkProjectFormPage })));
const WorkProjectDetailPage = lazy(() => import('./pages/WorkProjectDetailPage').then(({ WorkProjectDetailPage }) => ({ default: WorkProjectDetailPage })));
const LegalDashboardPage = lazy(() => import('./pages/LegalDashboardPage').then(({ LegalDashboardPage }) => ({ default: LegalDashboardPage })));
const DelinquencyCasesPage = lazy(() => import('./pages/DelinquencyCasesPage').then(({ DelinquencyCasesPage }) => ({ default: DelinquencyCasesPage })));
const DelinquencyCaseDetailPage = lazy(() => import('./pages/DelinquencyCaseDetailPage').then(({ DelinquencyCaseDetailPage }) => ({ default: DelinquencyCaseDetailPage })));
const RefinancingAgreementsPage = lazy(() => import('./pages/RefinancingAgreementsPage').then(({ RefinancingAgreementsPage }) => ({ default: RefinancingAgreementsPage })));
const RefinancingAgreementFormPage = lazy(() => import('./pages/RefinancingAgreementFormPage').then(({ RefinancingAgreementFormPage }) => ({ default: RefinancingAgreementFormPage })));
const RefinancingAgreementDetailPage = lazy(() => import('./pages/RefinancingAgreementDetailPage').then(({ RefinancingAgreementDetailPage }) => ({ default: RefinancingAgreementDetailPage })));
const LegalProcessesPage = lazy(() => import('./pages/LegalProcessesPage').then(({ LegalProcessesPage }) => ({ default: LegalProcessesPage })));
const LegalProcessFormPage = lazy(() => import('./pages/LegalProcessFormPage').then(({ LegalProcessFormPage }) => ({ default: LegalProcessFormPage })));
const LegalProcessDetailPage = lazy(() => import('./pages/LegalProcessDetailPage').then(({ LegalProcessDetailPage }) => ({ default: LegalProcessDetailPage })));
const DeedProcessesPage = lazy(() => import('./pages/DeedProcessesPage').then(({ DeedProcessesPage }) => ({ default: DeedProcessesPage })));
const DeedProcessFormPage = lazy(() => import('./pages/DeedProcessFormPage').then(({ DeedProcessFormPage }) => ({ default: DeedProcessFormPage })));
const DeedProcessDetailPage = lazy(() => import('./pages/DeedProcessDetailPage').then(({ DeedProcessDetailPage }) => ({ default: DeedProcessDetailPage })));
const DevelopmentMigrationPage = lazy(() => import('./pages/DevelopmentMigrationPage').then(({ DevelopmentMigrationPage }) => ({ default: DevelopmentMigrationPage })));
const MigrationsPage = lazy(() => import('./pages/MigrationsPage').then(({ MigrationsPage }) => ({ default: MigrationsPage })));
const MigrationDetailPage = lazy(() => import('./pages/MigrationDetailPage').then(({ MigrationDetailPage }) => ({ default: MigrationDetailPage })));
const ExecutiveDashboardPage = lazy(() => import('./pages/ExecutiveDashboardPage').then(({ ExecutiveDashboardPage }) => ({ default: ExecutiveDashboardPage })));
const ReportCommercialPage = lazy(() => import('./pages/ReportCommercialPage').then(({ ReportCommercialPage }) => ({ default: ReportCommercialPage })));
const ReportLotsPage = lazy(() => import('./pages/ReportLotsPage').then(({ ReportLotsPage }) => ({ default: ReportLotsPage })));
const ReportFinancialPage = lazy(() => import('./pages/ReportFinancialPage').then(({ ReportFinancialPage }) => ({ default: ReportFinancialPage })));
const ReportCashAndExpensesPage = lazy(() => import('./pages/ReportCashAndExpensesPage').then(({ ReportCashAndExpensesPage }) => ({ default: ReportCashAndExpensesPage })));
const ReportDelinquencyPage = lazy(() => import('./pages/ReportDelinquencyPage').then(({ ReportDelinquencyPage }) => ({ default: ReportDelinquencyPage })));
const ReportDeedsAndLegalPage = lazy(() => import('./pages/ReportDeedsAndLegalPage').then(({ ReportDeedsAndLegalPage }) => ({ default: ReportDeedsAndLegalPage })));
const ReportMigrationPage = lazy(() => import('./pages/ReportMigrationPage').then(({ ReportMigrationPage }) => ({ default: ReportMigrationPage })));
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(({ AlertsPage }) => ({ default: AlertsPage })));
const AlertRulesPage = lazy(() => import('./pages/AlertRulesPage').then(({ AlertRulesPage }) => ({ default: AlertRulesPage })));
const CommunicationsPage = lazy(() => import('./pages/CommunicationsPage').then(({ CommunicationsPage }) => ({ default: CommunicationsPage })));
const CommunicationDetailPage = lazy(() => import('./pages/CommunicationDetailPage').then(({ CommunicationDetailPage }) => ({ default: CommunicationDetailPage })));
const CommunicationTemplatesPage = lazy(() => import('./pages/CommunicationTemplatesPage').then(({ CommunicationTemplatesPage }) => ({ default: CommunicationTemplatesPage })));
const CommunicationTemplateFormPage = lazy(() => import('./pages/CommunicationTemplateFormPage').then(({ CommunicationTemplateFormPage }) => ({ default: CommunicationTemplateFormPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(({ NotificationsPage }) => ({ default: NotificationsPage })));
const CommunicationSettingsPage = lazy(() => import('./pages/CommunicationSettingsPage').then(({ CommunicationSettingsPage }) => ({ default: CommunicationSettingsPage })));
const BuyerNotificationsPage = lazy(() => import('./pages/BuyerNotificationsPage').then(({ BuyerNotificationsPage }) => ({ default: BuyerNotificationsPage })));
const OrgSettingsPage = lazy(() => import('./pages/OrgSettingsPage').then(({ OrgSettingsPage }) => ({ default: OrgSettingsPage })));
const DevelopmentSettingsListPage = lazy(() => import('./pages/DevelopmentSettingsListPage').then(({ DevelopmentSettingsListPage }) => ({ default: DevelopmentSettingsListPage })));
const DevelopmentSettingsPage = lazy(() => import('./pages/DevelopmentSettingsPage').then(({ DevelopmentSettingsPage }) => ({ default: DevelopmentSettingsPage })));
const RolesPage = lazy(() => import('./pages/RolesPage').then(({ RolesPage }) => ({ default: RolesPage })));
const RoleFormPage = lazy(() => import('./pages/RoleFormPage').then(({ RoleFormPage }) => ({ default: RoleFormPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(({ UsersPage }) => ({ default: UsersPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(({ AuditLogsPage }) => ({ default: AuditLogsPage })));
const ImportsPage = lazy(() => import('./pages/ImportsPage').then(({ ImportsPage }) => ({ default: ImportsPage })));
const ImportNewPage = lazy(() => import('./pages/ImportNewPage').then(({ ImportNewPage }) => ({ default: ImportNewPage })));
const ImportDetailPage = lazy(() => import('./pages/ImportDetailPage').then(({ ImportDetailPage }) => ({ default: ImportDetailPage })));
const ExportsPage = lazy(() => import('./pages/ExportsPage').then(({ ExportsPage }) => ({ default: ExportsPage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(({ BillingPage }) => ({ default: BillingPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(({ OnboardingPage }) => ({ default: OnboardingPage })));
const AdvancedLotsMapPage = lazy(() => import('./pages/AdvancedLotsMapPage').then(({ AdvancedLotsMapPage }) => ({ default: AdvancedLotsMapPage })));
const LotMapEditorPage = lazy(() => import('./pages/LotMapEditorPage').then(({ LotMapEditorPage }) => ({ default: LotMapEditorPage })));
const BackupJobsPage = lazy(() => import('./pages/BackupJobsPage').then(({ BackupJobsPage }) => ({ default: BackupJobsPage })));
const BackupJobFormPage = lazy(() => import('./pages/BackupJobFormPage').then(({ BackupJobFormPage }) => ({ default: BackupJobFormPage })));
const BackupRunsPage = lazy(() => import('./pages/BackupRunsPage').then(({ BackupRunsPage }) => ({ default: BackupRunsPage })));
const ManualBackupPage = lazy(() => import('./pages/ManualBackupPage').then(({ ManualBackupPage }) => ({ default: ManualBackupPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(({ LandingPage }) => ({ default: LandingPage })));
const SuperAdminDashboardPage = lazy(() => import('./pages/superAdmin/SuperAdminDashboardPage').then(({ SuperAdminDashboardPage }) => ({ default: SuperAdminDashboardPage })));
const SuperAdminOrganizationsPage = lazy(() => import('./pages/superAdmin/SuperAdminOrganizationsPage').then(({ SuperAdminOrganizationsPage }) => ({ default: SuperAdminOrganizationsPage })));
const SuperAdminOrganizationDetailPage = lazy(() => import('./pages/superAdmin/SuperAdminOrganizationDetailPage').then(({ SuperAdminOrganizationDetailPage }) => ({ default: SuperAdminOrganizationDetailPage })));
const SuperAdminPlansPage = lazy(() => import('./pages/superAdmin/SuperAdminPlansPage').then(({ SuperAdminPlansPage }) => ({ default: SuperAdminPlansPage })));
const SuperAdminPlanFormPage = lazy(() => import('./pages/superAdmin/SuperAdminPlanFormPage').then(({ SuperAdminPlanFormPage }) => ({ default: SuperAdminPlanFormPage })));
const SuperAdminPaymentsPage = lazy(() => import('./pages/superAdmin/SuperAdminPaymentsPage').then(({ SuperAdminPaymentsPage }) => ({ default: SuperAdminPaymentsPage })));

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/developments', label: 'Barrios', icon: Building2 },
      { to: '/lots', label: 'Lotes', icon: Map },
      { to: '/lots-map', label: 'Vista de lotes', icon: Map },
      { to: '/buyers', label: 'Compradores', icon: Users },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { to: '/sales', label: 'Ventas', icon: ReceiptText },
      { to: '/commercial-dashboard', label: 'Dashboard comercial', icon: ChartNoAxesCombined },
      { to: '/leads', label: 'Interesados', icon: UserRoundSearch },
      { to: '/quotations', label: 'Cotizaciones', icon: ClipboardList },
      { to: '/reservations', label: 'Reservas', icon: ReceiptText },
      { to: '/payment-requests', label: 'Pagos informados', icon: CreditCard },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/finance-dashboard', label: 'Dashboard financiero', icon: TrendingUp },
      { to: '/cash-accounts', label: 'Cajas / Cuentas', icon: Wallet },
      { to: '/cash-movements', label: 'Movimientos', icon: ArrowLeftRight },
      { to: '/expenses', label: 'Gastos', icon: Receipt },
      { to: '/suppliers', label: 'Proveedores', icon: Building },
      { to: '/work-projects', label: 'Obras', icon: HardHat },
    ],
  },
  {
    label: 'Legal',
    items: [
      { to: '/legal-dashboard', label: 'Dashboard legal', icon: Scale },
      { to: '/delinquency-cases', label: 'Mora', icon: AlertTriangle },
      { to: '/refinancing-agreements', label: 'Refinanciaciones', icon: RefreshCw },
      { to: '/legal-processes', label: 'Procesos legales', icon: Gavel },
      { to: '/deed-processes', label: 'Escrituración', icon: FileCheck },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { to: '/executive-dashboard', label: 'Ejecutivo', icon: BarChart2 },
      { to: '/reports/commercial', label: 'Rep. Comercial', icon: ChartNoAxesCombined },
      { to: '/reports/lots', label: 'Rep. Lotes', icon: Map },
      { to: '/reports/financial', label: 'Rep. Financiero', icon: TrendingUp },
      { to: '/reports/cash-and-expenses', label: 'Rep. Caja y gastos', icon: Wallet },
      { to: '/reports/delinquency', label: 'Rep. Mora', icon: AlertTriangle },
      { to: '/reports/deeds-and-legal', label: 'Rep. Legal', icon: Scale },
      { to: '/reports/migration', label: 'Rep. Migración', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Comunicaciones',
    items: [
      { to: '/communications', label: 'Comunicaciones', icon: Send },
      { to: '/communication-templates', label: 'Plantillas', icon: MessageSquare },
      { to: '/notifications', label: 'Notificaciones', icon: BellRing },
      { to: '/alerts', label: 'Alertas', icon: Bell },
      { to: '/alert-rules', label: 'Reglas de alerta', icon: Settings },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { to: '/settings/general', label: 'Config. general', icon: Settings },
      { to: '/settings/developments', label: 'Config. barrios', icon: Building2 },
      { to: '/settings/payment-methods', label: 'Medios de pago', icon: CreditCard },
      { to: '/communication-settings', label: 'Config. comunicaciones', icon: Settings },
      { to: '/settings/roles', label: 'Roles y permisos', icon: Shield },
      { to: '/settings/users', label: 'Usuarios y accesos', icon: Users },
      { to: '/settings/audit', label: 'Auditoría', icon: ClipboardList },
      { to: '/imports', label: 'Importaciones', icon: Upload },
      { to: '/exports', label: 'Exportaciones', icon: Download },
      { to: '/lots-map/advanced', label: 'Plano avanzado', icon: Map },
      { to: '/migrations', label: 'Migración a GestionAr', icon: ArrowLeftRight },
      { to: '/backups', label: 'Backups', icon: Archive },
      { to: '/billing', label: 'Mi plan', icon: CreditCard },
      { to: '/onboarding', label: 'Configuración inicial', icon: ClipboardList },
    ],
  },
];

export function App(): React.ReactElement {
  return (
    <Suspense fallback={<div className="loading">Cargando...</div>}>
      <Routes>
      <Route path="/buyer/login" element={<BuyerLoginPage />} />
      <Route path="/buyer" element={<BuyerPortalLayout />}>
        <Route index element={<Navigate to="/buyer/dashboard" replace />} />
        <Route path="dashboard" element={<BuyerDashboardPage />} />
        <Route path="sales" element={<BuyerSalesPage />} />
        <Route path="sales/:id" element={<BuyerSaleDetailPage />} />
        <Route path="documents" element={<BuyerDocumentsPage />} />
        <Route path="payment-requests" element={<BuyerPaymentRequestsPage />} />
        <Route path="profile" element={<BuyerProfilePage />} />
        <Route path="notifications" element={<BuyerNotificationsPage />} />
      </Route>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="organizations" element={<SuperAdminOrganizationsPage />} />
        <Route path="organizations/:id" element={<SuperAdminOrganizationDetailPage />} />
        <Route path="plans" element={<SuperAdminPlansPage />} />
        <Route path="plans/new" element={<SuperAdminPlanFormPage />} />
        <Route path="plans/:id/edit" element={<SuperAdminPlanFormPage />} />
        <Route path="payments" element={<SuperAdminPaymentsPage />} />
      </Route>
      <Route path="/*" element={<AdminApp />} />
      </Routes>
    </Suspense>
  );
}

function AdminApp(): React.ReactElement {
  return (
    <SessionGate>
      <PermissionsProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">GL</span>
            <div>
              <strong>GestionAr Lotes</strong>
              <small>Administracion comercial</small>
            </div>
          </div>
          <nav className="nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/developments" element={<DevelopmentsPage />} />
            <Route path="/developments/new" element={<DevelopmentFormPage />} />
            <Route path="/developments/:id/edit" element={<DevelopmentFormPage />} />
            <Route path="/lots" element={<LotsPage />} />
            <Route path="/lots-map" element={<LotsMapPage />} />
            <Route path="/lots/new" element={<LotFormPage />} />
            <Route path="/lots/:id/edit" element={<LotFormPage />} />
            <Route path="/buyers" element={<BuyersPage />} />
            <Route path="/buyers/new" element={<BuyerFormPage />} />
            <Route path="/buyers/:id" element={<BuyerDetailPage />} />
            <Route path="/buyers/:id/edit" element={<BuyerFormPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/new" element={<SaleFormPage />} />
            <Route path="/sales/:id" element={<SaleDetailPage />} />
            <Route path="/sales/:id/edit" element={<SaleFormPage />} />
            <Route path="/commercial-dashboard" element={<CommercialDashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/new" element={<LeadFormPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/leads/:id/edit" element={<LeadFormPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/quotations/new" element={<QuotationFormPage />} />
            <Route path="/quotations/:id" element={<QuotationDetailPage />} />
            <Route path="/quotations/:id/edit" element={<QuotationFormPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/reservations/new" element={<ReservationFormPage />} />
            <Route path="/reservations/:id" element={<ReservationDetailPage />} />
            <Route path="/reservations/:id/edit" element={<ReservationFormPage />} />
            <Route path="/payment-requests" element={<PaymentRequestsPage />} />
            <Route path="/settings/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/finance-dashboard" element={<FinanceDashboardPage />} />
            <Route path="/cash-accounts" element={<CashAccountsPage />} />
            <Route path="/cash-accounts/new" element={<CashAccountFormPage />} />
            <Route path="/cash-accounts/:id/edit" element={<CashAccountFormPage />} />
            <Route path="/cash-movements" element={<CashMovementsPage />} />
            <Route path="/cash-movements/new" element={<CashMovementFormPage />} />
            <Route path="/cash-movements/:id" element={<CashMovementDetailPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<SupplierFormPage />} />
            <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
            <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
            <Route path="/work-projects" element={<WorkProjectsPage />} />
            <Route path="/work-projects/new" element={<WorkProjectFormPage />} />
            <Route path="/work-projects/:id" element={<WorkProjectDetailPage />} />
            <Route path="/work-projects/:id/edit" element={<WorkProjectFormPage />} />
            <Route path="/legal-dashboard" element={<LegalDashboardPage />} />
            <Route path="/delinquency-cases" element={<DelinquencyCasesPage />} />
            <Route path="/delinquency-cases/:id" element={<DelinquencyCaseDetailPage />} />
            <Route path="/refinancing-agreements" element={<RefinancingAgreementsPage />} />
            <Route path="/refinancing-agreements/new" element={<RefinancingAgreementFormPage />} />
            <Route path="/refinancing-agreements/:id" element={<RefinancingAgreementDetailPage />} />
            <Route path="/legal-processes" element={<LegalProcessesPage />} />
            <Route path="/legal-processes/new" element={<LegalProcessFormPage />} />
            <Route path="/legal-processes/:id" element={<LegalProcessDetailPage />} />
            <Route path="/deed-processes" element={<DeedProcessesPage />} />
            <Route path="/deed-processes/new" element={<DeedProcessFormPage />} />
            <Route path="/deed-processes/:id" element={<DeedProcessDetailPage />} />
            <Route path="/developments/:id/migration" element={<DevelopmentMigrationPage />} />
            <Route path="/migrations" element={<MigrationsPage />} />
            <Route path="/migrations/:id" element={<MigrationDetailPage />} />
            <Route path="/executive-dashboard" element={<ExecutiveDashboardPage />} />
            <Route path="/reports/commercial" element={<ReportCommercialPage />} />
            <Route path="/reports/lots" element={<ReportLotsPage />} />
            <Route path="/reports/financial" element={<ReportFinancialPage />} />
            <Route path="/reports/cash-and-expenses" element={<ReportCashAndExpensesPage />} />
            <Route path="/reports/delinquency" element={<ReportDelinquencyPage />} />
            <Route path="/reports/deeds-and-legal" element={<ReportDeedsAndLegalPage />} />
            <Route path="/reports/migration" element={<ReportMigrationPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alert-rules" element={<AlertRulesPage />} />
            <Route path="/communications" element={<CommunicationsPage />} />
            <Route path="/communications/:id" element={<CommunicationDetailPage />} />
            <Route path="/communication-templates" element={<CommunicationTemplatesPage />} />
            <Route path="/communication-templates/new" element={<CommunicationTemplateFormPage />} />
            <Route path="/communication-templates/:id/edit" element={<CommunicationTemplateFormPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/communication-settings" element={<CommunicationSettingsPage />} />
            <Route path="/settings/general" element={<OrgSettingsPage />} />
            <Route path="/settings/developments" element={<DevelopmentSettingsListPage />} />
            <Route path="/settings/developments/:id" element={<DevelopmentSettingsPage />} />
            <Route path="/settings/roles" element={<RolesPage />} />
            <Route path="/settings/roles/new" element={<RoleFormPage />} />
            <Route path="/settings/roles/:id/edit" element={<RoleFormPage />} />
            <Route path="/settings/users" element={<UsersPage />} />
            <Route path="/settings/audit" element={<AuditLogsPage />} />
            <Route path="/imports" element={<ImportsPage />} />
            <Route path="/imports/new" element={<ImportNewPage />} />
            <Route path="/imports/:id" element={<ImportDetailPage />} />
            <Route path="/exports" element={<ExportsPage />} />
            <Route path="/lots-map/advanced" element={<AdvancedLotsMapPage />} />
            <Route path="/lots-map/editor" element={<LotMapEditorPage />} />
            <Route path="/backups" element={<BackupJobsPage />} />
            <Route path="/backups/new" element={<BackupJobFormPage />} />
            <Route path="/backups/:id/edit" element={<BackupJobFormPage />} />
            <Route path="/backups/runs" element={<BackupRunsPage />} />
            <Route path="/backups/manual" element={<ManualBackupPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      </PermissionsProvider>
    </SessionGate>
  );
}
