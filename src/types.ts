export type Id = string;
export type Currency = 'ARS' | 'USD';

export type DevelopmentStatus = 'draft' | 'active' | 'paused' | 'completed' | 'migrated_to_gestionar';
export type LotStatus = 'available' | 'reserved' | 'sold' | 'blocked' | 'cancelled' | 'deeded';
export type SaleStatus = 'draft' | 'pending_down_payment' | 'active' | 'in_legal_review' | 'rescission_process' | 'rescinded' | 'cancelled' | 'completed';
export type InstallmentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'refinanced' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'bank_deposit' | 'mercado_pago' | 'other';
export type PaymentRequestMethod = 'bank_transfer' | 'cash' | 'mercado_pago' | 'other';
export type PaymentRequestType = 'reservation_payment' | 'down_payment' | 'installment_payment';
export type PaymentRequestStatus = 'pending' | 'proof_uploaded' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'cancelled' | 'provider_pending' | 'provider_paid' | 'provider_failed';
export type DocumentType = 'down_payment_receipt' | 'installment_receipt' | 'account_statement' | 'sale_certificate' | 'debt_free_certificate' | 'quotation_pdf' | 'reservation_receipt';
export type DocumentStatus = 'active' | 'annulled';
export type LeadSource = 'instagram' | 'facebook' | 'whatsapp' | 'website' | 'referral' | 'sign' | 'real_estate_agent' | 'marketplace' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'visited' | 'quoted' | 'reservation_pending' | 'reserved' | 'converted' | 'lost';
export type LeadActivityType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'visit' | 'note' | 'quotation_sent' | 'reservation_created' | 'status_change';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted_to_reservation' | 'converted_to_sale';
export type ReservationStatus = 'active' | 'pending_payment' | 'paid' | 'expired' | 'cancelled' | 'converted_to_sale';
export type LotVisualStatus = 'available' | 'reserved' | 'reservation_expiring' | 'sold' | 'sold_with_overdue' | 'blocked' | 'cancelled';

export interface Development {
  _id: Id;
  name: string;
  description?: string;
  location?: string;
  totalLots?: number;
  defaultCurrency?: string;
  status: DevelopmentStatus;
  createdAt?: string;
}

export interface Lot {
  _id: Id;
  developmentId: Id | Development;
  lotNumber: string;
  block?: string;
  surface?: number;
  frontMeasure?: number;
  depthMeasure?: number;
  price: number;
  currency?: string;
  status: LotStatus;
  reservedBySaleId?: Id | null;
  services?: string[];
  notes?: string;
}

