import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { DateDisplay } from '../components/DateDisplay';
import { notificationsApi } from '../api/services';
import type { Notification } from '../types';

const severityLabels: Record<string, string> = { info: 'Info', warning: 'Aviso', high: 'Alta', critical: 'Crítica' };
const statusLabels: Record<string, string> = { unread: 'Sin leer', read: 'Leída', resolved: 'Resuelta', dismissed: 'Descartada' };

export function NotificationsPage(): React.ReactElement {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('unread');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (filter) params.status = filter;
      const res = await notificationsApi.list(params);
      setNotifications(res.notifications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [filter]);

  async function handleMarkRead(id: string) {
    try { await notificationsApi.markRead(id); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error.'); }
  }

  async function handleDismiss(id: string) {
    try { await notificationsApi.dismiss(id); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error.'); }
  }

  async function handleMarkAllRead() {
    try { await notificationsApi.markAllRead(); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error.'); }
  }

  if (loading) return <LoadingState message="Cargando notificaciones..." />;

  return (
    <div className="page-container">
      <PageHeader title="Notificaciones" description="Notificaciones internas del sistema." action={<button className="button" onClick={handleMarkAllRead}>Marcar todas leídas</button>} />

      <div className="filter-bar">
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todas</option>
          <option value="unread">Sin leer</option>
          <option value="read">Leídas</option>
          <option value="resolved">Resueltas</option>
          <option value="dismissed">Descartadas</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      {notifications.length === 0 ? (
        <EmptyState title="Sin notificaciones" message="No hay notificaciones para el filtro seleccionado." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Fecha</th><th>Severidad</th><th>Título</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n._id}>
                <td><DateDisplay value={n.createdAt} /></td>
                <td>{severityLabels[n.severity] ?? n.severity}</td>
                <td>
                  <strong>{n.title}</strong>
                  <div className="text-muted" style={{ fontSize: '0.85em' }}>{n.message}</div>
                </td>
                <td>{statusLabels[n.status] ?? n.status}</td>
                <td className="actions">
                  {n.status === 'unread' && <button className="button button--small" onClick={() => handleMarkRead(n._id)}>Marcar leída</button>}
                  {n.status !== 'dismissed' && <button className="button button--small" onClick={() => handleDismiss(n._id)}>Descartar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
