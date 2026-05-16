import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { DateDisplay } from '../components/DateDisplay';
import { userRoleAssignmentsApi, rolesApi } from '../api/services';
import type { Role, UserRoleAssignment } from '../types';

const typeLabels: Record<string, string> = {
  super_admin: 'Super admin', admin: 'Admin', sales: 'Vendedor',
  finance: 'Finanzas', legal: 'Legal', viewer: 'Solo lectura', custom: 'Personalizado',
};

export function UsersPage(): React.ReactElement {
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [assigning, setAssigning] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [aRes, rRes] = await Promise.all([
        userRoleAssignmentsApi.list(),
        rolesApi.list(),
      ]);
      setAssignments((aRes as { assignments: UserRoleAssignment[] }).assignments);
      setRoles((rRes as { roles: Role[] }).roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los accesos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserId.trim() || !newRoleId) return;
    setAssigning(true);
    setError('');
    try {
      await userRoleAssignmentsApi.create({ userId: newUserId.trim(), roleId: newRoleId });
      setNewUserId('');
      setNewRoleId('');
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar el rol.');
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemove(assignment: UserRoleAssignment) {
    const roleName = typeof assignment.roleId === 'object' ? (assignment.roleId as Role).name : 'este rol';
    if (!confirm(`¿Quitar la asignación de "${roleName}" para este usuario?`)) return;
    try {
      await userRoleAssignmentsApi.remove(assignment._id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al quitar la asignación.');
    }
  }

  if (loading) return <LoadingState message="Cargando accesos..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Usuarios y accesos"
        description="Asignación de roles a usuarios de la organización."
        action={<button className="button button--primary" onClick={() => setShowForm(!showForm)}>Asignar rol</button>}
      />
      {error && <ErrorMessage message={error} />}

      {showForm && (
        <form onSubmit={handleAssign} className="form report-card" style={{ marginBottom: '1rem' }}>
          <h4>Asignar rol a usuario</h4>
          <div className="form-row">
            <div className="form-group">
              <label>User ID *</label>
              <input className="input" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="ObjectId del usuario" required />
            </div>
            <div className="form-group">
              <label>Rol *</label>
              <select className="input" value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} required>
                <option value="">Seleccioná un rol</option>
                {roles.map((r) => <option key={r._id} value={r._id}>{r.name} ({typeLabels[r.type] ?? r.type})</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="button button--primary" disabled={assigning}>{assigning ? 'Asignando...' : 'Asignar'}</button>
            <button type="button" className="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="Sin asignaciones" message="No hay usuarios con roles asignados." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Usuario ID</th><th>Rol</th><th>Tipo</th><th>Acceso barrios</th><th>Asignado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {assignments.map((a) => {
              const role = typeof a.roleId === 'object' ? a.roleId as Role : null;
              return (
                <tr key={a._id}>
                  <td className="text-muted" style={{ fontSize: '0.85em' }}>{String(a.userId)}</td>
                  <td>{role?.name ?? String(a.roleId)}</td>
                  <td>{role ? (typeLabels[role.type] ?? role.type) : '—'}</td>
                  <td>{(a.developmentAccessMode || role?.developmentAccessMode) === 'all' ? 'Todos' : 'Seleccionados'}</td>
                  <td><DateDisplay value={a.assignedAt} /></td>
                  <td className="actions">
                    <button className="button button--small button--danger" onClick={() => handleRemove(a)}>Quitar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
