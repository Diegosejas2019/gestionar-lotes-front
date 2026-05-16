import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buyersApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Buyer } from '../types';

export function BuyerFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<Partial<Buyer>>({ documentType: 'DNI' });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load(): Promise<void> {
      try {
        const data = await buyersApi.get(id!);
        setBuyer(data.buyer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el comprador.');
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
      firstName: String(form.get('firstName') || ''),
      lastName: String(form.get('lastName') || ''),
      documentType: String(form.get('documentType') || 'DNI'),
      documentNumber: String(form.get('documentNumber') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      address: String(form.get('address') || ''),
      taxId: String(form.get('taxId') || ''),
      notes: String(form.get('notes') || ''),
    };
    if (!payload.firstName || !payload.lastName || !payload.documentNumber) {
      setError('Completá nombre, apellido y documento.');
      return;
    }
    try {
      setSaving(true);
      if (id) await buyersApi.update(id, payload);
      else await buyersApi.create(payload);
      navigate('/buyers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el comprador.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar comprador' : 'Nuevo comprador'} action={<Link className="button button--ghost" to="/buyers">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="form-grid panel" onSubmit={(event) => { void handleSubmit(event); }}>
        <label>Nombre<input name="firstName" defaultValue={buyer.firstName || ''} required /></label>
        <label>Apellido<input name="lastName" defaultValue={buyer.lastName || ''} required /></label>
        <label>Tipo documento<input name="documentType" defaultValue={buyer.documentType || 'DNI'} /></label>
        <label>Número documento<input name="documentNumber" defaultValue={buyer.documentNumber || ''} required /></label>
        <label>Email<input name="email" type="email" defaultValue={buyer.email || ''} /></label>
        <label>Teléfono<input name="phone" defaultValue={buyer.phone || ''} /></label>
        <label>Dirección<input name="address" defaultValue={buyer.address || ''} /></label>
        <label>CUIT/CUIL<input name="taxId" defaultValue={buyer.taxId || ''} /></label>
        <label className="span-2">Notas<textarea name="notes" defaultValue={buyer.notes || ''} rows={4} /></label>
        <div className="form-actions span-2"><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
      </form>
    </>
  );
}
