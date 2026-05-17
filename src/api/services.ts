import { apiDelete, apiGet, apiPost, apiPut, apiUpload, buildApiUrl, getToken } from './apiClient';
import type { Alert, AlertRule, AuditLog, Buyer, BuyerDashboard, BuyerPortalDocument, BuyerPortalInstallment, BuyerPortalPayment, BuyerPortalProfile, BuyerPortalSaleDetail, BuyerSaleSummary, CashAccount, CashMovement, CommunicationLog, CommunicationSettings, CommunicationTemplate, DashboardSummary, DeedProcess, DelinquencyAction, DelinquencyCase, Development, DevelopmentSettings, EffectivePermissions, ExecutiveSummary, Expense, FinanceDashboardSummary, GeneratedDocument, ImportBatch, ImportRow, ImportTemplate, Installment, Lead, LeadActivity, LegalDashboardSummary, LegalProcess, Lot, LotsMapResponse, LotsMapSummary, MigrationBatch, MigrationExecuteConfig, MigrationItem, MigrationPreviewResult, MigrationStatusResponse, Notification, OnboardingChecklist, OrganizationSettings, OrganizationSubscription, Payment, PaymentMethodConfig, PaymentRequest, PermissionsCatalogModule, PlanLimits, PlanModules, Quotation, RefinancingAgreement, Reservation, Role, SaasDashboard, Sale, SaleDetail, Supplier, SubscriptionPayment, SubscriptionPlan, UsageInfo, UserRoleAssignment, WorkProgressLog, WorkProject } from '../types';

export const developmentsApi = {
  list: () => apiGet<{ developments: Development[] }>('/api/developments'),
  get: (id: string) => apiGet<{ development: Development }>(`/api/developments/${id}`),
  create: (payload: Partial<Development>) => apiPost<{ development: Development }>('/api/developments', payload),
  update: (id: string, payload: Partial<Development>) => apiPut<{ development: Development }>(`/api/developments/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/developments/${id}`),
};

export const lotsApi = {
  list: (params: URLSearchParams = new URLSearchParams()) => apiGet<{ lots: Lot[] }>(`/api/lots${params.size ? `?${params}` : ''}`),
  get: (id: string) => apiGet<{ lot: Lot }>(`/api/lots/${id}`),
  create: (payload: Partial<Lot>) => apiPost<{ lot: Lot }>('/api/lots', payload),
  update: (id: string, payload: Partial<Lot>) => apiPut<{ lot: Lot }>(`/api/lots/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/lots/${id}`),
};

export const lotsMapApi = {
  getLotsMap: (params: URLSearchParams) => apiGet<LotsMapResponse>(`/api/lots-map?${params}`),
  getLotsMapSummary: (developmentId: string) => apiGet<LotsMapSummary>(`/api/lots-map/summary?developmentId=${developmentId}`),
};

export const buyersApi = {
  list: () => apiGet<{ buyers: Buyer[] }>('/api/buyers'),
  get: (id: string) => apiGet<{ buyer: Buyer }>(`/api/buyers/${id}`),
  create: (payload: Partial<Buyer>) => apiPost<{ buyer: Buyer }>('/api/buyers', payload),
  update: (id: string, payload: Partial<Buyer>) => apiPut<{ buyer: Buyer }>(`/api/buyers/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/buyers/${id}`),
};

export const salesApi = {
  list: () => apiGet<{ sales: Sale[] }>('/api/sales'),
  get: (id: string) => apiGet<SaleDetail>(`/api/sales/${id}`),
  create: (payload: Partial<Sale>) => apiPost<{ sale: Sale }>('/api/sales', payload),
  update: (id: string, payload: Partial<Sale>) => apiPut<{ sale: Sale }>(`/api/sales/${id}`, payload),
  registerDownPayment: (id: string, payload: Partial<Payment>) => apiPost<{ sale: Sale }>(`/api/sales/${id}/register-down-payment`, payload),
  cancel: (id: string, payload: { reason?: string }) => apiPost<{ sale: Sale }>(`/api/sales/${id}/cancel`, payload),
  installments: (id: string) => apiGet<{ installments: Installment[] }>(`/api/sales/${id}/installments`),
  payments: (id: string) => apiGet<{ payments: Payment[] }>(`/api/sales/${id}/payments`),
  documents: (id: string) => apiGet<{ documents: GeneratedDocument[] }>(`/api/sales/${id}/documents`),
  generateAccountStatement: (id: string) => apiPost<{ document: GeneratedDocument }>(`/api/sales/${id}/documents/account-statement`, {}),
  generateSaleCertificate: (id: string) => apiPost<{ document: GeneratedDocument }>(`/api/sales/${id}/documents/sale-certificate`, {}),
  generateDebtFreeCertificate: (id: string) => apiPost<{ document: GeneratedDocument }>(`/api/sales/${id}/documents/debt-free-certificate`, {}),
};

export const installmentsApi = {
  registerPayment: (id: string, payload: Partial<Payment>) => apiPost<{ installment: Installment }>(`/api/installments/${id}/register-payment`, payload),
  update: (id: string, payload: Partial<Installment>) => apiPut<{ installment: Installment }>(`/api/installments/${id}`, payload),
};

export const paymentsApi = {
  create: (payload: Partial<Payment>) => apiPost<{ payment?: Payment; sale?: Sale; installment?: Installment }>('/api/payments', payload),
  get: (id: string) => apiGet<{ payment: Payment }>(`/api/payments/${id}`),
  generateReceipt: (id: string) => apiPost<{ document: GeneratedDocument }>(`/api/payments/${id}/documents/receipt`, {}),
};

