import { useEffect, useState } from 'react';
import { buyerPortalApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { BuyerSaleSummary } from '../types';
import { BuyerSalesTable } from './BuyerDashboardPage';

export function BuyerSalesPage(): React.ReactElement {
  const [sales, setSales] = useState<BuyerSaleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const data = await buyerPortalApi.mySales();
        setSales(data.sales || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus compras.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Mis compras" description="Tus operaciones y saldos actualizados." />
      <ErrorMessage message={error} />
      <section className="panel">
        <BuyerSalesTable sales={sales} />
      </section>
    </>
  );
}
