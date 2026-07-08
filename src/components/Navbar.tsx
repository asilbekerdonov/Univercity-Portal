import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const NAV_LINKS = ["Dashboard", "Faculties", "Reports", "Team"];

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar-wrap">
      <nav className="nav-pill" aria-label="Primary">
        <span className="nav-brand">Marketing Portal</span>
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a href="#" className="nav-link">
                {link}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-user">
          {user && <span className="nav-user-name">{user.name}</span>}
          <button type="button" className="nav-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
