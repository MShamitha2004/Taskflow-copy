Analytics Specification (MVP)

Events (capture)
- task_created, task_viewed, task_updated, task_moved, task_completed
- comment_added, attachment_added
- board_viewed, board_column_drag
- session_heartbeat (light focus ping)

Derived Metrics
- Tasks completed per week
- Cycle time (created → done)
- Time-in-column (per status)
- Staleness (no activity > X days)
- Update frequency (edits per task)

Dashboards
- Team: throughput, WIP by column, bottlenecks
- Personal: assigned tasks, focus windows, completion rate

Suggestions (examples)
- WIP too high → limit in-progress tasks
- Stale tasks → nudge assignee
- Best focus window → suggest scheduling block

Data Model
- ActivityEvent: id, user_id, entity_type, entity_id, action, metadata, created_at
- Rollups (daily): per user/project metrics for charts