export interface Buyer {
  _id: Id;
  firstName: string;
  lastName: string;
  documentType?: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

export interface Lead {
  _id: Id;
  firstName: string;
  lastName: string;
  fullName?: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone: string;
  alternativePhone?: string;
  source: LeadSource;
  status: LeadStatus;
  interestedDevelopmentId: Id | Development;
  interestedLotId?: Id | Lot | null;
  budgetAmount?: number;
  budgetCurrency?: string;
  preferredInstallments?: number;
  notes?: string;
  assignedUserId?: Id | null;
  nextFollowUpDate?: string | null;
  lastContactDate?: string | null;
  convertedBuyerId?: Id | Buyer | null;
  convertedSaleId?: Id | Sale | null;
  convertedAt?: string | null;
  lostReason?: string;
  createdAt?: string;
}

export interface LeadActivity {
  _id: Id;
  leadId: Id | Lead;
  type: LeadActivityType;
  title: string;
  description?: string;
  activityDate: string;
  nextFollowUpDate?: string | null;
}

export interface Quotation {
  _id: Id;
  leadId?: Id | Lead | null;
  buyerId?: Id | Buyer | null;
  developmentId: Id | Development;
  lotId: Id | Lot;
  quotationNumber: string;
  totalPrice: number;
  currency?: string;
  discountAmount?: number;
  discountReason?: string;
  finalPrice: number;
  downPaymentAmount: number;
  financedAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate?: string | null;
  monthlyDueDay?: number | null;
  validUntil: string;
  status: QuotationStatus;
  notes?: string;
  generatedDocumentId?: Id | GeneratedDocument | null;
  convertedReservationId?: Id | Reservation | null;
  convertedSaleId?: Id | Sale | null;
  createdAt?: string;
}

export interface Reservation {
  _id: Id;
  reservationNumber: string;
  leadId?: Id | Lead | null;
  buyerId?: Id | Buyer | null;
  quotationId?: Id | Quotation | null;
  developmentId: Id | Development;
  lotId: Id | Lot;
  reservedByUserId?: Id;
  reservationDate: string;
  expirationDate: string;
  reservationAmount: number;
  currency?: string;
  paymentMethod?: PaymentMethod | '';
  paymentDate?: string | null;
  receiptNumber?: string;
  status: ReservationStatus;
  notes?: string;
  generatedDocumentId?: Id | GeneratedDocument | null;
  convertedSaleId?: Id | Sale | null;
  cancelledAt?: string | null;
  cancellationReason?: string;
  expiredAt?: string | null;
  createdAt?: string;
}

export interface Sale {
  _id: Id;
  developmentId: Id | Development;
  lotId: Id | Lot;
  buyerId: Id | Buyer;
  quotationId?: Id | Quotation | null;
  reservationId?: Id | Reservation | null;
  saleNumber: string;
  totalPrice: number;
  currency?: string;
  downPaymentAmount?: number;
  financedAmount?: number;
  installmentCount?: number;
  installmentAmount?: number;
  firstDueDate?: string | null;
  monthlyDueDay?: number | null;
  status: SaleStatus;
  notes?: string;
  createdAt?: string;
}

export interface Installment {
  _id: Id;
  saleId: Id | Sale;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  currency?: string;
  status: InstallmentStatus;
  paidAmount?: number;
  pendingAmount?: number;
  paidAt?: string | null;
}

export interface Payment {
  _id: Id;
  saleId?: Id | null;
  reservationId?: Id | null;
  installmentId?: Id | null;
  type: 'reservation_payment' | 'down_payment' | 'installment_payment';
  amount: number;
  currency?: Currency;
  requestedAmount?: number;
  requestedCurrency?: Currency;
  paidAmount?: number;
  paidCurrency?: Currency;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  exchangeRateSource?: 'manual' | 'legacy';
  appliedAmount?: number;
  appliedCurrency?: Currency;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
}

export interface GeneratedDocument {
  _id: Id;
  saleId: Id;
  buyerId?: Id | null;
  leadId?: Id | null;
  quotationId?: Id | null;
  reservationId?: Id | null;
  lotId: Id;
  paymentId?: Id | null;
  installmentId?: Id | null;
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  fileName: string;
  fileUrl: string;
  storageProvider: string;
  generatedAt: string;
  generatedBy?: Id;
  metadata?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
  status: DocumentStatus;
  annulledAt?: string | null;
  annulledReason?: string;
}

export interface PaymentMethodConfig {
  _id: Id;
  paymentMethodConfigId?: Id;
  type: PaymentRequestMethod;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  currency?: string;
  bankName?: string;
  accountHolder?: string;
  cbu?: string;
  alias?: string;
  accountNumber?: string;
  cuit?: string;
  instructions?: string;
  mercadoPagoPublicKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequest {
  _id: Id;
  paymentRequestId?: Id;
  buyerId: Id;
  buyerName?: string;
  saleId?: Id | null;
  saleNumber?: string;
  reservationId?: Id | null;
  reservationNumber?: string;
  installmentId?: Id | null;
  installmentNumber?: number | null;
  paymentId?: Id | null;
  generatedDocumentId?: Id | null;
  generatedDocumentNumber?: string;
  type: PaymentRequestType;
  amount: number;
  currency?: Currency;
  requestedAmount?: number;
  requestedCurrency?: Currency;
  paidAmount?: number;
  paidCurrency?: Currency;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  exchangeRateSource?: 'manual' | 'legacy';
  appliedAmount?: number;
  appliedCurrency?: Currency;
  status: PaymentRequestStatus;
  paymentMethod: PaymentRequestMethod;
  provider?: string;
  bankAccountId?: Id | null;
  proofFileName?: string;
  proofUploadedAt?: string | null;
  hasProof: boolean;
  reviewedAt?: string | null;
  rejectionReason?: string;
  approvedAt?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleStatusHistory {
  _id: Id;
  previousStatus?: string | null;
  newStatus: string;
  reason?: string;
  createdAt: string;
}

export interface DashboardSummary {
  activeDevelopments: number;
  totalLots: number;
  availableLots: number;
  reservedLots: number;
  soldLots: number;
  activeSales: number;
  totalSold: number;
  totalCollected: number;
  pendingBalance: number;
  overdueInstallments: number;
  overdueBalance: number;
  totalSoldByCurrency?: Partial<Record<Currency, number>>;
  totalCollectedByCurrency?: Partial<Record<Currency, number>>;
  pendingBalanceByCurrency?: Partial<Record<Currency, number>>;
  overdueBalanceByCurrency?: Partial<Record<Currency, number>>;
  paymentRequestsByCurrency?: Partial<Record<Currency, number>>;
}

export interface LotsMapSummary {
  totalLots: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
  cancelled: number;
  overdue: number;
  reservationsExpiringSoon: number;
  reservationExpiringSoon: number;
  soldWithOverdue: number;
  totalPendingBalanceByCurrency: Partial<Record<Currency, number>>;
  pendingBalanceByCurrency: Partial<Record<Currency, number>>;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
}

export interface LotsMapLot {
  id: Id;
  developmentId: Id;
  lotNumber: string;
  block?: string;
  surface?: number;
  frontMeasure?: number;
  depthMeasure?: number;
  price: number;
  currency?: Currency;
  status: LotStatus;
  visualStatus: LotVisualStatus;
  services?: string[];
  buyerId?: Id | null;
  buyerName?: string;
  saleId?: Id | null;
  saleNumber?: string;
  saleStatus?: SaleStatus | '';
  saleTotalPrice?: number | null;
  saleCurrency?: Currency | null;
  reservationId?: Id | null;
  reservationNumber?: string;
  reservationDate?: string | null;
  reservationExpirationDate?: string | null;
  reservationAmount?: number | null;
  reservationCurrency?: Currency | null;
  reservationStatus?: ReservationStatus | '';
  quotationId?: Id | null;
  quotationNumber?: string;
  hasOverdueInstallments: boolean;
  overdueInstallmentsCount: number;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  nextDueDate?: string | null;
  pendingBalanceByCurrency: Partial<Record<Currency, number>>;
  actions: Record<'canViewLot' | 'canEditLot' | 'canViewSale' | 'canViewReservation' | 'canViewQuotation' | 'canViewBuyer' | 'canCreateReservation' | 'canCreateSale' | 'canCreateQuotation' | 'canBlock' | 'canUnblock', boolean>;
}

export interface LotsMapBlock {
  block: string;
  totalLots: number;
  lots: LotsMapLot[];
}

export interface LotsMapResponse {
  development: {
    id: Id;
    name: string;
    location?: string;
    defaultCurrency?: Currency;
  };
  summary: LotsMapSummary;
  blocks: LotsMapBlock[];
  reservationsExpiringSoonDays?: number;
}

export interface SaleDetail {
  sale: Sale;
  installments: Installment[];
  payments: Payment[];
  statusHistory: SaleStatusHistory[];
}

export interface BuyerPortalProfile {
  primaryBuyer: {
    buyerId: Id;
    firstName: string;
    lastName: string;
    documentType?: string;
    documentNumber?: string;
    email?: string;
    phone?: string;
    gestionarOwnerId?: string | null;
  };
  buyers: BuyerPortalProfile['primaryBuyer'][];
  organization: { organizationId: Id; name: string };
  salesCount: number;
}

export interface BuyerSaleSummary {
  saleId: Id;
  saleNumber: string;
  developmentName: string;
  lotLabel: string;
  totalPrice: number;
  currency?: string;
  totalPaid: number;
  pendingBalance: number;
  overdueAmount: number;
  totalPaidByCurrency?: Partial<Record<Currency, number>>;
  pendingBalanceByCurrency?: Partial<Record<Currency, number>>;
  overdueAmountByCurrency?: Partial<Record<Currency, number>>;
  overdueInstallmentsCount: number;
  nextDueDate?: string | null;
  nextDueAmount: number;
  status: SaleStatus;
  reservationNumber?: string | null;
  quotationNumber?: string | null;
  hasReservation: boolean;
  hasQuotation: boolean;
  availableDocumentsCount?: number;
}

export interface BuyerDashboard {
  activeSalesCount: number;
  purchasedLotsCount: number;
  totalPaid: number;
  pendingBalance: number;
  overdueAmount: number;
  totalPaidByCurrency?: Partial<Record<Currency, number>>;
  pendingBalanceByCurrency?: Partial<Record<Currency, number>>;
  overdueAmountByCurrency?: Partial<Record<Currency, number>>;
  overdueInstallmentsCount: number;
  nextDueDate?: string | null;
  nextDueAmount: number;
  availableDocumentsCount: number;
  salesSummary: BuyerSaleSummary[];
  paymentRequestsInReview?: number;
  rejectedPaymentRequests?: number;
}

export interface BuyerPortalDocument {
  documentId: Id;
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  generatedAt: string;
  status: DocumentStatus;
  canDownload: boolean;
  relatedPaymentId?: Id | null;
  relatedInstallmentId?: Id | null;
  saleId?: Id;
  saleNumber?: string;
  developmentName?: string;
  lotLabel?: string;
}

export interface BuyerPortalInstallment {
  installmentId: Id;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  currency?: string;
  paidAmount: number;
  pendingAmount: number;
  status: InstallmentStatus;
  paidAt?: string | null;
  receiptDocumentId?: Id | null;
  receiptDocumentNumber?: string | null;
}

export interface BuyerPortalPayment {
  paymentId: Id;
  paymentDate: string;
  type: Payment['type'] | 'reservation_payment';
  amount: number;
  currency?: Currency;
  requestedAmount?: number;
  requestedCurrency?: Currency;
  paidAmount?: number;
  paidCurrency?: Currency;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  exchangeRateSource?: 'manual' | 'legacy';
  appliedAmount?: number;
  appliedCurrency?: Currency;
  paymentMethod: PaymentMethod;
  installmentNumber?: number | null;
  receiptNumber?: string;
  receiptDocumentId?: Id | null;
  receiptDocumentNumber?: string | null;
}

export interface BuyerPortalSaleDetail {
  sale: {
    saleId: Id;
    saleNumber: string;
    totalPrice: number;
    currency?: string;
    downPaymentAmount?: number;
    financedAmount?: number;
    installmentCount?: number;
    installmentAmount?: number;
    status: SaleStatus;
    createdAt?: string;
  };
  buyer: BuyerPortalProfile['primaryBuyer'];
  development: { developmentId: Id; name: string; location?: string; description?: string } | null;
  lot: Omit<Lot, '_id' | 'developmentId' | 'price' | 'currency' | 'reservedBySaleId' | 'notes'> & { lotId: Id } | null;
  financialSummary: {
    totalPrice: number;
    downPaymentAmount: number;
    reservationAmountApplied: number;
    financedAmount: number;
    totalPaid: number;
    pendingBalance: number;
    overdueAmount: number;
    paidInstallmentsCount: number;
    pendingInstallmentsCount: number;
    partialInstallmentsCount: number;
    overdueInstallmentsCount: number;
    nextDueDate?: string | null;
    nextDueAmount: number;
  };
  reservation: {
    reservationId: Id;
    reservationNumber: string;
    reservationDate: string;
    expirationDate: string;
    reservationAmount: number;
    currency?: string;
    paymentDate?: string | null;
    paymentMethod?: PaymentMethod | '';
    status: ReservationStatus;
    receiptDocumentId?: Id | null;
  } | null;
  quotation: {
    quotationId: Id;
    quotationNumber: string;
    totalPrice: number;
    discountAmount?: number;
    finalPrice: number;
    downPaymentAmount: number;
    financedAmount: number;
    installmentCount: number;
    installmentAmount: number;
    validUntil: string;
    status: QuotationStatus;
    generatedDocumentId?: Id | null;
  } | null;
  documents: BuyerPortalDocument[];
}

// ---- Etapa 7: Caja, Gastos, Proveedores, Obras ----

export type CashAccountType = 'cash' | 'bank_account' | 'virtual_wallet' | 'internal';
export type MovementType = 'income' | 'expense' | 'transfer_in' | 'transfer_out' | 'adjustment';
export type MovementStatus = 'draft' | 'confirmed' | 'cancelled';
export type MovementCategory =
  | 'sale_down_payment'
  | 'installment_payment'
  | 'reservation_payment'
  | 'manual_income'
  | 'other_income'
  | 'work_expense'
  | 'administrative_expense'
  | 'supplier_payment'
  | 'tax'
  | 'fee'
  | 'refund'
  | 'other_expense';
export type SupplierCategory = 'construction' | 'services' | 'professional' | 'materials' | 'taxes' | 'other';
export type ExpenseCategory =
  | 'work'
  | 'administrative'
  | 'professional_fees'
  | 'materials'
  | 'machinery'
  | 'taxes'
  | 'services'
  | 'marketing'
  | 'refund'
  | 'other';
export type ExpenseStatus = 'pending' | 'paid' | 'cancelled';
export type WorkProjectStatus = 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface CashAccount {
  _id: Id;
  organizationId: Id;
  developmentId?: Id | null;
  name: string;
  type: CashAccountType;
  currency: Currency;
  initialBalance: number;
  currentBalance: number;
  isDefault: boolean;
  enabled: boolean;
  bankName?: string;
  accountHolder?: string;
  cbu?: string;
  alias?: string;
  accountNumber?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashMovement {
  _id: Id;
  organizationId: Id;
  developmentId?: Id | null;
  cashAccountId: Id | CashAccount;
  type: MovementType;
  category: MovementCategory;
  concept: string;
  description?: string;
  amount: number;
  currency: Currency;
  movementDate: string;
  status: MovementStatus;
  sourceType?: string | null;
  sourceId?: Id | null;
  paymentId?: Id | null;
  paymentRequestId?: Id | null;
  expenseId?: Id | null;
  supplierId?: Id | Supplier | null;
  workProjectId?: Id | WorkProject | null;
  proofFileUrl?: string | null;
  proofFileName?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  _id: Id;
  organizationId: Id;
  name: string;
  businessName?: string;
  documentType?: string;
  documentNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  category: SupplierCategory;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: Id;
  organizationId: Id;
  developmentId?: Id | null;
  supplierId?: Id | Supplier | null;
  workProjectId?: Id | WorkProject | null;
  cashMovementId?: Id | CashMovement | null;
  expenseNumber: string;
  category: ExpenseCategory;
  concept: string;
  description?: string;
  amount: number;
  currency: Currency;
  expenseDate: string;
  dueDate?: string | null;
  paymentDate?: string | null;
  status: ExpenseStatus;
  paymentMethod?: string | null;
  proofFileUrl?: string | null;
  proofFileName?: string | null;
  invoiceNumber?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkProject {
  _id: Id;
  organizationId: Id;
  developmentId: Id | { _id: Id; name: string };
  name: string;
  description?: string;
  status: WorkProjectStatus;
  startDate?: string | null;
  estimatedEndDate?: string | null;
  actualEndDate?: string | null;
  estimatedBudget: number;
  currency: Currency;
  progressPercentage: number;
  responsibleUserId?: Id | null;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkProgressLog {
  _id: Id;
  organizationId: Id;
  developmentId: Id;
  workProjectId: Id;
  previousProgress: number;
  newProgress: number;
  description?: string;
  progressDate: string;
  createdBy: Id;
  createdAt: string;
}

export interface FinanceDashboardSummary {
  cashBalancesByCurrency: Partial<Record<Currency, number>>;
  incomeCurrentMonthByCurrency: Partial<Record<Currency, number>>;
  expensesCurrentMonthByCurrency: Partial<Record<Currency, number>>;
  netResultCurrentMonthByCurrency: Partial<Record<Currency, number>>;
  pendingExpensesByCurrency: Partial<Record<Currency, number>>;
  paidExpensesByCurrency: Partial<Record<Currency, number>>;
  workBudgetByCurrency: Partial<Record<Currency, number>>;
  workSpentByCurrency: Partial<Record<Currency, number>>;
  workProjectsInProgress: number;
}

// ---- Etapa 8: Mora, Refinanciación, Legal, Escrituración ----

export type DelinquencyStatus = 'open' | 'monitoring' | 'notified' | 'in_agreement' | 'in_legal_review' | 'rescission_process' | 'resolved' | 'cancelled';
export type DelinquencySeverity = 'low' | 'medium' | 'high' | 'critical';
export type DelinquencyActionType = 'call' | 'whatsapp' | 'email' | 'note' | 'payment_promise' | 'notice_sent' | 'legal_notice' | 'agreement_created' | 'agreement_signed' | 'legal_review_started' | 'rescission_started' | 'case_resolved';
export type RefinancingStatus = 'draft' | 'pending_signature' | 'signed' | 'active' | 'cancelled' | 'completed';
export type LegalProcessType = 'legal_review' | 'rescission' | 'execution' | 'mediation' | 'other';
export type LegalProcessStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'cancelled';
export type DeedStatus = 'not_started' | 'pending_documents' | 'documents_complete' | 'sent_to_notary' | 'signing_scheduled' | 'signed' | 'delivered' | 'completed' | 'cancelled';

export interface DelinquencyCase {
  _id: Id;
  organizationId: Id;
  developmentId: Id | Development;
  saleId: Id | Sale;
  buyerId: Id | Buyer;
  lotId: Id | Lot;
  caseNumber: string;
  status: DelinquencyStatus;
  severity: DelinquencySeverity;
  firstOverdueDate: string;
  overdueInstallmentsCount: number;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  totalPendingBalanceByCurrency: Partial<Record<Currency, number>>;
  lastPaymentDate?: string | null;
  lastContactDate?: string | null;
  nextActionDate?: string | null;
  assignedUserId?: Id | null;
  notes?: string;
  resolvedAt?: string | null;
  resolvedBy?: Id | null;
  resolutionType?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DelinquencyAction {
  _id: Id;
  organizationId: Id;
  delinquencyCaseId: Id;
  saleId: Id;
  type: DelinquencyActionType;
  title: string;
  description?: string;
  actionDate: string;
  nextActionDate?: string | null;
  createdBy: Id;
  createdAt: string;
  attachments?: { fileUrl: string; publicId: string; fileName: string }[];
}

export interface RefinancingAgreement {
  _id: Id;
  organizationId: Id;
  developmentId: Id;
  saleId: Id | Sale;
  buyerId: Id | Buyer;
  lotId: Id | Lot;
  delinquencyCaseId?: Id | null;
  agreementNumber: string;
  status: RefinancingStatus;
  agreementDate: string;
  signedAt?: string | null;
  currency: Currency;
  totalDebtAmount: number;
  downPaymentAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  monthlyDueDay: number;
  notes?: string;
  generatedDocumentId?: Id | null;
  signedDocumentUrl?: string | null;
  previousInstallmentIds: Id[];
  newInstallmentIds: Id[];
  exchangeRateSnapshot?: Record<string, unknown> | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalProcess {
  _id: Id;
  organizationId: Id;
  developmentId: Id;
  saleId: Id | Sale;
  buyerId: Id | Buyer;
  lotId: Id | Lot;
  delinquencyCaseId?: Id | null;
  processNumber: string;
  type: LegalProcessType;
  status: LegalProcessStatus;
  startDate: string;
  assignedUserId?: Id | null;
  lawyerName?: string | null;
  lawyerContact?: string | null;
  reason: string;
  notes?: string;
  resolutionDate?: string | null;
  resolutionType?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeedProcess {
  _id: Id;
  organizationId: Id;
  developmentId: Id;
  saleId: Id | Sale;
  buyerId: Id | Buyer;
  lotId: Id | Lot;
  processNumber: string;
  status: DeedStatus;
  notaryName?: string | null;
  notaryContact?: string | null;
  requiredDocuments: string[];
  submittedDocuments: { name: string; fileUrl: string; publicId: string; uploadedAt: string }[];
  estimatedSigningDate?: string | null;
  signingDate?: string | null;
  deedNumber?: string | null;
  deedFileUrl?: string | null;
  notes?: string;
  completedAt?: string | null;
  completedBy?: Id | null;
  overrideDebtCheck?: boolean;
  overrideReason?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDashboardSummary {
  openCases: number;
  criticalCases: number;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  activeRefinancings: number;
  openLegalProcesses: number;
  activeDeedProcesses: number;
  upcomingSignings: number;
}

// ---- Etapa 9: Migración a GestionAr App ----

export type MigrationBatchStatus = 'draft' | 'simulated' | 'in_progress' | 'completed' | 'completed_with_warnings' | 'failed' | 'cancelled';
export type MigrationMode = 'dry_run' | 'execute';
export type MigrationItemStatus = 'pending' | 'skipped' | 'created' | 'linked' | 'updated' | 'failed';
export type MigrationItemAction = 'create' | 'link_existing' | 'update_existing' | 'skip';
export type MigrationSourceType = 'development' | 'buyer' | 'lot' | 'sale' | 'owner_lot_link' | 'user';
export type MigrationTargetType = 'organization' | 'owner' | 'lot' | 'owner_lot_link' | 'user';

export interface MigrationBatchSummary {
  total: number;
  created: number;
  linked: number;
  skipped: number;
  failed: number;
  warnings: number;
}

export interface MigrationBatch {
  _id: Id;
  organizationId: Id;
  developmentId: Id | Development;
  batchNumber: string;
  status: MigrationBatchStatus;
  mode: MigrationMode;
  targetGestionarOrganizationId?: string | null;
  targetGestionarOrganizationName?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  startedBy: Id;
  completedBy?: Id | null;
  summary: MigrationBatchSummary;
  migrationErrors: string[];
  warnings: string[];
  dryRunResult?: MigrationPreviewResult | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationItem {
  _id: Id;
  organizationId: Id;
  migrationBatchId: Id;
  developmentId: Id;
  sourceType: MigrationSourceType;
  sourceId: string;
  targetType: MigrationTargetType;
  targetId?: string | null;
  status: MigrationItemStatus;
  action: MigrationItemAction;
  reason?: string | null;
  errorMessage?: string | null;
  warnings: string[];
  sourceSnapshot?: Record<string, unknown> | null;
  targetSnapshot?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationPreviewBuyer {
  _id: Id;
  name: string;
  documentNumber: string;
  email: string;
  action: MigrationItemAction;
  targetId?: string | null;
  warnings: string[];
}

export interface MigrationPreviewLot {
  _id: Id;
  lotNumber: string;
  block?: string;
  action: MigrationItemAction;
  targetId?: string | null;
  warnings: string[];
}

export interface MigrationPreviewSkippedSale {
  _id: Id;
  saleNumber: string;
  status: string;
  reason: string;
}

export interface MigrationPreviewResult {
  organization: {
    name: string;
    action: MigrationItemAction;
    targetId?: string | null;
  };
  buyers: MigrationPreviewBuyer[];
  lots: MigrationPreviewLot[];
  skippedSales: MigrationPreviewSkippedSale[];
  eligibleSalesCount: number;
  buyersCount: number;
  lotsCount: number;
  skippedCount: number;
  warnings: string[];
  blockingErrors: string[];
}

export interface MigrationStatusResponse {
  development: {
    _id: Id;
    name: string;
    gestionarOrganizationId?: string | null;
    migrationStatus: string;
    migratedToGestionarAt?: string | null;
  };
  lastBatch?: MigrationBatch | null;
  eligibleSalesCount: number;
  skippedSalesCount: number;
}

export interface MigrationExecuteConfig {
  targetOrganizationMode: 'create' | 'link_existing';
  targetGestionarOrganizationId?: string;
  startBillingPeriod?: string;
  chargeCurrentMonth?: boolean;
  allowPendingDebtMigration?: boolean;
  pendingDebtOverrideReason?: string;
  selectedSaleIds?: Id[];
  selectedBuyerIds?: Id[];
  selectedLotIds?: Id[];
}

// ---- Etapa 10: Reportes ejecutivos, alertas y notificaciones ----

export type AlertRuleType =
  | 'reservation_expiring'
  | 'installment_overdue'
  | 'payment_request_pending'
  | 'quotation_expiring'
  | 'lead_without_followup'
  | 'work_project_delayed'
  | 'expense_due'
  | 'deed_signing_upcoming'
  | 'migration_ready'
  | 'legal_action_pending'
  | 'cash_balance_low';

export type AlertRuleScope = 'organization' | 'development';
export type AlertChannel = 'in_app' | 'email' | 'whatsapp';
export type AlertFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';
export type AlertSeverity = 'info' | 'warning' | 'high' | 'critical';
export type AlertStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';
export type AlertEntityType =
  | 'lead'
  | 'quotation'
  | 'reservation'
  | 'sale'
  | 'installment'
  | 'payment_request'
  | 'delinquency_case'
  | 'work_project'
  | 'expense'
  | 'deed_process'
  | 'migration_batch'
  | 'cash_account'
  | 'development'
  | 'lot';

export interface AlertRule {
  _id: Id;
  organizationId: Id;
  name: string;
  description?: string;
  type: AlertRuleType;
  enabled: boolean;
  scope: AlertRuleScope;
  developmentId?: Id | null;
  conditions: Record<string, unknown>;
  channels: AlertChannel[];
  frequency: AlertFrequency;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: Id;
  organizationId: Id;
  developmentId?: Id | null;
  alertRuleId?: Id | null;
  type: AlertRuleType;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityType: AlertEntityType;
  entityId: Id;
  status: AlertStatus;
  dueDate?: string | null;
  assignedUserId?: Id | null;
  resolvedAt?: string | null;
  resolvedBy?: Id | null;
  dismissedAt?: string | null;
  dismissedBy?: Id | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveSummary {
  developmentsCount: number;
  activeDevelopmentsCount: number;
  migratedDevelopmentsCount: number;
  totalLots: number;
  lotsByStatus: Partial<Record<string, number>>;
  lotsAvailable: number;
  lotsReserved: number;
  lotsSold: number;
  lotsBlocked: number;
  leadsCount: number;
  leadsByStatus: Partial<Record<string, number>>;
  quotationsCount: number;
  reservationsActive: number;
  reservationsExpiringSoon: number;
  activeSalesCount: number;
  completedSalesCount: number;
  totalSoldByCurrency: Partial<Record<Currency, number>>;
  totalCollectedByCurrency: Partial<Record<Currency, number>>;
  pendingBalanceByCurrency: Partial<Record<Currency, number>>;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  overdueInstallmentsCount: number;
  paymentRequestsPendingCount: number;
  paymentRequestsPendingByCurrency: Partial<Record<Currency, number>>;
  cashBalancesByCurrency: Partial<Record<Currency, number>>;
  expensesCurrentMonthByCurrency: Partial<Record<Currency, number>>;
  worksInProgressCount: number;
  deedsInProgressCount: number;
  legalCasesOpenCount: number;
  migrationsReadyCount: number;
}

// ── Etapa 11: Comunicaciones ──────────────────────────────────────────────────

export type CommunicationTemplateType =
  | 'reservation_expiring' | 'quotation_expiring' | 'payment_reminder'
  | 'installment_overdue' | 'payment_request_received' | 'payment_request_approved'
  | 'payment_request_rejected' | 'down_payment_pending' | 'deed_status_update'
  | 'legal_notice_info' | 'refinancing_info' | 'migration_info' | 'custom';

export type CommunicationChannel = 'email' | 'whatsapp' | 'in_app';
export type CommunicationLogStatus = 'draft' | 'generated' | 'queued' | 'sent' | 'failed' | 'cancelled';
export type NotificationStatus = 'unread' | 'read' | 'resolved' | 'dismissed';
export type NotificationSeverity = 'info' | 'warning' | 'high' | 'critical';

export interface CommunicationTemplate {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: CommunicationTemplateType;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
  variables: string[];
  enabled: boolean;
  isDefault: boolean;
  scope: 'organization' | 'development';
  developmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  _id: string;
  organizationId: string;
  templateId?: string;
  channel: CommunicationChannel;
  type: string;
  direction: 'outbound' | 'inbound' | 'internal';
  recipientType: string;
  recipientId?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  status: CommunicationLogStatus;
  provider: string;
  errorMessage?: string;
  sentAt?: string;
  whatsappUrl?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  buyerId?: string;
  saleId?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  severity: NotificationSeverity;
  status: NotificationStatus;
  relatedEntityType?: string;
  relatedEntityId?: string;
  alertId?: string;
  readAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface CommunicationSettings {
  _id?: string;
  organizationId: string;
  emailEnabled: boolean;
  emailProvider: string;
  senderName?: string;
  senderEmail?: string;
  replyToEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpSecure?: boolean;
  whatsappEnabled: boolean;
  whatsappMode: string;
  defaultWhatsappNumber?: string;
  portalBaseUrl?: string;
  adminContactEmail?: string;
  adminContactPhone?: string;
  enabledAutomaticNotifications: string[];
}

// ── Etapa 12: Roles, permisos y configuración ────────────────────────────────

export type RoleType = 'super_admin' | 'admin' | 'sales' | 'finance' | 'legal' | 'viewer' | 'custom';
export type DevelopmentAccessMode = 'all' | 'selected';
export type AuditAction = string;

export interface Role {
  _id: Id;
  organizationId: Id;
  name: string;
  description?: string;
  type: RoleType;
  permissions: Record<string, string[]>;
  developmentAccessMode: DevelopmentAccessMode;
  allowedDevelopmentIds: Id[];
  isSystemRole: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleAssignment {
  _id: Id;
  organizationId: Id;
  userId: Id;
  roleId: Id | Role;
  developmentAccessMode: DevelopmentAccessMode | null;
  allowedDevelopmentIds: Id[];
  enabled: boolean;
  assignedAt: string;
  createdAt: string;
}

export interface OrganizationSettings {
  organizationId: Id;
  defaultCurrency: Currency;
  supportedCurrencies: Currency[];
  timezone: string;
  dateFormat: string;
  numberingConfig: Record<string, string>;
  paymentConfig: Record<string, unknown>;
  delinquencyConfig: Record<string, unknown>;
  documentConfig: Record<string, unknown>;
  migrationConfig: Record<string, unknown>;
  commercialConfig: Record<string, unknown>;
  updatedAt?: string;
}

export interface DevelopmentSettings {
  organizationId: Id;
  developmentId: Id;
  defaultCurrency?: Currency | null;
  allowedCurrencies?: Currency[];
  defaultReservationDays?: number | null;
  reservationExpiringSoonDays?: number | null;
  defaultQuotationValidityDays?: number | null;
  defaultMonthlyDueDay?: number | null;
  defaultInstallmentCount?: number | null;
  allowPendingDebtMigration?: boolean | null;
  requireDebtFreeForDeed?: boolean;
  automaticCashMovementOnPaymentApproval?: boolean | null;
  defaultCashAccountByCurrency?: Record<string, string>;
  updatedAt?: string;
}

export interface AuditLog {
  _id: Id;
  organizationId: Id;
  userId: Id;
  action: AuditAction;
  entityType?: string | null;
  entityId?: Id | null;
  developmentId?: Id | null;
  previousValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface EffectivePermissions {
  noAssignments: boolean;
  permissions: Record<string, string[]>;
  developmentAccessMode: DevelopmentAccessMode;
  allowedDevelopmentIds: Id[];
}

export interface PermissionsCatalogModule {
  key: string;
  label: string;
  actions: Array<{ key: string; label: string }>;
}

// ─── Etapa 13: Importaciones y Exportaciones ─────────────────────────────────

export type ImportType = 'lots' | 'buyers' | 'sales' | 'installments' | 'payments' | 'reservations' | 'suppliers' | 'expenses' | 'full_onboarding';
export type ImportStatus = 'uploaded' | 'validating' | 'validated' | 'validation_failed' | 'ready_to_import' | 'importing' | 'completed' | 'completed_with_warnings' | 'failed' | 'cancelled';
export type ImportMode = 'dry_run' | 'execute';
export type ImportRowStatus = 'valid' | 'invalid' | 'imported' | 'skipped' | 'duplicated' | 'failed';

export interface ImportBatch {
  _id: Id;
  organizationId: Id;
  developmentId?: Id | null;
  batchNumber: string;
  type: ImportType;
  status: ImportStatus;
  mode: ImportMode;
  fileName: string;
  fileUrl?: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  skippedRows: number;
  duplicatedRows: number;
  errorsCount: number;
  warningsCount: number;
  summary?: Record<string, unknown>;
  options?: Record<string, unknown>;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportRow {
  _id: Id;
  organizationId: Id;
  importBatchId: Id;
  rowNumber: number;
  rawData: Record<string, unknown>;
  normalizedData: Record<string, unknown>;
  status: ImportRowStatus;
  action?: string | null;
  entityType?: string | null;
  entityId?: Id | null;
  errors: Array<{ field?: string; message: string; severity: 'error' | 'warning' }>;
  warnings: Array<{ field?: string; message: string }>;
  createdAt: string;
}

export interface ImportTemplate {
  type: ImportType;
  label: string;
  description: string;
  requiredColumns: string[];
  optionalColumns: string[];
}

// ─── SaaS / Billing ─────────────────────────────────────────────────────────

export type PlanCode = 'starter' | 'pro' | 'enterprise' | 'custom';
export type SubscriptionStatus = 'trial' | 'active' | 'overdue' | 'suspended' | 'cancelled';

export interface PlanLimits {
  maxDevelopments: number | null;
  maxLots: number | null;
  maxUsers: number | null;
  maxBuyers: number | null;
  maxActiveSales: number | null;
  maxStorageMb: number | null;
  maxMonthlyImports: number | null;
  maxBuyerPortalUsers: number | null;
}

export interface PlanModules {
  commercial: boolean;
  buyerPortal: boolean;
  documents: boolean;
  payments: boolean;
  lotsMap: boolean;
  finance: boolean;
  legal: boolean;
  migration: boolean;
  reports: boolean;
  communications: boolean;
  imports: boolean;
  advancedPermissions: boolean;
}

export interface SubscriptionPlan {
  _id: Id;
  name: string;
  code: PlanCode;
  description?: string;
  monthlyPrice: number;
  currency: Currency;
  setupFee?: number;
  limits: PlanLimits;
  enabledModules: PlanModules;
  isPublic: boolean;
  isDefault: boolean;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface OrganizationSubscription {
  _id: Id;
  organizationId: Id;
  planId: Id | SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate?: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  customLimits?: Partial<PlanLimits> | null;
  customEnabledModules?: Partial<PlanModules> | null;
  notes?: string;
  createdAt?: string;
}

export interface SubscriptionPayment {
  _id: Id;
  organizationId: Id;
  subscriptionId: Id;
  amount: number;
  currency: Currency;
  paymentDate: string;
  periodFrom: string;
  periodTo: string;
  paymentMethod: 'cash' | 'transfer' | 'bank_deposit' | 'other';
  receiptNumber?: string;
  notes?: string;
  createdAt?: string;
}

export interface UsageInfo {
  developmentsCount: number;
  lotsCount: number;
  usersCount: number;
  buyersCount: number;
  activeSalesCount: number;
  storageUsedMb: number;
  monthlyImportsCount: number;
  buyerPortalUsersCount: number;
}

export interface OnboardingItem {
  key: string;
  title: string;
  description: string;
  route: string;
  completed: boolean;
  completedAt?: string;
  skipped: boolean;
  skippedAt?: string;
}

export interface OnboardingChecklist {
  _id: Id;
  items: OnboardingItem[];
  completedPercentage: number;
  completedAt?: string;
}

export interface SaasDashboard {
  totalOrgs: number;
  activeOrgs: number;
  trialOrgs: number;
  overdueOrgs: number;
  suspendedOrgs: number;
  mrrARS: number;
  mrrUSD: number;
  paymentsThisMonth: number;
  orgsByPlan: Array<{ planName: string; count: number }>;
}

// ── Etapa 16: Mapa Visual Avanzado ────────────────────────────────────────────

export interface LotMapShape {
  id: string;
  lotId?: string;
  shapeType: 'rectangle' | 'polygon';
  coordinates: any;
  label?: string;
  labelPosition?: { x: number; y: number };
  rotation?: number;
  style?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EnrichedMapShape extends LotMapShape {
  lotNumber?: string;
  block?: string;
  surface?: number;
  price?: number;
  currency?: string;
  visualStatus?: string;
  buyerName?: string;
  buyerId?: string;
  saleId?: string;
  saleNumber?: string;
  reservationId?: string;
  reservationNumber?: string;
  hasOverdueInstallments?: boolean;
  overdueInstallmentsCount?: number;
  pendingBalanceByCurrency?: Record<string, number>;
  overdueAmountByCurrency?: Record<string, number>;
  actions?: Record<string, boolean>;
}

export interface LotMapLayout {
  _id: Id;
  organizationId: Id;
  developmentId: Id;
  name: string;
  description?: string;
  backgroundImageUrl?: string;
  backgroundImagePublicId?: string;
  backgroundImageFileName?: string;
  canvasWidth: number;
  canvasHeight: number;
  layoutData: { shapes: LotMapShape[] };
  version: number;
  status: 'draft' | 'active' | 'archived';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdvancedMapData {
  development: { _id: Id; name: string; location?: string; defaultCurrency?: string };
  layout: LotMapLayout | null;
  shapes: EnrichedMapShape[];
  unplacedLots: Array<{ id: Id; lotNumber: string; block: string; surface?: number; price?: number; currency?: string; status?: string }>;
}

// ── Etapa 16: Backup y Exportaciones ─────────────────────────────────────────

export type BackupFrequency = 'manual' | 'weekly' | 'monthly';
export type BackupRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BackupJob {
  _id: Id;
  name: string;
  description?: string;
  frequency: BackupFrequency;
  enabled: boolean;
  includeModules: string[];
  developmentIds: Id[];
  format: 'zip' | 'xlsx';
  retentionCount: number;
  lastRunAt?: string;
  nextRunAt?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface BackupRun {
  _id: Id;
  backupJobId?: Id;
  runNumber: string;
  status: BackupRunStatus;
  startedAt: string;
  completedAt?: string;
  failedAt?: string;
  requestedBy?: Id;
  fileUrl?: string;
  filePublicId?: string;
  fileName?: string;
  format: 'zip' | 'xlsx';
  sizeBytes?: number;
  summary?: {
    modulesIncluded: string[];
    recordsExportedByModule: Record<string, number>;
    developmentIds: string[];
    warnings: string[];
  };
  errorMessage?: string;
  createdAt: string;
}
