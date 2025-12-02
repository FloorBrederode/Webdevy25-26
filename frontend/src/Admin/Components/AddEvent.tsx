import { useEffect, useState } from "react";

type Room = {
  id: number;
  location: string;
};

// Organizer ID will be added automatically
type AddEventFormProps = {
  userId: number; 
};

export function AddEventForm({ userId }: AddEventFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  // selected room for the event, dropdown
  const [roomId, setRoomId] = useState<number | null>(null);
  // available rooms to choose from
  const [rooms, setRooms] = useState<Room[]>([]);
  const [message, setMessage] = useState("");

  // Fetch rooms from API
  useEffect(() => {
    fetch("/api/rooms/all")
      .then(async res => {
        console.log("STATUS:", res.status);
        const json = await res.json();
        console.log("ROOM PAYLOAD:", json);
        setRooms(json);
      })
      .catch(err => console.error("ROOM ERROR:", err));
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId) {
      setMessage("Please select a room");
      return;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          start_time: startTime,
          end_time: endTime,
          organizer_id: userId,
          room_ids: [roomId],
          attendee_ids: [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage("Error: " + (data.error || "Failed to add event"));
        return;
      }

      setMessage("Event added successfully!");
      setName("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setRoomId(null);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add event");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <input
        type="text"
        placeholder="Event Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />

      {/* Room selection */}
      <select
        value={roomId ?? ""}
        onChange={(e) => setRoomId(Number(e.target.value))}
        required
      >
        <option value="" disabled>
          Select Room
        </option>
        {rooms.map(room => (
          <option key={room.id} value={room.id}>
            {room.location ?? room.location}
          </option>
        ))}

      </select>

      <button type="submit">Add Event</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}
