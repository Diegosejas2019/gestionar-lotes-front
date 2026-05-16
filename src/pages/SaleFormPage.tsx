import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { buyersApi, developmentsApi, lotsApi, salesApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Buyer, Development, Lot, Sale } from '../types';
import { getId, numberValue } from '../utils/format';
import { serviceLabels } from '../utils/labels';

export function SaleFormPage(): React.ReactElement {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sale, setSale] = useState<Partial<Sale>>({});
  const [developmentId, setDevelopmentId] = useState(searchParams.get('developmentId') || '');
  const [lotId, setLotId] = useState(searchParams.get('lotId') || '');
  const [buyerId, setBuyerId] = useState('');
  const [quickBuyer, setQuickBuyer] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [installmentCount, setInstallmentCount] = useState(0);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, lotData, buyerData, saleData] = await Promise.all([
          developmentsApi.list(),
          lotsApi.list(),
          buyersApi.list(),
          id ? salesApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        setLots(lotData.lots || []);
        setBuyers(buyerData.buyers || []);
        if (saleData) {
          setSale(saleData.sale);
          setDevelopmentId(getId(saleData.sale.developmentId));
          setLotId(getId(saleData.sale.lotId));
          setBuyerId(getId(saleData.sale.buyerId));
          setTotalPrice(saleData.sale.totalPrice || 0);
          setDownPayment(saleData.sale.downPaymentAmount || 0);
          setInstallmentCount(saleData.sale.installmentCount || 0);
          setInstallmentAmount(saleData.sale.installmentAmount || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const availableLots = lots.filter((lot) => getId(lot.developmentId) === developmentId && (lot.status === 'available' || lot._id === lotId));
  const selectedLot = lots.find((lot) => lot._id === lotId);
  const financedAmount = Math.max(0, totalPrice - downPayment);
  const calculatedInstallment = installmentCount > 0 ? Math.round((financedAmount / installmentCount + Number.EPSILON) * 100) / 100 : 0;
  const mismatch = installmentCount > 0 && Math.abs(calculatedInstallment - installmentAmount) > 0.01;

  useEffect(() => {
    if (!id && selectedLot) {
      setTotalPrice(selectedLot.price || 0);
      setInstallmentAmount(0);
    }
  }, [selectedLot, id]);

  const selectedDevelopment = useMemo(() => developments.find((item) => item._id === developmentId), [developments, developmentId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      setError('');
      let effectiveBuyerId = buyerId;
      if (quickBuyer) {
        const created = await buyersApi.create({
          firstName: String(form.get('quickFirstName') || ''),
          lastName: String(form.get('quickLastName') || ''),
          documentNumber: String(form.get('quickDocumentNumber') || ''),
          phone: String(form.get('quickPhone') || ''),
          email: String(form.get('quickEmail') || ''),
          documentType: 'DNI',
        });
        effectiveBuyerId = created.buyer._id;
      }
      if (!developmentId || !lotId || !effectiveBuyerId) {
        setError('Seleccioná barrio, lote y comprador.');
        return;
      }
      const payload = {
        developmentId,
        lotId,
        buyerId: effectiveBuyerId,
        totalPrice,
        currency: String(form.get('currency') || selectedLot?.currency || selectedDevelopment?.defaultCurrency || 'ARS'),
        downPaymentAmount: downPayment,
        financedAmount,
        installmentCount,
        installmentAmount,
        firstDueDate: String(form.get('firstDueDate') || ''),
        monthlyDueDay: numberValue(form.get('monthlyDueDay')),
        notes: String(form.get('notes') || ''),
      };
      if (id) await salesApi.update(id, { notes: payload.notes, firstDueDate: payload.firstDueDate, monthlyDueDay: payload.monthlyDueDay });
      else {
        const created = await salesApi.create(payload);
        navigate(`/sales/${created.sale._id}`);
        return;
      }
      navigate(`/sales/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la venta.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar venta' : 'Nueva venta'} action={<Link className="button button--ghost" to="/sales">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="stack" onSubmit={(event) => { void handleSubmit(event); }}>
        <section className="panel form-grid">
          <h2 className="span-2">Barrio y lote</h2>
          <label>Barrio<select value={developmentId} onChange={(event) => { setDevelopmentId(event.target.value); setLotId(''); }} disabled={Boolean(id)} required><option value="">Seleccionar</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label>Lote<select value={lotId} onChange={(event) => setLotId(event.target.value)} disabled={Boolean(id)} required><option value="">Seleccionar</option>{availableLots.map((lot) => <option key={lot._id} value={lot._id}>Mz. {lot.block || '-'} · Lote {lot.lotNumber}</option>)}</select></label>
          {selectedLot ? <div className="info-box span-2">Superficie: {selectedLot.surface || 0} m2 · Precio: <CurrencyAmount amount={selectedLot.price} currency={selectedLot.currency} /> · Servicios: {(selectedLot.services || []).map((service) => serviceLabels[service] || service).join(', ') || 'Sin servicios'}</div> : null}
        </section>
        <section className="panel form-grid">
          <h2 className="span-2">Comprador</h2>
          <label className="span-2"><input type="checkbox" checked={quickBuyer} onChange={(event) => setQuickBuyer(event.target.checked)} disabled={Boolean(id)} /> Crear comprador rápido</label>
          {!quickBuyer ? <label className="span-2">Comprador<select value={buyerId} onChange={(event) => setBuyerId(event.target.value)} disabled={Boolean(id)} required><option value="">Seleccionar</option>{buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.firstName} {buyer.lastName} · {buyer.documentNumber}</option>)}</select></label> : (
            <>
              <label>Nombre<input name="quickFirstName" required={quickBuyer} /></label>
              <label>Apellido<input name="quickLastName" required={quickBuyer} /></label>
              <label>Documento<input name="quickDocumentNumber" required={quickBuyer} /></label>
              <label>Teléfono<input name="quickPhone" /></label>
              <label>Email<input name="quickEmail" type="email" /></label>
            </>
          )}
        </section>
        <section className="panel form-grid">
          <h2 className="span-2">Condiciones comerciales</h2>
          <label>Precio total<input type="number" min="0" step="0.01" value={totalPrice} onChange={(event) => setTotalPrice(Number(event.target.value))} disabled={Boolean(id)} /></label>
          <label>Moneda<input name="currency" defaultValue={sale.currency || selectedLot?.currency || selectedDevelopment?.defaultCurrency || 'ARS'} disabled={Boolean(id)} /></label>
          <label>Anticipo<input type="number" min="0" step="0.01" value={downPayment} onChange={(event) => setDownPayment(Number(event.target.value))} disabled={Boolean(id)} /></label>
          <label>Monto financiado<input value={financedAmount} readOnly /></label>
          <label>Cantidad de cuotas<input type="number" min="0" value={installmentCount} onChange={(event) => setInstallmentCount(Number(event.target.value))} disabled={Boolean(id)} /></label>
          <label>Monto de cuota<input type="number" min="0" step="0.01" value={installmentAmount} onChange={(event) => setInstallmentAmount(Number(event.target.value))} disabled={Boolean(id)} /></label>
          {mismatch ? <div className="warning-message span-2">El monto de cuota no coincide con el cálculo exacto: <CurrencyAmount amount={calculatedInstallment} currency={selectedLot?.currency} />.</div> : null}
          <label>Primer vencimiento<input name="firstDueDate" type="date" defaultValue={sale.firstDueDate?.slice(0, 10) || ''} required={!id && financedAmount > 0} /></label>
          <label>Día de vencimiento mensual<input name="monthlyDueDay" type="number" min="1" max="31" defaultValue={sale.monthlyDueDay || ''} /></label>
          <label className="span-2">Notas<textarea name="notes" rows={4} defaultValue={sale.notes || ''} /></label>
          <div className="form-actions span-2"><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar venta'}</button></div>
        </section>
      </form>
    </>
  );
}
