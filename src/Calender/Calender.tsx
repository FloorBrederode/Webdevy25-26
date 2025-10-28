import React, { useState } from "react";
import "./Calendar.css"; // importeer onze CSS-styling

// Type-definitie voor een dag in de kalender
// Elke dag heeft een nummer en een vlag of het bij de huidige maand hoort
type CalendarDate = {
  day: number;
  isCurrentMonth: boolean;
};

// Functie om alle dagen (ook van vorige/volgende maand) te genereren
function generateCalendarDays(year: number, month: number): CalendarDate[] {
  const days: CalendarDate[] = [];

  // Eerste en laatste dag van de huidige maand
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Op welke dag van de week begint de maand (0 = zondag)
  const startDayOfWeek = firstDay.getDay();

  // Hoeveel dagen heeft de huidige maand
  const totalDays = lastDay.getDate();

  // Hoeveel dagen had de vorige maand
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Voeg de laatste paar dagen van de vorige maand toe (om het raster te vullen)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
  }

  // Voeg alle dagen van de huidige maand toe
  for (let i = 1; i <= totalDays; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }

  // Vul het raster verder aan met de eerste dagen van de volgende maand
  // zodat het rooster altijd 6 rijen van 7 dagen (42 cellen) bevat
  while (days.length < 42) {
    days.push({
      day: days.length - (startDayOfWeek + totalDays) + 1,
      isCurrentMonth: false,
    });
  }

  return days;
}

// Hoofdcomponent van de kalender
const CalendarApp: React.FC = () => {
  const today = new Date(); // Vandaag
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // Huidige maand
  const [currentYear, setCurrentYear] = useState(today.getFullYear()); // Huidig jaar

  // Genereer alle dagen voor de huidige maandweergave
  const days = generateCalendarDays(currentYear, currentMonth);

  // Ga één maand terug
  const prevMonth = () => {
    if (currentMonth === 0) {
      // Als we in januari zijn ga naar december van het vorige jaar
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Ga één maand vooruit
  const nextMonth = () => {
    if (currentMonth === 11) {
      // Als we in december zijn ga naar januari van volgend jaar
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Maandnamen om te tonen in de titel
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="app-container">
      {/* Zijmenu aan de linkerkant */}
      <aside className="sidebar">
        <h1 className="sidebar-title">Office Calendar</h1>
        <nav className="nav">
          {/* Menu-items – alleen "Calendar" is actief */}
          <button className="nav-item active">Calendar</button>
          <button className="nav-item">Teams</button>
          <button className="nav-item">Rooms</button>
          <button className="nav-item">Tasks</button>
          <button className="nav-item">Settings</button>
        </nav>
      </aside>

      {/* Hoofdinhoud: de kalender zelf */}
      <main className="calendar-container">
        <div className="calendar-card">
          {/* Header met maand, jaar en navigatieknoppen */}
          <div className="calendar-header">
            <h2 className="calendar-title">
              {monthNames[currentMonth]} {currentYear}
            </h2>

            {/* Knoppen om te navigeren tussen maanden */}
            <div className="calendar-controls">
              <button onClick={prevMonth} className="control-button">◀</button>

              {/* Reset naar de huidige maand */}
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

          {/* Rasterweergave van de kalender */}
          <div className="calendar-grid">
            {/* Weekdagen als bovenste rij */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="weekday">{d}</div>
            ))}

            {/* Alle dagen van het raster (ook vorige/volgende maand) */}
            {days.map((date, i) => (
              <div
                key={i}
                className={`day-cell ${date.isCurrentMonth ? "current" : "other"}`}
              >
                {date.day}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarApp;
