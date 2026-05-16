import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { delinquencyCasesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, DelinquencyCase, DelinquencySeverity, DelinquencyStatus } from '../types';
import { delinquencySeverityLabels, delinquencyStatusLabels } from '../utils/labels';

function statusTone(status: DelinquencyStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'resolved') return 'success';
  if (status === 'cancelled') return 'neutral';
  if (status === 'in_legal_review' || status === 'rescission_process') return 'danger';
  if (status === 'notified') return 'warning';
  return 'info';
}

function severityTone(severity: DelinquencySeverity): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (severity === 'critical') return 'danger';
  if (severity === 'high') return 'warning';
  if (severity === 'medium') return 'info';
  return 'neutral';
}

function buyerName(c: DelinquencyCase): string {
  if (typeof c.buyerId === 'object' && c.buyerId) {
    const b = c.buyerId as { firstName?: string; lastName?: string };
    return [b.firstName, b.lastName].filter(Boolean).join(' ') || '-';
  }
  return '-';
}

function devName(c: DelinquencyCase): string {
  if (typeof c.developmentId === 'object' && c.developmentId) {
    return (c.developmentId as { name: string }).name;
  }
  return '-';
}

export function DelinquencyCasesPage(): React.ReactElement {
  const [cases, setCases] = useState<DelinquencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [recalcResult, setRecalcResult] = useState<{ created: number; updated: number; resolved: number } | null>(null);
  const [confirmRecalc, setConfirmRecalc] = useState(false);

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await delinquencyCasesApi.list();
      setCases(data.delinquencyCases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los casos de mora.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function doRecalculate(): Promise<void> {
    setConfirmRecalc(false);
    setRecalculating(true);
    setRecalcResult(null);
    try {
      const result = await delinquencyCasesApi.recalculate();
      setRecalcResult(result);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al recalcular mora.');
    } finally {
      setRecalculating(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Casos de mora"
        action={
          <button className="btn btn--secondary" onClick={() => setConfirmRecalc(true)} disabled={recalculating}>
            {recalculating ? 'Recalculando...' : 'Recalcular mora'}
          </button>
        }
      />
      {error && <ErrorMessage message={error} />}
      {recalcResult && (
        <div className="alert alert--success">
          Recálculo completado: {recalcResult.created} creados, {recalcResult.updated} actualizados, {recalcResult.resolved} resueltos.
        </div>
      )}
      <DataTable
        columns={[
          { key: 'case', header: 'Caso', render: (c) => <Link to={`/delinquency-cases/${c._id}`}><strong>{c.caseNumber}</strong></Link> },
          { key: 'buyer', header: 'Comprador', render: buyerName },
          { key: 'dev', header: 'Barrio', render: devName },
          { key: 'overdue', header: 'Cuotas vencidas', render: (c) => c.overdueInstallmentsCount },
          {
            key: 'amount', header: 'Monto vencido', render: (c) => (
              <div>
                {(['ARS', 'USD'] as Currency[]).map((cur) => (
                  (c.overdueAmountByCurrency[cur] ?? 0) > 0 && (
                    <div key={cur}><CurrencyAmount amount={c.overdueAmountByCurrency[cur]!} currency={cur} /></div>
                  )
                ))}
              </div>
            ),
          },
          { key: 'severity', header: 'Severidad', render: (c) => <StatusBadge label={delinquencySeverityLabels[c.severity]} tone={severityTone(c.severity)} /> },
          { key: 'status', header: 'Estado', render: (c) => <StatusBadge label={delinquencyStatusLabels[c.status]} tone={statusTone(c.status)} /> },
          { key: 'nextAction', header: 'Próxima acción', render: (c) => <DateDisplay value={c.nextActionDate} /> },
          {
            key: 'actions', header: '', render: (c) => (
              <Link to={`/delinquency-cases/${c._id}`} className="btn btn--sm btn--secondary">Ver</Link>
            ),
          },
        ]}
        rows={cases}
        getRowKey={(c) => c._id}
        emptyTitle="No hay casos de mora registrados."
      />
      {confirmRecalc && (
        <ConfirmDialog
          open
          title="Recalcular mora"
          message="Se analizarán todas las ventas activas y se crearán, actualizarán o resolverán casos de mora según las cuotas vencidas. ¿Continuar?"
          onConfirm={doRecalculate}
          onCancel={() => setConfirmRecalc(false)}
        />
      )}
    </div>
  );
}
