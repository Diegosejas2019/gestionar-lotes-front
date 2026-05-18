import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { communicationSettingsApi } from '../api/services';

export function CommunicationSettingsPage(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    emailEnabled: false, emailProvider: 'smtp',
    senderName: '', senderEmail: '', replyToEmail: '',
    smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpSecure: false,
    whatsappEnabled: true, whatsappMode: 'manual_link', defaultWhatsappNumber: '',
    portalBaseUrl: '', adminContactEmail: '', adminContactPhone: '',
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await communicationSettingsApi.get();
        const s = (res as { data: { settings: typeof form | null } }).data.settings;
        if (s) setForm((f) => ({ ...f, ...s, smtpPass: '' }));
      } catch { /* sin config previa */ }
      finally { setLoading(false); }
    })();
  }, []);

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await communicationSettingsApi.update(form);
      setSuccess(true);
      setForm((f) => ({ ...f, smtpPass: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Cargando configuración..." />;

  return (
    <div className="page-container">
      <PageHeader title="Configuración de comunicaciones" description="Configurá email, WhatsApp y datos de contacto." />

      {error && <ErrorMessage message={error} />}
      {success && <div className="alert alert--success">Configuración guardada correctamente.</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="settings-panel">
          <h2>Email</h2>
          <div className="check-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label><input type="checkbox" checked={form.emailEnabled} onChange={(e) => set('emailEnabled', e.target.checked)} /> Email habilitado</label>
          </div>
          {form.emailEnabled && (
            <>
              <div className="form-group">
                <label>Proveedor</label>
                <select className="input" value={form.emailProvider} onChange={(e) => set('emailProvider', e.target.value)}>
                  <option value="smtp">SMTP</option>
                  <option value="nodemailer">Nodemailer</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre remitente</label>
                  <input className="input" value={form.senderName} onChange={(e) => set('senderName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email remitente</label>
                  <input className="input" type="email" value={form.senderEmail} onChange={(e) => set('senderEmail', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Email de respuesta</label>
                <input className="input" type="email" value={form.replyToEmail} onChange={(e) => set('replyToEmail', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input className="input" value={form.smtpHost} onChange={(e) => set('smtpHost', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Puerto</label>
                  <input className="input" type="number" value={form.smtpPort} onChange={(e) => set('smtpPort', Number(e.target.value))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Usuario SMTP</label>
                  <input className="input" value={form.smtpUser} onChange={(e) => set('smtpUser', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Contraseña SMTP</label>
                  <input className="input" type="password" value={form.smtpPass} onChange={(e) => set('smtpPass', e.target.value)} placeholder="(sin cambios)" />
                </div>
              </div>
              <div className="check-grid" style={{ gridTemplateColumns: '1fr' }}>
                <label><input type="checkbox" checked={form.smtpSecure} onChange={(e) => set('smtpSecure', e.target.checked)} /> Conexión segura (SSL/TLS)</label>
              </div>
            </>
          )}
        </div>

        <div className="settings-panel">
          <h2>WhatsApp</h2>
          <div className="check-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label><input type="checkbox" checked={form.whatsappEnabled} onChange={(e) => set('whatsappEnabled', e.target.checked)} /> WhatsApp habilitado</label>
          </div>
          {form.whatsappEnabled && (
            <div className="form-group">
              <label>Teléfono por defecto</label>
              <input className="input" value={form.defaultWhatsappNumber} onChange={(e) => set('defaultWhatsappNumber', e.target.value)} placeholder="+54 9 11 1234-5678" />
            </div>
          )}
        </div>

        <div className="settings-panel">
          <h2>General</h2>
          <div className="form-group">
            <label>URL base del portal comprador</label>
            <input className="input" value={form.portalBaseUrl} onChange={(e) => set('portalBaseUrl', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email de contacto admin</label>
              <input className="input" type="email" value={form.adminContactEmail} onChange={(e) => set('adminContactEmail', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Teléfono de contacto admin</label>
              <input className="input" value={form.adminContactPhone} onChange={(e) => set('adminContactPhone', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar configuración'}</button>
        </div>
      </form>
    </div>
  );
}
