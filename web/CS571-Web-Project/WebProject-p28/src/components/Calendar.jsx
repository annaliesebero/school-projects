import { useMemo } from "react";

/**
 * Calendar
 * 
 * A reusable month calendar grid component with GitHub-style task density visualization.
 * 
 * @param {Array} tasks - Array of task objects with dueDate property (YYYY-MM-DD format)
 * @param {Date} selectedDate - Currently selected date (determines which month to show)
 * @param {Function} onSelectDate - Callback when a date is clicked (receives Date object)
 * @param {Object} style - Optional styles for the container
 */
export default function Calendar({ 
  tasks = [], 
  selectedDate = new Date(), 
  onSelectDate = () => {},
  style = {}
}) {
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
    <div className="d-flex flex-column gap-1" style={style}>
      {/* Weekday header row */}
      <div className="mb-1 small" style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          color: "var(--color-text-muted)"
        }}>
        {weekdayLabels.map((label, idx) => (
          <div key={`${label}-${idx}`} className="text-center">
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
                <div key={`empty-${rowIndex}-${colIndex}`} className="w-100 rounded" style={{
                    paddingTop: "100%",
                    background: "transparent"
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
                className="position-relative w-100 rounded border"
                style={{
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