import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { DateDisplay } from '../components/DateDisplay';
import { auditLogsApi } from '../api/services';
import type { AuditLog } from '../types';

const ACTION_LABELS: Record<string, string> = {
  role_created: 'Rol creado', role_updated: 'Rol actualizado', role_deleted: 'Rol eliminado',
  user_role_assigned: 'Rol asignado', user_role_removed: 'Rol quitado',
  settings_updated: 'Config. actualizada',
  payment_approved: 'Pago aprobado', payment_rejected: 'Pago rechazado',
  sale_cancelled: 'Venta cancelada', migration_executed: 'Migración ejecutada',
};

export function AuditLogsPage(): React.ReactElement {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (action) params.action = action;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await auditLogsApi.list(params);
      setLogs((res as { logs: AuditLog[] }).logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la auditoría.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [action, dateFrom, dateTo]);

  if (loading) return <LoadingState message="Cargando auditoría..." />;

  return (
    <div className="page-container">
      <PageHeader title="Auditoría" description="Registro de acciones sensibles de la organización." />
      {error && <ErrorMessage message={error} />}

      <div className="filter-bar">
        <select className="input" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Todas las acciones</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Desde" />
        <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Hasta" />
      </div>

      {logs.length === 0 ? (
        <EmptyState title="Sin registros" message="No hay eventos de auditoría para el filtro seleccionado." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id}>
                <td><DateDisplay value={l.createdAt} /></td>
                <td className="text-muted" style={{ fontSize: '0.85em' }}>{String(l.userId)}</td>
                <td>{ACTION_LABELS[l.action] ?? l.action}</td>
                <td>{l.entityType ? `${l.entityType}${l.entityId ? ` #${String(l.entityId).slice(-6)}` : ''}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
