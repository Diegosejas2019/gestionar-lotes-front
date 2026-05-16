import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { migrationsApi } from '../api/services';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type {
  MigrationBatch,
  MigrationBatchStatus,
  MigrationExecuteConfig,
  MigrationPreviewResult,
  MigrationStatusResponse,
} from '../types';

const batchStatusLabels: Record<MigrationBatchStatus, string> = {
  draft: 'Borrador',
  simulated: 'Simulado',
  in_progress: 'En proceso',
  completed: 'Completado',
  completed_with_warnings: 'Completado con advertencias',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

function batchTone(s: MigrationBatchStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (s === 'completed') return 'success';
  if (s === 'failed') return 'danger';
  if (s === 'completed_with_warnings') return 'warning';
  if (s === 'in_progress') return 'info';
  return 'neutral';
}

function currentBillingPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function DevelopmentMigrationPage(): React.ReactElement {
  const { id: developmentId } = useParams<{ id: string }>();

  const [statusData, setStatusData] = useState<MigrationStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState('');

  const [config, setConfig] = useState<MigrationExecuteConfig>({
    targetOrganizationMode: 'create',
    targetGestionarOrganizationId: '',
    chargeCurrentMonth: true,
    startBillingPeriod: currentBillingPeriod(),
    allowPendingDebtMigration: false,
    pendingDebtOverrideReason: '',
  });

  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<MigrationPreviewResult | null>(null);
  const [previewBatch, setPreviewBatch] = useState<MigrationBatch | null>(null);
  const [previewError, setPreviewError] = useState('');

  const [confirmed, setConfirmed] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<MigrationBatch | null>(null);
  const [executeError, setExecuteError] = useState('');

  useEffect(() => {
    if (!developmentId) return;
    void (async () => {
      try {
        const data = await migrationsApi.status(developmentId);
        setStatusData(data);
      } catch (err) {
        setStatusError(err instanceof Error ? err.message : 'No se pudo cargar el estado de migración.');
      } finally {
        setStatusLoading(false);
      }
    })();
  }, [developmentId]);

  async function handlePreview() {
    if (!developmentId) return;
    setPreviewing(true);
    setPreviewError('');
    setPreviewData(null);
    setPreviewBatch(null);
    setConfirmed(false);
    setExecutionResult(null);
    try {
      const result = await migrationsApi.preview(developmentId, config);
      setPreviewData(result.preview);
      setPreviewBatch(result.migration);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'No se pudo completar la simulación.');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleExecute() {
    if (!developmentId || !confirmed) return;
    setExecuting(true);
    setExecuteError('');
    try {
      const result = await migrationsApi.execute(developmentId, config);
      setExecutionResult(result.migration);
      const refreshed = await migrationsApi.status(developmentId);
      setStatusData(refreshed);
    } catch (err) {
      setExecuteError(err instanceof Error ? err.message : 'No se pudo ejecutar la migración.');
    } finally {
      setExecuting(false);
    }
  }

  const hasBlockingErrors = previewData && previewData.blockingErrors.length > 0;

  if (statusLoading) return <LoadingState />;

  const dev = statusData?.development;

  return (
    <div>
      <PageHeader
        title={`Migración a GestionAr App${dev ? ` — ${dev.name}` : ''}`}
        action={<Link to="/migrations" className="btn btn--secondary">Historial de migraciones</Link>}
      />

      {statusError && <ErrorMessage message={statusError} />}

      {/* Estado actual */}
      {dev && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Estado actual del barrio</h3>
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem 1.5rem' }}>
            <div><dt>Barrio</dt><dd>{dev.name}</dd></div>
            <div>
              <dt>Estado de migración</dt>
              <dd><StatusBadge label={dev.migrationStatus || 'Sin migrar'} tone={dev.migrationStatus === 'completed' ? 'success' : dev.migrationStatus === 'failed' ? 'danger' : 'neutral'} /></dd>
            </div>
            {dev.gestionarOrganizationId && (
              <div><dt>Org en GestionAr App</dt><dd style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{dev.gestionarOrganizationId}</dd></div>
            )}
            {dev.migratedToGestionarAt && (
              <div><dt>Migrado el</dt><dd><DateDisplay value={dev.migratedToGestionarAt} /></dd></div>
            )}
            <div><dt>Ventas elegibles</dt><dd>{statusData?.eligibleSalesCount ?? '-'}</dd></div>
            <div><dt>Ventas omitidas</dt><dd>{statusData?.skippedSalesCount ?? '-'}</dd></div>
          </dl>

          {statusData?.lastBatch && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <strong>Última migración: </strong>
              <StatusBadge label={batchStatusLabels[statusData.lastBatch.status] || statusData.lastBatch.status} tone={batchTone(statusData.lastBatch.status)} />
              {' '}
              <Link to={`/migrations/${statusData.lastBatch._id}`}>Ver detalle →</Link>
            </div>
          )}
        </div>
      )}

      {/* Configuración */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Configuración de migración</h3>

        <div className="form-group">
          <label>Organización en GestionAr App</label>
          <select
            value={config.targetOrganizationMode}
            onChange={(e) => setConfig((c) => ({ ...c, targetOrganizationMode: e.target.value as 'create' | 'link_existing' }))}
          >
            <option value="create">Crear nueva organización</option>
            <option value="link_existing">Vincular a organización existente</option>
          </select>
        </div>

        {config.targetOrganizationMode === 'link_existing' && (
          <div className="form-group">
            <label>ID de organización existente en GestionAr App *</label>
            <input
              type="text"
              value={config.targetGestionarOrganizationId || ''}
              onChange={(e) => setConfig((c) => ({ ...c, targetGestionarOrganizationId: e.target.value }))}
              placeholder="Ej: org_abc123"
            />
          </div>
        )}

        <div className="form-group">
          <label>Período inicial de cobro (YYYY-MM)</label>
          <input
            type="month"
            value={config.startBillingPeriod || currentBillingPeriod()}
            onChange={(e) => setConfig((c) => ({ ...c, startBillingPeriod: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.chargeCurrentMonth ?? true}
              onChange={(e) => setConfig((c) => ({ ...c, chargeCurrentMonth: e.target.checked }))}
            />
            {' '}Cobrar mes en curso
          </label>
          <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>
            Si está marcado, el propietario paga desde el mes actual. Si no, desde el mes siguiente.
          </small>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.allowPendingDebtMigration ?? false}
              onChange={(e) => setConfig((c) => ({ ...c, allowPendingDebtMigration: e.target.checked, pendingDebtOverrideReason: e.target.checked ? c.pendingDebtOverrideReason : '' }))}
            />
            {' '}Migrar ventas con deuda pendiente
          </label>
        </div>

        {config.allowPendingDebtMigration && (
          <div className="form-group">
            <label>Motivo para migrar con deuda pendiente *</label>
            <input
              type="text"
              value={config.pendingDebtOverrideReason || ''}
              onChange={(e) => setConfig((c) => ({ ...c, pendingDebtOverrideReason: e.target.value }))}
              placeholder="Ej: Acuerdo de pago firmado fuera del sistema"
            />
          </div>
        )}

        <button
          className="btn btn--primary"
          onClick={() => void handlePreview()}
          disabled={previewing}
        >
          {previewing ? 'Simulando...' : 'Simular migración'}
        </button>
      </div>

      {/* Preview */}
      {previewError && <ErrorMessage message={previewError} />}

      {previewData && previewBatch && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Resultado de la simulación — {previewBatch.batchNumber}</h3>

          {previewData.blockingErrors.length > 0 && (
            <div style={{ background: 'var(--color-danger-bg, #fef2f2)', border: '1px solid var(--color-danger)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
              <strong>Errores bloqueantes — no se puede ejecutar la migración:</strong>
              <ul style={{ marginTop: '0.5rem' }}>
                {previewData.blockingErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {previewData.warnings.length > 0 && (
            <div style={{ background: 'var(--color-warning-bg, #fffbeb)', border: '1px solid var(--color-warning)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
              <strong>Advertencias:</strong>
              <ul style={{ marginTop: '0.5rem' }}>
                {previewData.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="stat-card"><strong>{previewData.eligibleSalesCount}</strong><span>Ventas elegibles</span></div>
            <div className="stat-card"><strong>{previewData.buyersCount}</strong><span>Compradores</span></div>
            <div className="stat-card"><strong>{previewData.lotsCount}</strong><span>Lotes</span></div>
            <div className="stat-card"><strong>{previewData.skippedCount}</strong><span>Omitidos</span></div>
          </div>

          <h4>Organización</h4>
          <p>
            <strong>{previewData.organization.name}</strong> —{' '}
            {previewData.organization.action === 'create' ? 'Se creará nueva organización' : `Se vinculará a ${previewData.organization.targetId}`}
          </p>

          {previewData.buyers.length > 0 && (
            <>
              <h4>Compradores ({previewData.buyers.length})</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Acción</th><th>Advertencias</th></tr>
                  </thead>
                  <tbody>
                    {previewData.buyers.map((b) => (
                      <tr key={b._id}>
                        <td>{b.name}</td>
                        <td>{b.documentNumber || '-'}</td>
                        <td>{b.email || '-'}</td>
                        <td>{b.action === 'create' ? 'Crear' : b.action === 'link_existing' ? 'Vincular' : b.action}</td>
                        <td>{b.warnings.length ? b.warnings.join('; ') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {previewData.lots.length > 0 && (
            <>
              <h4>Lotes ({previewData.lots.length})</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Lote</th><th>Manzana</th><th>Acción</th><th>Advertencias</th></tr>
                  </thead>
                  <tbody>
                    {previewData.lots.map((l) => (
                      <tr key={l._id}>
                        <td>{l.lotNumber}</td>
                        <td>{l.block || '-'}</td>
                        <td>{l.action === 'create' ? 'Crear' : l.action === 'link_existing' ? 'Vincular' : l.action}</td>
                        <td>{l.warnings.length ? l.warnings.join('; ') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {previewData.skippedSales.length > 0 && (
            <>
              <h4>Ventas omitidas ({previewData.skippedSales.length})</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Número</th><th>Estado</th><th>Motivo</th></tr>
                  </thead>
                  <tbody>
                    {previewData.skippedSales.map((s) => (
                      <tr key={s._id}>
                        <td>{s.saleNumber}</td>
                        <td>{s.status}</td>
                        <td>{s.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmación y ejecución */}
      {previewData && !hasBlockingErrors && !executionResult && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-warning)' }}>
          <h3>Confirmar ejecución</h3>
          <p style={{ marginBottom: '1rem' }}>
            Esta acción creará o vinculará datos en GestionAr App. La migración no eliminará datos de GestionAr Lotes.
            Verificá la simulación antes de continuar.
          </p>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span>Confirmé que revisé la simulación y quiero ejecutar la migración.</span>
          </label>
          <button
            className="btn btn--primary"
            onClick={() => void handleExecute()}
            disabled={!confirmed || executing}
          >
            {executing ? 'Ejecutando migración...' : 'Ejecutar migración'}
          </button>
          {executeError && <ErrorMessage message={executeError} />}
        </div>
      )}

      {/* Resultado de ejecución */}
      {executionResult && (
        <div className="card" style={{ borderLeft: `4px solid ${executionResult.status === 'completed' ? 'var(--color-success)' : executionResult.status === 'failed' ? 'var(--color-danger)' : 'var(--color-warning)'}` }}>
          <h3>Resultado de la migración</h3>
          <p>
            <StatusBadge label={batchStatusLabels[executionResult.status] || executionResult.status} tone={batchTone(executionResult.status)} />
          </p>
          {executionResult.summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', margin: '1rem 0' }}>
              <div className="stat-card"><strong>{executionResult.summary.created}</strong><span>Creados</span></div>
              <div className="stat-card"><strong>{executionResult.summary.linked}</strong><span>Vinculados</span></div>
              <div className="stat-card"><strong>{executionResult.summary.skipped}</strong><span>Omitidos</span></div>
              <div className="stat-card"><strong>{executionResult.summary.failed}</strong><span>Fallidos</span></div>
            </div>
          )}
          {executionResult.targetGestionarOrganizationId && (
            <p>Organización en GestionAr App: <code>{executionResult.targetGestionarOrganizationId}</code></p>
          )}
          <Link to={`/migrations/${executionResult._id}`} className="btn btn--secondary">
            Ver detalle completo →
          </Link>
        </div>
      )}
    </div>
  );
}
