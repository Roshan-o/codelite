import type { User } from '../types/user'

export function ProfilePage({ user }: { user: User }) {
  const initials = user.username ? user.username[0].toUpperCase() : '?'

  return (
    <div className="page-content">
      <section className="card profile-card">
        <div className="profile-avatar">{initials}</div>
        <h1>{user.username}</h1>
        <div className="profile-meta">
          <div className="profile-meta-item">
            <span style={{ color: 'var(--text-muted)' }}>📧</span>
            <span>{user.email}</span>
          </div>
          <div className="profile-meta-item">
            <span style={{ color: 'var(--text-muted)' }}>📅</span>
            <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
