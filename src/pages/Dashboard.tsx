import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { FacultyCard } from "../components/FacultyCard";
import { ProfileCard } from "../components/ProfileCard";
import { FacultyForm } from "../components/FacultyForm";
import { useAuth } from "../context/AuthContext";
import { facultyApi, ApiError } from "../api/client";
import type { Faculty } from "../types";
import "../styles/Dashboard.css";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function Dashboard() {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFaculties() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await facultyApi.getAll();
        if (!cancelled) {
          setFaculties(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load faculties. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFaculties();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddFaculty(name: string, description: string) {
    try {
      const created = await facultyApi.create({
        name,
        slug: slugify(name),
        description: description || undefined,
      });
      setFaculties((prev) => [...prev, created]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create faculty.");
      }
    }
  }

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

          {isLoading && <p className="faculties-status">Loading faculties…</p>}
          {error && <p className="faculties-status faculties-error">{error}</p>}

          {!isLoading && !error && (
            <div className="faculties-grid">
              {faculties.map((faculty) => (
                <FacultyCard key={faculty.id} faculty={faculty} />
              ))}
            </div>
          )}
        </section>

        <section className="profile-column" aria-label="Staff profile">
          {user && <ProfileCard user={user} />}
          <FacultyForm onAdd={handleAddFaculty} />
        </section>
      </main>
    </div>
  );
}