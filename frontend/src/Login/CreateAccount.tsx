import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ApiError,
  persistAuthSession,
  registerUser,
  validateEmail
} from './auth';
import './Login.css';
import './CreateAccount.css';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type ErrorState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  form: string;
};

const defaultState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

const defaultErrors: ErrorState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  form: '',
};

export default function CreateAccount(): React.ReactElement {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<ErrorState>(defaultErrors);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('account-page');
    return () => document.body.classList.remove('account-page');
  }, []);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '', form: '' }));
  };

  const validate = (): boolean => {
    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phoneNumber.trim();
    const phoneDigits = trimmedPhone.replace(/[^\d]/g, '');
    const phoneHasOnlyAllowedChars = trimmedPhone === '' || /^\+?[\d\s().-]+$/.test(trimmedPhone);
    const phoneValid = trimmedPhone === '' || (
      phoneHasOnlyAllowedChars &&
      phoneDigits.length >= 8 &&
      phoneDigits.length <= 15
    );

    const nextErrors: ErrorState = {
      firstName: trimmedFirst ? '' : 'Please enter your first name.',
      lastName: trimmedLast ? '' : 'Please enter your last name.',
      email: validateEmail(trimmedEmail) ? '' : 'Please enter a valid email.',
      phoneNumber: phoneValid ? '' : 'Please enter a valid phone number.',
      password: form.password.length >= 6 ? '' : 'Password must be at least 6 characters.',
      confirmPassword:
        form.confirmPassword === form.password ? '' : 'Passwords do not match.',
      form: '',
    };

    setErrors(nextErrors);
    const hasError = Object.entries(nextErrors).some(
      ([key, err]) => key !== 'form' && err !== ''
    );

    return !hasError;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: '' }));

    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.replace(/\s+/g, ' ');
    const normalizedPhone = form.phoneNumber.trim()
      ? `${form.phoneNumber.trim().startsWith('+') ? '+' : ''}${form.phoneNumber.replace(/[^\d]/g, '')}`
      : undefined;
    const payload = {
      name: name.trim(),
      email: form.email.trim(),
      phoneNumber: normalizedPhone,
      password: form.password
    };

    try {
      const session = await registerUser(payload);
      persistAuthSession(session, true);
      navigate('/calendar');
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.fieldErrors ?? {};
        const nextErrors: Partial<ErrorState> = {
          form: fieldErrors.form ?? err.message
        };

        if (fieldErrors.name) nextErrors.firstName = fieldErrors.name;
        if (fieldErrors.email) nextErrors.email = fieldErrors.email;
        if (fieldErrors.password) nextErrors.password = fieldErrors.password;
        if (err.status === 409 && !nextErrors.email && fieldErrors.form) {
          nextErrors.email = fieldErrors.form;
        }

        setErrors((prev) => ({ ...prev, ...nextErrors }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'Unable to create your account right now. Please try again.'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <label htmlFor="phoneNumber">Phone number (optional)</label>
          <div className="input-wrap">
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              autoComplete="tel"
              placeholder="+1 555 123 4567"
              value={form.phoneNumber}
              onChange={handleChange('phoneNumber')}
            />
          </div>
          {errors.phoneNumber && <div className="error show">{errors.phoneNumber}</div>}
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

        {errors.form && (
          <div className="error show" role="alert">
            {errors.form}
          </div>
        )}

        <div className="actions">
          <button className="btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      <div className="account-footer">
        <span className="muted">Already have an account?</span>
        <Link className="link" to="/login">Sign in</Link>
      </div>
    </section>
  );
}
