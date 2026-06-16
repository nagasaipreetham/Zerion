import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { RotateCw } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const isDark = theme === 'dark';

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="available-pill">
          <span className="glowing-dot"></span>
          AVAILABLE FOR HIRE
        </div>

        <h1 className="hero-title">Preetham Maddula</h1>
        
        <div className="hero-subtitle-group">
          <div className="hero-role">Full Stack Developer</div>
          <div className="hero-caption">"Creating what I wish existed."</div>
        </div>

        <p className="hero-bio">
          I work across the <span className="highlight-text">MERN stack</span>, 
          handling everything from <span className="highlight-text">UI</span> to <span className="highlight-text">backend</span> architecture and <span className="highlight-text">deployment</span>. My goal is to create tools that 
          people actually use.
        </p>

        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            Get in touch
          </a>
        </div>
      </div>

      <div className="hero-right-side">
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <img src="/mikey.png" alt="Preetham Maddula" className="hero-img-mikey" />
            </div>
            <div className="flip-card-back">
              <img src="/buymeacoffee.png" alt="Buy Me A Coffee" className="hero-img-coffee" />
            </div>
          </div>
        </div>

        <div className="flip-instruction-pill" onClick={() => setIsFlipped(!isFlipped)}>
          <RotateCw size={10} className="flip-icon" />
          <span>FLIP THE CARD</span>
        </div>

        <div className="right-social-icons">
          <div className="social-row-1">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-img-link">
              <img src={isDark ? '/github-light.svg' : '/github-dark.svg'} alt="GitHub" className="social-img-icon" />
            </a>
            <a href="mailto:preetham@example.com" className="social-img-link">
              <img src={isDark ? '/gmail-cleaner-light.svg' : '/gmail-cleaner-dark.svg'} alt="Gmail" className="social-img-icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-img-link">
              <img src={isDark ? '/linkedin-light.svg' : '/linkedin-dark.svg'} alt="LinkedIn" className="social-img-icon" />
            </a>
          </div>
          <div className="social-row-2">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-img-link">
              <img src={isDark ? '/x-light.svg' : '/x-dark.svg'} alt="X" className="social-img-icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-img-link">
              <img src={isDark ? '/instagram-light.svg' : '/instagram-dark.svg'} alt="Instagram" className="social-img-icon" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
