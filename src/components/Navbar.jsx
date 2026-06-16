import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [centerHidden, setCenterHidden] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const navRef = useRef(null);

  /* ── Detect scroll position ─────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      // Close menu on page scroll
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  /* ── Detect if nav-center is hidden (responsive breakpoint) ─ */
  useEffect(() => {
    const checkCenter = () => {
      // nav-center hides at 768px via CSS media query
      setCenterHidden(window.innerWidth <= 768);
    };
    checkCenter();
    window.addEventListener('resize', checkCenter);
    return () => window.removeEventListener('resize', checkCenter);
  }, []);

  /* ── Close menu on outside click ─────────────────────────── */
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [menuOpen]);

  /* ── Close menu when route changes ──────────────────────── */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`} ref={navRef}>
      {/* Left section */}
      <div className="nav-left">
        <Link to="/" className="logo">Zerion</Link>
        <div className="location-badge">
          Narsapur ☁ 34°
          <svg className="location-pin-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>

      {/* Center section — hidden below 768px via CSS */}
      <div className="nav-center">
        {isHome ? (
          <a href="#projects" className="nav-link">Projects</a>
        ) : (
          <Link to="/#projects" className="nav-link">Projects</Link>
        )}
        <a href="#blogs" className="nav-link">Blogs</a>
        <Link to="/resume" className="nav-link">Resume</Link>
      </div>

      {/* Right section */}
      <div className="nav-right">
        <button className="search-btn">
          Search... <span className="cmd-k">⌘K</span>
        </button>

        {/* Hamburger — only visible when center is hidden */}
        {centerHidden && (
          <button
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        )}

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <div className={`icon-container ${theme}`}>
            <svg className="icon moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
            <svg className="icon sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
          </div>
        </button>
      </div>

      {/* Dropdown menu — only visible on mobile when menu is open */}
      {centerHidden && menuOpen && (
        <div className="nav-dropdown">
          {isHome ? (
            <a href="#projects" className="dropdown-link" onClick={() => setMenuOpen(false)}>Projects</a>
          ) : (
            <Link to="/#projects" className="dropdown-link" onClick={() => setMenuOpen(false)}>Projects</Link>
          )}
          <a href="#blogs" className="dropdown-link" onClick={() => setMenuOpen(false)}>Blogs</a>
          <Link to="/resume" className="dropdown-link" onClick={() => setMenuOpen(false)}>Resume</Link>
        </div>
      )}
    </nav>
  );
}
