import React from 'react';

interface UnplacedLot {
  id: string | any;
  lotNumber: string;
  block: string;
  surface?: number;
  status?: string;
}

interface UnplacedLotsPanelProps {
  lots: UnplacedLot[];
}

export function UnplacedLotsPanel({ lots }: UnplacedLotsPanelProps): React.ReactElement {
  if (!lots.length) {
    return (
      <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: '0.85rem', color: '#15803d' }}>
        Todos los lotes tienen ubicación en el plano.
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem' }}>
        {lots.length} lote{lots.length !== 1 ? 's' : ''} sin ubicar en el plano
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lots.map((lot) => (
          <div key={String(lot.id)} style={{ padding: '4px 8px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 4, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Lote {lot.lotNumber}</strong>{lot.block ? ` — Mza. ${lot.block}` : ''}</span>
            {lot.surface && <span style={{ color: '#6b7280' }}>{lot.surface} m²</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
