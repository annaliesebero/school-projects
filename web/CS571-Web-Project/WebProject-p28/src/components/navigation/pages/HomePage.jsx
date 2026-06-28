import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import TaskCard from "../../TaskCard";
import { useAuth } from "../../../contexts/AuthContext";
import paintBucketIcon from "../../../assets/paint-bucket.svg";
import trashIcon from "../../../assets/trash.svg";
import pencilIcon from "../../../assets/pencil.svg";

export default function HomePage() {
  const auth = useAuth();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [studySessionTasks, setStudySessionTasks] = useState([]);
  const [openColorPickerId, setOpenColorPickerId] = useState(null);
  const [editingTitleTabId, setEditingTitleTabId] = useState(null);
  const [addingTaskToTabId, setAddingTaskToTabId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    color: "#8B4513",
  });

  useEffect(() => {
    if (auth.user) setTasks(auth.getTasks());
    else setTasks([]);
  }, [auth.user]);

  useEffect(() => {
    if (auth.user) {
      setStudySessionTasks(auth.getStudySessionTasks() || []);
    } else {
      setStudySessionTasks([]);
    }
  }, [auth.user]);

  useEffect(() => {
    if (auth.user) {
      const cols = auth.getColumns() || [];
      if (!cols || cols.length === 0) {
        const initial = [{ id: `col-${Date.now()}`, title: "Add Title Here", color: "#ffffff" }];
        auth.setColumns(initial);
        setColumns(initial);
      } else setColumns(cols);
    } else setColumns([]);
  }, [auth.user]);

  const handleAddTab = () => {
    if (!auth.user) return alert("Please log in to add a tab.");
    // limit to 8 tabs
    if ((columns || []).length >= 8) return alert("Maximum of 8 tabs allowed.");
    const newCol = { id: `col-${Date.now()}`, title: "New Tab", color: "#ffffff" };
    const updated = [...(columns || []), newCol];
    setColumns(updated);
    auth.setColumns(updated);
  };

  const handleDeleteTab = (colId) => {
    if (!auth.user) return alert("Please log in to modify tabs.");
    const updatedCols = (columns || []).filter((c) => c.id !== colId);

    const existing = auth.getTasks();
    // When deleting a class/column, clear the status for tasks that used it
    const updatedTasks = existing.map((t) =>
      t.status === colId ? { ...t, status: null } : t
    );

    auth.setTasks(updatedTasks);
    setTasks(updatedTasks);
    setColumns(updatedCols);
    auth.setColumns(updatedCols);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    if (!auth.user) return alert("Please log in to save tasks to your account.");
    if (!addingTaskToTabId) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: addingTaskToTabId,
      color: newTask.color || "#8B4513",
    };

    const updated = auth.addTask(task);
    setTasks(updated);
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      color: "#8B4513",
    });
    setAddingTaskToTabId(null);
  };

  const handleCompleteTask = (id) => {
    if (!auth.user) return;
    const updated = auth.completeTaskById(id);
    setTasks(updated);
  };

  const handleDeleteTask = (id) => {
    if (!auth.user) return;
    const existing = auth.getTasks();
    const idx = existing.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const updated = auth.deleteTask(idx);
    setTasks(updated);
  };

  const handleEditTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setNewTask({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate || "",
        color: task.color || "#8B4513",
      });
      setEditingTaskId(id);
      setAddingTaskToTabId(task.status);
    }
  };

  const handleSaveEditedTask = () => {
    if (!newTask.title.trim()) return;
    if (!auth.user) return;
    if (!editingTaskId) return;

    const updated = auth.updateTaskById(editingTaskId, {
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      color: newTask.color,
    });
    setTasks(updated);
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      color: "#8B4513",
    });
    setEditingTaskId(null);
    setAddingTaskToTabId(null);
  };

  const handleCancelEdit = () => {
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      color: "#8B4513",
    });
    setEditingTaskId(null);
    setAddingTaskToTabId(null);
  };

  const handleAddTaskToStudy = (id) => {
    if (!auth.user) return alert("Please log in to add tasks to study session.");
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const updated = auth.addTaskToStudySession(task);
      setStudySessionTasks(updated);
    }
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = Number(idStr);
    const updated = auth.updateTaskById(id, { status: newStatus });
    setTasks(updated);
  };

  const allowDrop = (e) => e.preventDefault();

  // Only return tasks that are explicitly assigned to the given column id
  const byStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="d-flex flex-column gap-4 p-4">
      {/* Tabs area */}
      <div className="d-flex justify-content-center">
        <div className="w-100 border rounded p-3" style={{ maxWidth: 1200, background: "var(--color-primary)", borderColor: "var(--color-border)" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="m-0" style={{ color: "var(--color-text)" }}>Tabs</h2>
            <Button size="sm" onClick={handleAddTab}>+ Create Tab</Button>
          </div>

          {/* No tabs message */}
          {(!columns || columns.length === 0) && (
            <div className="text-center p-4" style={{ color: "var(--color-text)", fontSize: "1.1rem" }}>
              Create a tab to start!
            </div>
          )}

          {/* Tabs grid */}
          {columns && columns.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {columns.map((col) => (
                <div
                  key={col.id}
                  onDragOver={allowDrop}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="rounded p-3 d-flex flex-column"
                  style={{background: "var(--color-secondary)",borderTop: `${col.color} solid 6px`,minHeight: 300}}
                >
                  {/* Tab header with title and color picker */}
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-3 position-relative">
                    {editingTitleTabId === col.id ? (
                      <Form.Control
                        autoFocus
                        value={col.title}
                        onChange={(e) => {
                          const updated = columns.map((c) => (c.id === col.id ? { ...c, title: e.target.value } : c));
                          setColumns(updated);
                          auth.setColumns(updated);
                        }}
                        onBlur={() => setEditingTitleTabId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingTitleTabId(null);
                        }}
                        className="flex-grow-1 fw-bold"
                        aria-label="Edit tab title"
                        style={{
                          border: "1px solid var(--color-border-light)",
                          background: "transparent",
                          fontSize: 16,
                          color: "var(--color-text-on-light)",
                        }}
                      />
                    ) : (
                      <h3
                        onClick={() => setEditingTitleTabId(col.id)}
                        className="flex-grow-1 m-0 fw-bold rounded user-select-none"
                        style={{
                          cursor: "pointer",
                          padding: "4px 8px",
                          color: "var(--color-text-on-light)",
                          fontSize: 16
                        }}
                        title="Click to edit"
                      >
                        {col.title}
                      </h3>
                    )}
                    <button
                      onClick={() => setOpenColorPickerId(openColorPickerId === col.id ? null : col.id)}
                      className="rounded border-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        background: "transparent",
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Click to change color"
                    >
                      <img src={paintBucketIcon} alt="color picker" style={{ width: 20, height: 20 }} />
                    </button>
                    {openColorPickerId === col.id && (
                      <div className="position-absolute border rounded p-2 d-flex flex-wrap gap-2" style={{
                        top: "100%",
                        right: 0,
                        marginTop: 8,
                        background: "var(--color-secondary)",
                        borderColor: "var(--color-border-light)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        width: 180
                      }}>
                        {['#8B4513', '#CC8800', '#D2691E', '#6B8E23', '#2E5C8A', '#6B4C9A', '#C74375', '#483e62', '#8B7500', '#5c5c57'].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              const updated = columns.map((c) => (c.id === col.id ? { ...c, color } : c));
                              setColumns(updated);
                              auth.setColumns(updated);
                              setOpenColorPickerId(null);
                            }}
                            className="rounded"
                            style={{
                              width: 24,
                              height: 24,
                              background: color,
                              border: col.color === color ? '3px solid #000' : '1px solid var(--color-border-light)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDeleteTab(col.id)} title="Delete tab" style={{ padding: "4px 8px" }}>
                      <img src={trashIcon} alt="delete" style={{ width: 16, height: 16 }} />
                    </Button>
                  </div>

                  {/* Tasks list */}
                  <div className="flex-grow-1 d-flex flex-column gap-2 overflow-auto mb-3">
                    {byStatus(col.id).map((task) => {
                      const isInStudySession = studySessionTasks.some((st) => st.id === task.id);
                      return (
                        <TaskCard
                          key={task.id}
                          title={task.title}
                          description={task.description}
                          dueDate={task.dueDate}
                          onDelete={() => handleDeleteTask(task.id)}
                          onComplete={() => handleCompleteTask(task.id)}
                          onAddToStudy={() => handleAddTaskToStudy(task.id)}
                          onEdit={() => handleEditTask(task.id)}
                          isInStudySession={isInStudySession}
                          draggable={true}
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(task.id))}
                          color={task.color}
                        />
                      );
                    })}
                  </div>

                  {/* Add/Edit Task form for this tab */}
                  {addingTaskToTabId === col.id ? (
                    <div className="border-top pt-3 d-flex flex-column gap-2" style={{ borderColor: "var(--color-border-light)" }}>
                      <Form.Group>
                        <Form.Label className="small">Task Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label className="small">Description (optional)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Description (optional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label className="small">Due Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        />
                      </Form.Group>
                      <div>
                        <div className="small mb-1">Color</div>
                        <div className="d-flex gap-1 flex-wrap">
                          {['#8B4513', '#CC8800', '#D2691E', '#6B8E23', '#2E5C8A', '#6B4C9A', '#C74375', '#483e62', '#8B7500', '#5c5c57'].map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewTask({ ...newTask, color })}
                              className="rounded"
                              aria-label={`Select color ${color}`}
                              style={{
                                width: 24,
                                height: 24,
                                background: color,
                                border: newTask.color === color ? '3px solid #000' : '1px solid var(--color-border-light)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {editingTaskId ? (
                          <>
                            <Button size="sm" variant="success" onClick={handleSaveEditedTask}>Save</Button>
                            <Button size="sm" variant="outline-secondary" onClick={handleCancelEdit}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="success" onClick={handleAddTask}>Add</Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => setAddingTaskToTabId(null)}>Cancel</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline-primary" onClick={() => setAddingTaskToTabId(col.id)} className="w-100">
                      + Add Task
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}