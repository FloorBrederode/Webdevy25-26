import React, { useCallback, useEffect, useState } from "react";
import Day from "./Day";
import "./Calendar.css";
import DayDetailView from "./DayDetailView";
import { getAllEvents, getCurrentUser, extractUserId, type CalendarEvent } from "./bookingApi";

export type CalendarDate = {
  day: number;
  isCurrentMonth: boolean;
};

export function generateCalendarDays(year: number, month: number): CalendarDate[] {
  const days: CalendarDate[] = [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }

  while (days.length < 42) {
    days.push({ day: days.length - (startDayOfWeek + totalDays) + 1, isCurrentMonth: false });
  }

  return days;
}

const buildDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const buildBookedDateMap = (events: CalendarEvent[]): Record<string, number> => {
  const dateMap: Record<string, number> = {};

  events.forEach((event) => {
    const startDate = new Date(event.startTime);
    const key = buildDateKey(startDate);
    dateMap[key] = (dateMap[key] || 0) + 1;
  });

  return dateMap;
};

const CalendarComponent: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const refreshBookedDates = useCallback(async (participantId: number | null) => {
    if (participantId == null) {
      setBookedDates({});
      return;
    }

    setLoading(true);
    try {
      const events = await getAllEvents(participantId);
      setBookedDates(buildBookedDateMap(events));
    } catch (err) {
      console.error('Failed to load events:', err);
      setBookedDates({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const current = await getCurrentUser();
        const normalizedUserId = extractUserId(current);
        setUserId(normalizedUserId);
        await refreshBookedDates(normalizedUserId ?? null);
      } catch (err) {
        console.error('Failed to load events:', err);
        setBookedDates({});
      }
    };

    loadEvents();
  }, [refreshBookedDates]); // Only run once on mount - events update when BookingModal closes

  const days = generateCalendarDays(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>

        <div className="calendar-controls">
          <button onClick={prevMonth} className="control-button">◀</button>

          <button
            onClick={() => {
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
            }}
            className="today-button"
          >
            Today
          </button>

          <button onClick={nextMonth} className="control-button">▶</button>
        </div>
      </div>

      {loading && (
        <div style={{ marginBottom: '8px', color: '#555' }}>
          Loading your events...
        </div>
      )}

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="weekday">{d}</div>
        ))}

        {days.map((date, i) => {
          const handleClick = (day: number) => {
            // construct the actual date object using displayed month/year
            const dt = new Date(currentYear, currentMonth, day);
            setSelectedDate(dt);
          };

          // compute date key for events only when in current month
          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
          const hasEvents = !!bookedDates[dateKey];

          return <Day key={i} day={date.day} isCurrentMonth={date.isCurrentMonth} onClick={handleClick} hasEvents={hasEvents} />;
        })}
      </div>
      {selectedDate && (
        <DayDetailView
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onEventCreated={async () => {
            await refreshBookedDates(userId);
          }}
        />
      )}
    </div>
  );
};

export default CalendarComponent;
