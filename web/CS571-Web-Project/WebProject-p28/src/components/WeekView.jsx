import { useMemo } from "react";

/**
 * WeekView
 * 
 * A reusable week view component that displays tasks organized by day.
 * 
 * @param {Array} tasks - Array of task objects with dueDate property (YYYY-MM-DD format)
 * @param {Date} selectedDate - The date within the week to display
 * @param {Function} renderTask - Function to render each task (receives task object)
 * @param {Object} style - Optional styles for the container
 */
export default function WeekView({ 
  tasks = [], 
  selectedDate = new Date(),
  renderTask = (task) => <div>{task.title}</div>,
  style = {}
}) {
  // Utility: format Date -> "YYYY-MM-DD" (matches <input type="date">)
  const toISODate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Week range based on selected date (Sunday–Saturday)
  const weekInfo = useMemo(() => {
    const base = new Date(selectedDate);
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    start.setDate(base.getDate() - base.getDay()); // move back to Sunday

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    const end = new Date(days[6]);
    end.setHours(23, 59, 59, 999);

    return { start, end, days };
  }, [selectedDate]);

  // Tasks that fall within the selected week (based on dueDate)
  const tasksByDate = useMemo(() => {
    const map = {};
    for (const d of weekInfo.days) {
      map[toISODate(d)] = [];
    }

    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = t.dueDate;
      if (map[key]) map[key].push(t);
    });

    return map;
  }, [tasks, weekInfo]);

  const formatDayHeading = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <div className="d-flex flex-column" style={style}>
      <div className="flex-grow-1 overflow-auto pe-1">
        {weekInfo.days.map((d) => {
          const iso = toISODate(d);
          const dayTasks = tasksByDate[iso] || [];
          return (
            <div key={iso} className="mb-3 pb-2" style={{ borderBottom: "1px dashed var(--color-border-light)" }}>
              <div className="fw-bold mb-1 small" style={{ color: "var(--color-text-muted)" }}>
                {formatDayHeading(d)}
              </div>
              {dayTasks.length === 0 ? (
                <div className="fst-italic small" style={{ color: "var(--color-text-muted)" }}>
                  No tasks
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {dayTasks.map((task) => (
                    <div key={task.id}>
                      {renderTask(task)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}