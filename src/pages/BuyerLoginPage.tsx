import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, saveToken } from '../api/apiClient';

export function BuyerLoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(getToken());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    saveToken(draft);
    navigate('/buyer/dashboard', { replace: true });
  }

  return (
    <main className="session-page buyer-login-page">
      <form className="session-card" onSubmit={handleSubmit}>
        <KeyRound size={32} aria-hidden="true" />
        <h1>Acceso comprador</h1>
        <p>Ingresa el token JWT comprador provisto por la administracion.</p>
        <label>
          Token JWT
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} required />
        </label>
        <button className="button" type="submit">Ingresar al portal</button>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
          <Link to="/legal/terms">Términos</Link>
          <Link to="/legal/privacy">Privacidad</Link>
          <Link to="/legal/cookies">Cookies</Link>
        </div>
      </form>
    </main>
  );
}
