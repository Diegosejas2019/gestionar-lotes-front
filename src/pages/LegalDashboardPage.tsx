import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { legalDashboardApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, DeedProcess, DeedStatus, DelinquencyCase, DelinquencySeverity, DelinquencyStatus, LegalDashboardSummary } from '../types';
import { asBuyer, asLot, buyerName, lotLabel } from '../utils/format';
import { deedStatusLabels, delinquencySeverityLabels, delinquencyStatusLabels } from '../utils/labels';

type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

type CountItem<T extends string = string> = {
  _id: T;
  count: number;
};

type LegalDashboardDelinquency = {
  casesByStatus: CountItem<DelinquencyStatus>[];
  casesBySeverity: CountItem<DelinquencySeverity>[];
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  topOverdueSales: DelinquencyCase[];
  upcomingActions: DelinquencyCase[];
  staleCases: DelinquencyCase[];
};

type LegalDashboardDeeds = {
  byStatus: CountItem<DeedStatus>[];
  upcomingSignings: DeedProcess[];
};

function delinquencyStatusTone(status: DelinquencyStatus): BadgeTone {
  if (status === 'resolved') return 'success';
  if (status === 'cancelled') return 'neutral';
  if (status === 'in_legal_review' || status === 'rescission_process') return 'danger';
  if (status === 'notified') return 'warning';
  return 'info';
}

function delinquencySeverityTone(severity: DelinquencySeverity): BadgeTone {
  if (severity === 'critical') return 'danger';
  if (severity === 'high') return 'warning';
  if (severity === 'medium') return 'info';
  return 'neutral';
}

function deedStatusTone(status: DeedStatus): BadgeTone {
  if (status === 'completed' || status === 'signed' || status === 'delivered') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'signing_scheduled' || status === 'sent_to_notary') return 'info';
  if (status === 'documents_complete') return 'warning';
  return 'neutral';
}

function caseBuyerName(item: DelinquencyCase): string {
  return buyerName(asBuyer(item.buyerId));
}

function deedBuyerName(item: DeedProcess): string {
  return buyerName(asBuyer(item.buyerId));
}

function caseLotLabel(item: DelinquencyCase): string {
  return lotLabel(asLot(item.lotId));
}

function deedLotLabel(item: DeedProcess): string {
  return lotLabel(asLot(item.lotId));
}

function AmountsByCurrency({ amounts }: { amounts: Partial<Record<Currency, number>> }): React.ReactElement {
  const visibleAmounts = (['ARS', 'USD'] as Currency[]).filter((cur) => (amounts[cur] ?? 0) > 0);
  if (!visibleAmounts.length) return <span>-</span>;

  return (
    <div>
      {visibleAmounts.map((cur) => (
        <div key={cur}><CurrencyAmount amount={amounts[cur]!} currency={cur} /></div>
      ))}
    </div>
  );
}

