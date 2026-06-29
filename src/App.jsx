import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Separator from './components/Separator';
import Hero from './components/Hero';
import About from './components/About';
import SkillStack from './components/SkillStack';
import Sponsorship from './components/Sponsorship';
import Works from './components/Works';
import PreUI from './components/PreUI';
import Contact from './components/Contact';
import GitHubGraph from './components/GitHubGraph';
import SkillsScroll from './components/SkillsScroll';
import Resume from './components/Resume';
import SectionNavigator from './components/SectionNavigator';
import FloatingBottomMenu from './components/FloatingBottomMenu';
import VintagePlayer from './components/vintage-player/VintagePlayer';
import StarEffect from './components/StarEffect';
import Clouds from './components/Clouds';
import Birds from './components/Birds';
import { useTheme } from './context/ThemeContext';

// Register ScrollTrigger once at module level so Works.jsx can also rely on it
gsap.registerPlugin(ScrollTrigger);

function App() {
  const location = useLocation();
  const { theme } = useTheme();

  /* ── Global smooth scroll (Lenis + GSAP ticker) ──────────────── */
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,        // smoothing factor (0 = instant, 1 = never arrives)
      smoothWheel: true,
    });

    // Expose lenis on window so other modules can call lenis.scrollTo
    window.__lenis = lenis;

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis via GSAP’s requestAnimationFrame ticker
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  /* ── Route change: reset navbar GSAP inline styles + scroll to top ── */
  useEffect(() => {
    // Always reset any GSAP-applied inline styles on the navbar first.
    // Works.jsx animates the navbar opacity/transform; these must be
    // cleared when we navigate away so /resume starts clean.
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.opacity = '';
      navbar.style.transform = '';
      navbar.style.pointerEvents = '';
    }

    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        const timer = setTimeout(() => {
          // If the element is pinned by GSAP, its parent is the pin-spacer.
          // Scrolling to the pin-spacer ensures we land at the correct position.
          const target = element.closest('.pin-spacer') || element;
          // Prefer Lenis smooth scroll when available
          if (window.__lenis) {
            window.__lenis.scrollTo(target, { offset: -80, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 250);
        return () => clearTimeout(timer);
      }
    } else {
      // Scroll to top via Lenis if available, otherwise native
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <Navbar />

      <Routes>
        {/* Homepage Route */}
        <Route path="/" element={
          <>
            <SectionNavigator />
            <FloatingBottomMenu />
            {/* ── Constrained centre column (existing sections) ─────── */}
            <div className="layout-container">
              <div className="hero-banner-wrapper">
                {/* Banner image + stars: dark mode only */}
                {theme === 'dark' && (
                  <img src="/banner.png" alt="Hero background" className="hero-banner-img" />
                )}
                {theme === 'dark' && <StarEffect />}
                {/* Halftone dotted clouds + flying birds: light mode only */}
                {theme === 'light' && <Clouds />}
                {theme === 'light' && <Birds />}
                <div className="hero-banner-fade"></div>
              </div>

              <div className="nav-placeholder" />

              <div className="separator-full-width">
                <Separator />
              </div>

              <main>
                <Hero />

                <div className="separator-full-width">
                  <Separator />
                </div>

                <About />

                {/* SKILL STACK section label */}
                <div className="section-separator">
                  <span className="section-label">SKILL STACK</span>
                  <div className="section-line"></div>
                </div>

                <SkillStack />

                <div className="separator-full-width">
                  <Separator />
                </div>

                {/* SPONSORS section label */}
                <div className="section-separator">
                  <span className="section-label">SPONSORS</span>
                  <div className="section-line"></div>
                </div>

                <Sponsorship />

                <div className="separator-full-width">
                  <Separator />
                </div>
              </main>
            </div>

            {/* ── Works — full-width, outside the 1000 px column ─────── */}
            <Works />

            {/* ── Standard middle column pattern resumes below Works ──── */}
            <div className="layout-container">
              <div className="separator-full-width">
                <Separator />
              </div>
              <main>
                <PreUI />

                <div className="separator-full-width">
                  <Separator />
                </div>

                <Contact />

                <SkillsScroll />

                <div id="footer">
                  <GitHubGraph />
                  <div className="portfolio-turntable-container">
                    <VintagePlayer theme={theme} />
                  </div>
                </div>

                <div className="separator-full-width">
                  <Separator />
                </div>
              </main>
            </div>
          </>
        } />

        {/* Resume Page Route */}
        <Route path="/resume" element={
          <div className="layout-container">
            <div className="nav-placeholder" />

            <div className="separator-full-width">
              <Separator />
            </div>

            <main>
              <Resume />

              <SkillsScroll />

              <GitHubGraph />

              <div className="separator-full-width">
                <Separator />
              </div>
            </main>
          </div>
        } />

      </Routes>
    </>
  );
}

export default App;
