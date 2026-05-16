import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { reportsApi } from '../api/services';

interface CommercialData {
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  quotationsByStatus: Record<string, number>;
  reservationsByStatus: Record<string, number>;
  salesByStatus: Record<string, number>;
  totalLeads: number;
  totalQuotations: number;
  totalReservations: number;
  totalSales: number;
  conversionLeadToQuotation: number;
  conversionQuotationToReservation: number;
  conversionReservationToSale: number;
  avgDaysLeadToSale: number | null;
}

const leadStatusLabels: Record<string, string> = {
  new: 'Nuevo', contacted: 'Contactado', interested: 'Interesado', visited: 'Visitó',
  quoted: 'Cotizado', reservation_pending: 'Reserva pendiente', reserved: 'Reservado',
  converted: 'Convertido', lost: 'Perdido',
};

const leadSourceLabels: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', website: 'Sitio web',
  referral: 'Referido', sign: 'Cartel', real_estate_agent: 'Inmobiliaria', marketplace: 'Marketplace', other: 'Otro',
};

function StatusTable({ data, labels }: { data: Record<string, number>; labels: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) return <p className="text-muted">Sin datos.</p>;
  return (
    <table className="simple-table">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k}>
            <td>{labels[k] ?? k}</td>
            <td className="text-right"><strong>{v}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportCommercialPage(): React.ReactElement {
  const [data, setData] = useState<CommercialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  function load() {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    void (async () => {
      try {
        const res = await reportsApi.commercial(params);
        setData((res as { data: CommercialData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte comercial.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando reporte comercial..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte comercial" description="Indicadores de leads, cotizaciones, reservas y ventas." />

      <div className="filter-bar">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
        <button className="button button--primary" onClick={load}>Actualizar</button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!data ? (
        <EmptyState title="Sin datos" message="No hay datos para el período seleccionado." />
      ) : (
        <div className="report-grid">
          <div className="report-card">
            <h3>Tasas de conversión</h3>
            <table className="simple-table">
              <tbody>
                <tr><td>Lead → Cotización</td><td className="text-right"><strong>{data.conversionLeadToQuotation}%</strong></td></tr>
                <tr><td>Cotización → Reserva</td><td className="text-right"><strong>{data.conversionQuotationToReservation}%</strong></td></tr>
                <tr><td>Reserva → Venta</td><td className="text-right"><strong>{data.conversionReservationToSale}%</strong></td></tr>
                <tr><td>Tiempo promedio lead → venta</td><td className="text-right"><strong>{data.avgDaysLeadToSale !== null ? `${data.avgDaysLeadToSale} días` : 'N/D'}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Totales</h3>
            <table className="simple-table">
              <tbody>
                <tr><td>Interesados</td><td className="text-right"><strong>{data.totalLeads}</strong></td></tr>
                <tr><td>Cotizaciones</td><td className="text-right"><strong>{data.totalQuotations}</strong></td></tr>
                <tr><td>Reservas</td><td className="text-right"><strong>{data.totalReservations}</strong></td></tr>
                <tr><td>Ventas</td><td className="text-right"><strong>{data.totalSales}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Interesados por estado</h3>
            <StatusTable data={data.leadsByStatus} labels={leadStatusLabels} />
          </div>

          <div className="report-card">
            <h3>Interesados por origen</h3>
            <StatusTable data={data.leadsBySource} labels={leadSourceLabels} />
          </div>

          <div className="report-card">
            <h3>Ventas por estado</h3>
            <StatusTable data={data.salesByStatus} labels={{ active: 'Activa', completed: 'Completada', cancelled: 'Cancelada', draft: 'Borrador', pending_down_payment: 'Anticipo pendiente', rescinded: 'Rescindida' }} />
          </div>
        </div>
      )}
    </div>
  );
}