export const dashboardApi = {
  summary: () => apiGet<DashboardSummary>('/api/dashboard/summary'),
  overdueInstallments: () => apiGet<{ installments: Installment[] }>('/api/dashboard/overdue-installments'),
};

export const documentsApi = {
  list: () => apiGet<{ documents: GeneratedDocument[] }>('/api/documents'),
  get: (id: string) => apiGet<{ document: GeneratedDocument }>(`/api/documents/${id}`),
  download: (id: string, disposition: 'inline' | 'attachment') => apiGet<{ url: string; fileName: string; disposition: string }>(`/api/documents/${id}/download?disposition=${disposition}`),
  annul: (id: string, reason?: string) => apiPost<{ document: GeneratedDocument }>(`/api/documents/${id}/annul`, { reason }),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/documents/${id}`),
};

export const leadsApi = {
  list: (params: URLSearchParams = new URLSearchParams()) => apiGet<{ leads: Lead[] }>(`/api/leads${params.size ? `?${params}` : ''}`),
  get: (id: string) => apiGet<{ lead: Lead }>(`/api/leads/${id}`),
  create: (payload: Partial<Lead>) => apiPost<{ lead: Lead }>('/api/leads', payload),
  update: (id: string, payload: Partial<Lead>) => apiPut<{ lead: Lead }>(`/api/leads/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/leads/${id}`),
  markLost: (id: string, payload: { lostReason?: string; reason?: string }) => apiPost<{ lead: Lead }>(`/api/leads/${id}/mark-lost`, payload),
  convertToBuyer: (id: string) => apiPost<{ lead: Lead; buyer: Buyer }>(`/api/leads/${id}/convert-to-buyer`, {}),
};

export const leadActivitiesApi = {
  list: (leadId: string) => apiGet<{ activities: LeadActivity[] }>(`/api/leads/${leadId}/activities`),
  create: (leadId: string, payload: Partial<LeadActivity>) => apiPost<{ activity: LeadActivity }>(`/api/leads/${leadId}/activities`, payload),
};

export const quotationsApi = {
  list: (params: URLSearchParams = new URLSearchParams()) => apiGet<{ quotations: Quotation[] }>(`/api/quotations${params.size ? `?${params}` : ''}`),
  get: (id: string) => apiGet<{ quotation: Quotation }>(`/api/quotations/${id}`),
  create: (payload: Partial<Quotation>) => apiPost<{ quotation: Quotation }>('/api/quotations', payload),
  update: (id: string, payload: Partial<Quotation>) => apiPut<{ quotation: Quotation }>(`/api/quotations/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/quotations/${id}`),
  generatePdf: (id: string) => apiPost<{ quotation: Quotation; document: GeneratedDocument }>(`/api/quotations/${id}/generate-pdf`, {}),
  convertToReservation: (id: string, payload: Partial<Reservation>) => apiPost<{ reservation: Reservation }>(`/api/quotations/${id}/convert-to-reservation`, payload),
  convertToSale: (id: string, payload: Record<string, unknown>) => apiPost<{ sale: Sale }>(`/api/quotations/${id}/convert-to-sale`, payload),
};

export const reservationsApi = {
  list: (params: URLSearchParams = new URLSearchParams()) => apiGet<{ reservations: Reservation[] }>(`/api/reservations${params.size ? `?${params}` : ''}`),
  get: (id: string) => apiGet<{ reservation: Reservation }>(`/api/reservations/${id}`),
  create: (payload: Partial<Reservation>) => apiPost<{ reservation: Reservation }>('/api/reservations', payload),
  update: (id: string, payload: Partial<Reservation>) => apiPut<{ reservation: Reservation }>(`/api/reservations/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/reservations/${id}`),
  registerPayment: (id: string, payload: Partial<Reservation> & { amount?: number }) => apiPost<{ reservation: Reservation; document?: GeneratedDocument }>(`/api/reservations/${id}/register-payment`, payload),
  cancel: (id: string, payload: { reason?: string }) => apiPost<{ reservation: Reservation }>(`/api/reservations/${id}/cancel`, payload),
  expire: (id: string) => apiPost<{ reservation: Reservation }>(`/api/reservations/${id}/expire`, {}),
  convertToSale: (id: string, payload: Record<string, unknown>) => apiPost<{ sale: Sale }>(`/api/reservations/${id}/convert-to-sale`, payload),
};

export const commercialDashboardApi = {
  summary: () => apiGet<{ newLeads: number; contactedLeads: number; sentQuotations: number; activeReservations: number; expiredReservations: number; convertedSales: number; lostLeads: number }>('/api/commercial-dashboard/summary'),
  leadsByStatus: () => apiGet<{ items: { _id: string; count: number }[] }>('/api/commercial-dashboard/leads-by-status'),
  leadsBySource: () => apiGet<{ items: { _id: string; count: number }[] }>('/api/commercial-dashboard/leads-by-source'),
  activeReservations: () => apiGet<{ reservations: Reservation[] }>('/api/commercial-dashboard/active-reservations'),
  expiredReservations: () => apiGet<{ reservations: Reservation[] }>('/api/commercial-dashboard/expired-reservations'),
  quotations: () => apiGet<{ quotations: Quotation[] }>('/api/commercial-dashboard/quotations'),
};

export const paymentMethodConfigsApi = {
  list: () => apiGet<{ paymentMethodConfigs: PaymentMethodConfig[] }>('/api/payment-method-configs'),
  get: (id: string) => apiGet<{ paymentMethodConfig: PaymentMethodConfig }>(`/api/payment-method-configs/${id}`),
  create: (payload: Partial<PaymentMethodConfig>) => apiPost<{ paymentMethodConfig: PaymentMethodConfig }>('/api/payment-method-configs', payload),
  update: (id: string, payload: Partial<PaymentMethodConfig>) => apiPut<{ paymentMethodConfig: PaymentMethodConfig }>(`/api/payment-method-configs/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/payment-method-configs/${id}`),
};

export const paymentRequestsApi = {
  list: (params: URLSearchParams = new URLSearchParams()) => apiGet<{ paymentRequests: PaymentRequest[] }>(`/api/payment-requests${params.size ? `?${params}` : ''}`),
  get: (id: string) => apiGet<{ paymentRequest: PaymentRequest }>(`/api/payment-requests/${id}`),
  approve: (id: string, payload: Partial<PaymentRequest> & { paymentDate?: string; paymentMethod?: string; notes?: string; receiptNumber?: string }) => apiPost<{ paymentRequest: PaymentRequest }>(`/api/payment-requests/${id}/approve`, payload),
  reject: (id: string, payload: { rejectionReason: string }) => apiPost<{ paymentRequest: PaymentRequest }>(`/api/payment-requests/${id}/reject`, payload),
  cancel: (id: string) => apiPost<{ paymentRequest: PaymentRequest }>(`/api/payment-requests/${id}/cancel`, {}),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/payment-requests/${id}`),
  proof: (id: string) => apiGet<{ url: string; fileName: string; disposition: string }>(`/api/payment-requests/${id}/proof`),
};

