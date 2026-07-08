import type { AuthUser } from "../types";
import { ROLE_LABELS } from "../types";
import "./ProfileCard.css";

interface ProfileCardProps {
  user: AuthUser;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <aside className="card profile-card">
      <div className="profile-banner">
        <div className="avatar-badge">{initialsFor(user.name)}</div>
      </div>
      <div className="profile-body">
        <h2 className="profile-name">{user.name}</h2>
        <span className="profile-role-tag">{ROLE_LABELS[user.role]}</span>

        <dl className="profile-fields">
          <div className="profile-field">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="profile-field">
            <dt>Role</dt>
            <dd>{ROLE_LABELS[user.role]}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
