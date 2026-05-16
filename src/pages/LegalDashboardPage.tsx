import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { legalDashboardApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Currency, LegalDashboardSummary } from '../types';

export function LegalDashboardPage(): React.ReactElement {
  const [summary, setSummary] = useState<LegalDashboardSummary | null>(null);
  const [delinquency, setDelinquency] = useState<unknown>(null);
  const [deeds, setDeeds] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [s, d, dd] = await Promise.all([
          legalDashboardApi.summary(),
          legalDashboardApi.delinquency(),
          legalDashboardApi.deeds(),
        ]);
        setSummary((s as { summary: LegalDashboardSummary }).summary);
        setDelinquency(d);
        setDeeds(dd);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard legal.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const currencies: Currency[] = ['ARS', 'USD'];

  return (
    <div>
      <PageHeader title="Dashboard Legal" />
      {error && <ErrorMessage message={error} />}
      {summary && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Casos de mora abiertos</div>
              <div className="stat-value">{summary.openCases}</div>
              {summary.criticalCases > 0 && <div className="stat-note text--danger">{summary.criticalCases} críticos</div>}
              <Link to="/delinquency-cases" className="stat-link">Ver casos</Link>
            </div>
            <div className="stat-card">
              <div className="stat-label">Monto vencido</div>
              {currencies.map((cur) => (
                (summary.overdueAmountByCurrency[cur] ?? 0) > 0 && (
                  <div key={cur} className="stat-value"><CurrencyAmount amount={summary.overdueAmountByCurrency[cur]!} currency={cur} /></div>
                )
              ))}
            </div>
            <div className="stat-card">
              <div className="stat-label">Refinanciaciones activas</div>
              <div className="stat-value">{summary.activeRefinancings}</div>
              <Link to="/refinancing-agreements" className="stat-link">Ver acuerdos</Link>
            </div>
            <div className="stat-card">
              <div className="stat-label">Procesos legales abiertos</div>
              <div className="stat-value">{summary.openLegalProcesses}</div>
              <Link to="/legal-processes" className="stat-link">Ver procesos</Link>
            </div>
            <div className="stat-card">
              <div className="stat-label">Escrituraciones activas</div>
              <div className="stat-value">{summary.activeDeedProcesses}</div>
              <Link to="/deed-processes" className="stat-link">Ver escrituraciones</Link>
            </div>
            <div className="stat-card">
              <div className="stat-label">Firmas próximas (30 días)</div>
              <div className="stat-value">{summary.upcomingSignings}</div>
            </div>
          </div>

          {delinquency && (
            <section className="section">
              <h2>Mora</h2>
              <pre className="debug-pre">{JSON.stringify(delinquency, null, 2)}</pre>
            </section>
          )}
          {deeds && (
            <section className="section">
              <h2>Escrituración</h2>
              <pre className="debug-pre">{JSON.stringify(deeds, null, 2)}</pre>
            </section>
          )}
        </>
      )}
    </div>
  );
}
