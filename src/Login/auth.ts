export const DEMO_EMAIL = 'demo@company.com';
export const DEMO_PASS = '123456';

export type LoginErrors = {
  email: boolean;
  password: boolean;
};

export function validateEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export function canLogin(email: string, password: string): { ok: boolean; errors: LoginErrors; demo: boolean } {
  if (email === DEMO_EMAIL && password === DEMO_PASS) {
    return { ok: true, demo: true, errors: { email: false, password: false } };
  }

  const errors: LoginErrors = { email: false, password: false };
  let ok = false;
  if (!email || !validateEmail(email)) {
    errors.email = true;
    ok = false;
  }
  if (!password || password.length < 6) {
    errors.password = true;
    ok = false;
  }
  return { ok , demo: false, errors };
}