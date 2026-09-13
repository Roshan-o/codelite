import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navbar } from './components/Navbar'
import { useProblems } from './hooks/useProblems'
import { LoginPage } from './pages/Login'
import { ProblemsPage } from './pages/Problems'
import { ProfilePage } from './pages/Profile'
import { CreateProblemPage } from './pages/CreateProblem'
import { ProblemDetailsPage } from './pages/ProblemDetails'
import { authApi } from './services/authApi'
import type { Problem } from './types/problem'
import type { User } from './types/user'
import './App.css'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('codelite_token') ?? '')
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<'problems' | 'create' | 'profile' | 'solve'>('problems')
  const [login, setLogin] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null)
  const { error: problemsError, search, setSearch, difficultyFilter, setDifficultyFilter, filteredProblems, setProblems } = useProblems()

  useEffect(() => {
    if (!token) return

    authApi.getProfile(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('codelite_token')
        setToken('')
        setUser(null)
      })
  }, [token])

  const openProblem = (problemId: number) => {
    setSelectedProblemId(problemId)
    setPage('solve')
  }

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    try {
      const result = login
        ? await authApi.login(String(form.get('email')), String(form.get('password')))
        : await authApi.register(
            String(form.get('username')),
            String(form.get('email')),
            String(form.get('password')),
          )

      localStorage.setItem('codelite_token', result.token)
      setToken(result.token)
      setUser(result.user)
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('codelite_token')
    setToken('')
    setUser(null)
    setMessage('')
    setPage('problems')
  }

  const handleCreated = (problem: Problem) => {
    setProblems((current) => [problem, ...current])
    setMessage('Problem published successfully.')
    setPage('problems')
  }

  if (!user) {
    return <LoginPage login={login} message={message} onToggleMode={() => setLogin((value) => !value)} onSubmit={handleAuth} />
  }

  return (
    <main className="app shell">
      <Navbar page={page} onSelect={setPage} onLogout={handleLogout} />

      {message && <p className="message banner">{message}</p>}

      {page === 'profile' && <ProfilePage user={user} />}
      {page === 'create' && <CreateProblemPage token={token} onCreated={handleCreated} />}
      {page === 'solve' && selectedProblemId !== null && <ProblemDetailsPage problemId={selectedProblemId} onBack={() => setPage('problems')} />}
      {page === 'problems' && (
        <ProblemsPage
          problems={filteredProblems}
          error={problemsError}
          search={search}
          onSearch={setSearch}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          onAddProblem={() => setPage('create')}
          onOpenProblem={openProblem}
        />
      )}
    </main>
  )
}

