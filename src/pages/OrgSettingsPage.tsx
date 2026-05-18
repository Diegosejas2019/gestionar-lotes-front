import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { orgSettingsApi } from '../api/services';
import type { OrganizationSettings } from '../types';

const TABS = ['General', 'Numeración', 'Pagos', 'Mora', 'Documentos', 'Migración', 'Comercial'] as const;
type Tab = typeof TABS[number];

export function OrgSettingsPage(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('General');
  const [form, setForm] = useState<Partial<OrganizationSettings>>({});

  useEffect(() => {
    void (async () => {
      try {
        const res = await orgSettingsApi.get();
        setForm((res as { settings: OrganizationSettings }).settings || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la configuración.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setNested(section: keyof OrganizationSettings, key: string, value: unknown) {
    setForm((f) => ({
      ...f,
      [section]: { ...(f[section] as Record<string, unknown> || {}), [key]: value },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await orgSettingsApi.update(form);
      setForm((res as { settings: OrganizationSettings }).settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Cargando configuración..." />;

  const num = (form.numberingConfig || {}) as Record<string, string>;
  const pay = (form.paymentConfig || {}) as Record<string, unknown>;
  const del = (form.delinquencyConfig || {}) as Record<string, unknown>;
  const doc = (form.documentConfig || {}) as Record<string, unknown>;
  const mig = (form.migrationConfig || {}) as Record<string, unknown>;
  const com = (form.commercialConfig || {}) as Record<string, unknown>;

  return (
    <div className="page-container">
      <PageHeader title="Configuración general" description="Parámetros globales de la organización." />
      {error && <ErrorMessage message={error} />}

      <nav className="settings-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`settings-tab${tab === t ? ' settings-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <form onSubmit={handleSave} className="form">
        {tab === 'General' && (
          <div className="settings-panel">
            <h2>General</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Moneda predeterminada</label>
                <select className="input" value={form.defaultCurrency || 'ARS'} onChange={(e) => setForm((f) => ({ ...f, defaultCurrency: e.target.value as 'ARS' | 'USD' }))}>
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="form-group">
                <label>Zona horaria</label>
                <input className="input" value={form.timezone || ''} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Monedas habilitadas</label>
              <div className="check-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))' }}>
                {(['ARS', 'USD'] as const).map((c) => (
                  <label key={c}>
                    <input type="checkbox" checked={(form.supportedCurrencies || ['ARS', 'USD']).includes(c)}
                      onChange={(e) => {
                        const current = form.supportedCurrencies || ['ARS', 'USD'];
                        setForm((f) => ({ ...f, supportedCurrencies: e.target.checked ? [...current, c] : current.filter((x) => x !== c) }));
                      }} /> {c}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Numeración' && (
          <div className="settings-panel">
            <h2>Prefijos de numeración</h2>
            <div className="form-grid--3">
              {Object.entries({ salePrefix: 'Ventas', reservationPrefix: 'Reservas', quotationPrefix: 'Cotizaciones', receiptPrefix: 'Recibos', documentPrefix: 'Documentos', migrationBatchPrefix: 'Migración' }).map(([key, label]) => (
                <div key={key} className="form-group">
                  <label>Prefijo {label}</label>
                  <input className="input" value={num[key] || ''} onChange={(e) => setNested('numberingConfig', key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Pagos' && (
          <div className="settings-panel">
            <h2>Opciones de pago</h2>
            <div className="check-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
              <label><input type="checkbox" checked={Boolean(pay.allowPartialPayments)} onChange={(e) => setNested('paymentConfig', 'allowPartialPayments', e.target.checked)} /> Permitir pagos parciales</label>
              <label><input type="checkbox" checked={Boolean(pay.requireProofForTransfer)} onChange={(e) => setNested('paymentConfig', 'requireProofForTransfer', e.target.checked)} /> Requerir comprobante para transferencias</label>
              <label><input type="checkbox" checked={Boolean(pay.requireCashAccountOnPaymentApproval)} onChange={(e) => setNested('paymentConfig', 'requireCashAccountOnPaymentApproval', e.target.checked)} /> Requerir caja al aprobar pago</label>
              <label><input type="checkbox" checked={Boolean(pay.automaticCashMovementOnPaymentApproval)} onChange={(e) => setNested('paymentConfig', 'automaticCashMovementOnPaymentApproval', e.target.checked)} /> Movimiento de caja automático al aprobar</label>
            </div>
          </div>
        )}

        {tab === 'Mora' && (
          <div className="settings-panel">
            <h2>Configuración de mora</h2>
            <div className="form-grid--3">
              {[
                ['lowSeverityOverdueInstallments', 'Cuotas mora leve'],
                ['mediumSeverityOverdueInstallments', 'Cuotas mora media'],
                ['highSeverityOverdueInstallments', 'Cuotas mora alta'],
                ['criticalSeverityOverdueInstallments', 'Cuotas mora crítica'],
                ['daysWithoutActionWarning', 'Días sin acción (aviso)'],
              ].map(([key, label]) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input className="input" type="number" min={1} value={Number(del[key]) || ''} onChange={(e) => setNested('delinquencyConfig', key, parseInt(e.target.value))} />
                </div>
              ))}
            </div>
            <div className="check-grid" style={{ gridTemplateColumns: '1fr' }}>
              <label><input type="checkbox" checked={Boolean(del.autoCreateDelinquencyCases)} onChange={(e) => setNested('delinquencyConfig', 'autoCreateDelinquencyCases', e.target.checked)} /> Crear casos de mora automáticamente</label>
            </div>
          </div>
        )}

        {tab === 'Documentos' && (
          <div className="settings-panel">
            <h2>Documentos</h2>
            <div className="form-group">
              <label>URL de logo</label>
              <input className="input" value={String(doc.organizationLogoUrl || '')} onChange={(e) => setNested('documentConfig', 'organizationLogoUrl', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Texto de pie de página</label>
              <textarea className="input" rows={3} value={String(doc.documentFooterText || '')} onChange={(e) => setNested('documentConfig', 'documentFooterText', e.target.value)} />
            </div>
            <div className="check-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))' }}>
              <label><input type="checkbox" checked={Boolean(doc.requireLegalDisclaimer)} onChange={(e) => setNested('documentConfig', 'requireLegalDisclaimer', e.target.checked)} /> Requerir aviso legal</label>
              <label><input type="checkbox" checked={Boolean(doc.allowDocumentAnnulment)} onChange={(e) => setNested('documentConfig', 'allowDocumentAnnulment', e.target.checked)} /> Permitir anulación de documentos</label>
            </div>
          </div>
        )}

        {tab === 'Migración' && (
          <div className="settings-panel">
            <h2>Migración</h2>
            <div className="check-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
              <label><input type="checkbox" checked={Boolean(mig.allowPendingDebtMigrationDefault)} onChange={(e) => setNested('migrationConfig', 'allowPendingDebtMigrationDefault', e.target.checked)} /> Permitir migración con deuda pendiente (por defecto)</label>
              <label><input type="checkbox" checked={Boolean(mig.requirePreviewBeforeExecute)} onChange={(e) => setNested('migrationConfig', 'requirePreviewBeforeExecute', e.target.checked)} /> Requerir previsualización antes de ejecutar</label>
              <label><input type="checkbox" checked={Boolean(mig.requireConfirmationCheckbox)} onChange={(e) => setNested('migrationConfig', 'requireConfirmationCheckbox', e.target.checked)} /> Requerir checkbox de confirmación</label>
              <label><input type="checkbox" checked={Boolean(mig.defaultChargeCurrentMonth)} onChange={(e) => setNested('migrationConfig', 'defaultChargeCurrentMonth', e.target.checked)} /> Cobrar mes corriente por defecto</label>
            </div>
          </div>
        )}

        {tab === 'Comercial' && (
          <div className="settings-panel">
            <h2>Configuración comercial</h2>
            <div className="form-grid">
              {[
                ['defaultReservationDays', 'Días de reserva (default)'],
                ['defaultQuotationValidityDays', 'Días de validez cotización'],
                ['reservationExpiringSoonDays', 'Días alerta reserva por vencer'],
                ['quotationExpiringSoonDays', 'Días alerta cotización por vencer'],
              ].map(([key, label]) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input className="input" type="number" min={1} value={Number(com[key]) || ''} onChange={(e) => setNested('commercialConfig', key, parseInt(e.target.value))} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
