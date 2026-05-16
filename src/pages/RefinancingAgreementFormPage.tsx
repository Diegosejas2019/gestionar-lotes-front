import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { refinancingAgreementsApi, salesApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Currency, Sale } from '../types';

export function RefinancingAgreementFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    saleId: params.get('saleId') || '',
    delinquencyCaseId: params.get('delinquencyCaseId') || '',
    currency: 'ARS' as Currency,
    agreementDate: new Date().toISOString().slice(0, 10),
    totalDebtAmount: '',
    downPaymentAmount: '0',
    installmentCount: '',
    installmentAmount: '',
    firstDueDate: '',
    monthlyDueDay: '1',
    notes: '',
  });

  useEffect(() => {
    void (async () => {
      try {
        const data = await salesApi.list();
        setSales((data.sales || []).filter((s) => ['active', 'in_legal_review', 'rescission_process'].includes(s.status)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las ventas.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        ...form,
        totalDebtAmount: parseFloat(form.totalDebtAmount),
        downPaymentAmount: parseFloat(form.downPaymentAmount) || 0,
        installmentCount: parseInt(form.installmentCount),
        installmentAmount: parseFloat(form.installmentAmount),
        monthlyDueDay: parseInt(form.monthlyDueDay),
        delinquencyCaseId: form.delinquencyCaseId || undefined,
      };
      const result = await refinancingAgreementsApi.create(body);
      navigate(`/refinancing-agreements/${(result as { refinancingAgreement: { _id: string } }).refinancingAgreement._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la refinanciación.');
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  const selectedSale = sales.find((s) => s._id === form.saleId);
  const financed = parseFloat(form.totalDebtAmount) || 0;
  const down = parseFloat(form.downPaymentAmount) || 0;
  const count = parseInt(form.installmentCount) || 0;
  const computedInstallment = count > 0 ? ((financed - down) / count).toFixed(2) : '';

  return (
    <div>
      <PageHeader title="Nueva refinanciación" />
      {error && <ErrorMessage message={error} />}

      <div className="alert alert--warning">
        Las cuotas anteriores no se eliminarán: quedarán marcadas como refinanciadas al activar el acuerdo.
      </div>

      <form onSubmit={submit} className="form-card">
        <div className="form-group">
          <label>Venta *</label>
          <select value={form.saleId} onChange={field('saleId')} required>
            <option value="">Seleccionar venta...</option>
            {sales.map((s) => (
              <option key={s._id} value={s._id}>{s.saleNumber} — {typeof s.buyerId === 'object' ? '' : String(s.buyerId)}</option>
            ))}
          </select>
        </div>

        {selectedSale && (
          <div className="info-box">
            <strong>Venta:</strong> {selectedSale.saleNumber} — {selectedSale.status}
          </div>
        )}

        <div className="form-group">
          <label>Caso de mora vinculado (opcional)</label>
          <input value={form.delinquencyCaseId} onChange={field('delinquencyCaseId')} placeholder="ID del caso de mora" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Moneda *</label>
            <select value={form.currency} onChange={field('currency')}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha del acuerdo *</label>
            <input type="date" value={form.agreementDate} onChange={field('agreementDate')} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Monto total a refinanciar *</label>
            <input type="number" step="0.01" min="0.01" value={form.totalDebtAmount} onChange={field('totalDebtAmount')} required />
          </div>
          <div className="form-group">
            <label>Anticipo</label>
            <input type="number" step="0.01" min="0" value={form.downPaymentAmount} onChange={field('downPaymentAmount')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cantidad de cuotas *</label>
            <input type="number" min="1" value={form.installmentCount} onChange={field('installmentCount')} required />
          </div>
          <div className="form-group">
            <label>Valor por cuota *</label>
            <input type="number" step="0.01" min="0.01" value={form.installmentAmount || computedInstallment} onChange={field('installmentAmount')} required placeholder={computedInstallment || '0.00'} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Primer vencimiento *</label>
            <input type="date" value={form.firstDueDate} onChange={field('firstDueDate')} required />
          </div>
          <div className="form-group">
            <label>Día de vencimiento mensual *</label>
            <input type="number" min="1" max="31" value={form.monthlyDueDay} onChange={field('monthlyDueDay')} required />
          </div>
        </div>

        {financed > 0 && count > 0 && (
          <div className="info-box">
            <strong>Resumen:</strong> ({financed} - {down}) / {count} = {computedInstallment} {form.currency} por cuota
          </div>
        )}

        <div className="form-group">
          <label>Notas</label>
          <textarea value={form.notes} onChange={field('notes')} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear acuerdo (borrador)'}</button>
        </div>
      </form>
    </div>
  );
}
