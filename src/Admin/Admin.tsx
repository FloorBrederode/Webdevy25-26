import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";

type StatCardProps = {
  title: string;
  value: string;
  onClick?: () => void;
};

function StatCard({ title, value, onClick }: StatCardProps) {
  return (
    <div className="stat-card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

type ActivityFeedProps = {
  activities: string[];
};

function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="activity-feed">
      <h2>Recent Activity</h2>
      <ul>
        {activities.map((activity, index) => (
          <li key={index}>{activity}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminDashboard() {
  const [dateTime, setDateTime] = useState(new Date());
  const [stats] = useState({
    events: "2 upcoming",
    teams: "4 active",
    rooms: "1 booked",
    tasks: "5 pending",
  });

  const [activities] = useState<string[]>([
    "New event 'Workshop' added for Sept 20",
    "Room 2 booked by Team Alpha",
    "Task 'Prepare Q3 report' marked complete",
    "3 attendees signed up for 'Team Meeting'",
  ]);

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (page: string) => {
    alert(`This would navigate to: ${page}`);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        {/* Left side: return link */}
        <Link to="/calendar" className="return-link">
          ← Return to Calendar
        </Link>

        {/* Center: title */}
        <h1>Welcome, Admin</h1>

        {/* Navigation */}
        <nav className="admin-nav">
          <button onClick={() => handleNavigate("events")}>Events</button>
          <button onClick={() => handleNavigate("teams")}>Teams</button>
          <button onClick={() => handleNavigate("rooms")}>Rooms</button>
          <button onClick={() => handleNavigate("tasks")}>Tasks</button>
          <button onClick={() => handleNavigate("settings")}>Settings</button>
        </nav>

        {/* Right side: live clock */}
        <div className="admin-clock">{dateTime.toLocaleString()}</div>
      </header>

      {/* Main */}
      <main className="admin-main">
        <div className="stat-grid">
          <StatCard title="Events" value={stats.events} />
          <StatCard title="Teams" value={stats.teams} />
          <StatCard title="Rooms" value={stats.rooms} />
          <StatCard title="Tasks" value={stats.tasks} />
          <StatCard title="Settings" value="Manage system" />
        </div>

        <ActivityFeed activities={activities} />
      </main>
    </div>
  );
}
