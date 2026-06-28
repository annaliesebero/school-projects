import { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import MonthCalendar from "../../Calendar";
import { useAuth } from "../../../contexts/AuthContext";

export default function ProfilePage() {
  const auth = useAuth();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completed, setCompleted] = useState(() => (auth ? auth.getCompleted() : 0));

  useEffect(() => {
    if (auth.user) {
      setTasks(auth.getTasks() || []);
      setCompleted(auth.getCompleted() || 0);
      const profile = auth.getProfile();
      setName(profile.name || "");
      setAge(profile.age || "");
      setInterests(profile.interests || "");
    } else {
      setTasks([]);
      setCompleted(0);
    }
  }, [auth.user]);

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = (field) => {
    if (field === "name") setName(tempValue);
    if (field === "age") setAge(tempValue);
    if (field === "interests") setInterests(tempValue);
    
    // Save to auth context
    const updatedProfile = {
      name: field === "name" ? tempValue : name,
      age: field === "age" ? tempValue : age,
      interests: field === "interests" ? tempValue : interests,
    };
    auth.saveProfile(updatedProfile);
    
    setEditingField(null);
    setTempValue("");
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  const monthLabel = (() => {
    const d = selectedDate;
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  })();

  return (
    <Container fluid className="d-flex flex-column" style={{ padding: 0, minHeight: "100vh" }}>
      {/* Header */}
      <div className="border-bottom p-3" style={{ background: "var(--color-background-alt)" }}>
        <h4 className="m-0" style={{ color: "var(--color-primary)" }}>Profile</h4>
      </div>

      {/* Content: left (profile), right (calendar) */}
      <div className="d-flex p-3 gap-4" style={{ flex: 1, overflow: "hidden" }}>
        {/* Left: Profile Section */}
        <div className="d-flex flex-column border rounded p-5" style={{ flex: 1, minWidth: 0, background: "var(--color-background)", overflowY: "auto" }}>
          {/* Welcome Header */}
          <div className="mb-5">
            <h2 className="m-0" style={{ color: "var(--color-text)", fontSize: 28, fontWeight: 600 }}>
              Hello {name || (auth.user ? auth.user.username.charAt(0).toUpperCase() + auth.user.username.slice(1) : "Guest")}!
            </h2>
            <p className="m-0 mt-2 small" style={{ color: "var(--color-text-muted)" }}>
              Manage your profile information
            </p>
          </div>

          {/* Profile Fields */}
          <div className="d-flex flex-column gap-5">
              {/* Name Field */}
              <ProfileField
                label="Name"
                value={name}
                placeholder="Add your name"
                isEditing={editingField === "name"}
                tempValue={tempValue}
                onEdit={() => handleEdit("name", name)}
                onSave={() => handleSave("name")}
                onCancel={handleCancel}
                onChange={setTempValue}
              />

              {/* Age Field */}
              <ProfileField
                label="Age"
                value={age}
                placeholder="Add your age"
                isEditing={editingField === "age"}
                tempValue={tempValue}
                onEdit={() => handleEdit("age", age)}
                onSave={() => handleSave("age")}
                onCancel={handleCancel}
                onChange={setTempValue}
              />

              {/* Interests Field */}
              <ProfileField
                label="Interests"
                value={interests}
                placeholder="Add your interests"
                isEditing={editingField === "interests"}
                tempValue={tempValue}
                onEdit={() => handleEdit("interests", interests)}
                onSave={() => handleSave("interests")}
                onCancel={handleCancel}
                onChange={setTempValue}
              />

            {/* Tasks Completed (Read-only) */}
            <div className="pb-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small fw-bold mb-2" style={{ color: "var(--color-text-muted)" }}>
                    Tasks Completed
                  </div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--color-primary)",
                    color: "var(--color-text)",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {completed ?? 0}
                </div>
              </div>
            </div>
            </div>
          </div>

        {/* Right: Activity Calendar */}
        <div className="d-flex flex-column border rounded p-5" style={{ flex: 1, minWidth: 0, background: "var(--color-background)" }}>
          <div className="mb-4">
            <h3 className="m-0 fw-bold" style={{ fontSize: 18, color: "var(--color-text)" }}>
              Activity Calendar
            </h3>
            <p className="m-0 mt-2 small" style={{ color: "var(--color-text-muted)" }}>
              {monthLabel}
            </p>
          </div>
          
          <div className="d-flex align-items-center justify-content-center" style={{ flex: 1 }}>
            <div style={{ width: "100%", maxWidth: 600 }}>
              <MonthCalendar
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-top d-flex flex-column align-items-center">
            <div className="small mb-3" style={{ color: "var(--color-text-muted)" }}>
              Task density
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small" style={{ color: "var(--color-text-muted)" }}>Less</span>
              <div className="d-flex gap-1">
                <div style={{ width: 16, height: 16, borderRadius: 3, border: "1px solid var(--color-border-light)", background: "transparent" }} />
                <div style={{ width: 16, height: 16, borderRadius: 3, background: "var(--color-primary)", opacity: 0.25 }} />
                <div style={{ width: 16, height: 16, borderRadius: 3, background: "var(--color-primary)", opacity: 0.6 }} />
                <div style={{ width: 16, height: 16, borderRadius: 3, background: "var(--color-primary)", opacity: 1 }} />
              </div>
              <span className="small" style={{ color: "var(--color-text-muted)" }}>More</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

// Reusable Profile Field Component
function ProfileField({
  label,
  value,
  placeholder,
  isEditing,
  tempValue,
  onEdit,
  onSave,
  onCancel,
  onChange,
}) {
  return (
    <div className="pb-3 border-bottom">
      <div className="d-flex justify-content-between align-items-start">
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <div className="mt-2">
              <Form.Label className="small fw-bold mb-2" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </Form.Label>
              <Form.Control
                type="text"
                value={tempValue}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus
                style={{
                  background: "var(--color-secondary)",
                  color: "var(--color-text-on-light)",
                }}
              />
              <div className="d-flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={onSave}
                  style={{
                    background: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "none",
                  }}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 15, color: "var(--color-text)" }}>
              {value || <span className="text-muted" style={{ fontStyle: "italic" }}>{placeholder}</span>}
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="bg-transparent border-0"
            style={{
              cursor: "pointer",
              padding: 4,
              marginLeft: 8,
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}