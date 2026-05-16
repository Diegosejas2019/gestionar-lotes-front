import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { DateDisplay } from '../components/DateDisplay';
import { communicationsApi } from '../api/services';
import type { CommunicationLog } from '../types';

const channelLabels: Record<string, string> = { email: 'Email', whatsapp: 'WhatsApp', in_app: 'Interno' };
const statusLabels: Record<string, string> = {
  draft: 'Borrador', generated: 'Generado', queued: 'En cola',
  sent: 'Enviado', failed: 'Fallido', cancelled: 'Cancelado',
};

export function CommunicationsPage(): React.ReactElement {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (channel) params.channel = channel;
    if (status) params.status = status;
    try {
      const res = await communicationsApi.listLogs(params);
      setLogs((res as { data: { logs: CommunicationLog[] } }).data.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las comunicaciones.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleMarkSent(id: string) {
    try {
      await communicationsApi.markWhatsappSent(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como enviado.');
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar esta comunicación?')) return;
    try {
      await communicationsApi.cancelLog(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar.');
    }
  }

  if (loading) return <LoadingState message="Cargando comunicaciones..." />;

  return (
    <div className="page-container">
      <PageHeader title="Comunicaciones" description="Historial de emails, WhatsApp y mensajes internos enviados." />

      <div className="filter-bar">
        <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="">Todos los canales</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="in_app">Interno</option>
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="generated">Generado</option>
          <option value="sent">Enviado</option>
          <option value="failed">Fallido</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <button className="button button--primary" onClick={load}>Actualizar</button>
      </div>

      {error && <ErrorMessage message={error} />}

      {logs.length === 0 ? (
        <EmptyState title="Sin comunicaciones" message="No hay comunicaciones para los filtros seleccionados." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Fecha</th><th>Canal</th><th>Destinatario</th><th>Asunto / Mensaje</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id}>
                <td><DateDisplay value={l.createdAt} /></td>
                <td>{channelLabels[l.channel] ?? l.channel}</td>
                <td>{l.recipientName || l.recipientEmail || '—'}</td>
                <td className="truncate">{l.subject || l.message.slice(0, 60)}</td>
                <td>{statusLabels[l.status] ?? l.status}</td>
                <td className="actions">
                  <Link to={`/communications/${l._id}`} className="button button--small">Ver</Link>
                  {l.channel === 'whatsapp' && l.status === 'generated' && (
                    <>
                      {l.whatsappUrl && <a href={l.whatsappUrl} target="_blank" rel="noreferrer" className="button button--small button--primary">Abrir WA</a>}
                      <button className="button button--small" onClick={() => handleMarkSent(l._id)}>Marcar enviado</button>
                    </>
                  )}
                  {['draft', 'generated'].includes(l.status) && (
                    <button className="button button--small button--danger" onClick={() => handleCancel(l._id)}>Cancelar</button>
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
