import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { canLogin, type LoginErrors } from './auth';
import './Login.css';

type LoginProps = {
  onSuccess?: () => void;
};

export default function Login({ onSuccess }: LoginProps): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const redirect = (): void => {
    if (typeof onSuccess === 'function') {
      onSuccess();
    } else {
      navigate('/calendar');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const res = canLogin(email, password);
    setErrors(res.errors);
    if (!res.ok) return;
    redirect();
  };

  return (
    <section className="card" aria-labelledby="loginTitle">
      <div className="head">
        <div className="title" id="loginTitle">Sign in</div>
        <div className="muted">Welcome back</div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setErrors((prev) => {
                  if (!prev.email && !prev.auth) return prev;
                  const next = { ...prev };
                  delete next.email;
                  delete next.auth;
                  return next;
                });
              }}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className={`error ${errors.email ? 'show' : ''}`} id="emailError" role="alert">
            {errors.email ?? ''}
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setErrors((prev) => {
                  if (!prev.password && !prev.auth) return prev;
                  const next = { ...prev };
                  delete next.password;
                  delete next.auth;
                  return next;
                });
              }}
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-pass"
              aria-label="Toggle password visibility"
              onClick={() => setShowPass((s) => !s)}
            >
              👁
            </button>
          </div>
          <div className={`error ${errors.password ? 'show' : ''}`} id="passError" role="alert">
            {errors.password ?? ''}
          </div>
        </div>

        {errors.auth && (
          <div className="error show" id="authError" role="alert">
            {errors.auth}
          </div>
        )}

        <div className="row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
            />
            {' '}
            Remember me
          </label>
          <Link className="link" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <div className="actions">
          <button className="btn primary" type="submit">Sign in</button>
        </div>

        <div className="account-footer">
          <span className="muted">New here?</span>
          <Link className="link" to="/register">Create an account</Link>
        </div>
      </form>
    </section>
  );
}
