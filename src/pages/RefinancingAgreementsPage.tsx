import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { refinancingAgreementsApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, RefinancingAgreement, RefinancingStatus } from '../types';
import { refinancingStatusLabels } from '../utils/labels';

function statusTone(status: RefinancingStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'active' || status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'pending_signature') return 'warning';
  if (status === 'signed') return 'info';
  return 'neutral';
}

function buyerName(r: RefinancingAgreement): string {
  if (typeof r.buyerId === 'object' && r.buyerId) {
    const b = r.buyerId as { firstName?: string; lastName?: string };
    return [b.firstName, b.lastName].filter(Boolean).join(' ') || '-';
  }
  return '-';
}

export function RefinancingAgreementsPage(): React.ReactElement {
  const [agreements, setAgreements] = useState<RefinancingAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await refinancingAgreementsApi.list();
        setAgreements(data.refinancingAgreements || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las refinanciaciones.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Refinanciaciones"
        action={<Link to="/refinancing-agreements/new" className="btn btn--primary">+ Nueva refinanciación</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <DataTable
        columns={[
          { key: 'number', header: 'Número', render: (r) => <Link to={`/refinancing-agreements/${r._id}`}><strong>{r.agreementNumber}</strong></Link> },
          { key: 'buyer', header: 'Comprador', render: buyerName },
          { key: 'currency', header: 'Moneda', render: (r) => r.currency },
          { key: 'total', header: 'Monto total', render: (r) => <CurrencyAmount amount={r.totalDebtAmount} currency={r.currency as Currency} /> },
          { key: 'installments', header: 'Cuotas', render: (r) => `${r.installmentCount} × ` },
          { key: 'amount', header: 'Valor cuota', render: (r) => <CurrencyAmount amount={r.installmentAmount} currency={r.currency as Currency} /> },
          { key: 'firstDue', header: 'Primer vencimiento', render: (r) => <DateDisplay value={r.firstDueDate} /> },
          { key: 'status', header: 'Estado', render: (r) => <StatusBadge label={refinancingStatusLabels[r.status]} tone={statusTone(r.status)} /> },
          {
            key: 'actions', header: '', render: (r) => (
              <Link to={`/refinancing-agreements/${r._id}`} className="btn btn--sm btn--secondary">Ver</Link>
            ),
          },
        ]}
        rows={agreements}
        getRowKey={(r) => r._id}
        emptyTitle="No hay acuerdos de refinanciación cargados."
      />
    </div>
  );
}
