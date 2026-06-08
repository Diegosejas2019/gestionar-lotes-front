import { useEffect, useState } from 'react';
import { financeDashboardApi } from '../api/services';
import { CashBalanceEvolutionChart } from '../components/finance/CashBalanceEvolutionChart';
import { CashAccountsTable } from '../components/finance/CashAccountsTable';
import { ExpensesByCategoryChart } from '../components/finance/ExpensesByCategoryChart';
import { FinancialAlertsPanel } from '../components/finance/FinancialAlertsPanel';
import { IncomeExpenseChart } from '../components/finance/IncomeExpenseChart';
import { WorkProjectsSummaryTable } from '../components/finance/WorkProjectsSummaryTable';
import { CurrencyTotals } from '../components/CurrencyAmount';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { usePermissions } from '../context/PermissionsContext';
import type {
  CashAccountSummaryItem,
  CashBalanceEvolutionPoint,
  ExpenseByCategoryItem,
  FinancialAlert,
  FinanceDashboardSummary,
  MonthlyIncomeExpensePoint,
  WorkProjectSummaryItem,
} from '../types';

export function FinanceDashboardPage(): React.ReactElement {
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const [summary, setSummary] = useState<FinanceDashboardSummary | null>(null);
  const [cashAccounts, setCashAccounts] = useState<CashAccountSummaryItem[]>([]);
  const [workProjects, setWorkProjects] = useState<WorkProjectSummaryItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyIncomeExpensePoint[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategoryItem[]>([]);
  const [cashEvolution, setCashEvolution] = useState<CashBalanceEvolutionPoint[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertsError, setAlertsError] = useState('');

  useEffect(() => {
    if (permissionsLoading) return;

    if (!hasPermission('cash', 'view')) {
      setLoading(false);
      setError('No tenés permisos para ver el dashboard financiero.');
      return;
    }

    async function load(): Promise<void> {
      try {
        const [sumRes, accountsRes, projectsRes, monthlyRes, categoryRes, evolutionRes] = await Promise.all([
          financeDashboardApi.summary(),
          financeDashboardApi.cashAccountsSummary(),
          financeDashboardApi.workProjectsSummary(),
          financeDashboardApi.incomeExpenseByMonth(),
          financeDashboardApi.expensesByCategory(),
          financeDashboardApi.cashBalanceEvolution(),
        ]);

        const s =
          (sumRes as unknown as { data: FinanceDashboardSummary }).data ??
          (sumRes as unknown as FinanceDashboardSummary);
        setSummary(s);
        setCashAccounts((accountsRes as unknown as { cashAccountsSummary: CashAccountSummaryItem[] }).cashAccountsSummary ?? []);
        setWorkProjects((projectsRes as unknown as { workProjects: WorkProjectSummaryItem[] }).workProjects ?? []);
        setMonthlyData((monthlyRes as unknown as { monthlyData: MonthlyIncomeExpensePoint[] }).monthlyData ?? []);
        setExpensesByCategory((categoryRes as unknown as { expensesByCategory: ExpenseByCategoryItem[] }).expensesByCategory ?? []);
        setCashEvolution((evolutionRes as unknown as { evolution: CashBalanceEvolutionPoint[] }).evolution ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard financiero.');
      } finally {
        setLoading(false);
      }

      // Alertas se cargan en paralelo y no rompen el dashboard si fallan
      financeDashboardApi.financialAlerts().then((res) => {
        setAlerts((res as unknown as { alerts: FinancialAlert[] }).alerts ?? []);
      }).catch(() => {
        setAlertsError('No se pudieron cargar las alertas financieras.');
      });
    }

    void load();
  }, [hasPermission, permissionsLoading]);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Dashboard financiero" />

      {error && <ErrorMessage message={error} />}

      {summary && (
        <>
          {/* Cards superiores */}
          <div className="finance-dashboard-grid">
            <div className="finance-dashboard-card">
              <h4>Saldos de caja</h4>
              <CurrencyTotals totals={summary.cashBalancesByCurrency} />
            </div>
            <div className="finance-dashboard-card">
              <h4>Ingresos del mes</h4>
              <CurrencyTotals totals={summary.incomeCurrentMonthByCurrency} />
            </div>
            <div className="finance-dashboard-card">
              <h4>Egresos del mes</h4>
              <CurrencyTotals totals={summary.expensesCurrentMonthByCurrency} />
            </div>
            <div className="finance-dashboard-card">
              <h4>Resultado del mes</h4>
              {Object.entries(summary.netResultCurrentMonthByCurrency).map(([currency, amount]) => (
                <div key={currency} className={amount < 0 ? 'finance-metric-number--negative' : undefined}>
                  <CurrencyTotals totals={{ [currency]: amount }} />
                </div>
              ))}
            </div>
            <div className="finance-dashboard-card">
              <h4>Gastos pendientes</h4>
              <CurrencyTotals totals={summary.pendingExpensesByCurrency} />
            </div>
            <div className="finance-dashboard-card">
              <h4>Presupuesto obras activas</h4>
              <CurrencyTotals totals={summary.workBudgetByCurrency} />
            </div>
            <div className="finance-dashboard-card">
              <h4>Gastado en obras</h4>
              <CurrencyTotals totals={summary.workSpentByCurrency} />
            </div>
            <div className="finance-dashboard-card">
              <h4>Obras en curso</h4>
              <p className="finance-metric-number">{summary.workProjectsInProgress}</p>
            </div>
          </div>

          {/* Gráfico: Ingresos vs Egresos */}
          <div className="finance-section">
            <h3 className="finance-section-title">Ingresos vs Egresos — últimos 6 meses</h3>
            <IncomeExpenseChart data={monthlyData} />
          </div>

          {/* Gráficos: Gastos por categoría + Evolución de saldo */}
          <div className="finance-charts-row">
            <div className="finance-section">
              <h3 className="finance-section-title">Composición de gastos</h3>
              <ExpensesByCategoryChart data={expensesByCategory} />
            </div>
            <div className="finance-section">
              <h3 className="finance-section-title">Evolución de saldo de caja</h3>
              <CashBalanceEvolutionChart data={cashEvolution} />
            </div>
          </div>

          {/* Tabla: Cajas / Cuentas */}
          <div className="finance-section">
            <h3 className="finance-section-title">Cajas / Cuentas</h3>
            <CashAccountsTable accounts={cashAccounts} />
          </div>

          {/* Tabla: Resumen de obras */}
          <div className="finance-section">
            <h3 className="finance-section-title">Resumen de obras</h3>
            <WorkProjectsSummaryTable projects={workProjects} />
          </div>

          {/* Panel: Alertas financieras */}
          <div className="finance-section">
            <h3 className="finance-section-title">Requiere atención</h3>
            {alertsError ? (
              <ErrorMessage message={alertsError} />
            ) : (
              <FinancialAlertsPanel alerts={alerts} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