export const buyerPortalApi = {
  profile: () => apiGet<BuyerPortalProfile>('/api/buyer-portal/profile'),
  dashboard: () => apiGet<BuyerDashboard>('/api/buyer-portal/dashboard'),
  mySales: () => apiGet<{ sales: BuyerSaleSummary[] }>('/api/buyer-portal/my-sales'),
  saleDetail: (id: string) => apiGet<BuyerPortalSaleDetail>(`/api/buyer-portal/my-sales/${id}`),
  installments: (id: string) => apiGet<{ installments: BuyerPortalInstallment[] }>(`/api/buyer-portal/my-sales/${id}/installments`),
  payments: (id: string) => apiGet<{ payments: BuyerPortalPayment[] }>(`/api/buyer-portal/my-sales/${id}/payments`),
  documents: (id: string) => apiGet<{ documents: BuyerPortalDocument[] }>(`/api/buyer-portal/my-sales/${id}/documents`),
  reservation: (id: string) => apiGet<{ reservation: BuyerPortalSaleDetail['reservation'] }>(`/api/buyer-portal/my-sales/${id}/reservation`),
  quotation: (id: string) => apiGet<{ quotation: BuyerPortalSaleDetail['quotation'] }>(`/api/buyer-portal/my-sales/${id}/quotation`),
  createAccountStatement: (id: string) => apiPost<{ document: BuyerPortalDocument }>(`/api/buyer-portal/my-sales/${id}/account-statement`, {}),
};

export const buyerDocumentsApi = {
  list: () => apiGet<{ documents: BuyerPortalDocument[] }>('/api/buyer-portal/documents'),
  download: (id: string) => apiGet<{ url: string; fileName: string; disposition: string }>(`/api/buyer-portal/documents/${id}/download`),
};

export const buyerPaymentMethodsApi = {
  list: () => apiGet<{ paymentMethods: PaymentMethodConfig[] }>('/api/buyer-portal/payment-methods'),
};

export const buyerPaymentRequestsApi = {
  list: () => apiGet<{ paymentRequests: PaymentRequest[] }>('/api/buyer-portal/payment-requests'),
  get: (id: string) => apiGet<{ paymentRequest: PaymentRequest }>(`/api/buyer-portal/payment-requests/${id}`),
  create: (payload: Partial<PaymentRequest>) => apiPost<{ paymentRequest: PaymentRequest }>('/api/buyer-portal/payment-requests', payload),
  uploadProof: (id: string, file: File) => {
    const form = new FormData();
    form.append('proof', file);
    return apiUpload<{ paymentRequest: PaymentRequest }>(`/api/buyer-portal/payment-requests/${id}/upload-proof`, form);
  },
  proof: (id: string) => apiGet<{ url: string; fileName: string; disposition: string }>(`/api/buyer-portal/payment-requests/${id}/proof`),
};

// ---- Etapa 7: Caja, Gastos, Proveedores, Obras ----

export const cashAccountsApi = {
  list: (params?: Record<string, string>) => apiGet<{ cashAccounts: CashAccount[] }>('/api/cash-accounts', params),
  create: (payload: Partial<CashAccount>) => apiPost<{ cashAccount: CashAccount }>('/api/cash-accounts', payload),
  get: (id: string) => apiGet<{ cashAccount: CashAccount }>(`/api/cash-accounts/${id}`),
  update: (id: string, payload: Partial<CashAccount>) => apiPut<{ cashAccount: CashAccount }>(`/api/cash-accounts/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/cash-accounts/${id}`),
};

