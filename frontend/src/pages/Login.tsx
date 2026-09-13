import type { FormEvent } from 'react'

type LoginProps = {
  login: boolean
  message: string
  onToggleMode: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function LoginPage({ login, message, onToggleMode, onSubmit }: LoginProps) {
  return (
    <main className="app shell">
      <section className="auth-hero">
        <div className="hero-copy">
          <span className="eyebrow">CODELITE</span>
          <h1>Practice coding. Ship better solutions.</h1>
          <p>
            Solve real problems, write C++ solutions, run sample cases, and submit for judgment in a
            polished coding environment built for practice and learning.
          </p>
          <ul className="feature-list">
            <li>Curated problem library</li>
            <li>Instant sample execution</li>
            <li>Submission verdict tracking</li>
          </ul>
        </div>

        <form className="auth-card card" onSubmit={onSubmit}>
          <h2>{login ? 'Welcome back' : 'Create account'}</h2>
          {!login && (
            <label>
              Name
              <input name="username" placeholder="Choose a username" required maxLength={50} />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="Minimum 8 characters" required minLength={8} />
          </label>
          <button className="primary" type="submit">{login ? 'Log in' : 'Register'}</button>
          <button type="button" className="ghost" onClick={onToggleMode}>
            {login ? 'Need an account?' : 'Already have an account?'}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </section>
    </main>
  )
}
