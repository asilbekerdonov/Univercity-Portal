import { useState, type FormEvent } from "react";
import "../styles/components/FacultyForm.css";

interface FacultyFormProps {
  onAdd: (name: string, description: string) => void;
}

export function FacultyForm({ onAdd }: FacultyFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(name.trim(), description.trim());
    setName("");
    setDescription("");
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <aside className="card faculty-form-card">
      <div className="faculty-form-banner">
        <span className="faculty-form-title">Add Faculty</span>
      </div>

      <form className="faculty-form-body" onSubmit={handleSubmit} noValidate>
        <div className="faculty-form-field">
          <label htmlFor="faculty-name">Faculty name</label>
          <input
            id="faculty-name"
            type="text"
            className="faculty-input"
            placeholder="e.g. Faculty of Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="faculty-form-field">
          <label htmlFor="faculty-description">Description</label>
          <textarea
            id="faculty-description"
            className="faculty-input faculty-textarea"
            placeholder="Short description of the faculty"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {submitted && (
          <p className="faculty-form-success">Faculty added successfully.</p>
        )}

        <button type="submit" className="button faculty-form-submit">
          Add faculty
        </button>
      </form>
    </aside>
  );
}