export const cashMovementsApi = {
  list: (params?: Record<string, string>) => apiGet<{ cashMovements: CashMovement[] }>('/api/cash-movements', params),
  create: (payload: Partial<CashMovement>) => apiPost<{ cashMovement: CashMovement }>('/api/cash-movements', payload),
  get: (id: string) => apiGet<{ cashMovement: CashMovement }>(`/api/cash-movements/${id}`),
  update: (id: string, payload: Partial<CashMovement>) => apiPut<{ cashMovement: CashMovement }>(`/api/cash-movements/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/cash-movements/${id}`),
  confirm: (id: string) => apiPost<{ cashMovement: CashMovement }>(`/api/cash-movements/${id}/confirm`, {}),
  cancel: (id: string) => apiPost<{ cashMovement: CashMovement }>(`/api/cash-movements/${id}/cancel`, {}),
  uploadProof: (id: string, file: File) => {
    const form = new FormData();
    form.append('proof', file);
    return apiUpload<{ cashMovement: CashMovement }>(`/api/cash-movements/${id}/upload-proof`, form);
  },
};

export const suppliersApi = {
  list: (params?: Record<string, string>) => apiGet<{ suppliers: Supplier[] }>('/api/suppliers', params),
  create: (payload: Partial<Supplier>) => apiPost<{ supplier: Supplier }>('/api/suppliers', payload),
  get: (id: string) => apiGet<{ supplier: Supplier }>(`/api/suppliers/${id}`),
  update: (id: string, payload: Partial<Supplier>) => apiPut<{ supplier: Supplier }>(`/api/suppliers/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/suppliers/${id}`),
};

export const expensesApi = {
  list: (params?: Record<string, string>) => apiGet<{ expenses: Expense[] }>('/api/expenses', params),
  create: (payload: Partial<Expense>) => apiPost<{ expense: Expense }>('/api/expenses', payload),
  get: (id: string) => apiGet<{ expense: Expense }>(`/api/expenses/${id}`),
  update: (id: string, payload: Partial<Expense>) => apiPut<{ expense: Expense }>(`/api/expenses/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/expenses/${id}`),
  markPaid: (id: string, payload: Record<string, unknown>) => apiPost<{ expense: Expense }>(`/api/expenses/${id}/mark-paid`, payload),
  cancel: (id: string) => apiPost<{ expense: Expense }>(`/api/expenses/${id}/cancel`, {}),
  uploadProof: (id: string, file: File) => {
    const form = new FormData();
    form.append('proof', file);
    return apiUpload<{ expense: Expense }>(`/api/expenses/${id}/upload-proof`, form);
  },
};

export const workProjectsApi = {
  list: (params?: Record<string, string>) => apiGet<{ workProjects: WorkProject[] }>('/api/work-projects', params),
  create: (payload: Partial<WorkProject>) => apiPost<{ workProject: WorkProject }>('/api/work-projects', payload),
  get: (id: string) => apiGet<{ workProject: WorkProject }>(`/api/work-projects/${id}`),
  update: (id: string, payload: Partial<WorkProject>) => apiPut<{ workProject: WorkProject }>(`/api/work-projects/${id}`, payload),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/work-projects/${id}`),
  updateProgress: (id: string, payload: Record<string, unknown>) => apiPost<{ workProject: WorkProject }>(`/api/work-projects/${id}/update-progress`, payload),
  progressLogs: (id: string) => apiGet<{ progressLogs: WorkProgressLog[] }>(`/api/work-projects/${id}/progress-logs`),
  expenses: (id: string) => apiGet<{ expenses: Expense[] }>(`/api/work-projects/${id}/expenses`),
};

export const financeDashboardApi = {
  summary: () => apiGet<{ data: FinanceDashboardSummary }>('/api/finance-dashboard/summary'),
  cashBalances: () => apiGet<{ cashAccounts: CashAccount[] }>('/api/finance-dashboard/cash-balances'),
  incomeExpenseByMonth: (params?: Record<string, string>) => apiGet<{ income: unknown[]; expenses: unknown[] }>('/api/finance-dashboard/income-expense-by-month', params),
  expensesByCategory: () => apiGet<{ expensesByCategory: unknown[] }>('/api/finance-dashboard/expenses-by-category'),
  workProjectsSummary: () => apiGet<{ workProjects: unknown[] }>('/api/finance-dashboard/work-projects-summary'),
};

// ---- Etapa 8: Mora, Refinanciación, Legal, Escrituración ----

export const delinquencyCasesApi = {
  list: (params?: Record<string, string>) => apiGet<{ delinquencyCases: DelinquencyCase[] }>('/api/delinquency-cases', params),
  recalculate: () => apiPost<{ created: number; updated: number; resolved: number }>('/api/delinquency-cases/recalculate', {}),
  get: (id: string) => apiGet<{ delinquencyCase: DelinquencyCase }>(`/api/delinquency-cases/${id}`),
  update: (id: string, body: unknown) => apiPut<{ delinquencyCase: DelinquencyCase }>(`/api/delinquency-cases/${id}`, body),
  addAction: (id: string, body: unknown) => apiPost<{ action: DelinquencyAction }>(`/api/delinquency-cases/${id}/actions`, body),
  getActions: (id: string) => apiGet<{ actions: DelinquencyAction[] }>(`/api/delinquency-cases/${id}/actions`),
  resolve: (id: string, body: unknown) => apiPost<{ delinquencyCase: DelinquencyCase }>(`/api/delinquency-cases/${id}/resolve`, body),
  startLegalReview: (id: string) => apiPost<{ delinquencyCase: DelinquencyCase }>(`/api/delinquency-cases/${id}/start-legal-review`, {}),
  startRescission: (id: string, body: unknown) => apiPost<{ delinquencyCase: DelinquencyCase }>(`/api/delinquency-cases/${id}/start-rescission`, body),
  generatePaymentNotice: (id: string) => apiPost<{ document: GeneratedDocument }>(`/api/delinquency-cases/${id}/documents/payment-notice`, {}),
  generateLegalNotice: (id: string) => apiPost<{ document: GeneratedDocument }>(`/api/delinquency-cases/${id}/documents/legal-notice`, {}),
};

export const refinancingAgreementsApi = {
  list: (params?: Record<string, string>) => apiGet<{ refinancingAgreements: RefinancingAgreement[] }>('/api/refinancing-agreements', params),
  create: (body: unknown) => apiPost<{ refinancingAgreement: RefinancingAgreement }>('/api/refinancing-agreements', body),
  get: (id: string) => apiGet<{ refinancingAgreement: RefinancingAgreement }>(`/api/refinancing-agreements/${id}`),
  update: (id: string, body: unknown) => apiPut<{ refinancingAgreement: RefinancingAgreement }>(`/api/refinancing-agreements/${id}`, body),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/refinancing-agreements/${id}`),
  generateDocument: (id: string) => apiPost<{ refinancingAgreement: RefinancingAgreement }>(`/api/refinancing-agreements/${id}/generate-document`, {}),
  markSigned: (id: string, body: unknown) => apiPost<{ refinancingAgreement: RefinancingAgreement }>(`/api/refinancing-agreements/${id}/mark-signed`, body),
  activate: (id: string) => apiPost<{ refinancingAgreement: RefinancingAgreement }>(`/api/refinancing-agreements/${id}/activate`, {}),
  cancel: (id: string, body: unknown) => apiPost<{ refinancingAgreement: RefinancingAgreement }>(`/api/refinancing-agreements/${id}/cancel`, body),
};

