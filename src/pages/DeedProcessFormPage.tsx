import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deedProcessesApi, salesApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Sale } from '../types';

export function DeedProcessFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    saleId: '',
    notaryName: '',
    notaryContact: '',
    notes: '',
    overrideDebtCheck: false,
    overrideReason: '',
  });
  const [requiredDocs, setRequiredDocs] = useState<string[]>(['DNI comprador', 'Título de propiedad', 'Plano de mensura']);
  const [newDoc, setNewDoc] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await salesApi.list();
        setSales((data.sales || []).filter((s) => ['active', 'completed'].includes(s.status)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las ventas.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  }

  function addDoc(): void {
    if (newDoc.trim()) {
      setRequiredDocs((d) => [...d, newDoc.trim()]);
      setNewDoc('');
    }
  }

  function removeDoc(i: number): void {
    setRequiredDocs((d) => d.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, requiredDocuments: requiredDocs, overrideReason: form.overrideReason || undefined };
      const result = await deedProcessesApi.create(body);
      navigate(`/deed-processes/${(result as { deedProcess: { _id: string } }).deedProcess._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proceso de escrituración.');
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Nuevo proceso de escrituración" />
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
            <label>Escribanía / Notario</label>
            <input value={form.notaryName} onChange={field('notaryName')} />
          </div>
          <div className="form-group">
            <label>Contacto</label>
            <input value={form.notaryContact} onChange={field('notaryContact')} />
          </div>
        </div>

        <div className="form-group">
          <label>Documentos requeridos</label>
          <ul className="docs-list">
            {requiredDocs.map((doc, i) => (
              <li key={i}>{doc} <button type="button" className="btn btn--sm btn--danger" onClick={() => removeDoc(i)}>×</button></li>
            ))}
          </ul>
          <div className="input-row">
            <input value={newDoc} onChange={(e) => setNewDoc(e.target.value)} placeholder="Agregar documento..." />
            <button type="button" className="btn btn--secondary" onClick={addDoc}>Agregar</button>
          </div>
        </div>

        <div className="form-group">
          <label>Notas</label>
          <textarea value={form.notes} onChange={field('notes')} />
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" checked={form.overrideDebtCheck} onChange={field('overrideDebtCheck')} />
            {' '}Iniciar aunque la venta tenga deuda pendiente
          </label>
        </div>

        {form.overrideDebtCheck && (
          <div className="form-group">
            <label>Motivo del override *</label>
            <textarea value={form.overrideReason} onChange={field('overrideReason')} required={form.overrideDebtCheck} rows={2} />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear proceso'}</button>
        </div>
      </form>
    </div>
  );
}
