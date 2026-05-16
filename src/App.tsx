import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AlertTriangle, Archive, ArrowLeftRight, Bell, BarChart2, BellRing, Building, Building2, ChartNoAxesCombined, ClipboardList, CreditCard, Download, FileCheck, Gavel, HardHat, LayoutDashboard, Map, MessageSquare, Receipt, ReceiptText, RefreshCw, Scale, Send, Settings, Shield, TrendingUp, Upload, UserRoundSearch, Users, Wallet } from 'lucide-react';
import { PermissionsProvider } from './context/PermissionsContext';
import { SessionGate } from './components/SessionGate';
import { BuyerPortalLayout } from './components/BuyerPortalLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DevelopmentsPage } from './pages/DevelopmentsPage';
import { DevelopmentFormPage } from './pages/DevelopmentFormPage';
import { LotsPage } from './pages/LotsPage';
import { LotsMapPage } from './pages/LotsMapPage';
import { LotFormPage } from './pages/LotFormPage';
import { BuyersPage } from './pages/BuyersPage';
import { BuyerFormPage } from './pages/BuyerFormPage';
import { BuyerDetailPage } from './pages/BuyerDetailPage';
import { SalesPage } from './pages/SalesPage';
import { SaleFormPage } from './pages/SaleFormPage';
import { SaleDetailPage } from './pages/SaleDetailPage';
import { CommercialDashboardPage } from './pages/CommercialDashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadFormPage } from './pages/LeadFormPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { QuotationFormPage } from './pages/QuotationFormPage';
import { QuotationDetailPage } from './pages/QuotationDetailPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ReservationFormPage } from './pages/ReservationFormPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { BuyerLoginPage } from './pages/BuyerLoginPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerSalesPage } from './pages/BuyerSalesPage';
import { BuyerSaleDetailPage } from './pages/BuyerSaleDetailPage';
import { BuyerDocumentsPage } from './pages/BuyerDocumentsPage';
import { BuyerProfilePage } from './pages/BuyerProfilePage';
import { PaymentMethodsPage } from './pages/PaymentMethodsPage';
import { PaymentRequestsPage } from './pages/PaymentRequestsPage';
import { BuyerPaymentRequestsPage } from './pages/BuyerPaymentRequestsPage';
import { FinanceDashboardPage } from './pages/FinanceDashboardPage';
import { CashAccountsPage } from './pages/CashAccountsPage';
import { CashAccountFormPage } from './pages/CashAccountFormPage';
import { CashMovementsPage } from './pages/CashMovementsPage';
import { CashMovementFormPage } from './pages/CashMovementFormPage';
import { CashMovementDetailPage } from './pages/CashMovementDetailPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { SupplierFormPage } from './pages/SupplierFormPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ExpenseFormPage } from './pages/ExpenseFormPage';
import { ExpenseDetailPage } from './pages/ExpenseDetailPage';
import { WorkProjectsPage } from './pages/WorkProjectsPage';
import { WorkProjectFormPage } from './pages/WorkProjectFormPage';
import { WorkProjectDetailPage } from './pages/WorkProjectDetailPage';
import { LegalDashboardPage } from './pages/LegalDashboardPage';
import { DelinquencyCasesPage } from './pages/DelinquencyCasesPage';
import { DelinquencyCaseDetailPage } from './pages/DelinquencyCaseDetailPage';
import { RefinancingAgreementsPage } from './pages/RefinancingAgreementsPage';
import { RefinancingAgreementFormPage } from './pages/RefinancingAgreementFormPage';
import { RefinancingAgreementDetailPage } from './pages/RefinancingAgreementDetailPage';
import { LegalProcessesPage } from './pages/LegalProcessesPage';
import { LegalProcessFormPage } from './pages/LegalProcessFormPage';
import { LegalProcessDetailPage } from './pages/LegalProcessDetailPage';
import { DeedProcessesPage } from './pages/DeedProcessesPage';
import { DeedProcessFormPage } from './pages/DeedProcessFormPage';
import { DeedProcessDetailPage } from './pages/DeedProcessDetailPage';
import { DevelopmentMigrationPage } from './pages/DevelopmentMigrationPage';
import { MigrationsPage } from './pages/MigrationsPage';
import { MigrationDetailPage } from './pages/MigrationDetailPage';
import { ExecutiveDashboardPage } from './pages/ExecutiveDashboardPage';
import { ReportCommercialPage } from './pages/ReportCommercialPage';
import { ReportLotsPage } from './pages/ReportLotsPage';
import { ReportFinancialPage } from './pages/ReportFinancialPage';
import { ReportCashAndExpensesPage } from './pages/ReportCashAndExpensesPage';
import { ReportDelinquencyPage } from './pages/ReportDelinquencyPage';
import { ReportDeedsAndLegalPage } from './pages/ReportDeedsAndLegalPage';
import { ReportMigrationPage } from './pages/ReportMigrationPage';
import { AlertsPage } from './pages/AlertsPage';
import { AlertRulesPage } from './pages/AlertRulesPage';
import { CommunicationsPage } from './pages/CommunicationsPage';
import { CommunicationDetailPage } from './pages/CommunicationDetailPage';
import { CommunicationTemplatesPage } from './pages/CommunicationTemplatesPage';
import { CommunicationTemplateFormPage } from './pages/CommunicationTemplateFormPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CommunicationSettingsPage } from './pages/CommunicationSettingsPage';
import { BuyerNotificationsPage } from './pages/BuyerNotificationsPage';
import { OrgSettingsPage } from './pages/OrgSettingsPage';
import { DevelopmentSettingsListPage } from './pages/DevelopmentSettingsListPage';
import { DevelopmentSettingsPage } from './pages/DevelopmentSettingsPage';
import { RolesPage } from './pages/RolesPage';
import { RoleFormPage } from './pages/RoleFormPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ImportsPage } from './pages/ImportsPage';
import { ImportNewPage } from './pages/ImportNewPage';
import { ImportDetailPage } from './pages/ImportDetailPage';
import { ExportsPage } from './pages/ExportsPage';
import { BillingPage } from './pages/BillingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AdvancedLotsMapPage } from './pages/AdvancedLotsMapPage';
import { LotMapEditorPage } from './pages/LotMapEditorPage';
import { BackupJobsPage } from './pages/BackupJobsPage';
import { BackupJobFormPage } from './pages/BackupJobFormPage';
import { BackupRunsPage } from './pages/BackupRunsPage';
import { ManualBackupPage } from './pages/ManualBackupPage';
import { LandingPage } from './pages/LandingPage';
import { SuperAdminLayout } from './components/SuperAdminLayout';
import { SuperAdminDashboardPage } from './pages/superAdmin/SuperAdminDashboardPage';
import { SuperAdminOrganizationsPage } from './pages/superAdmin/SuperAdminOrganizationsPage';
import { SuperAdminOrganizationDetailPage } from './pages/superAdmin/SuperAdminOrganizationDetailPage';
import { SuperAdminPlansPage } from './pages/superAdmin/SuperAdminPlansPage';
import { SuperAdminPlanFormPage } from './pages/superAdmin/SuperAdminPlanFormPage';
import { SuperAdminPaymentsPage } from './pages/superAdmin/SuperAdminPaymentsPage';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/developments', label: 'Barrios', icon: Building2 },
  { to: '/lots', label: 'Lotes', icon: Map },
  { to: '/lots-map', label: 'Vista de lotes', icon: Map },
  { to: '/buyers', label: 'Compradores', icon: Users },
  { to: '/sales', label: 'Ventas', icon: ReceiptText },
  { to: '/commercial-dashboard', label: 'Dashboard comercial', icon: ChartNoAxesCombined },
  { to: '/leads', label: 'Interesados', icon: UserRoundSearch },
  { to: '/quotations', label: 'Cotizaciones', icon: ClipboardList },
  { to: '/reservations', label: 'Reservas', icon: ReceiptText },
  { to: '/payment-requests', label: 'Pagos informados', icon: CreditCard },
  { to: '/settings/payment-methods', label: 'Medios de pago', icon: CreditCard },
  { to: '/finance-dashboard', label: 'Dashboard financiero', icon: TrendingUp },
  { to: '/cash-accounts', label: 'Cajas / Cuentas', icon: Wallet },
  { to: '/cash-movements', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/expenses', label: 'Gastos', icon: Receipt },
  { to: '/suppliers', label: 'Proveedores', icon: Building },
  { to: '/work-projects', label: 'Obras', icon: HardHat },
  { to: '/legal-dashboard', label: 'Dashboard legal', icon: Scale },
  { to: '/delinquency-cases', label: 'Mora', icon: AlertTriangle },
  { to: '/refinancing-agreements', label: 'Refinanciaciones', icon: RefreshCw },
  { to: '/legal-processes', label: 'Procesos legales', icon: Gavel },
  { to: '/deed-processes', label: 'Escrituración', icon: FileCheck },
  { to: '/migrations', label: 'Migración a GestionAr', icon: ArrowLeftRight },
  { to: '/executive-dashboard', label: 'Ejecutivo', icon: BarChart2 },
  { to: '/reports/commercial', label: 'Rep. Comercial', icon: ChartNoAxesCombined },
  { to: '/reports/lots', label: 'Rep. Lotes', icon: Map },
  { to: '/reports/financial', label: 'Rep. Financiero', icon: TrendingUp },
  { to: '/reports/cash-and-expenses', label: 'Rep. Caja y gastos', icon: Wallet },
  { to: '/reports/delinquency', label: 'Rep. Mora', icon: AlertTriangle },
  { to: '/reports/deeds-and-legal', label: 'Rep. Legal', icon: Scale },
  { to: '/reports/migration', label: 'Rep. Migración', icon: ArrowLeftRight },
  { to: '/alerts', label: 'Alertas', icon: Bell },
  { to: '/alert-rules', label: 'Reglas de alerta', icon: Settings },
  { to: '/communications', label: 'Comunicaciones', icon: Send },
  { to: '/communication-templates', label: 'Plantillas', icon: MessageSquare },
  { to: '/notifications', label: 'Notificaciones', icon: BellRing },
  { to: '/communication-settings', label: 'Config. comunicaciones', icon: Settings },
  { to: '/settings/general', label: 'Config. general', icon: Settings },
  { to: '/settings/developments', label: 'Config. barrios', icon: Building2 },
  { to: '/settings/roles', label: 'Roles y permisos', icon: Shield },
  { to: '/settings/users', label: 'Usuarios y accesos', icon: Users },
  { to: '/settings/audit', label: 'Auditoría', icon: ClipboardList },
  { to: '/imports', label: 'Importaciones', icon: Upload },
  { to: '/exports', label: 'Exportaciones', icon: Download },
  { to: '/lots-map/advanced', label: 'Plano avanzado', icon: Map },
  { to: '/backups', label: 'Backups', icon: Archive },
  { to: '/billing', label: 'Mi plan', icon: CreditCard },
  { to: '/onboarding', label: 'Configuración inicial', icon: ClipboardList },
];

export function App(): React.ReactElement {
  return (
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
