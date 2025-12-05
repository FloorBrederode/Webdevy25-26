import React, { useState, useEffect } from "react";
import { getAvailableRooms, createEvent, getCurrentUser } from "./bookingApi";
import { getStoredAuthSession } from '../Login/auth';
import type { Room } from "./bookingApi";
import "./Calendar.css";

type Props = {
  date: Date;
  onClose: () => void;
  onBooked?: (date: Date) => void;
};

const BookingModal: React.FC<Props> = ({ date, onClose, onBooked }) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [name, setName] = useState("Meeting");
  const [description, setDescription] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number>>(new Set());
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<number>>(new Set());
  const [userCompanyId, setUserCompanyId] = useState<number | null>(null);
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string; email: string }[]>([]);

  const formatIso = (d: Date, time: string) => {
    // time is HH:mm
    const [hh, mm] = time.split(":");
    const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(hh), Number(mm), 0);
    // return as 'YYYY-MM-DD HH:mm:00' which sqlite schema expects
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    const hours = String(dt.getHours()).padStart(2, "0");
    const mins = String(dt.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hours}:${mins}:00`;
  };

  // On mount: fetch current user and load company users for attendee list
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        const rawCompany = (user && (user.CompanyId ?? user.companyId)) ?? null;
        const rawId = (user && (user.Id ?? user.id ?? user.ID)) ?? null;
        if (mounted) {
          if (rawCompany != null) {
            const parsed = typeof rawCompany === 'string' ? parseInt(rawCompany, 10) : rawCompany;
            if (!Number.isNaN(parsed)) setUserCompanyId(parsed);
          }
          if (rawId != null) {
            const parsedId = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;
            if (!Number.isNaN(parsedId)) setOrganizerId(parsedId);
          }
        }

        // If getCurrentUser returned null (unauthenticated) try reading raw stored session
        if ((user == null) && mounted) {
          try {
            const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
            if (raw) {
              const parsed = JSON.parse(raw) as any;
              const rawCompany2 = parsed?.companyId ?? parsed?.CompanyId ?? parsed?.companyID ?? null;
              const rawId2 = parsed?.id ?? parsed?.ID ?? parsed?.Id ?? null;
              if (rawCompany2 != null) {
                const parsedC = typeof rawCompany2 === 'string' ? parseInt(rawCompany2, 10) : rawCompany2;
                if (!Number.isNaN(parsedC)) setUserCompanyId(parsedC);
              }
              if (rawId2 != null) {
                const parsedI = typeof rawId2 === 'string' ? parseInt(rawId2, 10) : rawId2;
                if (!Number.isNaN(parsedI)) setOrganizerId(parsedI);
              }
            }
          } catch (e) {
            // ignore
          }
        }

        // If we have a company, fetch company users via new endpoint
        const companyId = rawCompany != null ? (typeof rawCompany === 'string' ? parseInt(rawCompany, 10) : rawCompany) : null;
        try {
          if (companyId) {
            const session = getStoredAuthSession();
            // fallback to raw storage token
            let effectiveSession = session;
            if (!effectiveSession) {
              try {
                const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
                if (raw) {
                  const parsed = JSON.parse(raw) as any;
                  if (parsed && (parsed.token ?? parsed.Token)) {
                    effectiveSession = { id: parsed.id ?? parsed.ID ?? '', name: parsed.name ?? parsed.Name ?? '', email: parsed.email ?? parsed.Email ?? '', role: parsed.role ?? parsed.Role ?? 'user', token: parsed.token ?? parsed.Token ?? '', expiresAt: parsed.expiresAt ?? parsed.ExpiresAt ?? new Date(Date.now() + 3600_000).toISOString() };
                  }
                }
              } catch {
                // ignore
              }
            }
            const headers: Record<string,string> = { 'Content-Type': 'application/json' };
            if (effectiveSession) headers['Authorization'] = `Bearer ${effectiveSession.token}`;
            const res = await fetch(`/api/users/company/${companyId}`, { headers });
            if (res.ok) {
              const users = await res.json();
              if (mounted) setAvailableUsers(users.map((u: any) => ({ id: typeof (u.id ?? u.Id) === 'string' ? parseInt(u.id ?? u.Id, 10) : (u.id ?? u.Id), name: u.name, email: u.email })));
            }
          }
        } catch (e) {
          console.warn('Failed to load company users', e);
        }
      } catch (e) {
        console.warn('Failed to load current user', e);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const handleCheck = async () => {
    setError(null);
    setLoading(true);
    try {
      const startIso = formatIso(date, startTime);
      const endIso = formatIso(date, endTime);
      // validate times
      const startDt = new Date(startIso.replace(' ', 'T'));
      const endDt = new Date(endIso.replace(' ', 'T'));
      if (startDt >= endDt) {
        setError('Start time must be earlier than end time.');
        setRooms(null);
        return;
      }

      // Always fetch current user now to ensure we have companyId and organizerId
      let companyId = userCompanyId ?? undefined;
      try {
        const user = await getCurrentUser();
        const rawCompany = (user && (user.CompanyId ?? user.companyId)) ?? null;
        const rawId = (user && (user.Id ?? user.id ?? user.ID)) ?? null;
        if (rawCompany != null) {
          const parsed = typeof rawCompany === 'string' ? parseInt(rawCompany, 10) : rawCompany;
          if (!Number.isNaN(parsed)) {
            companyId = parsed;
            setUserCompanyId(parsed);
          }
        }
        if (rawId != null) {
          const parsedId = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;
          if (!Number.isNaN(parsedId)) setOrganizerId(parsedId);
        }
      } catch (e) {
        console.warn('Failed to get current user during check', e);
      }

      // If companyId still undefined, try to extract it directly from stored authSession
      if (companyId == null) {
        try {
          const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
          if (raw) {
            const parsed = JSON.parse(raw) as any;
            const rawCompany = parsed?.companyId ?? parsed?.CompanyId ?? parsed?.companyID ?? parsed?.Company ?? null;
            if (rawCompany != null) {
              const parsedC = typeof rawCompany === 'string' ? parseInt(rawCompany, 10) : rawCompany;
              if (!Number.isNaN(parsedC)) {
                companyId = parsedC;
                setUserCompanyId(parsedC);
                // eslint-disable-next-line no-console
                console.log('handleCheck: extracted companyId from storage', companyId);
              }
            }
          }
        } catch (ex) {
          console.warn('handleCheck: failed to extract companyId from storage', ex);
        }
      }

      // fetch company users (attendees) if we now have companyId
      if (companyId) {
        try {
          const session = getStoredAuthSession();
          let effectiveSession = session;
          if (!effectiveSession) {
            try {
              const raw = sessionStorage.getItem('authSession') ?? localStorage.getItem('authSession');
              if (raw) {
                const parsed = JSON.parse(raw) as any;
                if (parsed && (parsed.token ?? parsed.Token)) {
                  effectiveSession = { id: parsed.id ?? parsed.ID ?? '', name: parsed.name ?? parsed.Name ?? '', email: parsed.email ?? parsed.Email ?? '', role: parsed.role ?? parsed.Role ?? 'user', token: parsed.token ?? parsed.Token ?? '', expiresAt: parsed.expiresAt ?? parsed.ExpiresAt ?? new Date(Date.now() + 3600_000).toISOString() };
                }
              }
            } catch {
              // ignore
            }
          }
          const headers: Record<string,string> = { 'Content-Type': 'application/json' };
          if (effectiveSession) headers['Authorization'] = `Bearer ${effectiveSession.token}`;
          const res = await fetch(`/api/users/company/${companyId}`, { headers });
          if (res.ok) {
            const users = await res.json();
            setAvailableUsers(users.map((u: any) => ({ id: typeof (u.id ?? u.Id) === 'string' ? parseInt(u.id ?? u.Id, 10) : (u.id ?? u.Id), name: u.name, email: u.email })));
          }
        } catch (e) {
          console.warn('Failed to load company users during check', e);
        }
      }

      // Call availability endpoint with companyId (if present)
      console.log('Checking availability', { startIso, endIso, companyId });
      const available = await getAvailableRooms(startIso, endIso, companyId);
      console.log('Available rooms returned', available);
      // Filter to only show rooms from user's company (extra safety)
      const filtered = companyId ? available.filter(r => r.companyId === companyId) : available;
      setRooms(filtered);
      setSelectedRoomIds(new Set());
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (selectedRoomIds.size === 0) {
      setError('Please select at least one room to book.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // basic validation before booking
      const startIso = formatIso(date, startTime);
      const endIso = formatIso(date, endTime);
      const startDt = new Date(startIso.replace(' ', 'T'));
      const endDt = new Date(endIso.replace(' ', 'T'));
      if (startDt >= endDt) {
        setError('Start time must be earlier than end time.');
        setLoading(false);
        return;
      }

      // use organizerId populated at mount
      const organiser = organizerId;

      const payload = {
        Name: name,
        Description: description,
        StartTime: startIso,
        EndTime: endIso,
        OrganizerId: organiser,
        RoomIds: Array.from(selectedRoomIds),
        AttendeeIds: Array.from(selectedAttendeeIds),
      };

      await createEvent(payload);
      onBooked && onBooked(date);
      onClose();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Book a room on {date.toDateString()}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {userCompanyId == null && (
            <div style={{ marginBottom: 10, padding: 8, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 4 }}>
              Please log in to see only your company's rooms and to select attendees.
            </div>
          )}
          <label>
            Title<br />
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label style={{ display: 'block', marginTop: 8 }}>
            Description<br />
            <input value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <label>
              Start<br />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label>
              End<br />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleCheck} disabled={loading}>Check availability</button>
          </div>

          {loading && <div style={{ marginTop: 8 }}>Loading…</div>}
          {error && <div className="error">{error}</div>}

          {rooms && (
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong>Available rooms ({rooms.length})</strong>
                <button className="collapse-toggle" onClick={() => setCollapsed((c) => !c)}>{collapsed ? 'Expand' : 'Collapse'}</button>
              </div>

              {!collapsed && (
                <div className="room-list">
                  {rooms.length === 0 && <div>No rooms available for this slot.</div>}
                  {rooms.map((r) => (
                    <div
                      key={r.id}
                      className={"room-item" + (selectedRoomIds.has(r.id) ? ' selected' : '')}
                      onClick={() => {
                        const updated = new Set(selectedRoomIds);
                        if (updated.has(r.id)) {
                          updated.delete(r.id);
                        } else {
                          updated.add(r.id);
                        }
                        setSelectedRoomIds(updated);
                      }}
                    >
                      <div>
                        <input
                          type="checkbox"
                          checked={selectedRoomIds.has(r.id)}
                          onChange={() => {}}
                          style={{ marginRight: 8 }}
                        />
                        <strong>{r.location ?? `Room #${r.id}`}</strong>
                      </div>
                      {r.capacity != null && <div className="muted">Capacity: {r.capacity}</div>}
                    </div>
                  ))}
                </div>
              )}

              

              <div className="modal-footer">
                <button onClick={onClose} disabled={loading}>Cancel</button>
                <button onClick={handleCreate} disabled={loading || selectedRoomIds.size === 0 || !name || !!error || organizerId == null}>Create event ({selectedRoomIds.size})</button>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: 12 }}>
            <strong>Attendees ({selectedAttendeeIds.size})</strong>
            <div className="room-list" style={{ maxHeight: '200px', marginTop: 8 }}>
              {availableUsers.length === 0 && <div>No users available.</div>}
              {availableUsers.map((u) => (
                <div
                  key={u.id}
                  className={"room-item" + (selectedAttendeeIds.has(u.id) ? ' selected' : '')}
                  onClick={() => {
                    const updated = new Set(selectedAttendeeIds);
                    if (updated.has(u.id)) {
                      updated.delete(u.id);
                    } else {
                      updated.add(u.id);
                    }
                    setSelectedAttendeeIds(updated);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedAttendeeIds.has(u.id)}
                      onChange={() => {}}
                      style={{ marginRight: 8 }}
                    />
                    <strong>{u.name}</strong>
                  </div>
                  <div className="muted">{u.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
