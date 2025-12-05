import React from "react";
import { Link } from "react-router-dom";
import "./Calendar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Office Calendar</h1>
      <nav className="nav">
        <button className="nav-item active">Calendar</button>
        <button className="nav-item">Teams</button>
        <button className="nav-item">Rooms</button>
        <button className="nav-item">Tasks</button>
        <Link className="nav-item" to="/admin">
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