export const legalProcessesApi = {
  list: (params?: Record<string, string>) => apiGet<{ legalProcesses: LegalProcess[] }>('/api/legal-processes', params),
  create: (body: unknown) => apiPost<{ legalProcess: LegalProcess }>('/api/legal-processes', body),
  get: (id: string) => apiGet<{ legalProcess: LegalProcess }>(`/api/legal-processes/${id}`),
  update: (id: string, body: unknown) => apiPut<{ legalProcess: LegalProcess }>(`/api/legal-processes/${id}`, body),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/legal-processes/${id}`),
  resolve: (id: string, body: unknown) => apiPost<{ legalProcess: LegalProcess }>(`/api/legal-processes/${id}/resolve`, body),
  cancel: (id: string, body: unknown) => apiPost<{ legalProcess: LegalProcess }>(`/api/legal-processes/${id}/cancel`, body),
};

export const deedProcessesApi = {
  list: (params?: Record<string, string>) => apiGet<{ deedProcesses: DeedProcess[] }>('/api/deed-processes', params),
  create: (body: unknown) => apiPost<{ deedProcess: DeedProcess }>('/api/deed-processes', body),
  get: (id: string) => apiGet<{ deedProcess: DeedProcess }>(`/api/deed-processes/${id}`),
  update: (id: string, body: unknown) => apiPut<{ deedProcess: DeedProcess }>(`/api/deed-processes/${id}`, body),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/deed-processes/${id}`),
  uploadDocument: (id: string, body: unknown) => apiPost<{ deedProcess: DeedProcess }>(`/api/deed-processes/${id}/upload-document`, body),
  advanceStatus: (id: string, body: unknown) => apiPost<{ deedProcess: DeedProcess }>(`/api/deed-processes/${id}/advance-status`, body),
  cancel: (id: string, body: unknown) => apiPost<{ deedProcess: DeedProcess }>(`/api/deed-processes/${id}/cancel`, body),
};

export const legalDashboardApi = {
  summary: () => apiGet<{ summary: LegalDashboardSummary }>('/api/legal-dashboard/summary'),
  delinquency: () => apiGet<{ data: unknown }>('/api/legal-dashboard/delinquency'),
  refinancing: () => apiGet<{ data: unknown }>('/api/legal-dashboard/refinancing'),
  deeds: () => apiGet<{ data: unknown }>('/api/legal-dashboard/deeds'),
};

export const migrationsApi = {
  list: (params?: Record<string, string>) => apiGet<{ migrations: MigrationBatch[] }>('/api/migrations', params),
  get: (id: string) => apiGet<{ migration: MigrationBatch; items: MigrationItem[] }>(`/api/migrations/${id}`),
  retryFailed: (id: string) => apiPost<{ retried: number; fixed: number; errors: string[] }>(`/api/migrations/${id}/retry-failed`, {}),
  cancel: (id: string) => apiPost<{ migration: MigrationBatch }>(`/api/migrations/${id}/cancel`, {}),
  markReviewed: (id: string) => apiPost<{ migration: MigrationBatch }>(`/api/migrations/${id}/mark-reviewed`, {}),
  preview: (developmentId: string, config: MigrationExecuteConfig) => apiPost<{ migration: MigrationBatch; preview: MigrationPreviewResult }>(`/api/developments/${developmentId}/migration/preview`, config),
  execute: (developmentId: string, config: MigrationExecuteConfig) => apiPost<{ migration: MigrationBatch }>(`/api/developments/${developmentId}/migration/execute`, config),
  status: (developmentId: string) => apiGet<MigrationStatusResponse>(`/api/developments/${developmentId}/migration/status`),
};

