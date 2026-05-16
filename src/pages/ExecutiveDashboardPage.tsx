import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { CurrencyTotals } from '../components/CurrencyAmount';
import { executiveDashboardApi } from '../api/services';
import type { ExecutiveSummary } from '../types';

function StatCard({ label, value, linkTo }: { label: string; value: string | number; linkTo?: string }) {
  const content = (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
  return linkTo ? <Link to={linkTo} className="stat-card-link">{content}</Link> : content;
}

export function ExecutiveDashboardPage(): React.ReactElement {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [devFilter, setDevFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  function load() {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (devFilter) params.developmentId = devFilter;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    void (async () => {
      try {
        const res = await executiveDashboardApi.summary(params);
        setSummary((res as { data: ExecutiveSummary }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el dashboard ejecutivo.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando dashboard ejecutivo..." />;

  return (
    <div className="page-container">
      <PageHeader title="Dashboard Ejecutivo" description="Resumen integral de la organización." />

      <div className="filter-bar">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" placeholder="Desde" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" placeholder="Hasta" />
        <button className="button button--primary" onClick={load}>Actualizar</button>
      </div>

      {error && <ErrorMessage message={error} />}

      {summary && (
        <>
          <section>
            <h2 className="section-title">Lotes</h2>
            <div className="stats-grid">
              <StatCard label="Barrios activos" value={summary.activeDevelopmentsCount} linkTo="/developments" />
              <StatCard label="Lotes disponibles" value={summary.lotsAvailable} linkTo="/lots" />
              <StatCard label="Lotes reservados" value={summary.lotsReserved} />
              <StatCard label="Lotes vendidos" value={summary.lotsSold} />
            </div>
          </section>

          <section>
            <h2 className="section-title">Comercial</h2>
            <div className="stats-grid">
              <StatCard label="Interesados activos" value={summary.leadsCount} linkTo="/leads" />
              <StatCard label="Reservas activas" value={summary.reservationsActive} linkTo="/reservations" />
              <StatCard label="Reservas por vencer" value={summary.reservationsExpiringSoon} />
              <StatCard label="Ventas activas" value={summary.activeSalesCount} linkTo="/sales" />
            </div>
          </section>

          <section>
            <h2 className="section-title">Financiero</h2>
            <div className="dashboard-cards-row">
              <div className="dashboard-card">
                <div className="dashboard-card__label">Total vendido</div>
                <CurrencyTotals totals={summary.totalSoldByCurrency} />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card__label">Total cobrado</div>
                <CurrencyTotals totals={summary.totalCollectedByCurrency} />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card__label">Saldo pendiente</div>
                <CurrencyTotals totals={summary.pendingBalanceByCurrency} />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card__label">Deuda vencida</div>
                <CurrencyTotals totals={summary.overdueAmountByCurrency} />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card__label">Saldos de caja</div>
                <CurrencyTotals totals={summary.cashBalancesByCurrency} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="section-title">Operaciones</h2>
            <div className="stats-grid">
              <StatCard label="Pagos pendientes de revisión" value={summary.paymentRequestsPendingCount} linkTo="/payment-requests" />
              <StatCard label="Cuotas vencidas" value={summary.overdueInstallmentsCount} />
              <StatCard label="Obras en curso" value={summary.worksInProgressCount} linkTo="/work-projects" />
              <StatCard label="Escrituraciones en curso" value={summary.deedsInProgressCount} linkTo="/deed-processes" />
              <StatCard label="Casos legales abiertos" value={summary.legalCasesOpenCount} linkTo="/legal-processes" />
              <StatCard label="Barrios listos para migrar" value={summary.migrationsReadyCount} linkTo="/migrations" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
