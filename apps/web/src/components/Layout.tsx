import { NavLink, Outlet } from 'react-router-dom';
import { useAdminMode } from '../hooks/useAdminMode';

const navItems = [
  { to: '/impact-analyzer', label: 'Impact Analyzer' },
  { to: '/releases', label: 'Releases' },
] as const;

export function Layout() {
  const { isAdmin, toggleAdminMode } = useAdminMode();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-block">
            <span className="brand">AI MR Release Intelligence</span>
            <span className="brand-subtitle">Release impact & notes</span>
          </div>

          <nav className="top-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <label className="admin-toggle">
            <input type="checkbox" checked={isAdmin} onChange={toggleAdminMode} />
            <span>Admin mode</span>
          </label>
        </div>
      </header>

      <main className="content">
        <Outlet context={{ isAdmin }} />
      </main>
    </div>
  );
}
