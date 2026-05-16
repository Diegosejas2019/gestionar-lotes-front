import { useEffect, useState } from 'react';
import { buyerPortalApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { BuyerPortalProfile } from '../types';

export function BuyerProfilePage(): React.ReactElement {
  const [profile, setProfile] = useState<BuyerPortalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        setProfile(await buyerPortalApi.profile());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar tu perfil.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Mi perfil" description="Datos registrados por la administracion." />
      <ErrorMessage message={error} />
      <section className="panel profile-panel">
        <dl className="detail-list">
          <div><dt>Nombre</dt><dd>{profile?.primaryBuyer.firstName || '-'}</dd></div>
          <div><dt>Apellido</dt><dd>{profile?.primaryBuyer.lastName || '-'}</dd></div>
          <div><dt>Documento</dt><dd>{[profile?.primaryBuyer.documentType, profile?.primaryBuyer.documentNumber].filter(Boolean).join(' ') || '-'}</dd></div>
          <div><dt>Email</dt><dd>{profile?.primaryBuyer.email || '-'}</dd></div>
          <div><dt>Telefono</dt><dd>{profile?.primaryBuyer.phone || '-'}</dd></div>
          <div><dt>Organizacion</dt><dd>{profile?.organization?.name || '-'}</dd></div>
          <div><dt>Compras registradas</dt><dd>{profile?.salesCount || 0}</dd></div>
        </dl>
        <p className="info-box">Para modificar tus datos, comunicate con la administracion.</p>
      </section>
    </>
  );
}
