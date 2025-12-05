import React from "react";
import "./Calendar.css"; // importeer onze CSS-styling
import Sidebar from "./Sidebar";
import CalendarComponent from "./CalendarComponent";

const CalendarPage: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />

      <main className="calendar-container">
        <CalendarComponent />
      </main>
    </div>
  );
};

export default CalendarPage;
