import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { DateDisplay } from '../components/DateDisplay';
import { communicationsApi } from '../api/services';
import type { CommunicationLog } from '../types';

const channelLabels: Record<string, string> = { email: 'Email', whatsapp: 'WhatsApp', in_app: 'Interno' };
const statusLabels: Record<string, string> = {
  draft: 'Borrador', generated: 'Generado', queued: 'En cola',
  sent: 'Enviado', failed: 'Fallido', cancelled: 'Cancelado',
};

export function CommunicationDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [log, setLog] = useState<CommunicationLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const res = await communicationsApi.getLog(id);
        setLog(res.log);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la comunicación.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleMarkSent() {
    if (!id) return;
    try {
      const res = await communicationsApi.markWhatsappSent(id);
      setLog(res.log);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como enviado.');
    }
  }

  if (loading) return <LoadingState message="Cargando comunicación..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!log) return <ErrorMessage message="Comunicación no encontrada." />;

  return (
    <div className="page-container">
      <PageHeader title="Detalle de comunicación" description="" action={<button className="button" onClick={() => navigate('/communications')}>Volver</button>} />

      <div className="report-card">
        <table className="simple-table">
          <tbody>
            <tr><td><strong>Canal</strong></td><td>{channelLabels[log.channel] ?? log.channel}</td></tr>
            <tr><td><strong>Tipo</strong></td><td>{log.type}</td></tr>
            <tr><td><strong>Estado</strong></td><td>{statusLabels[log.status] ?? log.status}</td></tr>
            <tr><td><strong>Destinatario</strong></td><td>{log.recipientName}{log.recipientEmail ? ` <${log.recipientEmail}>` : ''}{log.recipientPhone ? ` (${log.recipientPhone})` : ''}</td></tr>
            {log.subject && <tr><td><strong>Asunto</strong></td><td>{log.subject}</td></tr>}
            {log.sentAt && <tr><td><strong>Enviado</strong></td><td><DateDisplay value={log.sentAt} /></td></tr>}
            {log.relatedEntityType && <tr><td><strong>Entidad relacionada</strong></td><td>{log.relatedEntityType}</td></tr>}
            {log.errorMessage && <tr><td><strong>Error</strong></td><td className="text-danger">{log.errorMessage}</td></tr>}
            <tr><td><strong>Fecha de creación</strong></td><td><DateDisplay value={log.createdAt} /></td></tr>
          </tbody>
        </table>
        <div style={{ marginTop: '1rem' }}>
          <h4>Mensaje</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>{log.message}</pre>
        </div>
        {log.channel === 'whatsapp' && log.status === 'generated' && (
          <div className="form-actions">
            {log.whatsappUrl && <a href={log.whatsappUrl} target="_blank" rel="noreferrer" className="button button--primary">Abrir WhatsApp</a>}
            <button className="button" onClick={handleMarkSent}>Marcar como enviado</button>
          </div>
        )}
      </div>
    </div>
  );
}
