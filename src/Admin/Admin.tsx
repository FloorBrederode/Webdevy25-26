import { useEffect, useState } from "react";

type StatCardProps = {
    title: string;
    value: string;
    onClick?: () => void;
};

// A reusable card component for stats
function StatCard({ title, value }: StatCardProps) {
    return (
        <div
            className={
                "bg-white rounded-2xl shadow-md p-6"
            }
        >
            <h3 className="text-lg font-semibold mb-1">
                {title}
            </h3>
            <p className="text-gray-500">{value}</p>
        </div>
    );
}

// A simple activity feed component
type ActivityFeedProps = {
    activities: string[];
};

// displays recent activities
function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
            <ul className="divide-y divide-gray-200">
                {activities.map((activity, index) => (
                    <li key={index} className="py-2 text-sm text-gray-700">
                        {activity}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// The main admin dashboard component
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
        // Later: use react-router-dom -> navigate("/events")
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                {/* Left side: title */}
                <h1 className="text-lg font-bold">Welcome, Admin</h1>

                {/* Center: navigation links */}
                <nav className="hidden sm:flex space-x-6">
                    <button
                        onClick={() => handleNavigate("events")}
                        className="hover:text-gray-300"
                    >
                        Events
                    </button>
                    <button
                        onClick={() => handleNavigate("teams")}
                        className="hover:text-gray-300"
                    >
                        Teams
                    </button>
                    <button
                        onClick={() => handleNavigate("rooms")}
                        className="hover:text-gray-300"
                    >
                        Rooms
                    </button>
                    <button
                        onClick={() => handleNavigate("tasks")}
                        className="hover:text-gray-300"
                    >
                        Tasks
                    </button>
                    <button
                        onClick={() => handleNavigate("settings")}
                        className="hover:text-gray-300"
                    >
                        Settings
                    </button>
                </nav>

                {/* Right side: live clock */}
                <div className="text-sm">{dateTime.toLocaleString()}</div>
            </header>


            {/* Main */}
            <main className="p-6 space-y-6">
                {/* Quick stats grid */}
                <div className="grid gap-20 sm:gap-12 lg:gap-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">                    <StatCard
                    title="Events"
                    value={stats.events}
                    onClick={() => handleNavigate("events")}
                />
                    <StatCard
                        title="Teams"
                        value={stats.teams}
                        onClick={() => handleNavigate("teams")}
                    />
                    <StatCard
                        title="Rooms"
                        value={stats.rooms}
                        onClick={() => handleNavigate("rooms")}
                    />
                    <StatCard
                        title="Tasks"
                        value={stats.tasks}
                        onClick={() => handleNavigate("tasks")}
                    />
                    <StatCard
                        title="Settings"
                        value="Manage system"
                        onClick={() => handleNavigate("settings")}
                    />
                </div>

                {/* Recent activity */}
                <ActivityFeed activities={activities} />
            </main>
        </div>
    );
}