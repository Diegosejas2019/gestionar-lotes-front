import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { legalProcessesApi, salesApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { LegalProcessType, Sale } from '../types';
import { legalProcessTypeLabels } from '../utils/labels';

const PROCESS_TYPES: LegalProcessType[] = ['legal_review', 'rescission', 'execution', 'mediation', 'other'];

export function LegalProcessFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    saleId: '',
    type: 'legal_review' as LegalProcessType,
    startDate: new Date().toISOString().slice(0, 10),
    reason: '',
    notes: '',
    lawyerName: '',
    lawyerContact: '',
    delinquencyCaseId: '',
  });

  useEffect(() => {
    void (async () => {
      try {
        const data = await salesApi.list();
        setSales((data.sales || []).filter((s) => !['cancelled', 'completed', 'rescinded'].includes(s.status)));
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
    if (!form.reason.trim()) { setError('El motivo es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      const body = { ...form, delinquencyCaseId: form.delinquencyCaseId || undefined };
      const result = await legalProcessesApi.create(body);
      navigate(`/legal-processes/${(result as { legalProcess: { _id: string } }).legalProcess._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proceso legal.');
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Nuevo proceso legal" />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={submit} className="form-card">
        <div className="form-group">
          <label>Venta *</label>
          <select value={form.saleId} onChange={field('saleId')} required>
            <option value="">Seleccionar venta...</option>
            {sales.map((s) => (
              <option key={s._id} value={s._id}>{s.saleNumber} — {s.status}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tipo de proceso *</label>
            <select value={form.type} onChange={field('type')}>
              {PROCESS_TYPES.map((t) => <option key={t} value={t}>{legalProcessTypeLabels[t]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Fecha de inicio *</label>
            <input type="date" value={form.startDate} onChange={field('startDate')} required />
          </div>
        </div>

        <div className="form-group">
          <label>Motivo *</label>
          <textarea value={form.reason} onChange={field('reason')} required rows={3} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Abogado / responsable</label>
            <input value={form.lawyerName} onChange={field('lawyerName')} />
          </div>
          <div className="form-group">
            <label>Contacto del abogado</label>
            <input value={form.lawyerContact} onChange={field('lawyerContact')} />
          </div>
        </div>

        <div className="form-group">
          <label>Caso de mora vinculado (opcional)</label>
          <input value={form.delinquencyCaseId} onChange={field('delinquencyCaseId')} placeholder="ID del caso de mora" />
        </div>

        <div className="form-group">
          <label>Notas</label>
          <textarea value={form.notes} onChange={field('notes')} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear proceso'}</button>
        </div>
      </form>
    </div>
  );
}
