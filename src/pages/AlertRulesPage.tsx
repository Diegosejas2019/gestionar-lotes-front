import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { DateDisplay } from '../components/DateDisplay';
import { alertRulesApi } from '../api/services';
import type { AlertRule } from '../types';

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

export function AlertRulesPage(): React.ReactElement {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runningId, setRunningId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError('');
    void (async () => {
      try {
        const res = await alertRulesApi.list();
        setRules(res.data.alertRules ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las reglas de alerta.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  async function toggleEnabled(rule: AlertRule) {
    try {
      await alertRulesApi.update(rule._id, { enabled: !rule.enabled });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la regla.');
    }
  }

  async function runRule(id: string) {
    setRunningId(id);
    try {
      await alertRulesApi.run(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar la regla.');
    } finally {
      setRunningId(null);
    }
  }

  if (loading) return <LoadingState message="Cargando reglas de alerta..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reglas de alerta" description="Configurá las reglas de alertas automáticas de la organización." />

      {error && <ErrorMessage message={error} />}

      {rules.length === 0 ? (
        <EmptyState
          title="No hay reglas configuradas"
          message="No hay reglas de alerta configuradas. Generá alertas para crear las reglas por defecto."
        />
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: 'Nombre', render: (r) => r.name },
            { key: 'type', header: 'Tipo', render: (r) => typeLabels[r.type] ?? r.type },
            { key: 'enabled', header: 'Estado', render: (r) => <StatusBadge label={r.enabled ? 'Activa' : 'Inactiva'} tone={r.enabled ? 'success' : 'neutral'} /> },
            { key: 'frequency', header: 'Frecuencia', render: (r) => r.frequency },
            { key: 'lastRunAt', header: 'Última ejecución', render: (r) => r.lastRunAt ? <DateDisplay value={r.lastRunAt} /> : '—' },
            {
              key: 'actions',
              header: 'Acciones',
              render: (r) => (
                <div className="table-actions">
                  <button className={`button button--small ${r.enabled ? 'button--danger' : 'button--primary'}`} onClick={() => void toggleEnabled(r)}>
                    {r.enabled ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="button button--small" onClick={() => void runRule(r._id)} disabled={runningId === r._id}>
                    {runningId === r._id ? 'Ejecutando...' : 'Ejecutar'}
                  </button>
                </div>
              ),
            },
          ]}
          rows={rules}
          getRowKey={(r) => r._id}
        />
      )}
    </div>
  );
}
