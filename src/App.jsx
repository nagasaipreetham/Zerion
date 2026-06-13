import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import Separator from './components/Separator';
import Hero from './components/Hero';
import About from './components/About';
import SkillStack from './components/SkillStack';
import Sponsorship from './components/Sponsorship';
import Works from './components/Works';

// Register ScrollTrigger once at module level so Works.jsx can also rely on it
gsap.registerPlugin(ScrollTrigger);

function App() {
  /* ── Global smooth scroll (Lenis + GSAP ticker) ────────────── */
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,        // smoothing factor (0 = instant, 1 = never arrives)
      smoothWheel: true,
    });

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis via GSAP's requestAnimationFrame ticker
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* ── Constrained centre column (existing sections) ─────── */}
      <div className="layout-container">
        <div className="hero-banner-wrapper">
          <img src="/banner.png" alt="Hero background" className="hero-banner-img" />
          <div className="hero-banner-fade"></div>
        </div>

        <Navbar />

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
    </>
  );
}

export default App;
