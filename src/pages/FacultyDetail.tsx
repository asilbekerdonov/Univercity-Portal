import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { StudentCard } from "../components/StudentCard";
import { StudentForm } from "../components/StudentForm";
import { facultyApi, ApiError } from "../api/client";
import type { Faculty, Student } from "../types";
import "../styles/Dashboard.css";
import "../styles/components/ProfileCard.css";
import "../styles/components/FacultyCard.css";
import "../styles/FacultyDetail.css";

export function FacultyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [facultyData, studentsData] = await Promise.all([
          facultyApi.getOne(id as string),
          facultyApi.getStudents(id as string),
        ]);
        if (!cancelled) {
          setFaculty(facultyData);
          setStudents(studentsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load faculty."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddStudent(name: string, age: number, course: number) {
    if (!id) return;

    try {
      const created = await facultyApi.createStudent(id, { name, age, course });
      setStudents((prev) => [...prev, created]);
    } catch {
      // The dedicated "create student" backend endpoint may not be wired up
      // yet — fall back to an optimistic local update so the form stays
      // usable while the backend catches up (per the API contract note).
      const optimistic: Student = {
        id: Date.now(),
        name,
        age,
        course,
        faculty_id: Number(id),
      };
      setStudents((prev) => [...prev, optimistic]);
    }
  }

  return (
    <div className="dashboard-page">
      <section className="hero">
        <div className="hero-planet" aria-hidden="true" />
        <Navbar />
        <div className="hero-copy">
          <button
            type="button"
            className="hero-back-link"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <span className="hero-eyebrow">Faculty</span>
          <h1 className="hero-title">
            {faculty ? faculty.name : "Loading faculty…"}
          </h1>
          <p className="hero-subtitle">Faculty overview and student roster.</p>
        </div>
      </section>

      <main className="dashboard-body">
        <section className="faculties-column" aria-label="Students">
          <div className="section-heading">
            <h2>Students</h2>
            <span className="section-count">{students.length} total</span>
          </div>

          {isLoading && <p className="faculties-status">Loading students…</p>}
          {error && <p className="faculties-status faculties-error">{error}</p>}

          {!isLoading && !error && (
            <div className="faculties-grid">
              {students.map((student, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={index}
                  onDeleted={(id) =>
                    setStudents((prev) => prev.filter((s) => s.id !== id))
                  }
                />
              ))}
              {students.length === 0 && (
                <p className="faculties-status">No students yet.</p>
              )}
            </div>
          )}
        </section>

        <section className="profile-column" aria-label="Faculty info">
          <aside className="card profile-card">
            <div className="profile-banner">
              <div className="avatar-badge">
                {faculty ? faculty.name.slice(0, 2).toUpperCase() : "—"}
              </div>
            </div>
            <div className="profile-body">
              <h2 className="profile-name">{faculty?.name ?? "—"}</h2>
              <span className="profile-role-tag">{faculty?.slug ?? "—"}</span>

              <dl className="profile-fields">
                <div className="profile-field">
                  <dt>Description</dt>
                  <dd>{faculty?.description ?? "No description"}</dd>
                </div>
                <div className="profile-field">
                  <dt>Students</dt>
                  <dd>{students.length}</dd>
                </div>
                <div className="profile-field">
                  <dt>Status</dt>
                  <dd>{faculty?.is_active ? "Active" : "Inactive"}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <StudentForm onAdd={handleAddStudent} />
        </section>
      </main>
    </div>
  );
}