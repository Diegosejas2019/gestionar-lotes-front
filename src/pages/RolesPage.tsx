import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { rolesApi } from '../api/services';
import type { Role } from '../types';

const typeLabels: Record<string, string> = {
  super_admin: 'Super administrador', admin: 'Administrador', sales: 'Vendedor',
  finance: 'Finanzas', legal: 'Legal', viewer: 'Solo lectura', custom: 'Personalizado',
};

export function RolesPage(): React.ReactElement {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await rolesApi.list();
      setRoles((res as { roles: Role[] }).roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los roles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleRemove(role: Role) {
    if (role.isSystemRole) { alert('Los roles de sistema no pueden eliminarse.'); return; }
    if (!confirm(`¿Eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await rolesApi.remove(role._id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el rol.');
    }
  }

  if (loading) return <LoadingState message="Cargando roles..." />;

  return (
    <div className="page-container">
      <PageHeader title="Roles y permisos" description="Administrá los roles y sus permisos por módulo." action={<Link to="/settings/roles/new" className="button button--primary">Nuevo rol</Link>} />
      {error && <ErrorMessage message={error} />}
      {roles.length === 0 ? (
        <EmptyState title="Sin roles" message="Creá el primer rol para tu organización." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Nombre</th><th>Tipo</th><th>Acceso barrios</th><th>Estado</th><th>Sistema</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{typeLabels[r.type] ?? r.type}</td>
                <td>{r.developmentAccessMode === 'all' ? 'Todos' : 'Seleccionados'}</td>
                <td>{r.enabled ? 'Habilitado' : 'Deshabilitado'}</td>
                <td>{r.isSystemRole ? 'Sí' : '—'}</td>
                <td className="actions">
                  <Link to={`/settings/roles/${r._id}/edit`} className="button button--small">Editar</Link>
                  {!r.isSystemRole && (
                    <button className="button button--small button--danger" onClick={() => handleRemove(r)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