// ---- Etapa 10: Reportes ejecutivos, alertas y notificaciones ----

export const executiveDashboardApi = {
  summary: (params?: Record<string, string>) => apiGet<{ data: ExecutiveSummary }>('/api/executive-dashboard/summary', params),
};

export const reportsApi = {
  commercial: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/commercial', params),
  lots: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/lots', params),
  financial: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/financial', params),
  cashAndExpenses: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/cash-and-expenses', params),
  delinquency: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/delinquency', params),
  deedsAndLegal: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/deeds-and-legal', params),
  migration: (params?: Record<string, string>) => apiGet<{ data: unknown }>('/api/reports/migration', params),
  exportCsv: (reportType: string, params?: Record<string, string>) => apiPost<unknown>(`/api/reports/${reportType}/export-csv`, params ?? {}),
};

export const alertRulesApi = {
  list: () => apiGet<{ data: { alertRules: AlertRule[] } }>('/api/alert-rules'),
  create: (data: Partial<AlertRule>) => apiPost<{ data: { alertRule: AlertRule } }>('/api/alert-rules', data),
  get: (id: string) => apiGet<{ data: { alertRule: AlertRule } }>(`/api/alert-rules/${id}`),
  update: (id: string, data: Partial<AlertRule>) => apiPut<{ data: { alertRule: AlertRule } }>(`/api/alert-rules/${id}`, data),
  remove: (id: string) => apiDelete<{ data: { message: string } }>(`/api/alert-rules/${id}`),
  run: (id: string) => apiPost<{ data: { result: unknown } }>(`/api/alert-rules/${id}/run`, {}),
};

export const alertsApi = {
  list: (params?: Record<string, string>) => apiGet<{ data: { alerts: Alert[]; total: number } }>('/api/alerts', params),
  get: (id: string) => apiGet<{ data: { alert: Alert } }>(`/api/alerts/${id}`),
  markInProgress: (id: string) => apiPost<{ data: { alert: Alert } }>(`/api/alerts/${id}/mark-in-progress`, {}),
  resolve: (id: string) => apiPost<{ data: { alert: Alert } }>(`/api/alerts/${id}/resolve`, {}),
  dismiss: (id: string) => apiPost<{ data: { alert: Alert } }>(`/api/alerts/${id}/dismiss`, {}),
  generate: () => apiPost<{ data: { generated: Record<string, number> } }>('/api/alerts/generate', {}),
};

export const communicationTemplatesApi = {
  list: (params?: Record<string, string>) => apiGet<{ data: { templates: CommunicationTemplate[]; total: number } }>('/api/communication-templates', params),
  get: (id: string) => apiGet<{ data: { template: CommunicationTemplate } }>(`/api/communication-templates/${id}`),
  create: (data: Partial<CommunicationTemplate>) => apiPost<{ data: { template: CommunicationTemplate } }>('/api/communication-templates', data),
  update: (id: string, data: Partial<CommunicationTemplate>) => apiPut<{ data: { template: CommunicationTemplate } }>(`/api/communication-templates/${id}`, data),
  remove: (id: string) => apiDelete<{ data: { message: string } }>(`/api/communication-templates/${id}`),
  preview: (id: string, data: { contextData: Record<string, unknown> }) => apiPost<{ data: { preview: { subject: string; body: string; channel: string } } }>(`/api/communication-templates/${id}/preview`, data),
};

export const communicationsApi = {
  listLogs: (params?: Record<string, string>) => apiGet<{ data: { logs: CommunicationLog[]; total: number } }>('/api/communications', params),
  getLog: (id: string) => apiGet<{ data: { log: CommunicationLog } }>(`/api/communications/${id}`),
  sendEmail: (data: Record<string, unknown>) => apiPost<{ data: { log: CommunicationLog } }>('/api/communications/send-email', data),
  generateWhatsapp: (data: Record<string, unknown>) => apiPost<{ data: { log: CommunicationLog; whatsappUrl: string } }>('/api/communications/generate-whatsapp', data),
  markWhatsappSent: (id: string) => apiPost<{ data: { log: CommunicationLog } }>(`/api/communications/${id}/mark-whatsapp-sent`, {}),
  cancelLog: (id: string) => apiPost<{ data: { log: CommunicationLog } }>(`/api/communications/${id}/cancel`, {}),
  sendPaymentReminder: (data: Record<string, unknown>) => apiPost<{ data: unknown }>('/api/communications/send-payment-reminder', data),
  sendReservationReminder: (data: Record<string, unknown>) => apiPost<{ data: unknown }>('/api/communications/send-reservation-reminder', data),
  sendOverdueNotice: (data: Record<string, unknown>) => apiPost<{ data: unknown }>('/api/communications/send-overdue-notice', data),
};

export const notificationsApi = {
  list: (params?: Record<string, string>) => apiGet<{ data: { notifications: Notification[]; total: number } }>('/api/notifications', params),
  unreadCount: () => apiGet<{ data: { count: number } }>('/api/notifications/unread-count'),
  markRead: (id: string) => apiPost<{ data: { notification: Notification } }>(`/api/notifications/${id}/read`, {}),
  dismiss: (id: string) => apiPost<{ data: { notification: Notification } }>(`/api/notifications/${id}/dismiss`, {}),
  resolve: (id: string) => apiPost<{ data: { notification: Notification } }>(`/api/notifications/${id}/resolve`, {}),
  markAllRead: () => apiPost<{ data: { updated: boolean } }>('/api/notifications/read-all', {}),
};

