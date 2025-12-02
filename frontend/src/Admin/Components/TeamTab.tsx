// TeamsPage.tsx
import { Link } from "react-router-dom";

type Team = {
  id: number;
  name: string;
};

const userTeams: Team[] = [
  { id: 1, name: "Team Alpha" },
  { id: 2, name: "Team Beta" },
  { id: 3, name: "Team Gamma" },
];

export default function TeamsPage() {
  return (
    <div className="teams-page">
      <h1>Your Teams</h1>
      <ul>
        {userTeams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
      <Link to="/admin">← Back to Dashboard</Link>
    </div>
  );
}
