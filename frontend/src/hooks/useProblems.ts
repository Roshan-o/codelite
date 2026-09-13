import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { Problem } from '../types/problem'

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | Problem['difficulty']>('ALL')

  useEffect(() => {
    api.listProblems()
      .then(setProblems)
      .catch(() => {
        setError('Unable to load problems. Start the backend server on port 8080.')
        setProblems([])
      })
  }, [])

  const filteredProblems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return problems.filter((problem) => {
      const matchesDifficulty = difficultyFilter === 'ALL' || problem.difficulty === difficultyFilter
      const searchText = `${problem.title} ${problem.description} ${problem.tags.join(' ')}`.toLowerCase()
      const matchesSearch = !query || searchText.includes(query)
      return matchesDifficulty && matchesSearch
    })
  }, [problems, search, difficultyFilter])

  return {
    problems,
    error,
    search,
    setSearch,
    difficultyFilter,
    setDifficultyFilter,
    filteredProblems,
    setProblems,
  }
}