export const communicationSettingsApi = {
  get: () => apiGet<{ data: { settings: CommunicationSettings | null } }>('/api/communication-settings'),
  update: (data: Partial<CommunicationSettings>) => apiPut<{ data: { settings: CommunicationSettings } }>('/api/communication-settings', data),
};

// ── Etapa 12: Roles, permisos y configuración ────────────────────────────────

export const rolesApi = {
  list: (params?: Record<string, string>) => apiGet<{ roles: Role[] }>('/api/roles', params),
  get: (id: string) => apiGet<{ role: Role }>(`/api/roles/${id}`),
  create: (data: Partial<Role>) => apiPost<{ role: Role }>('/api/roles', data),
  update: (id: string, data: Partial<Role>) => apiPut<{ role: Role }>(`/api/roles/${id}`, data),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/roles/${id}`),
};

export const userRoleAssignmentsApi = {
  list: (params?: Record<string, string>) => apiGet<{ assignments: UserRoleAssignment[] }>('/api/user-role-assignments', params),
  create: (data: { userId: string; roleId: string; developmentAccessMode?: string; allowedDevelopmentIds?: string[] }) => apiPost<{ assignment: UserRoleAssignment }>('/api/user-role-assignments', data),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/user-role-assignments/${id}`),
};

export const orgSettingsApi = {
  get: () => apiGet<{ settings: OrganizationSettings }>('/api/settings/organization'),
  update: (data: Partial<OrganizationSettings>) => apiPut<{ settings: OrganizationSettings }>('/api/settings/organization', data),
};

export const devSettingsApi = {
  get: (devId: string) => apiGet<{ settings: DevelopmentSettings }>(`/api/developments/${devId}/settings`),
  update: (devId: string, data: Partial<DevelopmentSettings>) => apiPut<{ settings: DevelopmentSettings }>(`/api/developments/${devId}/settings`, data),
};

export const auditLogsApi = {
  list: (params?: Record<string, string>) => apiGet<{ logs: AuditLog[]; total: number; page: number; limit: number }>('/api/audit-logs', params),
};

export const permissionsApi = {
  myPermissions: () => apiGet<{ permissions: EffectivePermissions; userId: string; organizationId: string }>('/api/auth/me/permissions'),
  catalog: () => apiGet<{ modules: PermissionsCatalogModule[] }>('/api/permissions/catalog'),
};

