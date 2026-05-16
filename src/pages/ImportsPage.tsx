import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { DateDisplay } from '../components/DateDisplay';
import { importsApi } from '../api/services';
import type { ImportBatch, ImportStatus } from '../types';

const TYPE_LABELS: Record<string, string> = {
  lots: 'Lotes', buyers: 'Compradores', sales: 'Ventas', installments: 'Cuotas',
  payments: 'Pagos', reservations: 'Reservas', suppliers: 'Proveedores',
  expenses: 'Gastos', full_onboarding: 'Puesta en marcha',
};

const STATUS_LABELS: Record<ImportStatus, string> = {
  uploaded: 'Subido', validating: 'Validando', validated: 'Validado',
  validation_failed: 'Validación fallida', ready_to_import: 'Listo',
  importing: 'Importando', completed: 'Completado',
  completed_with_warnings: 'Completado c/ advertencias', failed: 'Fallido', cancelled: 'Cancelado',
};

const STATUS_CLASS: Record<ImportStatus, string> = {
  uploaded: 'badge--info', validating: 'badge--warning', validated: 'badge--success',
  validation_failed: 'badge--danger', ready_to_import: 'badge--info',
  importing: 'badge--warning', completed: 'badge--success',
  completed_with_warnings: 'badge--warning', failed: 'badge--danger', cancelled: 'badge--default',
};

export function ImportsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await importsApi.list();
      setBatches(res.batches);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar las importaciones.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleValidate(batch: ImportBatch) {
    setActionError('');
    try {
      await importsApi.validate(batch._id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al validar.');
    }
  }

  async function handleExecute(batch: ImportBatch) {
    if (!confirm(`¿Ejecutar la importación "${batch.batchNumber}"? Esta acción creará datos en el sistema.`)) return;
    setActionError('');
    try {
      await importsApi.execute(batch._id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al ejecutar.');
    }
  }

  async function handleCancel(batch: ImportBatch) {
    if (!confirm(`¿Cancelar la importación "${batch.batchNumber}"?`)) return;
    setActionError('');
    try {
      await importsApi.cancel(batch._id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al cancelar.');
    }
  }

  async function handleRemove(batch: ImportBatch) {
    if (!confirm(`¿Eliminar la importación "${batch.batchNumber}"?`)) return;
    setActionError('');
    try {
      await importsApi.remove(batch._id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al eliminar.');
    }
  }

  if (loading) return <LoadingState message="Cargando importaciones..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Importaciones"
        description="Historial de importaciones masivas de datos."
        action={<button className="button button--primary" onClick={() => navigate('/imports/new')}>Nueva importación</button>}
      />
      {error && <ErrorMessage message={error} />}
      {actionError && <ErrorMessage message={actionError} />}

      {batches.length === 0 ? (
        <EmptyState title="Sin importaciones" message="No hay importaciones registradas. Comenzá con una nueva importación." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Archivo</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Válidas</th>
                <th>Errores</th>
                <th>Importadas</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontSize: '0.85em' }}>{b.batchNumber}</td>
                  <td>{TYPE_LABELS[b.type] ?? b.type}</td>
                  <td style={{ fontSize: '0.85em', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.fileName}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[b.status] ?? 'badge--default'}`}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </td>
                  <td>{b.totalRows}</td>
                  <td>{b.validRows}</td>
                  <td style={{ color: b.errorsCount > 0 ? 'var(--color-danger, #dc2626)' : undefined }}>{b.errorsCount}</td>
                  <td>{b.importedRows}</td>
                  <td><DateDisplay value={b.createdAt} /></td>
                  <td className="actions">
                    <button className="button button--small" onClick={() => navigate(`/imports/${b._id}`)}>Ver</button>
                    {b.status === 'uploaded' && (
                      <button className="button button--small button--secondary" onClick={() => handleValidate(b)}>Validar</button>
                    )}
                    {b.status === 'validated' && b.invalidRows === 0 && (
                      <button className="button button--small button--primary" onClick={() => handleExecute(b)}>Ejecutar</button>
                    )}
                    {['uploaded', 'validated', 'validation_failed'].includes(b.status) && (
                      <button className="button button--small button--danger" onClick={() => handleCancel(b)}>Cancelar</button>
                    )}
                    {!['importing', 'completed', 'completed_with_warnings'].includes(b.status) && (
                      <button className="button button--small button--danger" onClick={() => handleRemove(b)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
