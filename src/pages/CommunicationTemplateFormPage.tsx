import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { communicationTemplatesApi } from '../api/services';

const TEMPLATE_TYPES = [
  { value: 'payment_reminder', label: 'Recordatorio de pago' },
  { value: 'installment_overdue', label: 'Cuota vencida' },
  { value: 'reservation_expiring', label: 'Reserva por vencer' },
  { value: 'quotation_expiring', label: 'Cotización por vencer' },
  { value: 'payment_request_approved', label: 'Pago aprobado' },
  { value: 'payment_request_rejected', label: 'Pago rechazado' },
  { value: 'deed_status_update', label: 'Escrituración' },
  { value: 'custom', label: 'Personalizada' },
];

const ALLOWED_VARS = [
  '{{buyerName}}', '{{leadName}}', '{{developmentName}}', '{{lotLabel}}',
  '{{saleNumber}}', '{{reservationNumber}}', '{{quotationNumber}}', '{{installmentNumber}}',
  '{{dueDate}}', '{{amount}}', '{{currency}}', '{{portalUrl}}', '{{rejectionReason}}', '{{deedStatus}}',
];

export function CommunicationTemplateFormPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);

  const [form, setForm] = useState({
    name: '', description: '', type: 'payment_reminder', channel: 'email',
    subject: '', body: '', enabled: true, isDefault: false,
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    void (async () => {
      try {
        const res = await communicationTemplatesApi.get(id);
        const t = (res as { data: { template: typeof form & { _id: string } } }).data.template;
        setForm({ name: t.name, description: (t as unknown as Record<string,string>).description || '', type: t.type, channel: t.channel, subject: (t as unknown as Record<string,string>).subject || '', body: t.body, enabled: (t as unknown as Record<string,boolean>).enabled, isDefault: (t as unknown as Record<string,boolean>).isDefault });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la plantilla.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit && id) {
        await communicationTemplatesApi.update(id, form as Parameters<typeof communicationTemplatesApi.update>[1]);
      } else {
        await communicationTemplatesApi.create(form as Parameters<typeof communicationTemplatesApi.create>[0]);
      }
      navigate('/communication-templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la plantilla.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!id) return;
    try {
      const res = await communicationTemplatesApi.preview(id, { contextData: { buyerName: 'Juan Pérez', installmentNumber: 3, dueDate: '31/01/2025', amount: 5000, currency: 'ARS' } });
      setPreview((res as { data: { preview: { subject: string; body: string } } }).data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al previsualizar.');
    }
  }

  if (loading) return <LoadingState message="Cargando plantilla..." />;

  return (
    <div className="page-container">
      <PageHeader title={isEdit ? 'Editar plantilla' : 'Nueva plantilla'} description="Configurá el contenido y canal de la plantilla." />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nombre *</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <input className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo *</label>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TEMPLATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Canal *</label>
            <select className="input" value={form.channel} onChange={(e) => set('channel', e.target.value)}>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="in_app">Interno</option>
            </select>
          </div>
        </div>
        {form.channel === 'email' && (
          <div className="form-group">
            <label>Asunto</label>
            <input className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label>Cuerpo *</label>
          <textarea className="input" rows={8} value={form.body} onChange={(e) => set('body', e.target.value)} required />
          <small className="text-muted">Variables disponibles: {ALLOWED_VARS.join(' ')}</small>
        </div>
        <div className="form-row">
          <label><input type="checkbox" checked={form.enabled} onChange={(e) => set('enabled', e.target.checked)} /> Habilitada</label>
          <label><input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} /> Predeterminada</label>
        </div>
        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          {isEdit && <button type="button" className="button" onClick={handlePreview}>Vista previa</button>}
          <button type="button" className="button" onClick={() => navigate('/communication-templates')}>Cancelar</button>
        </div>
      </form>

      {preview && (
        <div className="report-card" style={{ marginTop: '1.5rem' }}>
          <h3>Vista previa</h3>
          {preview.subject && <p><strong>Asunto:</strong> {preview.subject}</p>}
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{preview.body}</pre>
        </div>
      )}
    </div>
  );
}