export const importsApi = {
  list: (params?: Record<string, string>) => apiGet<{ batches: ImportBatch[]; total: number }>('/api/imports', params),
  get: (id: string) => apiGet<{ batch: ImportBatch }>(`/api/imports/${id}`),
  upload: (formData: FormData) => apiUpload<{ batch: ImportBatch }>('/api/imports/upload', formData),
  validate: (id: string) => apiPost<{ batch: ImportBatch; summary: Record<string, number> }>(`/api/imports/${id}/validate`, {}),
  execute: (id: string) => apiPost<{ message: string; batchId: string }>(`/api/imports/${id}/execute`, {}),
  cancel: (id: string) => apiPost<{ batch: ImportBatch }>(`/api/imports/${id}/cancel`, {}),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/imports/${id}`),
  getRows: (id: string, params?: Record<string, string>) => apiGet<{ rows: ImportRow[]; total: number }>(`/api/imports/${id}/rows`, params),
  listTemplates: () => apiGet<{ templates: ImportTemplate[] }>('/api/imports/templates'),
  templateDownloadUrl: (type: string) => buildApiUrl(`/api/imports/templates/${type}/download`),
};

export const exportsApi = {
  downloadUrl: (type: string, params?: Record<string, string>) => {
    const token = getToken();
    const searchParams = new URLSearchParams({ ...params, token });
    return buildApiUrl(`/api/exports/${type}?${searchParams.toString()}`);
  },
  download: async (type: string, params?: Record<string, string>): Promise<void> => {
    const token = getToken();
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = buildApiUrl(`/api/exports/${type}${searchParams ? `?${searchParams}` : ''}`);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Error al exportar los datos.');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${type}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

export const superAdminApi = {
  getDashboard: () => apiGet<{ dashboard: SaasDashboard }>('/api/super-admin/dashboard'),
  listOrganizations: () => apiGet<{ organizations: (OrganizationSubscription & { planId: SubscriptionPlan })[] }>('/api/super-admin/organizations'),
  getOrganization: (id: string) => apiGet<{ subscription: OrganizationSubscription; usage: UsageInfo; limits: PlanLimits }>(`/api/super-admin/organizations/${id}`),
  listPlans: () => apiGet<{ plans: SubscriptionPlan[] }>('/api/super-admin/subscription-plans'),
  createPlan: (data: Partial<SubscriptionPlan>) => apiPost<{ plan: SubscriptionPlan }>('/api/super-admin/subscription-plans', data),
  updatePlan: (id: string, data: Partial<SubscriptionPlan>) => apiPut<{ plan: SubscriptionPlan }>(`/api/super-admin/subscription-plans/${id}`, data),
  deletePlan: (id: string) => apiDelete<{ message: string }>(`/api/super-admin/subscription-plans/${id}`),
  getSubscription: (orgId: string) => apiGet<{ subscription: OrganizationSubscription }>(`/api/super-admin/organizations/${orgId}/subscription`),
  createSubscription: (orgId: string, data: Partial<OrganizationSubscription> & { planId: string }) => apiPost<{ subscription: OrganizationSubscription }>(`/api/super-admin/organizations/${orgId}/subscription`, data),
  updateSubscription: (orgId: string, data: Partial<OrganizationSubscription>) => apiPut<{ subscription: OrganizationSubscription }>(`/api/super-admin/organizations/${orgId}/subscription`, data),
  suspendOrg: (orgId: string, reason: string) => apiPost<{ subscription: OrganizationSubscription }>(`/api/super-admin/organizations/${orgId}/suspend`, { reason }),
  reactivateOrg: (orgId: string) => apiPost<{ subscription: OrganizationSubscription }>(`/api/super-admin/organizations/${orgId}/reactivate`, {}),
  cancelSubscription: (orgId: string) => apiPost<{ subscription: OrganizationSubscription }>(`/api/super-admin/organizations/${orgId}/cancel-subscription`, {}),
  listPayments: (orgId: string) => apiGet<{ payments: SubscriptionPayment[] }>(`/api/super-admin/organizations/${orgId}/subscription-payments`),
  registerPayment: (orgId: string, data: Partial<SubscriptionPayment>) => apiPost<{ payment: SubscriptionPayment }>(`/api/super-admin/organizations/${orgId}/subscription-payments`, data),
  getUsage: (orgId: string) => apiGet<{ usage: UsageInfo; limits: PlanLimits }>(`/api/super-admin/organizations/${orgId}/usage`),
  createSnapshot: (orgId: string) => apiPost<{ snapshot: UsageInfo }>(`/api/super-admin/organizations/${orgId}/usage/snapshot`, {}),
};

export const billingApi = {
  getCurrentPlan: () => apiGet<{ plan: SubscriptionPlan | null; subscription: OrganizationSubscription | null }>('/api/billing/current-plan'),
  getUsage: () => apiGet<{ usage: UsageInfo; limits: PlanLimits; percentages: Record<string, number> }>('/api/billing/usage'),
  getLimits: () => apiGet<{ limits: PlanLimits; enabledModules: PlanModules }>('/api/billing/limits'),
};

export const onboardingApi = {
  getChecklist: () => apiGet<{ checklist: OnboardingChecklist }>('/api/onboarding/checklist'),
  completeItem: (key: string) => apiPost<{ checklist: OnboardingChecklist }>(`/api/onboarding/checklist/${key}/complete`, {}),
  skipItem: (key: string) => apiPost<{ checklist: OnboardingChecklist }>(`/api/onboarding/checklist/${key}/skip`, {}),
  recalculate: () => apiPost<{ checklist: OnboardingChecklist }>('/api/onboarding/recalculate', {}),
};

export const mapLayoutsApi = {
  list: (devId: string) => apiGet<{ layouts: import('../types').LotMapLayout[] }>(`/api/developments/${devId}/map-layouts`),
  create: (devId: string, data: Partial<import('../types').LotMapLayout>) => apiPost<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts`, data),
  get: (devId: string, layoutId: string) => apiGet<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts/${layoutId}`),
  update: (devId: string, layoutId: string, data: Partial<import('../types').LotMapLayout>) => apiPut<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts/${layoutId}`, data),
  remove: (devId: string, layoutId: string) => apiDelete<{ message: string }>(`/api/developments/${devId}/map-layouts/${layoutId}`),
  uploadBackground: (devId: string, layoutId: string, formData: FormData) => apiUpload<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts/${layoutId}/upload-background`, formData),
  updateShapes: (devId: string, layoutId: string, shapes: import('../types').LotMapShape[]) => apiPut<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts/${layoutId}/shapes`, { shapes }),
  activate: (devId: string, layoutId: string) => apiPost<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts/${layoutId}/activate`, {}),
  archive: (devId: string, layoutId: string) => apiPost<{ layout: import('../types').LotMapLayout }>(`/api/developments/${devId}/map-layouts/${layoutId}/archive`, {}),
  getAdvancedMap: (devId: string) => apiGet<import('../types').AdvancedMapData>(`/api/developments/${devId}/advanced-map`),
};

export const backupsApi = {
  listJobs: () => apiGet<{ jobs: import('../types').BackupJob[] }>('/api/backups/jobs'),
  createJob: (data: Partial<import('../types').BackupJob>) => apiPost<{ job: import('../types').BackupJob }>('/api/backups/jobs', data),
  getJob: (id: string) => apiGet<{ job: import('../types').BackupJob }>(`/api/backups/jobs/${id}`),
  updateJob: (id: string, data: Partial<import('../types').BackupJob>) => apiPut<{ job: import('../types').BackupJob }>(`/api/backups/jobs/${id}`, data),
  removeJob: (id: string) => apiDelete<{ message: string }>(`/api/backups/jobs/${id}`),
  runJob: (id: string) => apiPost<{ run: import('../types').BackupRun }>(`/api/backups/jobs/${id}/run`, {}),
  listRuns: (params?: Record<string, string>) => apiGet<{ runs: import('../types').BackupRun[]; total: number }>(`/api/backups/runs${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  getRun: (id: string) => apiGet<{ run: import('../types').BackupRun }>(`/api/backups/runs/${id}`),
  downloadRun: (id: string) => apiGet<{ url: string; fileName: string }>(`/api/backups/runs/${id}/download`),
  cancelRun: (id: string) => apiPost<{ run: import('../types').BackupRun }>(`/api/backups/runs/${id}/cancel`, {}),
  runManual: (data: { includeModules: string[]; developmentIds?: string[]; format?: string }) => apiPost<{ run: import('../types').BackupRun }>('/api/backups/run-manual', data),
};
