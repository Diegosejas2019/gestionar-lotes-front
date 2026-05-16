import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cashAccountsApi, developmentsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { CashAccount, CashAccountType, Currency, Development } from '../types';
import { cashAccountTypeLabels } from '../utils/labels';

export function CashAccountFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Partial<CashAccount>>({ type: 'cash', currency: 'ARS', initialBalance: 0, enabled: true, isDefault: false });
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, accountData] = await Promise.all([
          developmentsApi.list(),
          id ? cashAccountsApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        if (accountData) setAccount(accountData.cashAccount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      type: String(form.get('type') || 'cash') as CashAccountType,
      currency: String(form.get('currency') || 'ARS') as Currency,
      initialBalance: Number(form.get('initialBalance') || 0),
      developmentId: String(form.get('developmentId') || '') || null,
      bankName: String(form.get('bankName') || ''),
      accountHolder: String(form.get('accountHolder') || ''),
      cbu: String(form.get('cbu') || ''),
      alias: String(form.get('alias') || ''),
      accountNumber: String(form.get('accountNumber') || ''),
      notes: String(form.get('notes') || ''),
      enabled: form.get('enabled') === 'on',
      isDefault: form.get('isDefault') === 'on',
    };
    if (!payload.name) {
      setError('El nombre de la caja es obligatorio.');
      return;
    }
    if (payload.initialBalance < 0) {
      setError('El saldo inicial no puede ser negativo.');
      return;
    }
    try {
      setSaving(true);
      if (id) await cashAccountsApi.update(id, payload);
      else await cashAccountsApi.create(payload);
      navigate('/cash-accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la caja.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={id ? 'Editar caja' : 'Nueva caja'} />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label>Nombre *<input name="name" defaultValue={account.name || ''} required /></label>
          <label>Tipo *
            <select name="type" defaultValue={account.type || 'cash'}>
              {(Object.entries(cashAccountTypeLabels) as [string, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label>Moneda *
            <select name="currency" defaultValue={account.currency || 'ARS'} disabled={Boolean(id)}>
              <option value="ARS">ARS — Pesos</option>
              <option value="USD">USD — Dólares</option>
            </select>
            {id && <small>No se puede cambiar la moneda si ya tiene movimientos confirmados.</small>}
          </label>
          <label>Saldo inicial
            <input name="initialBalance" type="number" min="0" step="0.01" defaultValue={account.initialBalance ?? 0} disabled={Boolean(id)} />
          </label>
          <label>Barrio asociado (opcional)
            <select name="developmentId" defaultValue={String(account.developmentId || '')}>
              <option value="">Sin barrio específico</option>
              {developments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </label>
          <label>Banco<input name="bankName" defaultValue={account.bankName || ''} /></label>
          <label>Titular<input name="accountHolder" defaultValue={account.accountHolder || ''} /></label>
          <label>CBU<input name="cbu" defaultValue={account.cbu || ''} /></label>
          <label>Alias<input name="alias" defaultValue={account.alias || ''} /></label>
          <label>Número de cuenta<input name="accountNumber" defaultValue={account.accountNumber || ''} /></label>
          <label className="form-full">Notas<textarea name="notes" defaultValue={account.notes || ''} rows={3} /></label>
          <label className="form-checkbox"><input name="enabled" type="checkbox" defaultChecked={account.enabled !== false} /> Habilitada</label>
          <label className="form-checkbox"><input name="isDefault" type="checkbox" defaultChecked={Boolean(account.isDefault)} /> Predeterminada para su moneda</label>
        </div>
        <div className="form-actions">
          <Link to="/cash-accounts" className="btn btn--secondary">Cancelar</Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
