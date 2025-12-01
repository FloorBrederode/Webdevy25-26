import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, validateEmail } from './auth';
import {
  AccountFooter,
  AuthPage,
  FormMessage,
  InputField
} from './components';
import './Login.css';

export default function ForgotPassword(): React.ReactElement {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const subtitle = submitted
    ? 'If we find a matching account, we will email password reset instructions.'
    : 'Please enter your email and we will send you password reset instructions.';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      await requestPasswordReset(trimmedEmail);
      setSubmittedEmail(trimmedEmail);
      setSubmitted(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to process your request right now. Please try again.');
    }
  };

  return (
    <AuthPage title="Reset password" subtitle={subtitle}>
      {submitted ? (
        <ResetConfirmation
          email={submittedEmail}
          onBack={() => navigate('/login')}
        />
      ) : (
        <ResetRequestForm
          email={email}
          error={error}
          onEmailChange={(value) => {
            setEmail(value);
            if (error) setError('');
          }}
          onSubmit={handleSubmit}
        />
      )}
    </AuthPage>
  );
}

type ResetRequestFormProps = {
  email: string;
  error?: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
};

function ResetRequestForm({
  email,
  error,
  onEmailChange,
  onSubmit
}: ResetRequestFormProps): React.ReactElement {
  return (
    <form onSubmit={onSubmit} noValidate>
      <InputField
        id="forgotEmail"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        error={error}
        required
      />
      <div className="actions">
        <button className="btn primary" type="submit">Send reset link</button>
      </div>
      <AccountFooter
        prompt="Remembered your password?"
        linkText="Back to sign in"
        to="/login"
      />
    </form>
  );
}

type ResetConfirmationProps = {
  email: string;
  onBack: () => void;
};

function ResetConfirmation({
  email,
  onBack
}: ResetConfirmationProps): React.ReactElement {
  return (
    <>
      <FormMessage
        tone="success"
        message={(
          <>
            Check your inbox for a message about resetting the password for <strong>{email}</strong>.
          </>
        )}
      />
      <div className="actions">
        <button
          className="btn primary"
          type="button"
          onClick={onBack}
        >
          Back to sign in
        </button>
      </div>
      <AccountFooter
        prompt="Need to create an account?"
        linkText="Create account"
        to="/register"
      />
    </>
  );
}
