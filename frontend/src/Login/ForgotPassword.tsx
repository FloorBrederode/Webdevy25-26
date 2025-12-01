import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from './auth';
import './Login.css';

export default function ForgotPassword(): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email.');
      return;
    }

    setSubmittedEmail(trimmedEmail);
    setSubmitted(true);
    // A real implementation would trigger an API call here.
  };

  return (
    <section className="card" aria-labelledby="forgotTitle">
      <div className="head">
        <div className="title" id="forgotTitle">Reset password</div>
        <div className="muted">
          {submitted
            ? 'If we find a matching account, we will email password reset instructions.'
            : 'Please enter your email and we will send you password reset instructions.'}
        </div>
      </div>

      {submitted ? (
        <>
          <div className="success" role="status">
            Check your inbox for a message about resetting the password for <strong>{submittedEmail}</strong>.
          </div>
          <div className="actions">
            <button
              className="btn primary"
              type="button"
              onClick={() => navigate('/login')}
            >
              Back to sign in
            </button>
          </div>
          <div className="account-footer">
            <span className="muted">Need to create an account?</span>
            <Link className="link" to="/register">Create account</Link>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="forgotEmail">Email</label>
            <div className="input-wrap">
              <input
                type="email"
                id="forgotEmail"
                name="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <div className="error show" role="alert">
                {error}
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn primary" type="submit">Send reset link</button>
          </div>
          <div className="account-footer">
            <span className="muted">Remembered your password?</span>
            <Link className="link" to="/login">Back to sign in</Link>
          </div>
        </form>
      )}
    </section>
  );
}
