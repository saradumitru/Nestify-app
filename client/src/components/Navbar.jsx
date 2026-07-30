import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Heart, LayoutGrid, FolderOpen, Settings, LogOut,
  Bot, Camera, Palette, Calculator, Film, Globe, ArrowLeftRight,
  Clock, ChevronDown, ChevronUp, Users, Briefcase
} from 'lucide-react';

const Ico = ({ icon: I }) => <I size={14} strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.75 }} />;

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exploreOpen,  setExploreOpen]  = useState(false);
  const dropRef    = useRef(null);
  const exploreRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch {}
  const token = localStorage.getItem('token');
  const isLoggedIn = !!(user && token);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current    && !dropRef.current.contains(e.target))    setDropdownOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setExploreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const exploreActive = ['/discover','/compare','/palette','/timeline','/room-detector','/movie-houses','/assistant','/budget-estimator'].some(p => isActive(p));

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="nestify-nav">
      <Link to="/" className="nestify-logo">Nestify</Link>

      <div className="nestify-nav-links">
        <Link to="/"      className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Acasă</Link>
        <Link to="/search" className={`nav-link${isActive('/search') ? ' active' : ''}`}>Caută</Link>
        <Link to="/quiz"   className={`nav-link${isActive('/quiz') ? ' active' : ''}`}>Style Quiz</Link>

        {/* Explorează dropdown */}
        <div ref={exploreRef} style={{ position: 'relative' }}>
          <button
            className={`nav-link${exploreActive ? ' active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => setExploreOpen(v => !v)}
          >
            Explorează {exploreOpen ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
          </button>
          {exploreOpen && (
            <div className="account-dropdown" style={{ minWidth: 220, left: 0, right: 'auto' }}>
              <span className="account-dropdown-label">Unelte</span>
              <Link to="/assistant"        className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Bot} /> AI Assistant</Link>
              <Link to="/room-detector"    className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Camera} /> Detectează stil</Link>
              <Link to="/palette"          className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Palette} /> Generator paletă</Link>
              <Link to="/budget-estimator" className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Calculator} /> Estimator buget</Link>
              <div className="nav-drop-divider" />
              <span className="account-dropdown-label">Inspirație</span>
              <Link to="/movie-houses" className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Film} /> Only Movies in the Building</Link>
              <Link to="/discover"     className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Globe} /> Discover moodboards</Link>
              <Link to="/compare"      className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={ArrowLeftRight} /> Compară stiluri</Link>
              <Link to="/timeline"     className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Clock} /> Cronologia stilurilor</Link>
              <div className="nav-drop-divider" />
              <span className="account-dropdown-label">Profesioniști</span>
              <Link to="/designers" className="account-dropdown-link" onClick={() => setExploreOpen(false)}><Ico icon={Users} /> Designeri de interior</Link>
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <div className="account-menu-wrap" ref={dropRef}>
            <button className="account-trigger" onClick={() => setDropdownOpen(v => !v)}>
              <span className="account-avatar">{initials}</span>
              <span className="account-name">{user.name?.split(' ')[0]}</span>
              <span className="account-chevron">
                {dropdownOpen ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
              </span>
            </button>

            {dropdownOpen && (
              <div className="account-dropdown">
                <span className="account-dropdown-label">Contul meu</span>
                <Link to="/profile"    className="account-dropdown-link" onClick={() => setDropdownOpen(false)}><Ico icon={User} /> Profil</Link>
                <Link to="/favorites"  className="account-dropdown-link" onClick={() => setDropdownOpen(false)}><Ico icon={Heart} /> Favorite</Link>
                <Link to="/moodboards" className="account-dropdown-link" onClick={() => setDropdownOpen(false)}><Ico icon={LayoutGrid} /> Moodboards</Link>
                <Link to="/projects"   className="account-dropdown-link" onClick={() => setDropdownOpen(false)}><Ico icon={FolderOpen} /> Proiecte</Link>
                {(user.role === 'DESIGNER' || user.role === 'ADMIN') && (
                  <Link to="/designer/profile" className="account-dropdown-link" onClick={() => setDropdownOpen(false)}><Ico icon={Briefcase} /> Profilul meu designer</Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="account-dropdown-link" onClick={() => setDropdownOpen(false)}><Ico icon={Settings} /> Admin</Link>
                )}
                <div className="nav-drop-divider" />
                <button className="account-dropdown-link logout" onClick={handleLogout}>
                  <Ico icon={LogOut} /> Ieși din cont
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login"    className="nav-link">Autentificare</Link>
            <Link to="/register" className="nav-cta">Înregistrare</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
