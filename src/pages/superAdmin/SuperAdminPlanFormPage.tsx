import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { superAdminApi } from '../../api/services';
import type { PlanCode, PlanModules } from '../../types';

const MODULE_LABELS: Array<{ key: keyof PlanModules; label: string }> = [
  { key: 'commercial', label: 'Comercial' },
  { key: 'buyerPortal', label: 'Portal comprador' },
  { key: 'documents', label: 'Documentos' },
  { key: 'payments', label: 'Pagos' },
  { key: 'lotsMap', label: 'Mapa de lotes' },
  { key: 'finance', label: 'Finanzas' },
  { key: 'legal', label: 'Legal' },
  { key: 'migration', label: 'Migración' },
  { key: 'reports', label: 'Reportes' },
  { key: 'communications', label: 'Comunicaciones' },
  { key: 'imports', label: 'Importaciones' },
  { key: 'advancedPermissions', label: 'Permisos avanzados' },
];

function defaultModules(enabled = false): PlanModules {
  return {
    commercial: true, buyerPortal: enabled, documents: true, payments: true,
    lotsMap: enabled, finance: enabled, legal: enabled, migration: enabled,
    reports: enabled, communications: enabled, imports: enabled, advancedPermissions: enabled,
  };
}

export function SuperAdminPlanFormPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState<PlanCode>('starter');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [isPublic, setIsPublic] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [modules, setModules] = useState<PlanModules>(defaultModules());
  const [limits, setLimits] = useState({ maxDevelopments: '', maxLots: '', maxBuyers: '', maxActiveSales: '', maxMonthlyImports: '', maxUsers: '' });

  useEffect(() => {
    if (!id) return;
    void superAdminApi.listPlans().then((data) => {
      const p = data.plans.find((pl) => pl._id === id);
      if (!p) return;
      setName(p.name);
      setCode(p.code);
      setDescription(p.description || '');
      setMonthlyPrice(p.monthlyPrice);
      setCurrency(p.currency);
      setIsPublic(p.isPublic);
      setIsDefault(p.isDefault);
      setModules(p.enabledModules);
      setLimits({
        maxDevelopments: p.limits.maxDevelopments != null ? String(p.limits.maxDevelopments) : '',
        maxLots: p.limits.maxLots != null ? String(p.limits.maxLots) : '',
        maxBuyers: p.limits.maxBuyers != null ? String(p.limits.maxBuyers) : '',
        maxActiveSales: p.limits.maxActiveSales != null ? String(p.limits.maxActiveSales) : '',
        maxMonthlyImports: p.limits.maxMonthlyImports != null ? String(p.limits.maxMonthlyImports) : '',
        maxUsers: p.limits.maxUsers != null ? String(p.limits.maxUsers) : '',
      });
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar plan.')).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name, code, description, monthlyPrice, currency, isPublic, isDefault,
      enabledModules: modules,
      limits: {
        maxDevelopments: limits.maxDevelopments ? Number(limits.maxDevelopments) : null,
        maxLots: limits.maxLots ? Number(limits.maxLots) : null,
        maxBuyers: limits.maxBuyers ? Number(limits.maxBuyers) : null,
        maxActiveSales: limits.maxActiveSales ? Number(limits.maxActiveSales) : null,
        maxMonthlyImports: limits.maxMonthlyImports ? Number(limits.maxMonthlyImports) : null,
        maxUsers: limits.maxUsers ? Number(limits.maxUsers) : null,
        maxStorageMb: null,
        maxBuyerPortalUsers: null,
      },
    };
    try {
      if (isEdit && id) await superAdminApi.updatePlan(id, payload);
      else await superAdminApi.createPlan(payload);
      navigate('/super-admin/plans');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title={isEdit ? 'Editar plan' : 'Nuevo plan'} />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>Nombre <input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Código
          <select className="input" value={code} onChange={(e) => setCode(e.target.value as PlanCode)} disabled={isEdit}>
            {(['starter', 'pro', 'enterprise', 'custom'] as PlanCode[]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>Descripción <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ flex: 1 }}>Precio mensual <input className="input" type="number" min={0} value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} required /></label>
          <label>Moneda
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as 'ARS' | 'USD')}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.75rem' }}>
          <legend style={{ fontWeight: 600, padding: '0 0.5rem' }}>Límites (vacío = ilimitado)</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {Object.entries(limits).map(([key, val]) => (
              <label key={key}>{key.replace('max', 'Máx. ')}
                <input className="input" type="number" min={1} placeholder="Ilimitado" value={val} onChange={(e) => setLimits((prev) => ({ ...prev, [key]: e.target.value }))} />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.75rem' }}>
          <legend style={{ fontWeight: 600, padding: '0 0.5rem' }}>Módulos habilitados</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {MODULE_LABELS.map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={modules[key]} onChange={(e) => setModules((prev) => ({ ...prev, [key]: e.target.checked }))} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Visible en landing pública
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Plan por defecto
        </label>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/super-admin/plans')} style={{ padding: '0.6rem 1.5rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
