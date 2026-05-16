import { useEffect, useMemo, useState } from 'react';
import { buyerPaymentMethodsApi, buyerPaymentRequestsApi } from '../api/services';
import { CurrencyAmount } from './CurrencyAmount';
import { ErrorMessage } from './ErrorMessage';
import type { Currency, PaymentMethodConfig, PaymentRequest, PaymentRequestType } from '../types';
import { formatCurrency } from '../utils/format';
import { paymentRequestMethodLabels, paymentRequestTypeLabels } from '../utils/labels';

export type PaymentConcept = {
  type: PaymentRequestType;
  label: string;
  saleId?: string | null;
  reservationId?: string | null;
  installmentId?: string | null;
  amount: number;
  currency?: string;
};

type Props = {
  concepts: PaymentConcept[];
  initialConcept?: PaymentConcept | null;
  onClose: () => void;
  onCreated: (request: PaymentRequest) => void;
};

export function BuyerInformPaymentModal({ concepts, initialConcept, onClose, onCreated }: Props): React.ReactElement {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedConceptKey, setSelectedConceptKey] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [paidCurrency, setPaidCurrency] = useState<Currency>('ARS');
  const [exchangeRate, setExchangeRate] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const conceptKey = (concept: PaymentConcept): string => `${concept.type}:${concept.saleId || ''}:${concept.reservationId || ''}:${concept.installmentId || ''}`;

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const data = await buyerPaymentMethodsApi.list();
        const enabled = data.paymentMethods || [];
        setMethods(enabled);
        const defaultMethod = enabled.find((item) => item.isDefault) || enabled[0];
        setSelectedMethodId(defaultMethod?._id || defaultMethod?.paymentMethodConfigId || '');
        setPaidCurrency((defaultMethod?.currency as Currency) || 'ARS');
        const concept = initialConcept || concepts[0];
        setSelectedConceptKey(concept ? conceptKey(concept) : '');
        setAmount(String(concept?.amount || ''));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los medios de pago.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const selectedConcept = useMemo(() => concepts.find((item) => conceptKey(item) === selectedConceptKey) || null, [concepts, selectedConceptKey]);
  const selectedMethod = methods.find((item) => (item._id || item.paymentMethodConfigId) === selectedMethodId) || null;
  const appliedCurrency = (selectedConcept?.currency || 'ARS') as Currency;
  const needsExchangeRate = Boolean(selectedConcept && paidCurrency !== appliedCurrency);
  const numericAmount = Number(amount || 0);
  const numericRate = Number(exchangeRate || 0);
  const appliedAmount = useMemo(() => {
    if (!selectedConcept || numericAmount <= 0) return 0;
    if (!needsExchangeRate) return numericAmount;
    if (numericRate <= 0) return 0;
    if (paidCurrency === 'ARS' && appliedCurrency === 'USD') return Math.round((numericAmount / numericRate + Number.EPSILON) * 100) / 100;
    if (paidCurrency === 'USD' && appliedCurrency === 'ARS') return Math.round((numericAmount * numericRate + Number.EPSILON) * 100) / 100;
    return 0;
  }, [numericAmount, numericRate, paidCurrency, appliedCurrency, needsExchangeRate, selectedConcept]);

  useEffect(() => {
    if (selectedConcept) setAmount(String(selectedConcept.amount || ''));
  }, [selectedConceptKey]);
  useEffect(() => {
    if (selectedMethod?.currency) setPaidCurrency(selectedMethod.currency as Currency);
  }, [selectedMethodId]);

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedConcept) {
      setError('Selecciona el concepto que queres informar.');
      return;
    }
    if (!selectedMethod) {
      setError('Selecciona un medio de pago.');
      return;
    }
    if (numericAmount <= 0) {
      setError('El monto pagado debe ser mayor a cero.');
      return;
    }
    if (needsExchangeRate && numericRate <= 0) {
      setError('Ingresa un tipo de cambio mayor a cero.');
      return;
    }
    if (appliedAmount <= 0) {
      setError('El monto imputado debe ser mayor a cero.');
      return;
    }
    if (appliedAmount > selectedConcept.amount) {
      setError('El monto imputado no puede superar el saldo pendiente.');
      return;
    }
    if (selectedMethod.type === 'bank_transfer' && !file) {
      setError('Adjunta el comprobante de transferencia.');
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError('El comprobante no puede superar 5 MB.');
      return;
    }

    try {
      setSaving(true);
      const created = await buyerPaymentRequestsApi.create({
        type: selectedConcept.type,
        saleId: selectedConcept.saleId || undefined,
        reservationId: selectedConcept.reservationId || undefined,
        installmentId: selectedConcept.installmentId || undefined,
        requestedAmount: selectedConcept.amount,
        requestedCurrency: appliedCurrency,
        paidAmount: numericAmount,
        paidCurrency,
        appliedAmount,
        appliedCurrency,
        exchangeRate: needsExchangeRate ? numericRate : undefined,
        exchangeRateDate: needsExchangeRate ? new Date().toISOString().slice(0, 10) : undefined,
        paymentMethod: selectedMethod.type,
        bankAccountId: selectedMethod._id || selectedMethod.paymentMethodConfigId,
        notes,
      });
      let request = created.paymentRequest;
      if (file) {
        request = (await buyerPaymentRequestsApi.uploadProof(request._id || request.paymentRequestId!, file)).paymentRequest;
      }
      onCreated(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo informar el pago.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal modal--wide" role="dialog" aria-modal="true" onSubmit={(event) => { void submit(event); }}>
        <h2>Informar pago</h2>
        <ErrorMessage message={error} />
        {loading ? <p>Cargando medios de pago...</p> : null}
        {!loading && !methods.length ? <p>No hay medios de pago disponibles. Comunicate con la administracion.</p> : null}
        {!loading && methods.length ? (
          <>
            <label>Concepto<select value={selectedConceptKey} onChange={(event) => setSelectedConceptKey(event.target.value)} required>{concepts.map((concept) => <option key={conceptKey(concept)} value={conceptKey(concept)}>{concept.label}</option>)}</select></label>
            <label>Medio de pago<select value={selectedMethodId} onChange={(event) => setSelectedMethodId(event.target.value)} required>{methods.map((method) => <option key={method._id || method.paymentMethodConfigId} value={method._id || method.paymentMethodConfigId}>{method.name} - {paymentRequestMethodLabels[method.type]} {method.currency || 'ARS'}</option>)}</select></label>
            {selectedMethod?.type === 'bank_transfer' ? <section className="info-box">
              <strong>{selectedMethod.name}</strong>
              <p>Banco: {selectedMethod.bankName || '-'}</p>
              <p>Titular: {selectedMethod.accountHolder || '-'}</p>
              <p>CBU/CVU: {selectedMethod.cbu || '-'}</p>
              <p>Alias: {selectedMethod.alias || '-'}</p>
              <p>CUIT/CUIL: {selectedMethod.cuit || '-'}</p>
              <p>{selectedMethod.instructions || 'Carga el comprobante para que la administracion revise tu pago.'}</p>
            </section> : null}
            <label>Monto pendiente<input value={selectedConcept ? `${paymentRequestTypeLabels[selectedConcept.type]} - ${selectedConcept.label}` : ''} readOnly /></label>
            <p className="info-box">Saldo a informar: <strong><CurrencyAmount amount={selectedConcept?.amount || 0} currency={selectedConcept?.currency} /></strong></p>
            <label>Moneda en la que pagas<select value={paidCurrency} onChange={(event) => setPaidCurrency(event.target.value as Currency)} required><option value="ARS">ARS</option><option value="USD">USD</option></select></label>
            <label>Monto pagado<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
            {needsExchangeRate ? <label>Tipo de cambio<input type="number" min="0.01" step="0.01" value={exchangeRate} onChange={(event) => setExchangeRate(event.target.value)} required /></label> : null}
            <section className="info-box">
              <p>Monto pendiente: <strong><CurrencyAmount amount={selectedConcept?.amount || 0} currency={appliedCurrency} /></strong></p>
              <p>Pagas: <strong>{formatCurrency(numericAmount, paidCurrency)}</strong></p>
              {needsExchangeRate ? <p>Tipo de cambio aplicado: <strong>1 USD = ARS {numericRate || '-'}</strong></p> : null}
              <p>Se imputara: <strong><CurrencyAmount amount={appliedAmount} currency={appliedCurrency} /></strong></p>
            </section>
            <label>Comprobante<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
            <label>Notas<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></label>
            <p className="info-box">Tu pago sera revisado por la administracion. El recibo se emitira cuando sea aprobado.</p>
          </>
        ) : null}
        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button>
          <button className="button" type="submit" disabled={saving || loading || !methods.length}>{saving ? 'Enviando...' : 'Enviar comprobante'}</button>
        </div>
      </form>
    </div>
  );
}
