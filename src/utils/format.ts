import type { Buyer, Development, Id, Lead, Lot, Quotation, Reservation, Sale } from '../types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getId(value: Id | { _id: Id } | null | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value._id;
}

export function asDevelopment(value: Sale['developmentId'] | Lot['developmentId'] | null | undefined): Development | null {
  return isRecord(value) && typeof value._id === 'string' ? value as Development : null;
}

export function asLot(value: Sale['lotId'] | null | undefined): Lot | null {
  return isRecord(value) && typeof value._id === 'string' ? value as Lot : null;
}

export function asBuyer(value: Id | Buyer | null | undefined): Buyer | null {
  return isRecord(value) && typeof value._id === 'string' ? value as Buyer : null;
}

export function asLead(value: Lead | Quotation['leadId'] | Reservation['leadId'] | null | undefined): Lead | null {
  return isRecord(value) && typeof value._id === 'string' ? value as Lead : null;
}

export function asQuotation(value: Quotation | Reservation['quotationId'] | null | undefined): Quotation | null {
  return isRecord(value) && typeof value._id === 'string' ? value as Quotation : null;
}

export function asReservation(value: Reservation | Quotation['convertedReservationId'] | null | undefined): Reservation | null {
  return isRecord(value) && typeof value._id === 'string' ? value as Reservation : null;
}

export function buyerName(buyer?: Buyer | null): string {
  if (!buyer) return 'Sin comprador';
  return `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Sin nombre';
}

export function leadName(lead?: Lead | null): string {
  if (!lead) return 'Sin interesado';
  return lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Sin nombre';
}

export function partyName(lead?: Lead | null, buyer?: Buyer | null): string {
  if (buyer) return buyerName(buyer);
  if (lead) return leadName(lead);
  return 'Sin interesado/comprador';
}

export function lotLabel(lot?: Lot | null): string {
  if (!lot) return 'Sin lote';
  const block = lot.block ? `Mz. ${lot.block} · ` : '';
  return `${block}Lote ${lot.lotNumber}`;
}

export function formatCurrency(amount = 0, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

export function formatDate(value?: string | null): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toInputDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function numberValue(value: FormDataEntryValue | null): number {
  return Number(value || 0);
}
