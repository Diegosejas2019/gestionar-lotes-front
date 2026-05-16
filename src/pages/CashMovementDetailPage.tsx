import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cashMovementsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CashAccount, CashMovement, Currency } from '../types';
import { movementCategoryLabels, movementStatusLabels, movementTypeLabels } from '../utils/labels';

function statusTone(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
}

export function CashMovementDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [movement, setMovement] = useState<CashMovement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<'confirm' | 'cancel' | null>(null);

  async function load(): Promise<void> {
    try {
      const data = await cashMovementsApi.get(id!);
      setMovement(data.cashMovement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el movimiento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function doAction(action: 'confirm' | 'cancel'): Promise<void> {
    try {
      if (action === 'confirm') await cashMovementsApi.confirm(id!);
      else await cashMovementsApi.cancel(id!);
      setConfirmDialog(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `No se pudo ${action === 'confirm' ? 'confirmar' : 'cancelar'} el movimiento.`);
      setConfirmDialog(null);
    }
  }

  if (loading) return <LoadingState />;
  if (!movement) return <ErrorMessage message={error || 'Movimiento no encontrado.'} />;

  const accountName = typeof movement.cashAccountId === 'object'
    ? (movement.cashAccountId as CashAccount).name
    : String(movement.cashAccountId);

  return (
    <div>
      <PageHeader title="Detalle del movimiento" action={<Link to="/cash-movements" className="btn btn--secondary">← Volver</Link>} />
      {error && <ErrorMessage message={error} />}
      <div className="detail-card">
        <div className="detail-row"><span>Caja</span><strong>{accountName}</strong></div>
        <div className="detail-row"><span>Tipo</span><strong>{movementTypeLabels[movement.type] || movement.type}</strong></div>
        <div className="detail-row"><span>Categoría</span><strong>{movementCategoryLabels[movement.category] || movement.category}</strong></div>
        <div className="detail-row"><span>Concepto</span><strong>{movement.concept}</strong></div>
        {movement.description && <div className="detail-row"><span>Descripción</span><strong>{movement.description}</strong></div>}
        <div className="detail-row"><span>Monto</span><strong><CurrencyAmount amount={movement.amount} currency={movement.currency as Currency} /></strong></div>
        <div className="detail-row"><span>Fecha</span><strong><DateDisplay value={movement.movementDate} /></strong></div>
        <div className="detail-row"><span>Estado</span><StatusBadge label={movementStatusLabels[movement.status] || movement.status} tone={statusTone(movement.status)} /></div>
        {movement.sourceType && <div className="detail-row"><span>Origen</span><strong>Pago de comprador</strong></div>}
        {movement.proofFileUrl && <div className="detail-row"><span>Comprobante</span><a href={movement.proofFileUrl} target="_blank" rel="noreferrer">Ver comprobante</a></div>}
      </div>
      <div className="detail-actions">
        {movement.status === 'draft' && (
          <button className="btn btn--primary" onClick={() => setConfirmDialog('confirm')}>Confirmar movimiento</button>
        )}
        {movement.status === 'confirmed' && !movement.sourceType && (
          <button className="btn btn--danger" onClick={() => setConfirmDialog('cancel')}>Cancelar movimiento</button>
        )}
      </div>
      {confirmDialog === 'confirm' && (
        <ConfirmDialog
          open
          title="Confirmar movimiento"
          message="¿Confirmar este movimiento? El saldo de la caja se actualizará."
          onConfirm={() => doAction('confirm')}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      {confirmDialog === 'cancel' && (
        <ConfirmDialog
          open
          title="Cancelar movimiento"
          message="¿Cancelar este movimiento? Si estaba confirmado, el saldo de la caja será revertido."
          onConfirm={() => doAction('cancel')}
          onCancel={() => setConfirmDialog(null)}
          danger
        />
      )}
    </div>
  );
}
