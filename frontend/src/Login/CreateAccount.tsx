import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from './auth';
import './Login.css';
import './CreateAccount.css';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ErrorState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const defaultState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function CreateAccount(): React.ReactElement {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<ErrorState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('account-page');
    return () => document.body.classList.remove('account-page');
  }, []);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const nextErrors: ErrorState = {
      firstName: form.firstName.trim() ? '' : 'Please enter your first name.',
      lastName: form.lastName.trim() ? '' : 'Please enter your last name.',
      email: validateEmail(form.email) ? '' : 'Please enter a valid email.',
      password: form.password.length >= 6 ? '' : 'Password must be at least 6 characters.',
      confirmPassword:
        form.confirmPassword === form.password ? '' : 'Passwords do not match.',
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((err) => err === '');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!validate()) return;
    navigate('/login');
  };

  return (
    <section className="card account-card" aria-labelledby="createAccountTitle">
      <div className="head">
        <div className="title" id="createAccountTitle">Create account</div>
        <div className="muted">Start organising your schedule</div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <div className="input-wrap">
              <input
                type="text"
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange('firstName')}
                required
              />
            </div>
            {errors.firstName && <div className="error show">{errors.firstName}</div>}
          </div>

          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <div className="input-wrap">
              <input
                type="text"
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </div>
            {errors.lastName && <div className="error show">{errors.lastName}</div>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange('email')}
              required
            />
          </div>
          {errors.email && <div className="error show">{errors.email}</div>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange('password')}
              required
              minLength={6}
            />
          </div>
          {errors.password && <div className="error show">{errors.password}</div>}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="input-wrap">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
            />
          </div>
          {errors.confirmPassword && <div className="error show">{errors.confirmPassword}</div>}
        </div>

        <div className="actions">
          <button className="btn primary" type="submit">Create account</button>
        </div>
      </form>

      <div className="account-footer">
        <span className="muted">Already have an account?</span>
        <Link className="link" to="/login">Sign in</Link>
      </div>
    </section>
  );
}
