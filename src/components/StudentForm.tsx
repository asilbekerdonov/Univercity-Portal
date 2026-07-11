import { useState, type FormEvent } from "react";
import "../styles/components/FacultyForm.css";

interface StudentFormProps {
  onAdd: (name: string, age: number, course: number) => void;
}

export function StudentForm({ onAdd }: StudentFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age || !course) return;

    onAdd(name.trim(), Number(age), Number(course));
    setName("");
    setAge("");
    setCourse("");
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <aside className="card faculty-form-card">
      <div className="faculty-form-banner">
        <span className="faculty-form-title">Add Student</span>
      </div>

      <form className="faculty-form-body" onSubmit={handleSubmit} noValidate>
        <div className="faculty-form-field">
          <label htmlFor="student-name">Student name</label>
          <input
            id="student-name"
            type="text"
            className="faculty-input"
            placeholder="e.g. Ivan Petrov"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="faculty-form-field">
          <label htmlFor="student-age">Age</label>
          <input
            id="student-age"
            type="number"
            min={1}
            className="faculty-input"
            placeholder="e.g. 20"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="faculty-form-field">
          <label htmlFor="student-course">Course</label>
          <input
            id="student-course"
            type="number"
            min={1}
            className="faculty-input"
            placeholder="e.g. 2"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>

        {submitted && (
          <p className="faculty-form-success">Student added successfully.</p>
        )}

        <button type="submit" className="button faculty-form-submit">
          Add student
        </button>
      </form>
    </aside>
  );
}