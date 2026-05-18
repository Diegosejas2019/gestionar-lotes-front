import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { communicationTemplatesApi } from '../api/services';
import type { CommunicationTemplate } from '../types';

const channelLabels: Record<string, string> = { email: 'Email', whatsapp: 'WhatsApp', in_app: 'Interno' };
const typeLabels: Record<string, string> = {
  reservation_expiring: 'Reserva por vencer', quotation_expiring: 'Cotización por vencer',
  payment_reminder: 'Recordatorio de pago', installment_overdue: 'Cuota vencida',
  payment_request_received: 'Pago recibido', payment_request_approved: 'Pago aprobado',
  payment_request_rejected: 'Pago rechazado', down_payment_pending: 'Adelanto pendiente',
  deed_status_update: 'Escrituración', legal_notice_info: 'Aviso legal',
  refinancing_info: 'Refinanciación', migration_info: 'Migración', custom: 'Personalizada',
};

export function CommunicationTemplatesPage(): React.ReactElement {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await communicationTemplatesApi.list();
      setTemplates(res.templates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las plantillas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try {
      await communicationTemplatesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la plantilla.');
    }
  }

  if (loading) return <LoadingState message="Cargando plantillas..." />;

  return (
    <div className="page-container">
      <PageHeader title="Plantillas de comunicación" description="Plantillas reutilizables para email, WhatsApp y notificaciones internas." action={<Link to="/communication-templates/new" className="button button--primary">Nueva plantilla</Link>} />

      {error && <ErrorMessage message={error} />}

      {templates.length === 0 ? (
        <EmptyState title="Sin plantillas" message="Creá tu primera plantilla de comunicación." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Tipo</th><th>Canal</th><th>Habilitada</th><th>Predeterminada</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td>
                <td>{typeLabels[t.type] ?? t.type}</td>
                <td>{channelLabels[t.channel] ?? t.channel}</td>
                <td>{t.enabled ? 'Sí' : 'No'}</td>
                <td>{t.isDefault ? 'Sí' : '—'}</td>
                <td className="actions">
                  <Link to={`/communication-templates/${t._id}/edit`} className="button button--small">Editar</Link>
                  <button className="button button--small button--danger" onClick={() => handleRemove(t._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
