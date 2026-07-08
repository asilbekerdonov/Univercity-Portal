import { useMemo } from "react";
import { Navbar } from "../components/Navbar";
import { FacultyCard } from "../components/FacultyCard";
import { ProfileCard } from "../components/ProfileCard";
import { useAuth } from "../context/AuthContext";
import type { Faculty } from "../types";
import "./Dashboard.css";

function buildPlaceholderFaculties(): Faculty[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Faculty ${i + 1}`,
  }));
}

export function Dashboard() {
  const { user } = useAuth();
  const faculties = useMemo(buildPlaceholderFaculties, []);

  return (
    <div className="dashboard-page">
      <section className="hero">
        <div className="hero-planet" aria-hidden="true" />
        <Navbar />
        <div className="hero-copy">
          <span className="hero-eyebrow">Marketing Portal</span>
          <h1 className="hero-title">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="hero-subtitle">
            One place for faculty campaigns, assets, and reporting.
          </p>
        </div>
      </section>

      <main className="dashboard-body">
        <section className="faculties-column" aria-label="Faculties">
          <div className="section-heading">
            <h2>Faculties</h2>
            <span className="section-count">{faculties.length} total</span>
          </div>
          <div className="faculties-grid">
            {faculties.map((faculty) => (
              <FacultyCard key={faculty.id} faculty={faculty} />
            ))}
          </div>
        </section>

        <section className="profile-column" aria-label="Staff profile">
          {user && <ProfileCard user={user} />}
        </section>
      </main>
    </div>
  );
}
