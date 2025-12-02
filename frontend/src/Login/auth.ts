export type LoginErrors = {
  email?: string;
  password?: string;
  auth?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  jobTitle?: string;
  companyId?: number;
  role?: string;
};

export type AuthSession = {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const AUTH_STORAGE_KEY = 'authSession';
const API_BASE_URL = resolveApiBaseUrl();

export function validateEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const response = await postJson<LoginResponseDto>('/auth/login', { email, password });
  return mapAuthPayload(response, email);
}

export async function registerUser(payload: RegisterPayload): Promise<AuthSession> {
  const response = await postJson<RegisterResponseDto>('/auth/register', payload);
  return mapAuthPayload(response, payload.email);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await postJson('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await postJson('/auth/reset-password', { token, password });
}

export function persistAuthSession(session: AuthSession, remember: boolean): void {
  try {
    const serialized = JSON.stringify(session);
    // Always clear both scopes so we only keep the latest session in the chosen storage.
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, serialized);
  } catch {
    // Best-effort persistence; ignore storage failures (e.g. private mode).
  }
}

export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) ?? localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    if (!parsed.expiresAt || Number.isNaN(Date.parse(parsed.expiresAt))) {
      return null;
    }

    if (Date.parse(parsed.expiresAt) <= Date.now()) {
      clearAuthSession();
      return null;
    }

    if (!parsed.id || !parsed.name || !parsed.email || !parsed.role || !parsed.token) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      token: parsed.token,
      expiresAt: parsed.expiresAt
    };
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // voor als er errors zijn zeg maar
  }
}

function resolveApiBaseUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').trim();
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.', 0);
  }

  let payload: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const fieldErrors = extractFieldErrors(payload);
    const message = deriveErrorMessage(response.status, payload, fieldErrors);
    throw new ApiError(message, response.status, fieldErrors);
  }

  return payload as T;
}

function extractFieldErrors(payload: unknown): Record<string, string> | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const maybeErrors = (payload as Record<string, unknown>).errors;
  if (!maybeErrors) {
    return undefined;
  }

  if (Array.isArray(maybeErrors)) {
    if (maybeErrors.length === 0) return undefined;
    return { form: maybeErrors.join(' ') };
  }

  if (typeof maybeErrors === 'object') {
    const map: Record<string, string> = {};
    for (const [key, value] of Object.entries(maybeErrors as Record<string, unknown>)) {
      const message = Array.isArray(value) ? value.join(' ') : String(value);
      map[key.toLowerCase()] = message;
    }
    return map;
  }

  return undefined;
}

function deriveErrorMessage(
  status: number,
  payload: unknown,
  fieldErrors?: Record<string, string>
): string {
  if (status === 401) {
    return 'Incorrect email or password.';
  }

  if (status === 409) {
    return fieldErrors?.form ?? 'Account already exists for this email.';
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (typeof data.title === 'string') {
      return data.title;
    }
    if (typeof data.detail === 'string') {
      return data.detail;
    }
  }

  return 'Unable to complete the request. Please try again.';
}

type LoginResponseDto = {
  ID: string;
  Name: string;
  Role: string;
  Token: string;
  ExpiresAt: string;
};

type RegisterResponseDto = {
  ID: string;
  Email: string;
  Name: string;
  PhoneNumber?: string;
  JobTitle?: string;
  CompanyId?: number;
  Role: string;
  Token: string;
  ExpiresAt: string;
};

function mapAuthPayload(
  payload: LoginResponseDto | RegisterResponseDto,
  fallbackEmail: string
): AuthSession {
  const normalized = normalizeAuthPayload(payload);
  const email = normalized.email ?? fallbackEmail;

  return {
    id: normalized.id,
    name: normalized.name ?? email,
    email,
    role: normalized.role,
    token: normalized.token,
    expiresAt: normalized.expiresAt
  };
}

function normalizeAuthPayload(payload: LoginResponseDto | RegisterResponseDto): {
  id: string;
  name?: string;
  email?: string;
  role: string;
  token: string;
  expiresAt: string;
} {
  const obj = payload as Record<string, unknown>;

  const id = (obj.ID ?? obj.id) as string;
  const name = (obj.Name ?? obj.name) as string | undefined;
  const email = (obj.Email ?? obj.email) as string | undefined;
  const role = (obj.Role ?? obj.role) as string;
  const token = (obj.Token ?? obj.token) as string;
  const expiresAt = (obj.ExpiresAt ?? obj.expiresAt) as string;

  return { id, name, email, role, token, expiresAt };
}
