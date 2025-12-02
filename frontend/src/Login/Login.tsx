import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ApiError,
  getStoredAuthSession,
  loginUser,
  persistAuthSession,
  validateEmail,
  type LoginErrors
} from './auth';
import {
  AccountFooter,
  AuthPage,
  FormMessage,
  InputField,
  PasswordField
} from './components';
import './Login.css';

type LoginProps = {
  onSuccess?: () => void;
};

type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

export default function Login({ onSuccess }: LoginProps): React.ReactElement {
  const navigate = useNavigate();
  const handleSuccess = useCallback(() => {
    if (typeof onSuccess === 'function') {
      onSuccess();
    } else {
      navigate('/calendar');
    }
  }, [navigate, onSuccess]);

  useStoredSessionRedirect(handleSuccess);

  return (
    <AuthPage title="Sign in" subtitle="Welcome back">
      <LoginForm onSuccess={handleSuccess} />
    </AuthPage>
  );
}

function useStoredSessionRedirect(onSuccess: () => void): void {
  useEffect(() => {
    const session = getStoredAuthSession();
    if (session) {
      onSuccess();
    }
  }, [onSuccess]);
}

type LoginFormProps = {
  onSuccess: () => void;
};

function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFieldChange = (field: 'email' | 'password') => (value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field] && !prev.auth) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.auth;
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const validation: LoginErrors = {};
    const email = form.email.trim();
    const password = form.password.trim();

    if (!validateEmail(email)) {
      validation.email = 'Please enter a valid email.';
    }

    if (password.length < 6) {
      validation.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const session = await loginUser(email, password);
      persistAuthSession(session, form.remember);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.fieldErrors ?? {};
        const nextErrors: LoginErrors = {};

        if (fieldErrors.email) nextErrors.email = fieldErrors.email;
        if (fieldErrors.password) nextErrors.password = fieldErrors.password;
        nextErrors.auth = fieldErrors.auth ?? fieldErrors.form ?? err.message;

        setErrors(nextErrors);
      } else {
        setErrors({ auth: 'Unable to sign in right now. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <InputField
        id="email"
        name="email"
        type="email"
        label="Email"
        value={form.email}
        placeholder="you@company.com"
        onChange={(e) => handleFieldChange('email')(e.target.value)}
        error={errors.email}
        required
      />

      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => handleFieldChange('password')(e.target.value)}
        error={errors.password}
        toggleVisibility
        required
        minLength={6}
      />

      <FormMessage message={errors.auth} id="authError" />

      <div className="row">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            id="remember"
            checked={form.remember}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({
              ...prev,
              remember: e.target.checked
            }))}
          />
          {' '}
          Remember me
        </label>
        <Link className="link" to="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <div className="actions">
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <AccountFooter
        prompt="New here?"
        linkText="Create an account"
        to="/register"
      />
    </form>
  );
}
