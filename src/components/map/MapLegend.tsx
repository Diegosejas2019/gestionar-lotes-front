import React from 'react';

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  reservation_expiring: 'Reserva por vencer',
  sold: 'Vendido',
  sold_with_overdue: 'Vendido con mora',
  blocked: 'Bloqueado',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  available: '#16a34a',
  reserved: '#2563eb',
  reservation_expiring: '#f59e0b',
  sold: '#7c3aed',
  sold_with_overdue: '#dc2626',
  blocked: '#6b7280',
  cancelled: '#9ca3af',
};

export function MapLegend(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', padding: '0.5rem 0' }}>
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: STATUS_COLORS[key], display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />
          {label}
        </div>
      ))}
    </div>
  );
}
