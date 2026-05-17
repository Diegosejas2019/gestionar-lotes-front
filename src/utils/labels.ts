import type { CashAccountType, DeedStatus, DelinquencyActionType, DelinquencySeverity, DelinquencyStatus, DevelopmentStatus, ExpenseCategory, ExpenseStatus, InstallmentStatus, LeadActivityType, LeadSource, LeadStatus, LegalProcessStatus, LegalProcessType, LotStatus, LotVisualStatus, MovementCategory, MovementStatus, MovementType, PaymentMethod, PaymentRequestMethod, PaymentRequestStatus, PaymentRequestType, QuotationStatus, RefinancingStatus, ReservationStatus, SaleStatus, SupplierCategory, WorkProjectStatus } from '../types';
import type { DocumentStatus, DocumentType } from '../types';

export const developmentStatusLabels: Record<DevelopmentStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Finalizado',
  migrated_to_gestionar: 'Migrado a GestionAr',
};

export const lotStatusLabels: Record<LotStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
  blocked: 'Bloqueado',
  cancelled: 'Cancelado',
  deeded: 'Escriturado',
};

export const lotVisualStatusLabels: Record<LotVisualStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  reservation_expiring: 'Reserva por vencer',
  sold: 'Vendido',
  sold_with_overdue: 'Vendido con mora',
  blocked: 'Bloqueado',
  cancelled: 'Cancelado',
  deeded: 'Escriturado',
};

export const saleStatusLabels: Record<SaleStatus, string> = {
  draft: 'Borrador',
  pending_down_payment: 'Anticipo pendiente',
  active: 'Activa',
  in_legal_review: 'En revisión legal',
  rescission_process: 'En proceso de rescisión',
  rescinded: 'Rescindida',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

export const installmentStatusLabels: Record<InstallmentStatus, string> = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagada',
  overdue: 'Vencida',
  refinanced: 'Refinanciada',
  cancelled: 'Cancelada',
};

export const serviceLabels: Record<string, string> = {
  electricity: 'Luz',
  water: 'Agua',
  gas: 'Gas',
  sewer: 'Cloacas',
  internet: 'Internet',
  security: 'Seguridad',
  lighting: 'Alumbrado',
  pavement: 'Pavimento',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  bank_deposit: 'Depósito bancario',
  mercado_pago: 'Mercado Pago',
  other: 'Otro',
};

export const paymentRequestMethodLabels: Record<PaymentRequestMethod, string> = {
  bank_transfer: 'Transferencia bancaria',
  cash: 'Efectivo',
  mercado_pago: 'Mercado Pago',
  other: 'Otro',
};

export const paymentRequestTypeLabels: Record<PaymentRequestType, string> = {
  reservation_payment: 'Sena de reserva',
  down_payment: 'Anticipo',
  installment_payment: 'Pago de cuota',
};

export const paymentRequestStatusLabels: Record<PaymentRequestStatus, string> = {
  pending: 'Pendiente',
  proof_uploaded: 'Comprobante cargado',
  under_review: 'En revision',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  expired: 'Vencido',
  cancelled: 'Cancelado',
  provider_pending: 'Pendiente en proveedor',
  provider_paid: 'Pagado en proveedor',
  provider_failed: 'Fallido en proveedor',
};

export const documentTypeLabels: Record<DocumentType, string> = {
  down_payment_receipt: 'Recibo de anticipo',
  installment_receipt: 'Recibo de cuota',
  account_statement: 'Estado de cuenta',
  sale_certificate: 'Constancia de venta/reserva',
  debt_free_certificate: 'Libre deuda simple',
  quotation_pdf: 'Cotizacion comercial',
  reservation_receipt: 'Recibo de sena de reserva',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  active: 'Activo',
  annulled: 'Anulado',
};

export const leadSourceLabels: Record<LeadSource, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  website: 'Sitio web',
  referral: 'Referido',
  sign: 'Cartel en obra',
  real_estate_agent: 'Inmobiliaria',
  marketplace: 'Marketplace',
  other: 'Otro',
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  interested: 'Interesado',
  visited: 'Visito el barrio',
  quoted: 'Cotizacion enviada',
  reservation_pending: 'Reserva pendiente',
  reserved: 'Reservado',
  converted: 'Convertido',
  lost: 'Perdido',
};

export const leadActivityTypeLabels: Record<LeadActivityType, string> = {
  call: 'Llamada',
  whatsapp: 'WhatsApp',
  email: 'Email',
  meeting: 'Reunion',
  visit: 'Visita',
  note: 'Nota',
  quotation_sent: 'Cotizacion enviada',
  reservation_created: 'Reserva creada',
  status_change: 'Cambio de estado',
};

export const quotationStatusLabels: Record<QuotationStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Vencida',
  converted_to_reservation: 'Convertida en reserva',
  converted_to_sale: 'Convertida en venta',
};

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  active: 'Activa',
  pending_payment: 'Sena pendiente',
  paid: 'Sena pagada',
  expired: 'Vencida',
  cancelled: 'Cancelada',
  converted_to_sale: 'Convertida en venta',
};

