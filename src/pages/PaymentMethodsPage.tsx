import { useEffect, useState } from 'react';
import { paymentMethodConfigsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { PaymentMethodConfig, PaymentRequestMethod } from '../types';
import { paymentRequestMethodLabels } from '../utils/labels';

const emptyForm: Partial<PaymentMethodConfig> = {
  type: 'bank_transfer',
  name: '',
  enabled: true,
  isDefault: false,
  currency: 'ARS',
};

export function PaymentMethodsPage(): React.ReactElement {
  const [items, setItems] = useState<PaymentMethodConfig[]>([]);
  const [editing, setEditing] = useState<Partial<PaymentMethodConfig> | null>(null);
  const [removing, setRemoving] = useState<PaymentMethodConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await paymentMethodConfigsApi.list();
      setItems(data.paymentMethodConfigs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los medios de pago.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: Partial<PaymentMethodConfig> = {
      type: String(form.get('type') || 'bank_transfer') as PaymentRequestMethod,
      name: String(form.get('name') || ''),
      currency: String(form.get('currency') || 'ARS'),
      bankName: String(form.get('bankName') || ''),
      accountHolder: String(form.get('accountHolder') || ''),
      cbu: String(form.get('cbu') || ''),
      alias: String(form.get('alias') || ''),
      accountNumber: String(form.get('accountNumber') || ''),
      cuit: String(form.get('cuit') || ''),
      instructions: String(form.get('instructions') || ''),
      mercadoPagoPublicKey: String(form.get('mercadoPagoPublicKey') || ''),
      enabled: form.get('enabled') === 'on',
      isDefault: form.get('isDefault') === 'on',
    };
    try {
      setSaving(true);
      if (editing?._id) await paymentMethodConfigsApi.update(editing._id, payload);
      else await paymentMethodConfigsApi.create(payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el medio de pago.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(): Promise<void> {
    if (!removing) return;
    try {
      setSaving(true);
      await paymentMethodConfigsApi.remove(removing._id);
      setRemoving(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el medio de pago.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Medios de pago" description="Datos visibles para compradores al informar pagos." action={<button className="button" type="button" onClick={() => setEditing(emptyForm)}>Nuevo medio</button>} />
      <ErrorMessage message={error} />
      <DataTable rows={items} getRowKey={(item) => item._id} emptyTitle="No hay medios de pago configurados." columns={[
        { key: 'name', header: 'Nombre', render: (item) => item.name },
        { key: 'type', header: 'Tipo', render: (item) => paymentRequestMethodLabels[item.type] },
        { key: 'bank', header: 'Banco/Alias', render: (item) => item.type === 'bank_transfer' ? `${item.bankName || '-'} / ${item.alias || '-'}` : '-' },
        { key: 'currency', header: 'Moneda', render: (item) => item.currency || 'ARS' },
        { key: 'enabled', header: 'Estado', render: (item) => <StatusBadge label={item.enabled ? 'Habilitado' : 'Deshabilitado'} tone={item.enabled ? 'success' : 'warning'} /> },
        { key: 'default', header: 'Predeterminado', render: (item) => item.isDefault ? <StatusBadge label="Predeterminado" tone="info" /> : '-' },
        { key: 'actions', header: 'Acciones', render: (item) => <div className="row-actions"><button className="link-button" type="button" onClick={() => setEditing(item)}>Editar</button><button className="text-danger" type="button" onClick={() => setRemoving(item)}>Eliminar</button></div> },
      ]} />
      {editing ? <PaymentMethodModal value={editing} saving={saving} onSubmit={submit} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog open={Boolean(removing)} title="Eliminar medio de pago" message="El medio dejara de estar disponible para compradores." danger confirmLabel={saving ? 'Eliminando...' : 'Eliminar'} onConfirm={() => { void remove(); }} onCancel={() => setRemoving(null)} />
    </>
  );
}

function PaymentMethodModal({ value, saving, onSubmit, onClose }: { value: Partial<PaymentMethodConfig>; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal modal--wide" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>{value._id ? 'Editar medio de pago' : 'Nuevo medio de pago'}</h2>
        <label>Tipo<select name="type" defaultValue={value.type || 'bank_transfer'}><option value="bank_transfer">Transferencia bancaria</option><option value="cash">Efectivo</option><option value="mercado_pago">Mercado Pago</option><option value="other">Otro</option></select></label>
        <label>Nombre visible<input name="name" defaultValue={value.name || ''} required /></label>
        <label>Moneda<input name="currency" defaultValue={value.currency || 'ARS'} /></label>
        <label>Banco<input name="bankName" defaultValue={value.bankName || ''} /></label>
        <label>Titular<input name="accountHolder" defaultValue={value.accountHolder || ''} /></label>
        <label>CUIT/CUIL<input name="cuit" defaultValue={value.cuit || ''} /></label>
        <label>CBU/CVU<input name="cbu" defaultValue={value.cbu || ''} /></label>
        <label>Alias<input name="alias" defaultValue={value.alias || ''} /></label>
        <label>Numero de cuenta<input name="accountNumber" defaultValue={value.accountNumber || ''} /></label>
        <label>Public key Mercado Pago<input name="mercadoPagoPublicKey" defaultValue={value.mercadoPagoPublicKey || ''} /></label>
        <label className="span-2">Instrucciones<textarea name="instructions" defaultValue={value.instructions || ''} rows={3} /></label>
        <label><input name="enabled" type="checkbox" defaultChecked={value.enabled !== false} /> Habilitado</label>
        <label><input name="isDefault" type="checkbox" defaultChecked={Boolean(value.isDefault)} /> Predeterminado</label>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
      </form>
    </div>
  );
}
