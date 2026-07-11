import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { facultyApi, ApiError } from "../api/client";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import type { Faculty } from "../types";
import "../styles/components/FacultyCard.css";

interface FacultyCardProps {
  faculty: Faculty;
  onDeleted?: (id: number) => void;
}

export function FacultyCard({ faculty, onDeleted }: FacultyCardProps) {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = user?.role === "super_admin" || user?.role === "supervisor";

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await facultyApi.delete(faculty.id);
      setShowConfirm(false);
      onDeleted?.(faculty.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete faculty.");
      setIsDeleting(false);
    }
  }

  return (
    <article className="card faculty-card">
      {canDelete && (
        <button
          className="faculty-delete-icon"
          aria-label={`Delete ${faculty.name}`}
          onClick={() => setShowConfirm(true)}
        >
          🗑
        </button>
      )}

      <span className="faculty-card-index">
        {String(faculty.id).padStart(2, "0")}
      </span>
      <h3 className="faculty-card-title">{faculty.name}</h3>
      <p className="faculty-card-hint">
        {faculty.description && faculty.description.length > 0
          ? faculty.description
          : "Placeholder — data coming soon"}
      </p>

      {error && <p className="faculty-card-error">{error}</p>}

      {showConfirm && (
        <ConfirmDeleteModal
          facultyName={faculty.name}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </article>
  );
}