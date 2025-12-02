import React, { useState } from "react";

export default function SettingsTab() {
  // Admin's own profile info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    // Replace with your API call to update admin info
    alert(`Profile updated!\nName: ${name}\nEmail: ${email}`);
  };

  return (
    <div className="settings-page">
      <h2>Admin Profile</h2>

      <div className="settings-section">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="settings-section">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      <button className="save-btn" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}
