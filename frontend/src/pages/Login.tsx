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
          <div className="lc-logo-large">
            <div className="lc-logo-mark">C</div>
            <span className="lc-logo-text">codelite</span>
          </div>
          <h1>
            Level up your<br />
            <span>coding skills.</span>
          </h1>
          <p>
            Solve curated algorithmic challenges, write C++ solutions, run sample
            test cases, and submit for judgment — all in one polished environment.
          </p>
          <ul className="feature-list">
            <li>Curated problem library with difficulty tiers</li>
            <li>Instant sample test case execution</li>
            <li>Submission verdict &amp; feedback tracking</li>
            <li>Create and share your own challenges</li>
          </ul>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <h2>{login ? 'Sign in to codelite' : 'Create your account'}</h2>
          <p className="auth-subtitle">
            {login ? 'Welcome back! Ready to solve?' : 'Start your coding journey today.'}
          </p>

          {!login && (
            <label>
              Name
              <input
                name="username"
                placeholder="Choose a username"
                required
                maxLength={50}
                autoComplete="username"
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete={login ? 'current-password' : 'new-password'}
            />
          </label>

          <button className="primary btn-submit" type="submit">
            {login ? 'Log in' : 'Register'}
          </button>

          <div className="auth-divider">or</div>

          <button type="button" className="ghost" onClick={onToggleMode}>
            {login ? 'Need an account?' : 'Already have an account?'}
          </button>

          {message && <p className="message error-msg">{message}</p>}
        </form>
      </section>
    </main>
  )
}
