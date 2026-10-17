import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .list()
      .then((data) => {
        if (active) setTodos(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (filter === "open") return todos.filter((todo) => !todo.completed);
    if (filter === "done") return todos.filter((todo) => todo.completed);
    return todos;
  }, [todos, filter]);

  const remaining = todos.filter((todo) => !todo.completed).length;

  async function addTodo(event) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setBusy(true);
    setError("");
    try {
      const created = await api.create(nextTitle);
      setTodos((current) => [created, ...current]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleTodo(todo) {
    const previous = todos;
    setTodos((current) =>
      current.map((item) =>
        item._id === todo._id ? { ...item, completed: !item.completed } : item,
      ),
    );
    try {
      const updated = await api.update(todo._id, { completed: !todo.completed });
      setTodos((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      setTodos(previous);
      setError(err.message);
    }
  }

  function startEdit(todo) {
    setEditingId(todo._id);
    setDraft(todo.title);
  }

  async function saveEdit(event) {
    event.preventDefault();
    const nextTitle = draft.trim();
    if (!nextTitle || !editingId) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api.update(editingId, { title: nextTitle });
      setTodos((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setEditingId(null);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeTodo(id) {
    const previous = todos;
    setTodos((current) => current.filter((item) => item._id !== id));
    setError("");
    try {
      await api.remove(id);
      if (editingId === id) {
        setEditingId(null);
        setDraft("");
      }
    } catch (err) {
      setTodos(previous);
      setError(err.message);
    }
  }

  async function clearDone() {
    const done = todos.filter((todo) => todo.completed);
    if (done.length === 0) return;
    const previous = todos;
    setTodos((current) => current.filter((todo) => !todo.completed));
    setError("");
    try {
      await Promise.all(done.map((todo) => api.remove(todo._id)));
    } catch (err) {
      setTodos(previous);
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <section className="sheet">
        <header className="mast">
          <p className="eyebrow">Today</p>
          <h1>Things to do</h1>
          <p className="lede">
            {remaining === 0
              ? "Nothing left open."
              : `${remaining} open ${remaining === 1 ? "item" : "items"}.`}
          </p>
        </header>

        <form className="composer" onSubmit={addTodo}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
            maxLength={200}
            aria-label="New task"
          />
          <button type="submit" disabled={busy || !title.trim()}>
            Add
          </button>
        </form>

        <div className="toolbar">
          <div className="filters" role="tablist" aria-label="Filter tasks">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={filter === item.id ? "active" : ""}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-button"
            onClick={clearDone}
            disabled={!todos.some((todo) => todo.completed)}
          >
            Clear done
          </button>
        </div>

        {error && <p className="banner">{error}</p>}

        {loading ? (
          <p className="empty">Loading tasks…</p>
        ) : visible.length === 0 ? (
          <p className="empty">{todos.length === 0 ? "Your list is empty." : "Nothing in this view."}</p>
        ) : (
          <ul className="list">
            {visible.map((todo) => (
              <li key={todo._id} className={todo.completed ? "done" : ""}>
                <button
                  type="button"
                  className="check"
                  aria-label={todo.completed ? "Mark open" : "Mark done"}
                  onClick={() => toggleTodo(todo)}
                />
                {editingId === todo._id ? (
                  <form className="edit" onSubmit={saveEdit}>
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={200}
                      autoFocus
                      aria-label="Edit task"
                    />
                    <button type="submit" disabled={busy || !draft.trim()}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setDraft("");
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <button type="button" className="title" onClick={() => startEdit(todo)}>
                      {todo.title}
                    </button>
                    <button
                      type="button"
                      className="remove"
                      aria-label={`Delete ${todo.title}`}
                      onClick={() => removeTodo(todo._id)}
                    >
                      ×
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
