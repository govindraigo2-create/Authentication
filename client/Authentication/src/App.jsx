
import { useEffect, useState } from "react";
import { apiRequest } from "./services/api";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

// Google Client ID frontend .env file se aayega
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function TaskManagerApp() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend se logged-in user ke tasks load karo
  async function loadTasks() {
    try {
      const data = await apiRequest("/tasks");
      setTasks(data.tasks || []);
    } catch (error) {
      setMessage(error.message);

      if (
        error.message.toLowerCase().includes("token") ||
        error.message.toLowerCase().includes("login")
      ) {
        logout();
      }
    }
  }

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  // Email/password se signup ya login
  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";

      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (mode === "signup") {
        setMessage("Signup successful! Ab login karo.");
        setMode("login");
        setPassword("");
      } else {
        saveLogin(data);
        setPassword("");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Login details save karke dashboard kholna
  function saveLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    setMessage("");
  }

  // Google login successful hone par backend ko credential bhejo
  async function handleGoogleSuccess(response) {
    if (!response.credential) {
      setMessage("Google credential nahi mila. Dobara try karo.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      saveLogin(data);
    } catch (error) {
      setMessage(error.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  // Logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setTasks([]);
    setTitle("");
    setDescription("");
    setEditingId(null);
    setMessage("");
    setPassword("");
  }

  // Naya task create ya existing task update
  async function handleTaskSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Task title zaroor likho.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const isEditing = Boolean(editingId);

      await apiRequest(isEditing ? `/tasks/${editingId}` : "/tasks", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      setTitle("");
      setDescription("");
      setEditingId(null);
      setMessage(isEditing ? "Task update ho gaya!" : "Task create ho gaya!");

      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Task complete ya incomplete karna
  async function toggleTask(task) {
    try {
      await apiRequest(`/tasks/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !task.completed }),
      });

      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Task edit karne ke liye form mein details bharna
  function startEditing(task) {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Task delete karna
  async function deleteTask(id) {
    if (!window.confirm("Kya tum ye task delete karna chahte ho?")) {
      return;
    }

    try {
      await apiRequest(`/tasks/${id}`, { method: "DELETE" });
      setMessage("Task delete ho gaya!");
      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Login aur signup screen
  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-icon">✓</div>
          <h1>Task Manager</h1>
          <p className="subtitle">Apne din ko organize karo.</p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "signup" ? "tab active" : "tab"}
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {mode === "signup" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apna naam"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kam se kam 8 characters"
                minLength={8}
                required
              />
            </label>

            {message && <p className="message">{message}</p>}

            <button
              type="submit"
              className="primary-button full-width"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login →"
                : "Create account →"}
            </button>
          </form>

          <div className="google-divider">
            <span>OR</span>
          </div>

          <div className="google-login">
            {loading ? (
              <p>Please wait...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setMessage("Google login cancel ya fail ho gaya.")}
                text="continue_with"
                shape="rectangular"
                width="280"
              />
            )}
          </div>

          <p className="auth-footer">
            Your tasks, all in one place.
          </p>
        </section>
      </main>
    );
  }

  // Main task dashboard
  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="logo" href="#">
          <span className="brand-icon small">✓</span>
          Task Manager
        </a>

        <div className="profile">
          <span className="avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </span>

          <span className="profile-name">{user?.name || "User"}</span>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Good to see you, {user?.name || "there"}!</h1>
        <p>Ek-ek task complete karo aur progress banate jao.</p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
          <small>All your tasks</small>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Still to do</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>Great progress!</small>
        </div>
      </section>

      <section className="task-layout">
        <div className="panel task-form-panel">
          <h2>{editingId ? "Edit task" : "Create a task"}</h2>

          <p className="panel-subtitle">
            {editingId
              ? "Apne task ki details update karo."
              : "Aaj kya complete karna hai?"}
          </p>

          <form onSubmit={handleTaskSubmit}>
            <label>
              Task title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Finish project report"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details (optional)"
                rows={4}
              />
            </label>

            <button
              type="submit"
              className="primary-button full-width"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Save changes"
                : "+ Add task"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button full-width"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setDescription("");
                }}
              >
                Cancel edit
              </button>
            )}
          </form>
        </div>

        <div className="panel task-list-panel">
          <div className="list-heading">
            <div>
              <h2>My tasks</h2>
              <p className="panel-subtitle">Your latest tasks</p>
            </div>

            <span className="task-count">{tasks.length} total</span>
          </div>

          {message && <p className="message">{message}</p>}

          {tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">☑</span>
              <h3>No tasks yet</h3>
              <p>Create your first task using the form.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-item" key={task._id}>
                  <button
                    className={
                      task.completed ? "check-button checked" : "check-button"
                    }
                    onClick={() => toggleTask(task)}
                    aria-label="Toggle task completion"
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <div className="task-content">
                    <h3 className={task.completed ? "task-done" : ""}>
                      {task.title}
                    </h3>

                    {task.description && <p>{task.description}</p>}

                    <span
                      className={
                        task.completed ? "status completed" : "status pending"
                      }
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button onClick={() => startEditing(task)} title="Edit">
                      Edit
                    </button>

                    <button
                      className="delete-action"
                      onClick={() => deleteTask(task._id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          
        </div>
      </section>

      <footer className="page-footer">
        Small steps. Big progress.
      </footer>
    </main>
  );
}

// GoogleOAuthProvider ko poori app ke around wrap karna
export default function App() {
  if (!GOOGLE_CLIENT_ID) {
    return <p>Google Client ID missing hai. Frontend .env file check karo.</p>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TaskManagerApp />
    </GoogleOAuthProvider>
  );
}
