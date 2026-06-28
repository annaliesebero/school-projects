import { useEffect, useState, useMemo } from "react";
import { Container } from "react-bootstrap";
import TaskCard from "../../TaskCard";
import { useAuth } from "../../../contexts/AuthContext";

export default function WeeklyCalendar() {
  const auth = useAuth();

  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (auth.user) {
      setTasks(auth.getTasks() || []);
      setColumns(auth.getColumns() || []);
    } else {
      setTasks([]);
      setColumns([]);
    }
  }, [auth.user]);

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
  }, [tasks, weekInfo, toISODate]);

  const getClassForTask = (task) =>
    columns.find((c) => c.id === task.status) || null;

  const handleDeleteTask = (taskId) => {
    const existing = auth.getTasks();
    const idx = existing.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    const updated = auth.deleteTask(idx);
    setTasks(updated);
  };

  const handleCompleteTask = (taskId) => {
    const updated = auth.completeTaskById(taskId);
    setTasks(updated);
  };

  const formatDayHeading = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  const weekLabel = (() => {
    const { start, end } = weekInfo;
    const opts = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  })();

  const monthLabel = (() => {
    const d = selectedDate;
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  })();

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="border-bottom p-3 d-flex justify-content-between align-items-baseline" style={{
            background: "var(--color-background-alt)",
            borderColor: "var(--color-border)"
          }}>
          <div>
            <h4 className="m-0" style={{ color: "var(--color-primary)" }}>Weekly Calendar</h4>
            <div className="small" style={{ color: "var(--color-text-muted)" }}>{weekLabel}</div>
          </div>
          <div className="small" style={{ color: "var(--color-text-muted)" }}>{monthLabel}</div>
        </div>

        {/* Content: left (month grid), right (week tasks) */}
        <div className="flex-grow-1 d-flex p-3 gap-3 overflow-hidden">
          {/* Left: Month grid */}
          <div className="flex-grow-1 border rounded p-3 d-flex flex-column" style={{
              minWidth: 0,
              background: "var(--color-background)",
              borderColor: "var(--color-border-light)"
            }}>
            <div className="fw-bold mb-2" style={{ fontSize: 14 }}>
              This month
            </div>
            <MonthCalendarGrid
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Right: Week tasks (scrollable) */}
          <div className="flex-grow-1 border rounded p-3 d-flex flex-column" style={{
              minWidth: 0,
              background: "var(--color-background)",
              borderColor: "var(--color-border-light)"
            }}>
            <div className="fw-bold mb-2" style={{ fontSize: 14 }}>
              Tasks this week
            </div>
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
                        {dayTasks.map((task) => {
                          const cls = getClassForTask(task);
                          const classColor =
                            cls?.color || task.color || "var(--color-primary)";
                          return (
                            <TaskCard
                              key={task.id}
                              title={task.title}
                              description={task.description}
                              showDescription={false}
                              compact={true}
                              tiny={true}
                              inlineActions={true}
                              onDelete={() => handleDeleteTask(task.id)}
                              onComplete={() => handleCompleteTask(task.id)}
                              color={classColor}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

/**
 * MonthCalendarGrid
 * - Shows the current month in a grid.
 * - Each day is a square with GitHub-style shading based on # of tasks with that dueDate.
 * - Clicking a day selects it (drives the weekly view).
 */
function MonthCalendarGrid({ tasks, selectedDate, onSelectDate }) {
  const today = new Date();
  const baseMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth(); // 0-11

  // Utility: Date -> "YYYY-MM-DD"
  const toISODate = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  // Count tasks per date (for this month)
  const taskCounts = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      // Only consider tasks in this month (for shading)
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        counts[t.dueDate] = (counts[t.dueDate] || 0) + 1;
      }
    });
    return counts;
  }, [tasks, year, month]);

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay(); // 0-Sun .. 6-Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // Leading blanks
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  // Trailing blanks to complete rows of 7
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const selectedISO = toISODate(selectedDate);

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const getShade = (count) => {
    if (!count || count <= 0) return { bg: "transparent", opacity: 1 };

    // 1 -> light, 2 -> medium, 3+ -> strong
    if (count === 1) return { bg: "var(--color-primary)", opacity: 0.25 };
    if (count === 2) return { bg: "var(--color-primary)", opacity: 0.6 };
    return { bg: "var(--color-primary)", opacity: 1 };
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="d-flex flex-column gap-1">
      {/* Weekday header row */}
      <div className="mb-1 small" style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          color: "var(--color-text)"
        }}>
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {rows.map((row, rowIndex) =>
          row.map((cellDate, colIndex) => {
            if (!cellDate) {
              return (
                <div
                  key={`empty-${rowIndex}-${colIndex}`}
                  style={{
                    width: "100%",
                    paddingTop: "100%",
                    borderRadius: 4,
                    background: "transparent",
                  }}
                />
              );
            }

            const iso = toISODate(cellDate);
            const count = taskCounts[iso] || 0;
            const shade = getShade(count);

            const isToday = isSameDay(cellDate, today);
            const isSelected = iso === selectedISO;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDate(new Date(cellDate))}
                className="position-relative rounded border"
                style={{
                  width: "100%",
                  paddingTop: "100%", // square
                  borderColor: isSelected ? "var(--color-primary)" : "var(--color-border-light)",
                  borderWidth: isSelected ? 2 : 1,
                  background: shade.bg,
                  opacity: shade.opacity,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {/* Day number */}
                <div className="position-absolute" style={{
                    top: 2,
                    left: 3,
                    fontSize: 10,
                    color: count ? "var(--color-text)" : "var(--color-text-muted)",
                    textShadow: count ? "0 0 2px rgba(0,0,0,0.6)" : "none",
                  }}>
                  {cellDate.getDate()}
                </div>

                {/* Today dot */}
                {isToday && (
                  <div className="position-absolute rounded-circle" style={{
                      bottom: 3,
                      right: 3,
                      width: 6,
                      height: 6,
                      background: "var(--color-success)",
                      boxShadow: "0 0 4px var(--color-success)",
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}