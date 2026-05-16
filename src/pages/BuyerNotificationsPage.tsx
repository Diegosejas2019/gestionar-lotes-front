import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { DateDisplay } from '../components/DateDisplay';
import { notificationsApi } from '../api/services';
import type { Notification } from '../types';

const severityLabels: Record<string, string> = { info: 'Info', warning: 'Aviso', high: 'Alta', critical: 'Crítica' };

export function BuyerNotificationsPage(): React.ReactElement {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsApi.list();
      setNotifications((res as { data: { notifications: Notification[] } }).data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleMarkRead(id: string) {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, status: 'read' as const } : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error.');
    }
  }

  if (loading) return <LoadingState message="Cargando notificaciones..." />;

  return (
    <div className="page-container">
      <PageHeader title="Mis notificaciones" description="Avisos sobre tus operaciones, pagos y documentos." />

      {error && <ErrorMessage message={error} />}

      {notifications.length === 0 ? (
        <EmptyState title="Sin notificaciones" message="No tenés notificaciones pendientes." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div key={n._id} className={`report-card ${n.status === 'unread' ? 'report-card--highlighted' : ''}`} style={{ borderLeft: `4px solid ${n.severity === 'critical' ? '#dc2626' : n.severity === 'high' ? '#ea580c' : n.severity === 'warning' ? '#d97706' : '#2563eb'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{n.title}</strong>
                  {n.status === 'unread' && <span style={{ marginLeft: '0.5rem', background: '#2563eb', color: '#fff', borderRadius: '9999px', padding: '0 0.4rem', fontSize: '0.7em' }}>Nuevo</span>}
                  <p style={{ margin: '0.25rem 0 0', color: '#555' }}>{n.message}</p>
                  <small className="text-muted"><DateDisplay value={n.createdAt} /> · {severityLabels[n.severity] ?? n.severity}</small>
                </div>
                {n.status === 'unread' && (
                  <button className="button button--small" onClick={() => handleMarkRead(n._id)}>Marcar leída</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
