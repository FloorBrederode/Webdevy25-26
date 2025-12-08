export type Room = {
  id: number;
  capacity?: number | null;
  location?: string | null;
  companyId?: number | null;
};

export type CalendarEvent = {
  id: number;
  name: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  organizerId?: number | null;
  roomIds: number[];
  attendeeIds: number[];
};

export function normalizeId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function normalizeIdArray(rawIds: unknown): number[] {
  if (rawIds == null) return [];

  const ids = typeof rawIds === 'string'
    ? (() => {
        try {
          return JSON.parse(rawIds) as unknown[];
        } catch {
          return [];
        }
      })()
    : rawIds;

  if (!Array.isArray(ids)) return [];

  return ids
    .map((id) => normalizeId(id))
    .filter((id): id is number => id != null);
}

export function extractUserId(user: any): number | null {
  if (!user) return null;
  return normalizeId(
    user.id ??
    user.Id ??
    user.ID ??
    user.userId ??
    user.UserId ??
    user.user_id
  );
}

export async function getAvailableRooms(startIso: string, endIso: string, companyId?: number): Promise<Room[]> {
  const paramsObj: Record<string,string> = { startTime: startIso, endTime: endIso };
  if (companyId != null) paramsObj.companyId = String(companyId);
  const params = new URLSearchParams(paramsObj);
  // include stored auth token when available
  const { getStoredAuthSession } = await import('../Login/auth');
  let session = getStoredAuthSession();
  // fallback: try to read raw storage even if the stored session is considered expired
  if (!session) {
    try {
      const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        if (parsed && parsed.token) {
          session = { id: parsed.id ?? parsed.ID ?? '', name: parsed.name ?? parsed.Name ?? '', email: parsed.email ?? parsed.Email ?? '', role: parsed.role ?? parsed.Role ?? 'user', token: parsed.token ?? parsed.Token ?? '', expiresAt: parsed.expiresAt ?? parsed.ExpiresAt ?? new Date(Date.now() + 3600_000).toISOString() };
        }
      }
    } catch {
      // ignore
    }
  }
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (session) headers['Authorization'] = `Bearer ${session.token}`;

  const res = await fetch(`/api/rooms/available?${params.toString()}`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to get available rooms: ${txt}`);
  }
  // normalize fields (backend may return snake_case)
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    id: r.id ?? r.ID ?? r.Id,
    capacity: r.capacity ?? r.Capacity ?? null,
    location: r.location ?? r.Location ?? r.room_location ?? null,
    companyId: r.companyId ?? r.company_id ?? r.CompanyId ?? null,
  }));
}

export async function getCurrentUser() {
  const { getStoredAuthSession } = await import('../Login/auth');
  let session = getStoredAuthSession();
  // fallback to raw storage if getStoredAuthSession returned null
  if (!session) {
    try {
      const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        if (parsed && (parsed.token ?? parsed.Token)) {
          session = { id: parsed.id ?? parsed.ID ?? '', name: parsed.name ?? parsed.Name ?? '', email: parsed.email ?? parsed.Email ?? '', role: parsed.role ?? parsed.Role ?? 'user', token: parsed.token ?? parsed.Token ?? '', expiresAt: parsed.expiresAt ?? parsed.ExpiresAt ?? new Date(Date.now() + 3600_000).toISOString() };
        }
      }
    } catch {
      // ignore
    }
  }
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (session) {
    try {
      const masked = typeof session.token === 'string' ? `***${session.token.slice(-6)}` : '***';
      // eslint-disable-next-line no-console
      console.log('getCurrentUser: using stored session, token endsWith=', masked);
    } catch {}
    headers['Authorization'] = `Bearer ${session.token}`;
  } else {
    // eslint-disable-next-line no-console
    console.log('getCurrentUser: no stored session found');
  }

  const res = await fetch(`/api/users/current`, { headers });
  if (!res.ok) {
    // return null when unauthenticated or other failure so callers can handle gracefully
    return null;
  }
  return res.json();
}

export async function getAllEvents(userId?: number): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  if (userId != null) params.set('userId', String(userId));
  const endpoint = params.toString() ? `/api/events?${params.toString()}` : '/api/events';

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch events: ${txt}`);
  }
  const events = await res.json();
  // Convert room_ids and attendee_ids JSON strings to arrays; tolerate snake_case from backend
  return events.map((e: any) => {
    const roomIds = normalizeIdArray(e.roomIds ?? e.room_ids);
    const attendeeIds = normalizeIdArray(e.attendeeIds ?? e.attendee_ids);

    return {
      id: normalizeId(e.id ?? e.ID ?? e.Id) ?? 0,
      name: e.name ?? e.Name ?? '',
      description: e.description ?? e.Description ?? null,
      startTime: e.startTime ?? e.start_time,
      endTime: e.endTime ?? e.end_time,
      organizerId: normalizeId(e.organizerId ?? e.organizer_id),
      roomIds,
      attendeeIds,
    };
  });
}

export type CreateEventPayload = {
  Name: string;
  Description?: string | null;
  StartTime: string; // ISO
  EndTime: string; // ISO
  OrganizerId?: number | null;
  RoomIds?: number[];
  AttendeeIds?: number[];
};

export async function createEvent(payload: CreateEventPayload) {
  // include auth header when available
  const { getStoredAuthSession } = await import('../Login/auth');
  let session = getStoredAuthSession();
  if (!session) {
    try {
      const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        if (parsed && (parsed.token ?? parsed.Token)) {
          session = { id: parsed.id ?? parsed.ID ?? '', name: parsed.name ?? parsed.Name ?? '', email: parsed.email ?? parsed.Email ?? '', role: parsed.role ?? parsed.Role ?? 'user', token: parsed.token ?? parsed.Token ?? '', expiresAt: parsed.expiresAt ?? parsed.ExpiresAt ?? new Date(Date.now() + 3600_000).toISOString() };
        }
      }
    } catch {
      // ignore
    }
  }
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (session) headers['Authorization'] = `Bearer ${session.token}`;

  const res = await fetch('/api/events', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to create event: ${txt}`);
  }
  return res.json();
}
