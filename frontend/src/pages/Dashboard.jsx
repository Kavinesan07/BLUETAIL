import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="logo">Bluetail</h1>
        <div className="topbar-right">
          <span className="who">{user.username}</span>
          <button className="ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="content">
        <h1>Hello, {user.username}</h1>
        <p className="hint">Signed in as {user.email}</p>

        <div className="empty">
          <h2>No tasks yet</h2>
          <p>Your tasks will appear here once the task routes are connected.</p>
        </div>
      </main>
    </div>
  );
}
