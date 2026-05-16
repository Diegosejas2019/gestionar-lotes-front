import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backupsApi, developmentsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { BackupFrequency, Development } from '../types';

const ALL_MODULES = [
  { value: 'developments', label: 'Barrios' },
  { value: 'lots', label: 'Lotes' },
  { value: 'buyers', label: 'Compradores' },
  { value: 'leads', label: 'Leads' },
  { value: 'quotations', label: 'Cotizaciones' },
  { value: 'reservations', label: 'Reservas' },
  { value: 'sales', label: 'Ventas' },
  { value: 'installments', label: 'Cuotas' },
  { value: 'payments', label: 'Pagos' },
  { value: 'expenses', label: 'Gastos' },
  { value: 'suppliers', label: 'Proveedores' },
  { value: 'cashAccounts', label: 'Cajas' },
  { value: 'cashMovements', label: 'Movimientos de caja' },
];

interface FormState {
  name: string;
  description: string;
  frequency: BackupFrequency;
  enabled: boolean;
  includeModules: string[];
  developmentIds: string[];
  format: 'zip' | 'xlsx';
  retentionCount: number;
}

const DEFAULT_FORM: FormState = {
  name: '',
  description: '',
  frequency: 'manual',
  enabled: true,
  includeModules: ['developments', 'lots', 'buyers', 'sales'],
  developmentIds: [],
  format: 'zip',
  retentionCount: 5,
};

export function BackupJobFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const devRes = await developmentsApi.list();
        setDevelopments(devRes.developments || []);
        if (isEdit && id) {
          const res = await backupsApi.listJobs();
          const jobs = res.jobs || res || [];
          const job = jobs.find((j: any) => j._id === id);
          if (job) {
            setForm({
              name: job.name || '',
              description: job.description || '',
              frequency: job.frequency || 'manual',
              enabled: job.enabled !== false,
              includeModules: job.includeModules || [],
              developmentIds: (job.developmentIds || []).map(String),
              format: job.format || 'zip',
              retentionCount: job.retentionCount || 5,
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [id, isEdit]);

  function toggleModule(mod: string): void {
    setForm((prev) => ({
      ...prev,
      includeModules: prev.includeModules.includes(mod)
        ? prev.includeModules.filter((m) => m !== mod)
        : [...prev.includeModules, mod],
    }));
  }

  function toggleDev(devId: string): void {
    setForm((prev) => ({
      ...prev,
      developmentIds: prev.developmentIds.includes(devId)
        ? prev.developmentIds.filter((d) => d !== devId)
        : [...prev.developmentIds, devId],
    }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (form.includeModules.length === 0) { setError('Seleccioná al menos un módulo.'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit && id) {
        await backupsApi.updateJob(id, form);
      } else {
        await backupsApi.createJob(form);
      }
      navigate('/backups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el trabajo.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Cargando..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar trabajo de backup' : 'Nuevo trabajo de backup'}
        description="Configurá qué datos exportar y con qué frecuencia"
        action={
          <button className="button button--ghost" type="button" onClick={() => navigate('/backups')}>
            ← Volver
          </button>
        }
      />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={(e) => void handleSubmit(e)} style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input className="form-input" type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ej: Backup mensual completo" />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <input className="form-input" type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Opcional" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Frecuencia</label>
            <select className="form-input" value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as BackupFrequency }))}>
              <option value="manual">Manual</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Formato</label>
            <select className="form-input" value={form.format} onChange={(e) => setForm((p) => ({ ...p, format: e.target.value as 'zip' | 'xlsx' }))}>
              <option value="zip">ZIP (múltiples CSV)</option>
              <option value="xlsx">XLSX</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Retención (copias)</label>
            <input className="form-input" type="number" min={1} max={20} value={form.retentionCount} onChange={(e) => setForm((p) => ({ ...p, retentionCount: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Módulos a incluir *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_MODULES.map((m) => (
              <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', background: form.includeModules.includes(m.value) ? '#eff6ff' : '#f9fafb', border: '1px solid ' + (form.includeModules.includes(m.value) ? '#93c5fd' : '#e5e7eb'), borderRadius: 6, padding: '4px 10px' }}>
                <input type="checkbox" checked={form.includeModules.includes(m.value)} onChange={() => toggleModule(m.value)} />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        {developments.length > 0 && (
          <div className="form-group">
            <label className="form-label">Filtrar por barrio (opcional — vacío = todos)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {developments.map((d) => (
                <label key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', background: form.developmentIds.includes(d._id) ? '#f0fdf4' : '#f9fafb', border: '1px solid ' + (form.developmentIds.includes(d._id) ? '#86efac' : '#e5e7eb'), borderRadius: 6, padding: '4px 10px' }}>
                  <input type="checkbox" checked={form.developmentIds.includes(d._id)} onChange={() => toggleDev(d._id)} />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))} />
            Trabajo habilitado
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear trabajo'}
          </button>
          <button className="button button--ghost" type="button" onClick={() => navigate('/backups')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
