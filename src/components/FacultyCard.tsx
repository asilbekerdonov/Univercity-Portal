import type { Faculty } from "../types";
import "../styles/components/FacultyCard.css";

interface FacultyCardProps {
  faculty: Faculty;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  return (
    <article className="card faculty-card">
      <span className="faculty-card-index">
        {String(faculty.id).padStart(2, "0")}
      </span>
      <h3 className="faculty-card-title">{faculty.name}</h3>
      <p className="faculty-card-hint">
        {faculty.description && faculty.description.length > 0
          ? faculty.description
          : "Placeholder — data coming soon"}
      </p>
    </article>
  );
}
