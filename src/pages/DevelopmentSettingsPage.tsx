import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { devSettingsApi, developmentsApi } from '../api/services';
import type { DevelopmentSettings } from '../types';

export function DevelopmentSettingsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [devName, setDevName] = useState('');
  const [form, setForm] = useState<Partial<DevelopmentSettings>>({});

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const [devRes, settingsRes] = await Promise.all([
          developmentsApi.get(id),
          devSettingsApi.get(id),
        ]);
        setDevName((devRes as { development: { name: string } }).development.name);
        setForm((settingsRes as { settings: DevelopmentSettings }).settings || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la configuración.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function set(key: keyof DevelopmentSettings, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      const res = await devSettingsApi.update(id, form);
      setForm((res as { settings: DevelopmentSettings }).settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Cargando configuración del barrio..." />;

  return (
    <div className="page-container">
      <PageHeader title={`Config: ${devName}`} description="Parámetros específicos para este barrio. Sobrescriben la configuración general." action={<button className="button" onClick={() => navigate('/settings/developments')}>Volver</button>} />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSave} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Moneda predeterminada</label>
            <select className="input" value={form.defaultCurrency || ''} onChange={(e) => set('defaultCurrency', e.target.value || null)}>
              <option value="">Usar config. general</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="form-group">
            <label>Día mensual de vencimiento (1-28)</label>
            <input className="input" type="number" min={1} max={28} value={form.defaultMonthlyDueDay ?? ''} onChange={(e) => set('defaultMonthlyDueDay', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Días de reserva</label>
            <input className="input" type="number" min={1} value={form.defaultReservationDays ?? ''} onChange={(e) => set('defaultReservationDays', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div className="form-group">
            <label>Días alerta reserva por vencer</label>
            <input className="input" type="number" min={1} value={form.reservationExpiringSoonDays ?? ''} onChange={(e) => set('reservationExpiringSoonDays', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div className="form-group">
            <label>Días validez cotización</label>
            <input className="input" type="number" min={1} value={form.defaultQuotationValidityDays ?? ''} onChange={(e) => set('defaultQuotationValidityDays', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div className="form-group">
            <label>Cantidad de cuotas (default)</label>
            <input className="input" type="number" min={1} value={form.defaultInstallmentCount ?? ''} onChange={(e) => set('defaultInstallmentCount', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
        </div>
        <div className="form-row" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <label><input type="checkbox" checked={form.requireDebtFreeForDeed === true} onChange={(e) => set('requireDebtFreeForDeed', e.target.checked)} /> Requerir libre deuda para escriturar</label>
          <label><input type="checkbox" checked={form.allowPendingDebtMigration === true} onChange={(e) => set('allowPendingDebtMigration', e.target.checked)} /> Permitir migración con deuda pendiente</label>
          <label><input type="checkbox" checked={form.automaticCashMovementOnPaymentApproval === true} onChange={(e) => set('automaticCashMovementOnPaymentApproval', e.target.checked)} /> Movimiento de caja automático al aprobar pago</label>
        </div>
        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" className="button" onClick={() => navigate('/settings/developments')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
