import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { suppliersApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Supplier, SupplierCategory } from '../types';
import { supplierCategoryLabels } from '../utils/labels';

export function SupplierFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Partial<Supplier>>({ category: 'other' });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load(): Promise<void> {
      try {
        const data = await suppliersApi.get(id!);
        setSupplier(data.supplier);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el proveedor.');
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
      businessName: String(form.get('businessName') || ''),
      documentType: String(form.get('documentType') || ''),
      documentNumber: String(form.get('documentNumber') || ''),
      taxId: String(form.get('taxId') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      address: String(form.get('address') || ''),
      contactName: String(form.get('contactName') || ''),
      category: String(form.get('category') || 'other') as SupplierCategory,
      notes: String(form.get('notes') || ''),
    };
    if (!payload.name) {
      setError('El nombre del proveedor es obligatorio.');
      return;
    }
    try {
      setSaving(true);
      if (id) await suppliersApi.update(id, payload);
      else await suppliersApi.create(payload);
      navigate('/suppliers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el proveedor.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={id ? 'Editar proveedor' : 'Nuevo proveedor'} />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label>Nombre *<input name="name" defaultValue={supplier.name || ''} required /></label>
          <label>Razón social<input name="businessName" defaultValue={supplier.businessName || ''} /></label>
          <label>Tipo documento<input name="documentType" defaultValue={supplier.documentType || ''} placeholder="DNI / Pasaporte" /></label>
          <label>Número documento<input name="documentNumber" defaultValue={supplier.documentNumber || ''} /></label>
          <label>CUIT<input name="taxId" defaultValue={supplier.taxId || ''} /></label>
          <label>Email<input name="email" type="email" defaultValue={supplier.email || ''} /></label>
          <label>Teléfono<input name="phone" defaultValue={supplier.phone || ''} /></label>
          <label>Dirección<input name="address" defaultValue={supplier.address || ''} /></label>
          <label>Contacto<input name="contactName" defaultValue={supplier.contactName || ''} /></label>
          <label>Categoría
            <select name="category" defaultValue={supplier.category || 'other'}>
              {(Object.entries(supplierCategoryLabels) as [string, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="form-full">Notas<textarea name="notes" defaultValue={supplier.notes || ''} rows={3} /></label>
        </div>
        <div className="form-actions">
          <Link to="/suppliers" className="btn btn--secondary">Cancelar</Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
