import type { User } from '../types/user'

export function ProfilePage({ user }: { user: User }) {
  return (
    <section className="card profile-card">
      <div>
        <span className="eyebrow muted">ACCOUNT</span>
        <h1>{user.username}</h1>
      </div>
      <div className="profile-meta">
        <p>{user.email}</p>
        <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
      </div>
    </section>
  )
}
