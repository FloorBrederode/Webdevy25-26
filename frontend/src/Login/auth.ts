export const DEMO_EMAIL = 'demo@company.com';
export const DEMO_PASS = '123456';

export type LoginErrors = {
  email?: string;
  password?: string;
  auth?: string;
};

export function validateEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export function canLogin(email: string, password: string): { ok: boolean; errors: LoginErrors; demo: boolean } {
  if (email === DEMO_EMAIL && password === DEMO_PASS) {
    return { ok: true, demo: true, errors: {} };
  }

  const errors: LoginErrors = {};
  let ok = true;

  if (!email || !validateEmail(email)) {
    errors.email = 'Please enter a valid email.';
    ok = false;
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
    ok = false;
  }

  if (!ok) {
    return { ok: false, demo: false, errors };
  }

  errors.auth = 'Incorrect email or password.';
  return { ok: false, demo: false, errors };
}