export const developmentStatuses = Object.keys(developmentStatusLabels) as DevelopmentStatus[];
export const lotStatuses = Object.keys(lotStatusLabels) as LotStatus[];
export const lotVisualStatuses = Object.keys(lotVisualStatusLabels) as LotVisualStatus[];
export const saleStatuses = Object.keys(saleStatusLabels) as SaleStatus[];
export const paymentMethods = Object.keys(paymentMethodLabels) as PaymentMethod[];
export const paymentRequestMethods = Object.keys(paymentRequestMethodLabels) as PaymentRequestMethod[];
export const paymentRequestTypes = Object.keys(paymentRequestTypeLabels) as PaymentRequestType[];
export const paymentRequestStatuses = Object.keys(paymentRequestStatusLabels) as PaymentRequestStatus[];
export const leadSources = Object.keys(leadSourceLabels) as LeadSource[];
export const leadStatuses = Object.keys(leadStatusLabels) as LeadStatus[];
export const leadActivityTypes = Object.keys(leadActivityTypeLabels) as LeadActivityType[];
export const quotationStatuses = Object.keys(quotationStatusLabels) as QuotationStatus[];
export const reservationStatuses = Object.keys(reservationStatusLabels) as ReservationStatus[];
export const services = Object.keys(serviceLabels);

// ---- Etapa 7: Caja, Gastos, Proveedores, Obras ----

export const cashAccountTypeLabels: Record<CashAccountType, string> = {
  cash: 'Efectivo',
  bank_account: 'Cuenta bancaria',
  virtual_wallet: 'Billetera virtual',
  internal: 'Interna',
};

export const movementTypeLabels: Record<MovementType, string> = {
  income: 'Ingreso',
  expense: 'Egreso',
  transfer_in: 'Transferencia entrada',
  transfer_out: 'Transferencia salida',
  adjustment: 'Ajuste',
};

export const movementStatusLabels: Record<MovementStatus, string> = {
  draft: 'Borrador',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

export const movementCategoryLabels: Record<MovementCategory, string> = {
  sale_down_payment: 'Anticipo de venta',
  installment_payment: 'Pago de cuota',
  reservation_payment: 'Seña de reserva',
  manual_income: 'Ingreso manual',
  other_income: 'Otro ingreso',
  work_expense: 'Gasto de obra',
  administrative_expense: 'Gasto administrativo',
  supplier_payment: 'Pago a proveedor',
  tax: 'Impuesto',
  fee: 'Honorarios',
  refund: 'Devolución',
  other_expense: 'Otro egreso',
};

export const supplierCategoryLabels: Record<SupplierCategory, string> = {
  construction: 'Construcción',
  services: 'Servicios',
  professional: 'Profesional',
  materials: 'Materiales',
  taxes: 'Impuestos',
  other: 'Otro',
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  work: 'Obra',
  administrative: 'Administrativo',
  professional_fees: 'Honorarios',
  materials: 'Materiales',
  machinery: 'Maquinaria',
  taxes: 'Impuestos',
  services: 'Servicios',
  marketing: 'Marketing',
  refund: 'Devolución',
  other: 'Otro',
};

export const expenseStatusLabels: Record<ExpenseStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

export const workProjectStatusLabels: Record<WorkProjectStatus, string> = {
  planned: 'Planificada',
  in_progress: 'En curso',
  paused: 'Pausada',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
};

// ---- Etapa 8: Mora, Refinanciación, Legal, Escrituración ----

export const delinquencyStatusLabels: Record<DelinquencyStatus, string> = {
  open: 'Abierto',
  monitoring: 'En seguimiento',
  notified: 'Notificado',
  in_agreement: 'En acuerdo',
  in_legal_review: 'En revisión legal',
  rescission_process: 'En proceso de rescisión',
  resolved: 'Resuelto',
  cancelled: 'Cancelado',
};

export const delinquencySeverityLabels: Record<DelinquencySeverity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export const delinquencyActionTypeLabels: Record<DelinquencyActionType, string> = {
  call: 'Llamada',
  whatsapp: 'WhatsApp',
  email: 'Email',
  note: 'Nota',
  payment_promise: 'Promesa de pago',
  notice_sent: 'Aviso enviado',
  legal_notice: 'Intimación',
  agreement_created: 'Acuerdo creado',
  agreement_signed: 'Acuerdo firmado',
  legal_review_started: 'Revisión legal iniciada',
  rescission_started: 'Rescisión iniciada',
  case_resolved: 'Caso resuelto',
};

export const refinancingStatusLabels: Record<RefinancingStatus, string> = {
  draft: 'Borrador',
  pending_signature: 'Pendiente de firma',
  signed: 'Firmado',
  active: 'Activo',
  cancelled: 'Cancelado',
  completed: 'Completado',
};

export const legalProcessTypeLabels: Record<LegalProcessType, string> = {
  legal_review: 'Revisión legal',
  rescission: 'Rescisión',
  execution: 'Ejecución',
  mediation: 'Mediación',
  other: 'Otro',
};

export const legalProcessStatusLabels: Record<LegalProcessStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  waiting_response: 'Esperando respuesta',
  resolved: 'Resuelto',
  cancelled: 'Cancelado',
};

export const deedStatusLabels: Record<DeedStatus, string> = {
  not_started: 'No iniciado',
  pending_documents: 'Documentación pendiente',
  documents_complete: 'Documentación completa',
  sent_to_notary: 'En escribanía',
  signing_scheduled: 'Firma programada',
  signed: 'Escritura firmada',
  delivered: 'Testimonio entregado',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};;
