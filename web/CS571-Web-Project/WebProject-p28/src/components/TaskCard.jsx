import { useState } from "react";
import { Card, Button } from "react-bootstrap";
import checkCircleIcon from "../assets/check-circle.svg";
import plusCircleIcon from "../assets/plus-circle.svg";
import trashIcon from "../assets/trash.svg";
import pencilIcon from "../assets/pencil.svg";

export default function TaskCard({
  title,
  description,
  dueDate,
  onDelete,
  onComplete,
  onEdit,
  draggable,
  onDragStart,
  color,
  compact = false,
  tiny = false,
  inlineActions = false,
  showDescription = true,
  onAddToStudy,
  isInStudySession = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const className = (tiny || compact) ? "task-card-slim" : undefined;

  const bodyStyle = tiny
    ? { padding: "0px", display: "flex", flexDirection: "column" }
    : compact
    ? { padding: "0px", display: "flex", flexDirection: "column" }
    : { padding: "4px 6px", display: "flex", flexDirection: "column" };

  const titleStyle = {
    fontWeight: tiny || compact ? 600 : "bold",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: tiny ? "0.9rem" : compact ? "0.95rem" : "1rem",
    marginRight: 0,
  };

  const menuBtnStyle = {
    background: "transparent",
    border: "none",
    padding: tiny ? 1 : 4,
    cursor: "pointer",
    fontSize: tiny ? 12 : 16,
    color: "var(--color-text-muted)",
  };

  const useMenu = (compact || tiny) && !inlineActions;

  return (
    <Card
      className={className}
      style={{
        marginBottom: tiny ? "0.125rem" : compact ? "0.375rem" : "0.5rem",
        textAlign: "left",
        cursor: draggable ? "grab" : "default",
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onMouseEnter={() => (compact || tiny) && setMenuOpen(true)}
      onMouseLeave={() => (compact || tiny) && setMenuOpen(false)}
    >
      <Card.Body className="position-relative d-flex flex-column" style={bodyStyle}>
        {/* Top section: title, description, dueDate */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="d-flex align-items-center gap-2">
            {/* Left side: color flag + title */}
            <div className="d-flex align-items-center flex-grow-1 gap-2" style={{ minWidth: 0 }}>
              {color && (
                <span aria-hidden="true" className="rounded-circle flex-shrink-0" style={{
                    width: tiny ? 8 : 10,
                    height: tiny ? 8 : 10,
                    backgroundColor: color,
                    boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                  }}
                />
              )}
              <span style={titleStyle}>{title}</span>
            </div>
          </div>

          {showDescription && description && !compact && !tiny && (
            <div className="mt-1 small" style={{ color: "var(--color-text-muted)" }}>
              {description}
            </div>
          )}

          {dueDate && !tiny && (
            <div className="small" style={{ marginTop: "0.12rem", color: "var(--color-text-muted)" }}>
              Due: {dueDate}
            </div>
          )}
        </div>

        {/* Bottom section: action buttons */}
        <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
          {useMenu ? (
            <div className="position-relative">
              <button
                aria-label="open menu"
                style={menuBtnStyle}
                onClick={() => setMenuOpen((s) => !s)}
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="position-absolute border rounded" style={{
                    right: 0,
                    top: "100%",
                    marginTop: 6,
                    background: "var(--color-secondary)",
                    borderColor: "var(--color-border-light)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    zIndex: 1000
                  }}>
                  <div className="d-flex flex-column" style={{ minWidth: 120 }}>
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit();
                          setMenuOpen(false);
                        }}
                        className="border-0 bg-transparent text-start"
                        style={{
                          padding: tiny ? "2px 6px" : "8px 12px",
                          cursor: "pointer",
                          fontSize: tiny ? "0.75rem" : undefined,
                          color: "var(--color-text-on-light)",
                        }}
                        title="Edit task"
                      >
                        Edit
                      </button>
                    )}
                    {onComplete && (
                      <button
                        onClick={() => {
                          onComplete();
                          setMenuOpen(false);
                        }}
                        className="border-0 bg-transparent text-start"
                        style={{
                          padding: tiny ? "2px 6px" : "8px 12px",
                          cursor: "pointer",
                          fontSize: tiny ? "0.75rem" : undefined,
                          color: "var(--color-text-on-light)",
                        }}
                        title="Mark as complete"
                      >
                        Complete
                      </button>
                    )}
                    {onAddToStudy && (
                      <button
                        onClick={() => {
                          if (!isInStudySession) {
                            onAddToStudy();
                            setMenuOpen(false);
                          }
                        }}
                        disabled={isInStudySession}
                        className="border-0 bg-transparent text-start"
                        style={{
                          padding: tiny ? "2px 6px" : "8px 12px",
                          cursor: isInStudySession ? "not-allowed" : "pointer",
                          fontSize: tiny ? "0.75rem" : undefined,
                          opacity: isInStudySession ? 0.5 : 1,
                          color: "var(--color-text-on-light)",
                        }}
                        title={isInStudySession ? "Already in study session" : "Add to study session"}
                      >
                        Add to Study
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete();
                          setMenuOpen(false);
                        }}
                        className="border-0 bg-transparent text-start"
                        style={{
                          padding: tiny ? "2px 6px" : "8px 12px",
                          color: "var(--color-danger)",
                          cursor: "pointer",
                          fontSize: tiny ? "0.75rem" : undefined,
                        }}
                        title="Delete task"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              {onEdit && (
                <Button
                  variant="primary"
                  size={tiny ? "sm" : "sm"}
                  onClick={onEdit}
                  style={{ padding: tiny ? "2px 6px" : "4px 8px" }}
                  title="Edit task"
                >
                  <img src={pencilIcon} alt="edit" style={{ width: 16, height: 16 }} />
                </Button>
              )}
              {onComplete && (
                <Button
                  variant="success"
                  size={tiny ? "sm" : "sm"}
                  onClick={onComplete}
                  style={{ padding: tiny ? "2px 6px" : "4px 8px" }}
                  title="Mark as complete"
                >
                  <img src={checkCircleIcon} alt="complete" style={{ width: 16, height: 16 }} />
                </Button>
              )}
              {onAddToStudy && (
                <Button
                  variant={isInStudySession ? "secondary" : "info"}
                  size={tiny ? "sm" : "sm"}
                  onClick={onAddToStudy}
                  disabled={isInStudySession}
                  style={{ 
                    padding: tiny ? "2px 6px" : "4px 8px",
                    opacity: isInStudySession ? 0.6 : 1,
                    cursor: isInStudySession ? "not-allowed" : "pointer",
                  }}
                  title={isInStudySession ? "Already in study session" : "Add to Study Session"}
                >
                  <img src={plusCircleIcon} alt="add to study" style={{ width: 16, height: 16 }} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  size={tiny ? "sm" : "sm"}
                  onClick={onDelete}
                  style={{ padding: tiny ? "2px 6px" : "4px 8px" }}
                  title="Delete task"
                >
                  <img src={trashIcon} alt="delete" style={{ width: 16, height: 16 }} />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}