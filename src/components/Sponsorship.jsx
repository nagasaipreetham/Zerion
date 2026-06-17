import { useTheme } from '../context/ThemeContext';
import './Sponsorship.css';

export default function Sponsorship() {
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const xIcon = isDark ? '/x-light.svg' : '/x-dark.svg';
  const linkedinIcon = isDark ? '/linkedin-light.svg' : '/linkedin-dark.svg';
  const githubIcon = isDark ? '/github-light.svg' : '/github-dark.svg';

  return (
    <section className="sponsorship-section" id="sponsors">
      <div className="sponsorship-flex-container">
        
        {/* Left Column: Welded Media Block */}
        <div className="sponsorship-media-block">
          <div className="sponsor-profile-wrapper">
            <img 
              src="/navdeep profile.jpg" 
              alt="Navdeep Singh" 
              className="sponsor-profile-img" 
            />
            <img 
              src="/neetcodelogo.jpg" 
              alt="NeetCode Logo" 
              className="sponsor-neetcode-logo" 
            />
            
            <a 
              href="https://github.com/neetcode-gh?tab=sponsoring" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sponsor-view-btn"
            >
              <span className="view-text">VIEW</span>
              <svg className="view-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Right Column: Text & Social Details */}
        <div className="sponsorship-info-block">
          <div className="sponsor-header">
            <span className="sponsor-amount">$250</span>
            <h2 className="sponsor-name">Navdeep Singh</h2>
          </div>
          
          <div className="sponsor-title-line">
            <span className="sponsor-role">Founder, CEO of </span>
            <a 
              href="https://neetcode.io" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sponsor-org-link"
            >
              Neetcode
              <svg className="sponsor-visit-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
              </svg>
            </a>
          </div>

          <div className="sponsor-socials">
            <a href="https://x.com/neetcode1" target="_blank" rel="noopener noreferrer" className="sponsor-social-link">
              <img src={xIcon} alt="X" className="sponsor-social-img" />
            </a>
            <a href="https://www.linkedin.com/in/navdeep-singh-3aaa14161/" target="_blank" rel="noopener noreferrer" className="sponsor-social-link">
              <img src={linkedinIcon} alt="LinkedIn" className="sponsor-social-img" />
            </a>
            <a href="https://github.com/neetcode-gh" target="_blank" rel="noopener noreferrer" className="sponsor-social-link">
              <img src={githubIcon} alt="GitHub" className="sponsor-social-img" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
