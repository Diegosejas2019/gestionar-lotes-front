import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Building, CreditCard, FileText, LayoutDashboard, Settings } from 'lucide-react';
import { SessionGate } from './SessionGate';
import { LegalAcceptanceGate } from './LegalAcceptanceGate';

const superAdminNavItems = [
  { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/super-admin/organizations', label: 'Organizaciones', icon: Building },
  { to: '/super-admin/plans', label: 'Planes', icon: Settings },
  { to: '/super-admin/payments', label: 'Pagos', icon: CreditCard },
  { to: '/super-admin/legal-documents', label: 'Documentos legales', icon: FileText },
];

export function SuperAdminLayout(): React.ReactElement {
  return (
    <SessionGate>
      <LegalAcceptanceGate>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark" style={{ background: '#7c3aed' }}>SA</span>
            <div>
              <strong>Super Admin</strong>
              <small>GestionAr Lotes</small>
            </div>
          </div>
          <nav className="nav">
            {superAdminNavItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">
          <Outlet />
        </main>
      </div>
      </LegalAcceptanceGate>
    </SessionGate>
  );
}
