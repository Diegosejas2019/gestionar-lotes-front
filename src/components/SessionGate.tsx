import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getToken, saveToken } from '../api/apiClient';

type SessionGateProps = {
  children: React.ReactNode;
};

export function SessionGate({ children }: SessionGateProps): React.ReactElement {
  const [token, setToken] = useState(getToken());
  const [draft, setDraft] = useState(token);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    saveToken(draft);
    setToken(draft.trim());
  }

  if (token) return <>{children}</>;

  return (
    <main className="session-page">
      <form className="session-card" onSubmit={handleSubmit}>
        <KeyRound size={32} aria-hidden="true" />
        <h1>Configurar sesión</h1>
        <p>Para operar GestionAr Lotes cargá un JWT válido con organización seleccionada.</p>
        <label>
          Token JWT
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} required />
        </label>
        <button className="button" type="submit">Guardar token</button>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
          <Link to="/legal/terms">Términos</Link>
          <Link to="/legal/privacy">Privacidad</Link>
          <Link to="/legal/cookies">Cookies</Link>
        </div>
      </form>
    </main>
  );
}
