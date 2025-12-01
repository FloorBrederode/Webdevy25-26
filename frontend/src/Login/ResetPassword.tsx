import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from './auth';
import {
  AccountFooter,
  AuthPage,
  FormMessage,
  PasswordField
} from './components';
import './Login.css';

type ErrorState = {
  password?: string;
  confirm?: string;
  form?: string;
};

export default function ResetPassword(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const token = initialToken.trim();
  const title = submitted ? 'Password reset' : 'Choose a new password';
  const subtitle = submitted
    ? 'Your password has been updated. You can now sign in with the new password.'
    : 'Enter your new password to finish resetting your account.';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!token) {
      setErrors({ form: 'Reset link is missing or invalid. Please request a new link.' });
      return;
    }

    const nextErrors: ErrorState = {};
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (confirm !== password) nextErrors.confirm = 'Passwords do not match.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Unable to reset your password right now. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPage title={title} subtitle={subtitle}>
      {submitted ? (
        <SuccessState onNavigate={() => navigate('/login')} />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <PasswordField
            id="newPassword"
            name="password"
            label="New password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            toggleVisibility
            required
            minLength={6}
          />

          <PasswordField
            id="confirmNewPassword"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            toggleVisibility
            required
          />

          <FormMessage message={errors.form} />

          <div className="actions">
            <button className="btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </button>
          </div>

          <AccountFooter
            prompt="Remembered your password?"
            linkText="Back to sign in"
            to="/login"
          />
        </form>
      )}
    </AuthPage>
  );
}

type SuccessStateProps = {
  onNavigate: () => void;
};

function SuccessState({ onNavigate }: SuccessStateProps): React.ReactElement {
  return (
    <>
      <FormMessage
        tone="success"
        message="Your password has been reset."
      />
      <div className="actions">
        <button className="btn primary" type="button" onClick={onNavigate}>
          Sign in
        </button>
      </div>
    </>
  );
}
