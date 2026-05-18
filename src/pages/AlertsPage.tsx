import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { DateDisplay } from '../components/DateDisplay';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { alertsApi } from '../api/services';
import type { Alert, AlertSeverity, AlertStatus } from '../types';

const severityLabels: Record<AlertSeverity, string> = {
  info: 'Informativa',
  warning: 'Advertencia',
  high: 'Alta',
  critical: 'Crítica',
};

const severityTones: Record<AlertSeverity, 'neutral' | 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warning: 'warning',
  high: 'danger',
  critical: 'danger',
};

const statusLabels: Record<AlertStatus, string> = {
  open: 'Abierta',
  in_progress: 'En proceso',
  resolved: 'Resuelta',
  dismissed: 'Descartada',
};

const statusTones: Record<AlertStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  open: 'danger',
  in_progress: 'warning',
  resolved: 'success',
  dismissed: 'neutral',
};

const typeLabels: Record<string, string> = {
  reservation_expiring: 'Reserva por vencer',
  installment_overdue: 'Cuota vencida',
  payment_request_pending: 'Pago informado pendiente',
  quotation_expiring: 'Cotización por vencer',
  lead_without_followup: 'Interesado sin seguimiento',
  work_project_delayed: 'Obra demorada',
  expense_due: 'Gasto por vencer',
  deed_signing_upcoming: 'Firma de escritura próxima',
  migration_ready: 'Barrio listo para migrar',
  legal_action_pending: 'Acción legal pendiente',
  cash_balance_low: 'Saldo de caja bajo',
};

export function AlertsPage(): React.ReactElement {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; action: 'resolve' | 'dismiss' | 'in_progress' } | null>(null);

  function load() {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (filterSeverity) params.severity = filterSeverity;

    void (async () => {
      try {
        const res = await alertsApi.list(params);
        setAlerts(res.alerts ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las alertas.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, [filterStatus, filterSeverity]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await alertsApi.generate();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar alertas.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleAction() {
    if (!confirm) return;
    try {
      if (confirm.action === 'resolve') await alertsApi.resolve(confirm.id);
      else if (confirm.action === 'dismiss') await alertsApi.dismiss(confirm.id);
      else await alertsApi.markInProgress(confirm.id);
      setConfirm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la alerta.');
      setConfirm(null);
    }
  }

  const actionLabels = { resolve: 'Resolver', dismiss: 'Descartar', in_progress: 'Marcar en proceso' };

  if (loading) return <LoadingState message="Cargando alertas..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Alertas"
        description="Alertas operativas internas de la organización."
        action={
          <button className="button button--primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generando...' : 'Generar alertas'}
          </button>
        }
      />

      <div className="filter-bar">
        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="open">Abierta</option>
          <option value="in_progress">En proceso</option>
          <option value="resolved">Resuelta</option>
          <option value="dismissed">Descartada</option>
        </select>
        <select className="input" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="">Todas las severidades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="warning">Advertencia</option>
          <option value="info">Informativa</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      {alerts.length === 0 ? (
        <EmptyState title="No hay alertas" message="No hay alertas para los filtros seleccionados." />
      ) : (
        <DataTable
          columns={[
            { key: 'createdAt', header: 'Fecha', render: (a) => <DateDisplay value={a.createdAt} /> },
            { key: 'severity', header: 'Severidad', render: (a) => <StatusBadge label={severityLabels[a.severity]} tone={severityTones[a.severity]} /> },
            { key: 'type', header: 'Tipo', render: (a) => typeLabels[a.type] ?? a.type },
            { key: 'title', header: 'Título', render: (a) => a.title },
            { key: 'dueDate', header: 'Vencimiento', render: (a) => a.dueDate ? <DateDisplay value={a.dueDate} /> : '—' },
            { key: 'status', header: 'Estado', render: (a) => <StatusBadge label={statusLabels[a.status]} tone={statusTones[a.status] as 'neutral' | 'success' | 'warning' | 'danger'} /> },
            {
              key: 'actions',
              header: 'Acciones',
              render: (a) => (
                <div className="table-actions">
                  {(a.status === 'open' || a.status === 'in_progress') && (
                    <>
                      {a.status === 'open' && (
                        <button className="button button--small" onClick={() => setConfirm({ id: a._id, action: 'in_progress' })}>
                          En proceso
                        </button>
                      )}
                      <button className="button button--small button--success" onClick={() => setConfirm({ id: a._id, action: 'resolve' })}>
                        Resolver
                      </button>
                      <button className="button button--small button--danger" onClick={() => setConfirm({ id: a._id, action: 'dismiss' })}>
                        Descartar
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          rows={alerts}
          getRowKey={(a) => a._id}
        />
      )}

      {confirm && (
        <ConfirmDialog
          open
          title={`${actionLabels[confirm.action]} alerta`}
          message={`¿Confirmás que querés ${actionLabels[confirm.action].toLowerCase()} esta alerta?`}
          confirmLabel={actionLabels[confirm.action]}
          onConfirm={() => void handleAction()}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
