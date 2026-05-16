import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { buyersApi, developmentsApi, leadsApi, lotsApi, quotationsApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Buyer, Development, Lead, Lot, Quotation, QuotationStatus } from '../types';
import { getId, numberValue, todayInputValue, toInputDate } from '../utils/format';
import { quotationStatusLabels, quotationStatuses } from '../utils/labels';

export function QuotationFormPage(): React.ReactElement {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [quotation, setQuotation] = useState<Partial<Quotation>>({ status: 'draft' });
  const [developmentId, setDevelopmentId] = useState(searchParams.get('developmentId') || '');
  const [lotId, setLotId] = useState(searchParams.get('lotId') || '');
  const [leadId, setLeadId] = useState(searchParams.get('leadId') || '');
  const [buyerId, setBuyerId] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [manualInstallment, setManualInstallment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, lotData, leadData, buyerData, quotationData] = await Promise.all([
          developmentsApi.list(),
          lotsApi.list(),
          leadsApi.list(),
          buyersApi.list(),
          id ? quotationsApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        setLots(lotData.lots || []);
        setLeads(leadData.leads || []);
        setBuyers(buyerData.buyers || []);
        if (quotationData) {
          const item = quotationData.quotation;
          setQuotation(item);
          setDevelopmentId(getId(item.developmentId));
          setLotId(getId(item.lotId));
          setLeadId(getId(item.leadId));
          setBuyerId(getId(item.buyerId));
          setTotalPrice(item.totalPrice || 0);
          setDiscount(item.discountAmount || 0);
          setDownPayment(item.downPaymentAmount || 0);
          setInstallmentCount(item.installmentCount || 1);
          setInstallmentAmount(item.installmentAmount || 0);
        } else if (leadId) {
          const lead = (leadData.leads || []).find((item) => item._id === leadId);
          if (lead) {
            setDevelopmentId(getId(lead.interestedDevelopmentId));
            setLotId(getId(lead.interestedLotId));
            setDownPayment(0);
            setInstallmentCount(lead.preferredInstallments || 1);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, leadId]);

  const availableLots = lots.filter((lot) => getId(lot.developmentId) === developmentId);
  const selectedLot = useMemo(() => lots.find((lot) => lot._id === lotId), [lots, lotId]);
  const selectedDevelopment = useMemo(() => developments.find((item) => item._id === developmentId), [developments, developmentId]);
  const finalPrice = Math.max(0, totalPrice - discount);
  const financedAmount = Math.max(0, finalPrice - downPayment);
  const calculatedInstallment = installmentCount > 0 ? Math.round((financedAmount / installmentCount + Number.EPSILON) * 100) / 100 : 0;

  useEffect(() => {
    if (!id && selectedLot) setTotalPrice(selectedLot.price || 0);
  }, [selectedLot, id]);

  useEffect(() => {
    if (!manualInstallment) setInstallmentAmount(calculatedInstallment);
  }, [calculatedInstallment, manualInstallment]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!developmentId || !lotId) {
      setError('Selecciona barrio y lote.');
      return;
    }
    const payload: Partial<Quotation> = {
      leadId: leadId || null,
      buyerId: buyerId || null,
      developmentId,
      lotId,
      totalPrice,
      currency: String(form.get('currency') || selectedLot?.currency || selectedDevelopment?.defaultCurrency || 'ARS'),
      discountAmount: discount,
      discountReason: String(form.get('discountReason') || ''),
      finalPrice,
      downPaymentAmount: downPayment,
      financedAmount,
      installmentCount,
      installmentAmount,
      firstDueDate: String(form.get('firstDueDate') || ''),
      monthlyDueDay: numberValue(form.get('monthlyDueDay')),
      validUntil: String(form.get('validUntil') || ''),
      status: String(form.get('status') || 'draft') as QuotationStatus,
      notes: String(form.get('notes') || ''),
    };
    try {
      setSaving(true);
      setError('');
      if (id) await quotationsApi.update(id, payload);
      else {
        const created = await quotationsApi.create(payload);
        navigate(`/quotations/${created.quotation._id}`);
        return;
      }
      navigate(`/quotations/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la cotizacion.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar cotizacion' : 'Nueva cotizacion'} action={<Link className="button button--ghost" to="/quotations">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="stack" onSubmit={(event) => { void handleSubmit(event); }}>
        <section className="panel form-grid">
          <h2 className="span-2">Interesado y lote</h2>
          <label>Interesado<select value={leadId} onChange={(event) => setLeadId(event.target.value)}><option value="">Sin interesado</option>{leads.map((lead) => <option key={lead._id} value={lead._id}>{lead.fullName || `${lead.firstName} ${lead.lastName}`}</option>)}</select></label>
          <label>Comprador<select value={buyerId} onChange={(event) => setBuyerId(event.target.value)}><option value="">Sin comprador</option>{buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.firstName} {buyer.lastName}</option>)}</select></label>
          <label>Barrio<select value={developmentId} onChange={(event) => { setDevelopmentId(event.target.value); setLotId(''); }} required><option value="">Seleccionar</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label>Lote<select value={lotId} onChange={(event) => setLotId(event.target.value)} required><option value="">Seleccionar</option>{availableLots.map((lot) => <option key={lot._id} value={lot._id}>Mz. {lot.block || '-'} - Lote {lot.lotNumber} ({lot.status})</option>)}</select></label>
        </section>
        <section className="panel form-grid">
          <h2 className="span-2">Simulador</h2>
          <label>Precio de lista<input type="number" min="0" step="0.01" value={totalPrice} onChange={(event) => setTotalPrice(Number(event.target.value))} /></label>
          <label>Moneda<input name="currency" defaultValue={quotation.currency || selectedLot?.currency || selectedDevelopment?.defaultCurrency || 'ARS'} /></label>
          <label>Descuento<input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></label>
          <label>Motivo descuento<input name="discountReason" defaultValue={quotation.discountReason || ''} /></label>
          <label>Precio final<input value={finalPrice} readOnly /></label>
          <label>Anticipo<input type="number" min="0" step="0.01" value={downPayment} onChange={(event) => setDownPayment(Number(event.target.value))} /></label>
          <label>Saldo financiado<input value={financedAmount} readOnly /></label>
          <label>Cantidad de cuotas<input type="number" min="1" value={installmentCount} onChange={(event) => setInstallmentCount(Number(event.target.value))} /></label>
          <label>Valor cuota<input type="number" min="0" step="0.01" value={installmentAmount} onChange={(event) => { setManualInstallment(true); setInstallmentAmount(Number(event.target.value)); }} /></label>
          <label>Primer vencimiento<input name="firstDueDate" type="date" defaultValue={toInputDate(quotation.firstDueDate)} /></label>
          <label>Dia mensual<input name="monthlyDueDay" type="number" min="1" max="31" defaultValue={quotation.monthlyDueDay || ''} /></label>
          <label>Valida hasta<input name="validUntil" type="date" defaultValue={toInputDate(quotation.validUntil) || todayInputValue()} required /></label>
          <label>Estado<select name="status" defaultValue={quotation.status || 'draft'}>{quotationStatuses.map((status) => <option key={status} value={status}>{quotationStatusLabels[status]}</option>)}</select></label>
          {manualInstallment ? <div className="warning-message span-2">El valor de cuota fue modificado manualmente. Calculo sugerido: <CurrencyAmount amount={calculatedInstallment} currency={selectedLot?.currency} />.</div> : null}
          {selectedLot && selectedLot.status !== 'available' ? <div className="warning-message span-2">El lote ya no esta disponible.</div> : null}
          <label className="span-2">Notas<textarea name="notes" rows={4} defaultValue={quotation.notes || ''} /></label>
          <div className="form-actions span-2"><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cotizacion'}</button></div>
        </section>
      </form>
    </>
  );
}
