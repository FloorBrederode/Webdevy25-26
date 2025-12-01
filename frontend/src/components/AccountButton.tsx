import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearAuthSession,
  getStoredAuthSession,
  type AuthSession
} from '../Login/auth';
import './AccountButton.css';

type SessionSnapshot = {
  name: string;
  email?: string;
} & Partial<AuthSession>;

function getSessionSnapshot(): SessionSnapshot | null {
  const validated = getStoredAuthSession();
  if (validated) return validated;

  // Fallback: read raw value to still show the name if validation failed.
  try {
    const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    const name = pickString(record, 'name') ?? pickString(record, 'Name');
    const email = pickString(record, 'email') ?? pickString(record, 'Email');
    const token = pickString(record, 'token') ?? pickString(record, 'Token');

    const tokenName = token ? extractNameFromToken(token) : undefined;
    const finalName = name ?? tokenName ?? email;

    if (!finalName && !email) return null;
    return {
      name: finalName ?? 'Account',
      email
    };
  } catch {
    return null;
  }
}

type AccountButtonProps = {
  onLogout?: () => void;
};

export function AccountButton({ onLogout }: AccountButtonProps): React.ReactElement | null {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<SessionSnapshot | null>(() => getSessionSnapshot());
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refresh session when the route changes (e.g. after login).
  useEffect(() => {
    setSession(getSessionSnapshot());
  }, [location]);

  // Keep in sync with storage updates (e.g. another tab logs out).
  useEffect(() => {
    const handleStorage = (): void => {
      setSession(getSessionSnapshot());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Refresh when window regains focus (catches recent logins/logouts).
  useEffect(() => {
    const handleFocus = (): void => setSession(getSessionSnapshot());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (!open) return;
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleLogout = (): void => {
    clearAuthSession();
    setSession(null);
    setOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const handleLogin = (): void => {
    navigate('/login');
  };

  const displayName = formatDisplayName(session);
  const displayEmail = session?.email;

  const authPaths = ['/login', '/register', '/forgot-password', '/'];
  if (authPaths.includes(location.pathname)) return null;

  if (!session) {
    return (
      <div className="account-button" ref={containerRef}>
        <button
          type="button"
          className="account-trigger"
          onClick={handleLogin}
        >
          <span className="account-name">Log in</span>
        </button>
      </div>
    );
  }

  return (
    <div className="account-button" ref={containerRef}>
      <button
        type="button"
        className="account-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="account-name">{displayName}</span>
        <span aria-hidden="true" className="account-caret">▾</span>
      </button>

      {open && (
        <div className="account-menu" role="menu">
          {displayEmail && (
            <div className="account-menu-email" role="presentation">
              {displayEmail}
            </div>
          )}
          <button
            type="button"
            className="account-menu-item"
            role="menuitem"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function formatDisplayName(session: SessionSnapshot | null): string {
  if (!session) return 'Account';

  const rawName = session.name?.trim() ?? '';
  if (rawName) {
    const parts = rawName.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  }

  if (session.email) {
    const local = session.email.split('@')[0];
    return local || 'Account';
  }

  return 'Account';
}

function extractNameFromToken(token: string): string | undefined {
  const parts = token.split('.');
  if (parts.length < 2) return undefined;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload || typeof payload !== 'object') return undefined;

    const name =
      (payload as Record<string, unknown>).name ??
      (payload as Record<string, unknown>).unique_name ??
      `${(payload as Record<string, unknown>).given_name ?? ''} ${(payload as Record<string, unknown>).family_name ?? ''}`.trim();

    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}
