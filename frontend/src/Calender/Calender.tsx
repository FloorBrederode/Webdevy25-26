import React from "react";
import "./Calendar.css";
import Sidebar from "./Sidebar";
import CalendarComponent from "./CalendarComponent";
import AiSummaryWidget from "./AiSummaryWidget";

const CalendarPage: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />

      <main className="calendar-container">
        <CalendarComponent />
      </main>

      <AiSummaryWidget />
    </div>
  );
};

export default CalendarPage;
