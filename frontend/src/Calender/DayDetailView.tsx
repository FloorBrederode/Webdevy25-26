import React, { useCallback, useEffect, useState } from "react";
import { getAllEvents, getCurrentUser, extractUserId, normalizeId, type CalendarEvent } from "./bookingApi";
import { getStoredAuthSession } from '../Login/auth';
import BookingModal from "./BookingModal";
import "./Calendar.css";

type Props = {
  date: Date;
  onClose: () => void;
  onEventCreated?: () => void;
};

const DayDetailView: React.FC<Props> = ({ date, onClose, onEventCreated }) => {
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const refreshDayEvents = useCallback(async () => {
    setLoading(true);
    try {
      const current = await getCurrentUser();
      const userId = extractUserId(current);

      // Filter events for this day
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      const allEvents = userId != null ? await getAllEvents(userId) : [];
      const filtered = allEvents.filter((event) => {
        const eventStart = new Date(event.startTime);
        return eventStart >= dayStart && eventStart <= dayEnd;
      });

      // Fetch users for name lookup (company-limited)
      let userMap: Record<number, string> = {};
      try {
        const companyId = normalizeId(current?.CompanyId ?? current?.companyId);
        if (companyId) {
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
            users.forEach((u: any) => {
              const id = normalizeId(u.id ?? u.Id);
              if (id != null) {
                userMap[id] = u.name;
              }
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load users for attendee name lookup', e);
      }

      const sorted = filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      // attach attendee names for display
      const withNames = sorted.map((ev) => ({ ...ev, attendeeNames: (ev.attendeeIds || []).map((id) => userMap[id] ?? String(id)) }));
      // @ts-ignore we add attendeeNames dynamically
      setDayEvents(withNames as any);
    } catch (err) {
      console.error('Failed to load day events:', err);
      setDayEvents([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void refreshDayEvents();
  }, [refreshDayEvents]);

  const formatTime = (dateString: string): string => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (): string => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>Events on {formatDateHeader()}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <div>Loading events...</div>}

          {!loading && dayEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No events scheduled for this day.</p>
            </div>
          )}

          {!loading && dayEvents.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Scheduled Events:</strong>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{event.name}</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: '0.85em', marginTop: '4px', color: '#555' }}>
                        {event.description}
                      </div>
                    )}
                    {event.roomIds && event.roomIds.length > 0 && (
                      <div style={{ fontSize: '0.85em', marginTop: '4px', color: '#777' }}>
                        Rooms: {event.roomIds.join(', ')}
                      </div>
                    )}
                    {/* attendees: may be attached as attendeeNames by loader */}
                    {/** @ts-ignore */}
                    {(event as any).attendeeNames && (event as any).attendeeNames.length > 0 && (
                      <div style={{ fontSize: '0.85em', marginTop: '6px', color: '#444' }}>
                        Attendees: {(event as any).attendeeNames.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '20px' }}>
            <button onClick={onClose}>Close</button>
            <button
              onClick={() => setShowBookingModal(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Create Event
            </button>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          date={date}
          onClose={() => setShowBookingModal(false)}
          onBooked={async () => {
            await refreshDayEvents();
            onEventCreated?.();
          }}
        />
      )}
    </div>
  );
};

export default DayDetailView;
