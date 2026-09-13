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
        <span className="brand-name">codelite</span>
      </div>

      <nav className="nav">
        <button
          className={page === 'problems' ? 'active' : ''}
          onClick={() => onSelect('problems')}
        >
          Problems
        </button>
        <button
          className={page === 'create' ? 'active' : ''}
          onClick={() => onSelect('create')}
        >
          Create
        </button>
        <button
          className={page === 'profile' ? 'active' : ''}
          onClick={() => onSelect('profile')}
        >
          Profile
        </button>
      </nav>

      <div className="nav-right">
        <button className="btn-sign-out" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  )
}
