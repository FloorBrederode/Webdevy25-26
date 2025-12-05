import React from "react";
import "./Calendar.css";

type DayProps = {
  day: number;
  isCurrentMonth: boolean;
  onClick?: (day: number) => void;
  hasEvents?: boolean;
};

const Day: React.FC<DayProps> = ({ day, isCurrentMonth, onClick, hasEvents }) => {
  return (
    <div
      className={`day-cell ${isCurrentMonth ? "current" : "other"}`}
      onClick={() => onClick && onClick(day)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick && onClick(day);
      }}
    >
      <div className="day-number">{day}</div>
      {/* small marker for events */}
      {hasEvents && <div className="event-dot" />}
    </div>
  );
};

export default Day;
