import { LogIn } from 'lucide-react';
import { FormEvent, useState } from 'react';
import roqiaSymbol from '../../../favicon.png';

interface LoginViewProps {
  onLogin: (email: string, password: string) => { ok: true } | { ok: false; message: string };
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [message, setMessage] = useState('');
  const [loginForm, setLoginForm] = useState({ email: 'admin@roqia.com', password: 'admin123' });

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onLogin(loginForm.email, loginForm.password);
    if (!result.ok) {
      setMessage(result.message);
    }
  }

  return (
    <main className="login-shell app-shell" data-theme="dark">
      <section className="login-panel">
        <div className="login-brand">
          <img src={roqiaSymbol} alt="RoqIA" />
          <div>
            <strong>RoqIA CRM</strong>
            <span>Acesso operacional</span>
          </div>
        </div>

        <form className="form-stack" onSubmit={handleLogin}>
          <label>
            E-mail
            <input
              required
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
            />
          </label>
          <label>
            Senha
            <input
              required
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
          </label>
          <button className="primary-action" type="submit">
            <LogIn size={18} aria-hidden="true" />
            Entrar
          </button>
        </form>

        {message && <p className="login-error">{message}</p>}
      </section>
    </main>
  );
}
