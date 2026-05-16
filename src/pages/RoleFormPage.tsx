import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { rolesApi, permissionsApi } from '../api/services';
import type { PermissionsCatalogModule, RoleType } from '../types';

const ROLE_TYPE_LABELS: Record<string, string> = {
  super_admin: 'Super administrador', admin: 'Administrador', sales: 'Vendedor',
  finance: 'Finanzas', legal: 'Legal', viewer: 'Solo lectura', custom: 'Personalizado',
};

export function RoleFormPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [catalog, setCatalog] = useState<PermissionsCatalogModule[]>([]);

  const [form, setForm] = useState({
    name: '', description: '', type: 'custom' as RoleType,
    developmentAccessMode: 'all' as 'all' | 'selected',
    enabled: true,
    permissions: {} as Record<string, string[]>,
  });

  useEffect(() => {
    void (async () => {
      try {
        const catRes = await permissionsApi.catalog();
        setCatalog((catRes as { modules: PermissionsCatalogModule[] }).modules);
        if (isEdit && id) {
          const res = await rolesApi.get(id);
          const r = (res as { role: typeof form & { _id: string; isSystemRole: boolean } }).role;
          setForm({ name: r.name, description: (r as unknown as Record<string, string>).description || '', type: r.type, developmentAccessMode: (r as unknown as Record<string, 'all' | 'selected'>).developmentAccessMode || 'all', enabled: (r as unknown as Record<string, boolean>).enabled, permissions: r.permissions || {} });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function toggleAction(module: string, action: string) {
    setForm((f) => {
      const current = f.permissions[module] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...f, permissions: { ...f.permissions, [module]: updated } };
    });
  }

  function setAllModuleActions(module: string, actions: string[], checked: boolean) {
    setForm((f) => ({
      ...f,
      permissions: { ...f.permissions, [module]: checked ? [...actions] : [] },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit && id) {
        await rolesApi.update(id, form);
      } else {
        await rolesApi.create(form);
      }
      navigate('/settings/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el rol.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Cargando rol..." />;

  return (
    <div className="page-container">
      <PageHeader title={isEdit ? 'Editar rol' : 'Nuevo rol'} description="Configurá nombre, tipo y permisos del rol." />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Tipo *</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RoleType }))}>
              {Object.entries(ROLE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Acceso a barrios</label>
            <select className="input" value={form.developmentAccessMode} onChange={(e) => setForm((f) => ({ ...f, developmentAccessMode: e.target.value as 'all' | 'selected' }))}>
              <option value="all">Todos los barrios</option>
              <option value="selected">Barrios seleccionados</option>
            </select>
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label><input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} /> Habilitado</label>
          </div>
        </div>

        <h3 style={{ marginTop: '1.5rem' }}>Permisos por módulo</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="simple-table" style={{ fontSize: '0.85em' }}>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Todos</th>
                {/* Actions vary per module — we'll list up to the first module's actions as columns, but each module has different actions */}
              </tr>
            </thead>
            <tbody>
              {catalog.map((mod) => {
                const current = form.permissions[mod.key] || [];
                const allSelected = mod.actions.every((a) => current.includes(a.key));
                return (
                  <tr key={mod.key}>
                    <td><strong>{mod.label}</strong></td>
                    <td>
                      <input type="checkbox" checked={allSelected} onChange={(e) => setAllModuleActions(mod.key, mod.actions.map((a) => a.key), e.target.checked)} />
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {mod.actions.map((a) => (
                        <label key={a.key} style={{ marginRight: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input type="checkbox" checked={current.includes(a.key)} onChange={() => toggleAction(mod.key, a.key)} />
                          {a.label}
                        </label>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" className="button" onClick={() => navigate('/settings/roles')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
