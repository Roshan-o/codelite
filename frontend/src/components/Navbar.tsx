type NavbarProps = {
  page: 'problems' | 'create' | 'profile' | 'solve'
  onSelect: (page: 'problems' | 'create' | 'profile' | 'solve') => void
  onLogout: () => void
}

export function Navbar({ page, onSelect, onLogout }: NavbarProps) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">C</div>
        <div>
          <p className="brand-name">codelite</p>
          <small>Practice platform</small>
        </div>
      </div>

      <nav className="nav">
        <button className={page === 'problems' ? 'active' : ''} onClick={() => onSelect('problems')}>
          Problems
        </button>
        <button className={page === 'create' ? 'active' : ''} onClick={() => onSelect('create')}>
          Create problem
        </button>
        <button className={page === 'profile' ? 'active' : ''} onClick={() => onSelect('profile')}>
          Profile
        </button>
        <button className="ghost" onClick={onLogout}>Sign out</button>
      </nav>
    </header>
  )
}
