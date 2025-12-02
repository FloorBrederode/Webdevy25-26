import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  persistAuthSession,
  registerUser,
  validateEmail
} from './auth';
import {
  AccountFooter,
  AuthPage,
  FormMessage,
  InputField,
  PasswordField
} from './components';
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

type ErrorState = Partial<FormState> & {
  form?: string;
};

const defaultState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

export default function CreateAccount(): React.ReactElement {
  const navigate = useNavigate();
  const handleSuccess = useCallback(() => navigate('/calendar'), [navigate]);

  return (
    <AuthPage
      title="Create account"
      subtitle="Start organising your schedule"
      bodyClass="account-page"
      className="account-card"
    >
      <CreateAccountForm onSuccess={handleSuccess} />
      <AccountFooter prompt="Already have an account?" linkText="Sign in" to="/login" />
    </AuthPage>
  );
}

type CreateAccountFormProps = {
  onSuccess: () => void;
};

function CreateAccountForm({ onSuccess }: CreateAccountFormProps): React.ReactElement {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: keyof FormState) => (value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const validation = validateForm(form);

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.replace(/\s+/g, ' ');
    const normalizedPhone = normalizePhone(form.phoneNumber);
    const payload = {
      name: name.trim(),
      email: form.email.trim(),
      phoneNumber: normalizedPhone,
      password: form.password
    };

    try {
      const session = await registerUser(payload);
      persistAuthSession(session, true);
      onSuccess();
    } catch (err) {
      handleSubmitError(err, setErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <InputField
          id="firstName"
          name="firstName"
          type="text"
          label="First name"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => handleChange('firstName')(e.target.value)}
          error={errors.firstName}
          required
        />

        <InputField
          id="lastName"
          name="lastName"
          type="text"
          label="Last name"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(e) => handleChange('lastName')(e.target.value)}
          error={errors.lastName}
          required
        />
      </div>

      <InputField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@company.com"
        value={form.email}
        onChange={(e) => handleChange('email')(e.target.value)}
        error={errors.email}
        required
      />

      <InputField
        id="phoneNumber"
        name="phoneNumber"
        type="tel"
        label="Phone number (optional)"
        autoComplete="tel"
        placeholder="+1 555 123 4567"
        value={form.phoneNumber}
        onChange={(e) => handleChange('phoneNumber')(e.target.value)}
        error={errors.phoneNumber}
      />

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={form.password}
        onChange={(e) => handleChange('password')(e.target.value)}
        error={errors.password}
        toggleVisibility
        required
        minLength={6}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Repeat password"
        value={form.confirmPassword}
        onChange={(e) => handleChange('confirmPassword')(e.target.value)}
        error={errors.confirmPassword}
        toggleVisibility
        required
      />

      <FormMessage message={errors.form} />

      <div className="actions">
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
}

function validateForm(form: FormState): ErrorState {
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

  const nextErrors: ErrorState = {};

  if (!trimmedFirst) nextErrors.firstName = 'Please enter your first name.';
  if (!trimmedLast) nextErrors.lastName = 'Please enter your last name.';
  if (!validateEmail(trimmedEmail)) nextErrors.email = 'Please enter a valid email.';
  if (!phoneValid) nextErrors.phoneNumber = 'Please enter a valid phone number.';
  if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
  if (form.confirmPassword !== form.password) {
    nextErrors.confirmPassword = 'Passwords do not match.';
  }

  return nextErrors;
}

function normalizePhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const prefix = trimmed.startsWith('+') ? '+' : '';
  const digits = trimmed.replace(/[^\d]/g, '');
  return `${prefix}${digits}`;
}

function handleSubmitError(
  err: unknown,
  setErrors: React.Dispatch<React.SetStateAction<ErrorState>>
): void {
  if (err instanceof ApiError) {
    const fieldErrors = err.fieldErrors ?? {};
    const nextErrors: ErrorState = {
      form: fieldErrors.form ?? err.message
    };

    if (fieldErrors.name) nextErrors.firstName = fieldErrors.name;
    if (fieldErrors.email) nextErrors.email = fieldErrors.email;
    if (fieldErrors.password) nextErrors.password = fieldErrors.password;
    if (err.status === 409 && !nextErrors.email && fieldErrors.form) {
      nextErrors.email = fieldErrors.form;
    }

    setErrors(nextErrors);
  } else {
    setErrors({
      form: 'Unable to create your account right now. Please try again.'
    });
  }
}
