import React, { useState, useEffect } from "react";
import Day from "./Day";
import "./Calendar.css";
import DayDetailView from "./DayDetailView";
import { getAllEvents, type CalendarEvent } from "./bookingApi";

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

const CalendarComponent: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Load events from database on component mount and when month/year changes
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const events = await getAllEvents();
        console.log('Loaded events from database:', events);
        
        // Build bookedDates map from loaded events
        const dateMap: Record<string, number> = {};
        events.forEach((event) => {
          const startDate = new Date(event.startTime);
          const key = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
          dateMap[key] = (dateMap[key] || 0) + 1;
        });
        
        setBookedDates(dateMap);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []); // Only run once on mount - events update when BookingModal closes

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
            // Reload events from database after event creation
            try {
              const events = await getAllEvents();
              const dateMap: Record<string, number> = {};
              events.forEach((event) => {
                const startDate = new Date(event.startTime);
                const key = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
                dateMap[key] = (dateMap[key] || 0) + 1;
              });
              setBookedDates(dateMap);
              console.log('Updated calendar events from database');
            } catch (err) {
              console.error('Failed to refresh events after booking:', err);
            }
          }}
        />
      )}
    </div>
  );
};

export default CalendarComponent;
