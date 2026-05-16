import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { DateDisplay } from '../components/DateDisplay';
import { importsApi } from '../api/services';
import type { ImportBatch, ImportRow, ImportStatus } from '../types';

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

const ROW_STATUS_LABELS: Record<string, string> = {
  valid: 'Válida', invalid: 'Con errores', imported: 'Importada',
  skipped: 'Omitida', duplicated: 'Duplicado', failed: 'Fallida',
};
const ROW_STATUS_CLASS: Record<string, string> = {
  valid: 'badge--success', invalid: 'badge--danger', imported: 'badge--success',
  skipped: 'badge--default', duplicated: 'badge--warning', failed: 'badge--danger',
};

export function ImportDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rowFilter, setRowFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [batchRes, rowsRes] = await Promise.all([
        importsApi.get(id),
        importsApi.getRows(id, { ...(rowFilter && { status: rowFilter }), page: String(page), limit: '50' }),
      ]);
      setBatch(batchRes.batch);
      setRows(rowsRes.rows);
      setTotal(rowsRes.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la importación.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id, rowFilter, page]);

  async function handleValidate() {
    if (!id) return;
    setActionLoading(true);
    try {
      await importsApi.validate(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al validar.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExecute() {
    if (!id || !confirmed) return;
    if (!confirm('¿Ejecutar la importación? Esta acción creará datos en el sistema.')) return;
    setActionLoading(true);
    try {
      await importsApi.execute(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al ejecutar.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    if (!confirm('¿Cancelar esta importación?')) return;
    setActionLoading(true);
    try {
      await importsApi.cancel(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cancelar.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingState message="Cargando importación..." />;
  if (!batch) return <ErrorMessage message="Importación no encontrada." />;

  const canValidate = batch.status === 'uploaded';
  const canExecute = batch.status === 'validated' && batch.invalidRows === 0;
  const canCancel = ['uploaded', 'validated', 'validation_failed'].includes(batch.status);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="page-container">
      <PageHeader
        title={`Importación ${batch.batchNumber}`}
        description={`${TYPE_LABELS[batch.type] ?? batch.type} · ${STATUS_LABELS[batch.status] ?? batch.status}`}
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canValidate && <button className="button button--secondary" onClick={handleValidate} disabled={actionLoading}>Validar</button>}
            {canCancel && <button className="button button--danger" onClick={handleCancel} disabled={actionLoading}>Cancelar</button>}
          </div>
        }
      />
      {error && <ErrorMessage message={error} />}

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: batch.totalRows },
          { label: 'Válidas', value: batch.validRows, color: '#16a34a' },
          { label: 'Errores', value: batch.errorsCount, color: batch.errorsCount > 0 ? '#dc2626' : undefined },
          { label: 'Advertencias', value: batch.warningsCount, color: batch.warningsCount > 0 ? '#d97706' : undefined },
          { label: 'Importadas', value: batch.importedRows },
          { label: 'Omitidas', value: batch.skippedRows },
          { label: 'Duplicadas', value: batch.duplicatedRows },
        ].map((s) => (
          <div key={s.label} className="report-card" style={{ textAlign: 'center', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8em', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <strong>Archivo:</strong> {batch.fileName} &nbsp;|&nbsp;
        <strong>Fecha:</strong> <DateDisplay value={batch.createdAt} /> &nbsp;|&nbsp;
        <strong>Modo:</strong> {batch.mode === 'dry_run' ? 'Simulación' : 'Ejecución real'}
      </div>

      {/* Ejecutar */}
      {canExecute && (
        <div className="report-card" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            Confirmé que revisé los datos y estoy de acuerdo con importarlos.
          </label>
          <button className="button button--primary" onClick={handleExecute} disabled={!confirmed || actionLoading}>
            {actionLoading ? 'Ejecutando...' : 'Ejecutar importación'}
          </button>
        </div>
      )}

      {/* Tabla de filas */}
      <h3 style={{ marginBottom: '0.5rem' }}>Filas ({total})</h3>
      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['', 'valid', 'invalid', 'imported', 'skipped', 'duplicated', 'failed'].map((s) => (
          <button
            key={s}
            className={`button button--small ${rowFilter === s ? 'button--primary' : ''}`}
            onClick={() => { setRowFilter(s); setPage(1); }}
          >
            {s ? (ROW_STATUS_LABELS[s] ?? s) : 'Todas'}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p style={{ color: '#64748b' }}>No hay filas con el filtro seleccionado.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="simple-table" style={{ fontSize: '0.82em' }}>
            <thead>
              <tr><th>#</th><th>Estado</th><th>Acción</th><th>Errores / Advertencias</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.rowNumber}</td>
                  <td><span className={`badge ${ROW_STATUS_CLASS[r.status] ?? 'badge--default'}`}>{ROW_STATUS_LABELS[r.status] ?? r.status}</span></td>
                  <td>{r.action ?? '—'}</td>
                  <td>
                    {[...r.errors, ...(r.warnings || [])].map((e, i) => (
                      <div key={i} style={{ color: 'severity' in e && e.severity === 'error' ? '#dc2626' : '#d97706' }}>
                        {'field' in e && e.field ? <strong>{e.field}: </strong> : null}{e.message}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="button button--small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
              <span style={{ lineHeight: '2' }}>Pág. {page} / {totalPages}</span>
              <button className="button button--small" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      )}

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button className="button" onClick={() => navigate('/imports')}>Volver a importaciones</button>
      </div>
    </div>
  );
}
