import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { facultyApi, ApiError } from "../api/client";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import type { Student } from "../types";
import "../styles/components/FacultyCard.css";

interface StudentCardProps {
  student: Student;
  index: number;
  onDeleted?: (id: number) => void;
}

export function StudentCard({ student, index, onDeleted }: StudentCardProps) {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = user?.role === "super_admin" || user?.role === "supervisor";

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await facultyApi.deleteStudent(student.id);
      setShowConfirm(false);
      onDeleted?.(student.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete student.");
      setIsDeleting(false);
    }
  }

  return (
    <article className="card faculty-card">
      {canDelete && (
        <button
          className="faculty-delete-icon"
          aria-label={`Delete ${student.name}`}
          onClick={() => setShowConfirm(true)}
        >
          🗑
        </button>
      )}

      <span className="faculty-card-index">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="faculty-card-title">{student.name}</h3>
      <p className="faculty-card-hint">
        Age {student.age} · Course {student.course}
      </p>

      {error && <p className="faculty-card-error">{error}</p>}

      {showConfirm && (
        <ConfirmDeleteModal
          itemName={student.name}
          itemLabel="student"
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </article>
  );
}