import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { legalProcessesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { LegalProcess, LegalProcessStatus } from '../types';
import { legalProcessStatusLabels, legalProcessTypeLabels } from '../utils/labels';

function statusTone(status: LegalProcessStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'resolved') return 'success';
  if (status === 'cancelled') return 'neutral';
  if (status === 'in_progress') return 'info';
  if (status === 'waiting_response') return 'warning';
  return 'neutral';
}

export function LegalProcessDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [process, setProcess] = useState<LegalProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [resolveDialog, setResolveDialog] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    resolutionType: 'other',
    resolutionDate: new Date().toISOString().slice(0, 10),
    notes: '',
    releaseLot: false,
  });
  const [releaseLotConfirm, setReleaseLotConfirm] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [working, setWorking] = useState('');

  async function load(): Promise<void> {
    try {
      const data = await legalProcessesApi.get(id!);
      setProcess(data.legalProcess);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el proceso legal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function doResolve(): Promise<void> {
    const isRescission = process?.type === 'rescission' && resolveForm.resolutionType === 'rescission_completed' && resolveForm.releaseLot;
    if (isRescission) {
      setResolveDialog(false);
      setReleaseLotConfirm(true);
      return;
    }
    await submitResolve();
  }

  async function submitResolve(): Promise<void> {
    setReleaseLotConfirm(false);
    setResolveDialog(false);
    setWorking('resolve');
    try {
      await legalProcessesApi.resolve(id!, resolveForm);
      setMsg('Proceso resuelto correctamente.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo resolver el proceso.');
    } finally {
      setWorking('');
    }
  }

  async function cancel(): Promise<void> {
    setCancelDialog(false);
    setWorking('cancel');
    try {
      await legalProcessesApi.cancel(id!, { reason: cancelReason });
      setMsg('Proceso cancelado.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el proceso.');
    } finally {
      setWorking('');
    }
  }

  if (loading) return <LoadingState />;
  if (!process) return <ErrorMessage message="Proceso no encontrado." />;

  const p = process;
  const canResolve = !['resolved', 'cancelled'].includes(p.status);
  const canCancel = !['resolved', 'cancelled'].includes(p.status);

  return (
    <div>
      <PageHeader title={`Proceso legal ${p.processNumber}`} />
      {error && <ErrorMessage message={error} />}
      {msg && <div className="alert alert--success">{msg}</div>}

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Datos del proceso</h3>
          <dl className="detail-list">
            <dt>Estado</dt><dd><StatusBadge label={legalProcessStatusLabels[p.status]} tone={statusTone(p.status)} /></dd>
            <dt>Tipo</dt><dd>{legalProcessTypeLabels[p.type]}</dd>
            <dt>Inicio</dt><dd><DateDisplay value={p.startDate} /></dd>
            <dt>Motivo</dt><dd>{p.reason}</dd>
            {p.lawyerName && <><dt>Abogado</dt><dd>{p.lawyerName}</dd></>}
            {p.lawyerContact && <><dt>Contacto</dt><dd>{p.lawyerContact}</dd></>}
            {p.resolutionDate && <><dt>Fecha resolución</dt><dd><DateDisplay value={p.resolutionDate} /></dd></>}
            {p.resolutionType && <><dt>Tipo resolución</dt><dd>{p.resolutionType}</dd></>}
          </dl>
          {p.notes && <><h4>Notas</h4><p>{p.notes}</p></>}
        </div>
      </div>

      <div className="action-bar">
        {canResolve && <button className="btn btn--primary" onClick={() => setResolveDialog(true)} disabled={!!working}>Resolver proceso</button>}
        {canCancel && <button className="btn btn--danger" onClick={() => setCancelDialog(true)} disabled={!!working}>Cancelar proceso</button>}
      </div>

      {resolveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Resolver proceso</h3>
            <div className="form-group">
              <label>Tipo de resolución</label>
              <select value={resolveForm.resolutionType} onChange={(e) => setResolveForm((f) => ({ ...f, resolutionType: e.target.value }))}>
                <option value="other">Otro</option>
                <option value="paid">Deuda pagada</option>
                <option value="agreement">Acuerdo alcanzado</option>
                {p.type === 'rescission' && <option value="rescission_completed">Rescisión completada</option>}
                <option value="dismissed">Desestimado</option>
              </select>
            </div>
            {p.type === 'rescission' && resolveForm.resolutionType === 'rescission_completed' && (
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={resolveForm.releaseLot} onChange={(e) => setResolveForm((f) => ({ ...f, releaseLot: e.target.checked }))} />
                  {' '}Liberar lote (lo marcará como "disponible" y la venta como "rescindida")
                </label>
              </div>
            )}
            <div className="form-group">
              <label>Fecha de resolución</label>
              <input type="date" value={resolveForm.resolutionDate} onChange={(e) => setResolveForm((f) => ({ ...f, resolutionDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={resolveForm.notes} onChange={(e) => setResolveForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--primary" onClick={doResolve}>Confirmar resolución</button>
              <button className="btn btn--secondary" onClick={() => setResolveDialog(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {releaseLotConfirm && (
        <ConfirmDialog
          open
          title="Confirmar liberación del lote"
          message="¿Confirmar liberación del lote? El lote volverá a 'disponible' y la venta quedará 'rescindida'. Esta acción es irreversible."
          onConfirm={submitResolve}
          onCancel={() => setReleaseLotConfirm(false)}
          danger
        />
      )}

      {cancelDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cancelar proceso legal</h3>
            <div className="form-group">
              <label>Motivo</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--danger" onClick={cancel}>Cancelar proceso</button>
              <button className="btn btn--secondary" onClick={() => setCancelDialog(false)}>Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
