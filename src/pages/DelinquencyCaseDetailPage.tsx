import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { delinquencyCasesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, DelinquencyAction, DelinquencyActionType, DelinquencyCase, DelinquencySeverity, DelinquencyStatus } from '../types';
import { delinquencyActionTypeLabels, delinquencySeverityLabels, delinquencyStatusLabels } from '../utils/labels';

function statusTone(status: DelinquencyStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'resolved') return 'success';
  if (status === 'cancelled') return 'neutral';
  if (status === 'in_legal_review' || status === 'rescission_process') return 'danger';
  if (status === 'notified') return 'warning';
  return 'info';
}

function severityTone(severity: DelinquencySeverity): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (severity === 'critical') return 'danger';
  if (severity === 'high') return 'warning';
  if (severity === 'medium') return 'info';
  return 'neutral';
}

const ACTION_TYPES: DelinquencyActionType[] = ['call', 'whatsapp', 'email', 'note', 'payment_promise', 'notice_sent', 'legal_notice', 'agreement_created', 'agreement_signed', 'legal_review_started', 'rescission_started', 'case_resolved'];

export function DelinquencyCaseDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<DelinquencyCase | null>(null);
  const [actions, setActions] = useState<DelinquencyAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const [actionDialog, setActionDialog] = useState(false);
  const [actionForm, setActionForm] = useState({ type: 'call' as DelinquencyActionType, title: '', description: '', actionDate: new Date().toISOString().slice(0, 10), nextActionDate: '' });
  const [resolveDialog, setResolveDialog] = useState(false);
  const [resolveForm, setResolveForm] = useState({ reason: '', resolutionType: 'paid' });
  const [legalReviewDialog, setLegalReviewDialog] = useState(false);
  const [rescissionDialog, setRescissionDialog] = useState(false);
  const [rescissionReason, setRescissionReason] = useState('');
  const [generating, setGenerating] = useState('');

  async function load(): Promise<void> {
    try {
      const [cd, ad] = await Promise.all([
        delinquencyCasesApi.get(id!),
        delinquencyCasesApi.getActions(id!),
      ]);
      setCaseData(cd.delinquencyCase);
      setActions(ad.actions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el caso de mora.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function addAction(): Promise<void> {
    try {
      await delinquencyCasesApi.addAction(id!, actionForm);
      setActionDialog(false);
      setActionForm({ type: 'call', title: '', description: '', actionDate: new Date().toISOString().slice(0, 10), nextActionDate: '' });
      await load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'No se pudo guardar la acción.');
    }
  }

  async function resolve(): Promise<void> {
    try {
      await delinquencyCasesApi.resolve(id!, resolveForm);
      setResolveDialog(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo resolver el caso.');
    }
  }

  async function startLegalReview(): Promise<void> {
    try {
      await delinquencyCasesApi.startLegalReview(id!);
      setLegalReviewDialog(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar revisión legal.');
    }
  }

  async function startRescission(): Promise<void> {
    if (!rescissionReason.trim()) { setError('El motivo es obligatorio.'); return; }
    try {
      await delinquencyCasesApi.startRescission(id!, { reason: rescissionReason });
      setRescissionDialog(false);
      setRescissionReason('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la rescisión.');
    }
  }

  async function generateDoc(type: 'payment' | 'legal'): Promise<void> {
    setGenerating(type);
    try {
      if (type === 'payment') await delinquencyCasesApi.generatePaymentNotice(id!);
      else await delinquencyCasesApi.generateLegalNotice(id!);
      setActionMsg('Documento generado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el documento.');
    } finally {
      setGenerating('');
    }
  }

  if (loading) return <LoadingState />;
  if (!caseData) return <ErrorMessage message="Caso no encontrado." />;

  const c = caseData;
  const canActOnCase = !['resolved', 'cancelled'].includes(c.status);

  return (
    <div>
      <PageHeader title={`Caso de mora ${c.caseNumber}`} />
      {error && <ErrorMessage message={error} />}

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Estado del caso</h3>
          <dl className="detail-list">
            <dt>Estado</dt><dd><StatusBadge label={delinquencyStatusLabels[c.status]} tone={statusTone(c.status)} /></dd>
            <dt>Severidad</dt><dd><StatusBadge label={delinquencySeverityLabels[c.severity]} tone={severityTone(c.severity)} /></dd>
            <dt>Primer vencimiento</dt><dd><DateDisplay value={c.firstOverdueDate} /></dd>
            <dt>Cuotas vencidas</dt><dd>{c.overdueInstallmentsCount}</dd>
            <dt>Último contacto</dt><dd><DateDisplay value={c.lastContactDate} /></dd>
            <dt>Próxima acción</dt><dd><DateDisplay value={c.nextActionDate} /></dd>
          </dl>
        </div>

        <div className="detail-card">
          <h3>Deuda vencida</h3>
          {(['ARS', 'USD'] as Currency[]).map((cur) => (
            (c.overdueAmountByCurrency[cur] ?? 0) > 0 && (
              <div key={cur} className="amount-row">
                <span>{cur}:</span>
                <strong><CurrencyAmount amount={c.overdueAmountByCurrency[cur]!} currency={cur} /></strong>
              </div>
            )
          ))}
          <h3 style={{ marginTop: 16 }}>Saldo pendiente total</h3>
          {(['ARS', 'USD'] as Currency[]).map((cur) => (
            (c.totalPendingBalanceByCurrency[cur] ?? 0) > 0 && (
              <div key={cur} className="amount-row">
                <span>{cur}:</span>
                <strong><CurrencyAmount amount={c.totalPendingBalanceByCurrency[cur]!} currency={cur} /></strong>
              </div>
            )
          ))}
        </div>
      </div>

      {canActOnCase && (
        <div className="action-bar">
          <button className="btn btn--secondary" onClick={() => setActionDialog(true)}>+ Agregar acción</button>
          <button className="btn btn--secondary" onClick={() => generateDoc('payment')} disabled={generating === 'payment'}>Aviso de deuda PDF</button>
          <button className="btn btn--secondary" onClick={() => generateDoc('legal')} disabled={generating === 'legal'}>Intimación PDF</button>
          <Link to={`/refinancing-agreements/new?delinquencyCaseId=${c._id}&saleId=${typeof c.saleId === 'string' ? c.saleId : ''}`} className="btn btn--secondary">Crear refinanciación</Link>
          {c.status !== 'in_legal_review' && c.status !== 'rescission_process' && (
            <button className="btn btn--warning" onClick={() => setLegalReviewDialog(true)}>Iniciar revisión legal</button>
          )}
          {c.status !== 'rescission_process' && (
            <button className="btn btn--danger" onClick={() => setRescissionDialog(true)}>Iniciar rescisión</button>
          )}
          <button className="btn btn--primary" onClick={() => setResolveDialog(true)}>Resolver caso</button>
        </div>
      )}
      {actionMsg && <div className="alert alert--success">{actionMsg}</div>}

      <section className="section">
        <h2>Historial de acciones</h2>
        <DataTable
          columns={[
            { key: 'date', header: 'Fecha', render: (a) => <DateDisplay value={a.actionDate} /> },
            { key: 'type', header: 'Tipo', render: (a) => delinquencyActionTypeLabels[a.type] || a.type },
            { key: 'title', header: 'Título', render: (a) => a.title },
            { key: 'desc', header: 'Descripción', render: (a) => a.description || '-' },
            { key: 'next', header: 'Próxima acción', render: (a) => <DateDisplay value={a.nextActionDate} /> },
          ]}
          rows={actions}
          getRowKey={(a) => a._id}
          emptyTitle="Sin acciones registradas."
        />
      </section>

      {actionDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Agregar acción</h3>
            {actionMsg && <ErrorMessage message={actionMsg} />}
            <div className="form-group">
              <label>Tipo</label>
              <select value={actionForm.type} onChange={(e) => setActionForm((f) => ({ ...f, type: e.target.value as DelinquencyActionType }))}>
                {ACTION_TYPES.map((t) => <option key={t} value={t}>{delinquencyActionTypeLabels[t]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Título *</label>
              <input value={actionForm.title} onChange={(e) => setActionForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea value={actionForm.description} onChange={(e) => setActionForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Fecha de acción *</label>
              <input type="date" value={actionForm.actionDate} onChange={(e) => setActionForm((f) => ({ ...f, actionDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Próxima acción</label>
              <input type="date" value={actionForm.nextActionDate} onChange={(e) => setActionForm((f) => ({ ...f, nextActionDate: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--primary" onClick={addAction}>Guardar</button>
              <button className="btn btn--secondary" onClick={() => setActionDialog(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {resolveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Resolver caso</h3>
            <div className="form-group">
              <label>Tipo de resolución</label>
              <select value={resolveForm.resolutionType} onChange={(e) => setResolveForm((f) => ({ ...f, resolutionType: e.target.value }))}>
                <option value="paid">Deuda pagada</option>
                <option value="debt_cleared">Deuda saldada automáticamente</option>
                <option value="agreement_fulfilled">Acuerdo cumplido</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Motivo / notas</label>
              <textarea value={resolveForm.reason} onChange={(e) => setResolveForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--primary" onClick={resolve}>Resolver</button>
              <button className="btn btn--secondary" onClick={() => setResolveDialog(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {legalReviewDialog && (
        <ConfirmDialog
          open
          title="Iniciar revisión legal"
          message="Se marcará este caso y la venta asociada como 'En revisión legal'. Esta acción notifica al área legal para seguimiento. ¿Continuar?"
          onConfirm={startLegalReview}
          onCancel={() => setLegalReviewDialog(false)}
          danger
        />
      )}

      {rescissionDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Iniciar proceso de rescisión</h3>
            <p className="text--warning">Esta acción marcará la venta como 'En proceso de rescisión'. No implica rescisión automática.</p>
            <div className="form-group">
              <label>Motivo *</label>
              <textarea value={rescissionReason} onChange={(e) => setRescissionReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--danger" onClick={startRescission}>Iniciar rescisión</button>
              <button className="btn btn--secondary" onClick={() => setRescissionDialog(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
