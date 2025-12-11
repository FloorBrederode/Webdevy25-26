import { useEffect, useState } from "react";

export type Event = {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
};

export default function EventsTab() {
  // Mock events; later replace with fetch from API
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      name: "Workshop",
      description: "Learn React",
      start_time: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      end_time: new Date(Date.now() + 90000000).toISOString(),
    },
    {
      id: 2,
      name: "Team Meeting",
      description: "Weekly sync",
      start_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      end_time: new Date(Date.now() - 171000000).toISOString(),
    },
  ]);

  // Split upcoming vs past events
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.start_time) >= now);
  const pastEvents = events.filter((e) => new Date(e.start_time) < now);

  return (
    <div className="main-grid">
      {/* Left Panel - Upcoming Events (work events) */}
      <div className="left-panel">
        <h2>Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p>No upcoming events</p>
        ) : (
          <ul>
            {upcomingEvents.map((e) => (
              <li key={e.id}>
                <strong>{e.name}</strong> <br />
                {new Date(e.start_time).toLocaleString()} -{" "}
                {new Date(e.end_time).toLocaleString()} <br />
                {e.description}
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* left panel personal events */}
      <div className="right-panel">
        <h2>Personal Events</h2>
        {pastEvents.length === 0 ? (
          <p>No personal events</p>
        ) : (
          <ul>
            {pastEvents.map((e) => (
              <li key={e.id}>
                <strong>{e.name}</strong> <br />
                {new Date(e.start_time).toLocaleString()} -{" "}
                {new Date(e.end_time).toLocaleString()} <br />
                {e.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


{/* Right Panel - Past Events
      <div className="right-panel">
        <h2>Past Events</h2>
        {pastEvents.length === 0 ? (
          <p>No past events</p>
        ) : (
          <ul>
            {pastEvents.map((e) => (
              <li key={e.id}>
                <strong>{e.name}</strong> <br />
                {new Date(e.start_time).toLocaleString()} -{" "}
                {new Date(e.end_time).toLocaleString()} <br />
                {e.description}
              </li>
            ))}
          </ul>
        )}
      </div> */}

