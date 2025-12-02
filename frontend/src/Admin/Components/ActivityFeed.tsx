export default ActivityFeed;

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