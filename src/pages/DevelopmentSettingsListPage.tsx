import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { developmentsApi } from '../api/services';
import type { Development } from '../types';

export function DevelopmentSettingsListPage(): React.ReactElement {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const res = await developmentsApi.list();
        setDevelopments((res as { developments: Development[] }).developments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los barrios.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState message="Cargando barrios..." />;

  return (
    <div className="page-container">
      <PageHeader title="Configuración por barrio" description="Configuración específica para cada barrio/desarrollo." />
      {error && <ErrorMessage message={error} />}
      {developments.length === 0 ? (
        <EmptyState title="Sin barrios" message="No hay barrios registrados." />
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Barrio</th><th>Estado</th><th>Moneda</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {developments.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{d.status}</td>
                <td>{d.defaultCurrency || '—'}</td>
                <td className="actions">
                  <Link to={`/settings/developments/${d._id}`} className="button button--small">Configurar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
