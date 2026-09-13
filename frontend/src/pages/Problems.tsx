import type { Problem } from '../types/problem'
import { DifficultyBadge } from '../components/DifficultyBadge'

export function ProblemsPage({
  problems,
  error,
  search,
  onSearch,
  difficultyFilter,
  onDifficultyChange,
  onAddProblem,
  onOpenProblem,
}: {
  problems: Problem[]
  error?: string
  search: string
  onSearch: (value: string) => void
  difficultyFilter: 'ALL' | Problem['difficulty']
  onDifficultyChange: (value: 'ALL' | Problem['difficulty']) => void
  onAddProblem: () => void
  onOpenProblem: (id: number) => void
}) {
  const counts = {
    all: problems.length,
    easy: problems.filter((p) => p.difficulty === 'EASY').length,
    medium: problems.filter((p) => p.difficulty === 'MEDIUM').length,
    hard: problems.filter((p) => p.difficulty === 'HARD').length,
  }

  return (
    <section className="problem-panel page-content">
      <div className="panel-header">
        <h1 className="page-title">Problems</h1>
        <button className="primary" onClick={onAddProblem}>
          + Create Problem
        </button>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-chip all">
          <span>All</span>
          <strong>{counts.all}</strong>
        </div>
        <div className="stat-chip easy">
          <span>Easy</span>
          <strong>{counts.easy}</strong>
        </div>
        <div className="stat-chip medium">
          <span>Medium</span>
          <strong>{counts.medium}</strong>
        </div>
        <div className="stat-chip hard">
          <span>Hard</span>
          <strong>{counts.hard}</strong>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="🔍  Search problems..."
          aria-label="Search problems"
        />
        <select
          value={difficultyFilter}
          onChange={(event) =>
            onDifficultyChange(event.target.value as 'ALL' | Problem['difficulty'])
          }
          aria-label="Filter by difficulty"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {error && <p className="message error-msg">{error}</p>}

      {/* Problem Table */}
      {problems.length > 0 ? (
        <table className="problems-table">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th className="col-title">Title</th>
              <th className="col-tags">Tags</th>
              <th className="col-diff">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} onClick={() => onOpenProblem(problem.id)}>
                <td className="col-id" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {problem.id}
                </td>
                <td className="col-title">
                  <span className="problem-row-title">{problem.title}</span>
                </td>
                <td className="col-tags">
                  <div className="problem-row-tags">
                    {problem.tags.length ? (
                      problem.tags.slice(0, 3).map((tag) => (
                        <span key={`${problem.id}-${tag}`} className="tag-chip">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="tag-chip">General</span>
                    )}
                    {problem.tags.length > 3 && (
                      <span className="tag-chip">+{problem.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="col-diff">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && (
          <div className="empty-state">
            <h3>No problems found</h3>
            <p>Try a different search or create the first challenge!</p>
          </div>
        )
      )}
    </section>
  )
}
