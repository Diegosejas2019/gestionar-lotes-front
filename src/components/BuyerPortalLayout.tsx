import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { CreditCard, FileText, Home, LogOut, ReceiptText, UserRound } from 'lucide-react';
import { clearToken, getToken } from '../api/apiClient';

const navItems = [
  { to: '/buyer/dashboard', label: 'Inicio', icon: Home },
  { to: '/buyer/sales', label: 'Mis compras', icon: ReceiptText },
  { to: '/buyer/payment-requests', label: 'Mis pagos', icon: CreditCard },
  { to: '/buyer/documents', label: 'Documentos', icon: FileText },
  { to: '/buyer/profile', label: 'Mi perfil', icon: UserRound },
];

export function BuyerPortalLayout(): React.ReactElement {
  const navigate = useNavigate();
  const token = getToken();

  if (!token) return <Navigate to="/buyer/login" replace />;

  function logout(): void {
    clearToken();
    navigate('/buyer/login', { replace: true });
  }

  return (
    <div className="buyer-shell">
      <aside className="buyer-sidebar">
        <div className="brand">
          <span className="brand-mark">GL</span>
          <div>
            <strong>Portal comprador</strong>
            <small>GestionAr Lotes</small>
          </div>
        </div>
        <nav className="nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <button type="button" className="buyer-nav-button" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesion
          </button>
        </nav>
      </aside>
      <main className="content buyer-content">
        <Outlet />
      </main>
    </div>
  );
}
