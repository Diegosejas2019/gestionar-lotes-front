import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { financeDashboardApi } from '../api/services';
import { CurrencyAmount, CurrencyTotals } from '../components/CurrencyAmount';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CashAccount, Currency, FinanceDashboardSummary, WorkProjectStatus } from '../types';
import { workProjectStatusLabels } from '../utils/labels';

type WorkProjectSummaryItem = {
  _id: string;
  name: string;
  developmentName: string;
  status: WorkProjectStatus;
  estimatedBudget: number;
  currency: string;
  spent: number;
  remaining: number;
  progressPercentage: number;
  estimatedEndDate?: string | null;
};

function statusTone(status: WorkProjectStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'in_progress') return 'info';
  if (status === 'paused') return 'warning';
  return 'neutral';
}

export function FinanceDashboardPage(): React.ReactElement {
  const [summary, setSummary] = useState<FinanceDashboardSummary | null>(null);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [projects, setProjects] = useState<WorkProjectSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [sumData, balData, projData] = await Promise.all([
          financeDashboardApi.summary(),
          financeDashboardApi.cashBalances(),
          financeDashboardApi.workProjectsSummary(),
        ]);
        // summary endpoint wraps in data.data due to how the API is shaped
        const s = (sumData as unknown as { data: FinanceDashboardSummary }).data ?? (sumData as unknown as FinanceDashboardSummary);
        setSummary(s);
        setAccounts((balData as unknown as { cashAccounts: CashAccount[] }).cashAccounts || []);
        setProjects((projData as unknown as { workProjects: WorkProjectSummaryItem[] }).workProjects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard financiero.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Dashboard financiero" />
      {error && <ErrorMessage message={error} />}

      {summary && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h4>Saldos de caja</h4>
              <CurrencyTotals totals={summary.cashBalancesByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Ingresos del mes</h4>
              <CurrencyTotals totals={summary.incomeCurrentMonthByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Egresos del mes</h4>
              <CurrencyTotals totals={summary.expensesCurrentMonthByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Resultado del mes</h4>
              <CurrencyTotals totals={summary.netResultCurrentMonthByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Gastos pendientes</h4>
              <CurrencyTotals totals={summary.pendingExpensesByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Presupuesto obras activas</h4>
              <CurrencyTotals totals={summary.workBudgetByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Gastado en obras</h4>
              <CurrencyTotals totals={summary.workSpentByCurrency} />
            </div>
            <div className="dashboard-card">
              <h4>Obras en curso</h4>
              <p className="dashboard-metric">{summary.workProjectsInProgress}</p>
            </div>
          </div>

          <h3>Cajas / Cuentas</h3>
          {accounts.length === 0 ? (
            <p className="empty-inline">No hay cajas configuradas. <Link to="/cash-accounts/new">Crear caja</Link></p>
          ) : (
            <div className="accounts-grid">
              {accounts.map((a) => (
                <div key={a._id} className="account-card">
                  <strong>{a.name}</strong>
                  <small>{a.type}</small>
                  <CurrencyAmount amount={a.currentBalance} currency={a.currency as Currency} />
                  {!a.enabled && <StatusBadge label="Deshabilitada" tone="neutral" />}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <>
              <h3>Resumen de obras</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Obra</th>
                      <th>Barrio</th>
                      <th>Estado</th>
                      <th>Presupuesto</th>
                      <th>Gastado</th>
                      <th>Avance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p._id}>
                        <td><Link to={`/work-projects/${p._id}`}>{p.name}</Link></td>
                        <td>{p.developmentName}</td>
                        <td><StatusBadge label={workProjectStatusLabels[p.status] || p.status} tone={statusTone(p.status)} /></td>
                        <td><CurrencyAmount amount={p.estimatedBudget} currency={p.currency as Currency} /></td>
                        <td><CurrencyAmount amount={p.spent} currency={p.currency as Currency} /></td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} /></div>
                            <span>{p.progressPercentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
