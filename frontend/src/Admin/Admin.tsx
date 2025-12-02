import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import EventsTab from "./Components/EventsTab";
import "./Admin.css";
import { AddEventForm } from "./Components/AddEvent";
import ActivityFeed from "./Components/ActivityFeed";


// Mock user data; replace with real auth logic
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const user: User = {
  id: 1,
  name: "Floor",
  email: "floor@company.com",
  role: "admin",
};

export default function AdminDashboard() {
  const [dateTime, setDateTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<
    "main" | "teams" | "events" | "rooms" | "tasks" | "settings"
  >("main");

  const [activities] = useState<string[]>([
    "New event 'Workshop' added for Sept 20",
    "Room 2 booked by Team Alpha",
    "Task 'Prepare Q3 report' marked complete",
    "3 attendees signed up for 'Team Meeting'",
  ]);

  const [userTeams] = useState([
    { id: 1, name: "Team Alpha" },
    { id: 2, name: "Team Beta" },
    { id: 3, name: "Team Gamma" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: typeof activeTab) => setActiveTab(tab);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <button
          className={`return-link ${activeTab === "main" ? "active" : ""}`}
          onClick={() => handleTabClick("main")}
        >
          ← Return to Dashboard
        </button>

        <h1>Welcome, Admin</h1>

        <nav className="admin-nav">
          <button
            className={activeTab === "main" ? "active" : ""}
            onClick={() => handleTabClick("main")}
          >
            Home
          </button>
          <button
            className={activeTab === "events" ? "active" : ""}
            onClick={() => handleTabClick("events")}
          >
            Events
          </button>
          <button
            className={activeTab === "teams" ? "active" : ""}
            onClick={() => handleTabClick("teams")}
          >
            Teams
          </button>
          <button
            className={activeTab === "rooms" ? "active" : ""}
            onClick={() => handleTabClick("rooms")}
          >
            Rooms
          </button>
          <button
            className={activeTab === "tasks" ? "active" : ""}
            onClick={() => handleTabClick("tasks")}
          >
            Tasks
          </button>
          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => handleTabClick("settings")}
          >
            Settings
          </button>
        </nav>

        <div className="admin-clock">{dateTime.toLocaleString()}</div>
      </header>

      <main className="admin-main">
        {/* Main content */}
        {activeTab === "main" && (
          <div className="main-grid">
            {/* Left Panel */}
            <div className="left-panel">
              <ActivityFeed activities={activities} />
            </div>

            {/* Right Panel */}
            <div className="right-panel">
              {/* Add Event Block */}
              <div className="add-event-block">
                <h2>Add Event</h2>
                <AddEventForm userId={user?.id} />
              </div>

              {/* User Info Block */}
              <div className="user-info-block">
                <h2>Your Info</h2>
                {user ? (
                  <div className="user-info">
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                  </div>
                ) : (
                  <p>Loading user info...</p>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === "teams" && (
          <div className="teams-page">
            <h2>Your Teams</h2>
            <ul>
              {userTeams.map(team => (
                <li key={team.id}>{team.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Render the separate EventsTab */}
        {activeTab === "events" && <EventsTab />}

        {activeTab === "rooms" && <div><h2>Rooms Page (fetch from DB)</h2></div>}
        {activeTab === "tasks" && <div><h2>Tasks Page (fetch from DB)</h2></div>}
        {activeTab === "settings" && <div><h2>Settings Page</h2></div>}
      </main>
    </div >
  );
}