function CountSummary<T extends string>({
  title,
  items,
  labels,
  toneFor,
}: {
  title: string;
  items: CountItem<T>[];
  labels: Partial<Record<T, string>>;
  toneFor?: (key: T) => BadgeTone;
}): React.ReactElement {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      {items.length ? (
        <div className="stack">
          {items.map((item) => (
            <div key={item._id} className="inline-row">
              <StatusBadge label={labels[item._id] || item._id} tone={toneFor?.(item._id) || 'neutral'} />
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Sin datos.</p>
      )}
    </div>
  );
}

export function LegalDashboardPage(): React.ReactElement {
  const [summary, setSummary] = useState<LegalDashboardSummary | null>(null);
  const [delinquency, setDelinquency] = useState<LegalDashboardDelinquency | null>(null);
  const [deeds, setDeeds] = useState<LegalDashboardDeeds | null>(null);
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
        setSummary(s.summary);
        setDelinquency((d as unknown as { delinquency: LegalDashboardDelinquency }).delinquency);
        setDeeds((dd as unknown as { deeds: LegalDashboardDeeds }).deeds);
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
              <div className="dashboard-grid">
                <CountSummary
                  title="Casos por estado"
                  items={delinquency.casesByStatus}
                  labels={delinquencyStatusLabels}
                  toneFor={delinquencyStatusTone}
                />
                <CountSummary
                  title="Casos por severidad"
                  items={delinquency.casesBySeverity}
                  labels={delinquencySeverityLabels}
                  toneFor={delinquencySeverityTone}
                />
                <div className="dashboard-card">
                  <h3>Monto vencido</h3>
                  <AmountsByCurrency amounts={delinquency.overdueAmountByCurrency} />
                </div>
              </div>

              <h3>Ventas con mayor mora</h3>
              <DataTable
                columns={[
                  { key: 'case', header: 'Caso', render: (item) => <Link to={`/delinquency-cases/${item._id}`}><strong>{item.caseNumber}</strong></Link> },
                  { key: 'buyer', header: 'Comprador', render: caseBuyerName },
                  { key: 'lot', header: 'Lote', render: caseLotLabel },
                  { key: 'overdue', header: 'Cuotas vencidas', render: (item) => item.overdueInstallmentsCount },
                  { key: 'amount', header: 'Monto vencido', render: (item) => <AmountsByCurrency amounts={item.overdueAmountByCurrency} /> },
                  { key: 'severity', header: 'Severidad', render: (item) => <StatusBadge label={delinquencySeverityLabels[item.severity]} tone={delinquencySeverityTone(item.severity)} /> },
                  { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={delinquencyStatusLabels[item.status]} tone={delinquencyStatusTone(item.status)} /> },
                ]}
                rows={delinquency.topOverdueSales}
                getRowKey={(item) => item._id}
                emptyTitle="No hay ventas con mora activa."
              />

              <h3>Próximas acciones</h3>
              <DataTable
                columns={[
                  { key: 'case', header: 'Caso', render: (item) => <Link to={`/delinquency-cases/${item._id}`}><strong>{item.caseNumber}</strong></Link> },
                  { key: 'buyer', header: 'Comprador', render: caseBuyerName },
                  { key: 'nextAction', header: 'Próxima acción', render: (item) => <DateDisplay value={item.nextActionDate} /> },
                  { key: 'lastContact', header: 'Último contacto', render: (item) => <DateDisplay value={item.lastContactDate} /> },
                  { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={delinquencyStatusLabels[item.status]} tone={delinquencyStatusTone(item.status)} /> },
                ]}
                rows={delinquency.upcomingActions}
                getRowKey={(item) => item._id}
                emptyTitle="No hay acciones próximas."
              />

              <h3>Casos sin contacto reciente</h3>
              <DataTable
                columns={[
                  { key: 'case', header: 'Caso', render: (item) => <Link to={`/delinquency-cases/${item._id}`}><strong>{item.caseNumber}</strong></Link> },
                  { key: 'buyer', header: 'Comprador', render: caseBuyerName },
                  { key: 'createdAt', header: 'Creado', render: (item) => <DateDisplay value={item.createdAt} /> },
                  { key: 'lastContact', header: 'Último contacto', render: (item) => <DateDisplay value={item.lastContactDate} /> },
                  { key: 'severity', header: 'Severidad', render: (item) => <StatusBadge label={delinquencySeverityLabels[item.severity]} tone={delinquencySeverityTone(item.severity)} /> },
                ]}
                rows={delinquency.staleCases}
                getRowKey={(item) => item._id}
                emptyTitle="No hay casos sin contacto reciente."
              />
            </section>
          )}

          {deeds && (
            <section className="section">
              <h2>Escrituración</h2>
              <div className="dashboard-grid">
                <CountSummary
                  title="Procesos por estado"
                  items={deeds.byStatus}
                  labels={deedStatusLabels}
                  toneFor={deedStatusTone}
                />
              </div>

              <h3>Firmas próximas</h3>
              <DataTable
                columns={[
                  { key: 'number', header: 'Proceso', render: (item) => <Link to={`/deed-processes/${item._id}`}><strong>{item.processNumber}</strong></Link> },
                  { key: 'buyer', header: 'Comprador', render: deedBuyerName },
                  { key: 'lot', header: 'Lote', render: deedLotLabel },
                  { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={deedStatusLabels[item.status]} tone={deedStatusTone(item.status)} /> },
                  { key: 'notary', header: 'Escribanía', render: (item) => item.notaryName || '-' },
                  { key: 'docs', header: 'Docs', render: (item) => `${item.submittedDocuments.length}/${item.requiredDocuments.length}` },
                  { key: 'signing', header: 'Firma estimada', render: (item) => <DateDisplay value={item.estimatedSigningDate} /> },
                ]}
                rows={deeds.upcomingSignings}
                getRowKey={(item) => item._id}
                emptyTitle="No hay firmas próximas."
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
