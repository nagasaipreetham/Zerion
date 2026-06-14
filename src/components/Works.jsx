import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useTheme } from '../context/ThemeContext';
import GalaxyBackground from './GalaxyBackground';
import SphereBackground from './SphereBackground';
import './Works.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const PROJECTS = [
  {
    id: '01',
    name: 'Zerion',
    tagline: 'Analytics Dashboard',
    description:
      'Real-time data visualization platform with AI-powered insights, customizable widgets, and live reporting modules.',
    stack: ['React', 'Node.js', 'MongoDB', 'WebSocket'],
    year: '2024',
    hue: '230',
  },
  {
    id: '02',
    name: 'NeoCommerce',
    tagline: 'E-Commerce Platform',
    description:
      'Scalable storefront builder with seamless checkout flow, inventory management system, and multi-theme support.',
    stack: ['Next.js', 'Express', 'PostgreSQL', 'Stripe'],
    year: '2024',
    hue: '160',
  },
  {
    id: '03',
    name: 'Cortex AI',
    tagline: 'AI Writing Assistant',
    description:
      'Distraction-free editor with GPT-4 integration, smart auto-complete, real-time suggestions, and voice input.',
    stack: ['React', 'Python', 'OpenAI API', 'FastAPI'],
    year: '2023',
    hue: '40',
  },
  {
    id: '04',
    name: 'Flowcast',
    tagline: 'Collaborative Whiteboard',
    description:
      'Infinite canvas with real-time multi-cursor syncing, shape recognition, and one-click diagram export.',
    stack: ['React', 'Socket.io', 'Canvas API', 'Node.js'],
    year: '2023',
    hue: '310',
  },
  {
    id: '05',
    name: 'Beacon CMS',
    tagline: 'Headless Content Platform',
    description:
      'Visual page builder with multi-site support, API-first architecture, role-based access, and global CDN delivery.',
    stack: ['React', 'GraphQL', 'MongoDB', 'Cloudflare'],
    year: '2023',
    hue: '265',
  },
];

export default function Works() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isActive, setIsActive] = useState(false);

  const sectionRef          = useRef(null);
  const curtainTopRef       = useRef(null);   // used for BOTH open AND close
  const curtainBottomRef    = useRef(null);   // used for BOTH open AND close
  const galleryTrackRef     = useRef(null);
  const galleryContainerRef = useRef(null);

  // Core glassmorphic style setup defined inline to prevent minifiers/bundlers from stripping properties like WebkitBackdropFilter
  const glassStyle = {
    background: isDark ? 'rgba(10, 10, 15, 0.45)' : 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 10px rgba(255, 255, 255, 0.04)'
      : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(255, 255, 255, 0.1), inset 0 0 20px 10px rgba(255, 255, 255, 0.15)',
  };

  useEffect(() => {
    const section          = sectionRef.current;
    const curtainTop       = curtainTopRef.current;
    const curtainBottom    = curtainBottomRef.current;
    const track            = galleryTrackRef.current;

    const ctx = gsap.context(() => {
      const PAUSE_PX = 100;

      /* ── How far the gallery must slide (px) ─────────────────── */
      const getGalleryDist = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      /* ── High-perf setters (created once, used every tick) ───── */
      const setCurtainTopY    = gsap.quickSetter(curtainTop,       'yPercent');
      const setCurtainBottomY = gsap.quickSetter(curtainBottom,    'yPercent');
      const setTrackX         = gsap.quickSetter(track,            'x', 'px');

      const navbar = document.querySelector('.navbar');
      const setNavbarOp = navbar ? gsap.quickSetter(navbar, 'opacity') : () => {};
      const setNavbarY = navbar ? gsap.quickSetter(navbar, 'y', 'px') : () => {};

      let navbarVisible = true;
      const setNavbarPointerEvents = (visible) => {
        if (!navbar) return;
        if (visible !== navbarVisible) {
          navbar.style.pointerEvents = visible ? 'auto' : 'none';
          navbarVisible = visible;
        }
      };

      /* ── Card Focus calculation (runs on scroll/refresh) ────── */
      const updateFocus = () => {
        const cards = track.querySelectorAll('.project-card');
        const centerX = window.innerWidth / 2;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(centerX - cardCenter);

          // Focus range from center of viewport (0 = focused, 500 = dull/small)
          const maxDist = 500;
          const factor = Math.min(1, dist / maxDist);

          const scale = 1.0 - factor * 0.22;   // 1.0 -> 0.78
          const dimmerOpacity = factor * 0.7;  // 0.0 -> 0.7 (dimmer overlay fades content)

          // Scale the outer card container
          gsap.set(card, {
            scale: scale,
            transformOrigin: 'center center',
            overwrite: 'auto',
          });

          // Set opacity of the card dimmer overlay to avoid changing card container opacity (which breaks backdrop-filter)
          const dimmer = card.querySelector('.card-dimmer');
          if (dimmer) {
            gsap.set(dimmer, {
              opacity: dimmerOpacity,
              overwrite: 'auto',
            });
          }
        });
      };

      /* ── Scroll phase map (progress 0 → 1) ───────────────────────
       *
       *  [0.00 – 0.25]  Phase 1 — curtains split OUTWARD
       *  [0.25 – 0.68]  Phase 2 — gallery scrolls horizontally
       *  [0.68 – 0.78]  Phase 3 — gallery stays active / no dimming
       *  [0.74 – 0.92]  Phase 4 — SAME curtains return INWARD (close)
       *  [0.92 – 1.00]  Phase 5 — hold sealed, then natural unpin
       * ─────────────────────────────────────────────────────────── */
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => {
          const G = getGalleryDist();
          const S_base = Math.max(window.innerHeight * 2, Math.round(G / 0.43));
          return `+=${Math.round(0.94 * S_base + PAUSE_PX)}`;
        },
        pin: true,
        scrub: 1.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onToggle(self) {
          setIsActive(self.isActive);
        },

        onUpdate(self) {
          const p = self.progress;
          const G = getGalleryDist();
          const S_base = Math.max(window.innerHeight * 2, Math.round(G / 0.43));
          const S = Math.round(0.94 * S_base + PAUSE_PX);

          const currentScroll = p * S;

          // Define pixel boundaries for each phase
          const p1_end = 0.25 * S_base;
          const p2_end = p1_end + 0.43 * S_base;
          const pause_end = p2_end + PAUSE_PX;
          const p4_end = pause_end + 0.18 * S_base;

          let topY, bottomY;
          let navOp, navY;

          if (currentScroll <= p1_end) {
            // Phase 1 — opening
            const t = p1_end > 0 ? Math.max(0, Math.min(1, currentScroll / p1_end)) : 1;
            topY    = t * -100;
            bottomY = t *  100;
            
            navOp   = 1 - t;
            navY    = t * -50;
            setNavbarPointerEvents(t < 0.8);
          } else if (currentScroll >= pause_end) {
            // Phase 4 — closing (same curtains, reversed direction)
            const closeDist = p4_end - pause_end;
            const t = closeDist > 0 ? Math.max(0, Math.min(1, (currentScroll - pause_end) / closeDist)) : 1;
            topY    = -100 + t * 100;   //  -100 → 0
            bottomY =  100 - t * 100;   //  +100 → 0

            navOp   = t;
            navY    = -50 + t * 50;
            setNavbarPointerEvents(t > 0.2);
          } else {
            // Phases 2 & pause — curtains fully open
            topY    = -100;
            bottomY =  100;

            navOp   = 0;
            navY    = -50;
            setNavbarPointerEvents(false);
          }

          setCurtainTopY(topY);
          setCurtainBottomY(bottomY);

          setNavbarOp(navOp);
          setNavbarY(navY);

          /* ── Phase 2: gallery scrolls (p1_end → p2_end) ──────── */
          const scrollDist = 0.43 * S_base;
          const galleryP = scrollDist > 0 ? Math.max(0, Math.min(1, (currentScroll - p1_end) / scrollDist)) : 1;
          setTrackX(-G * galleryP);

          /* Phase 3 Gallery Dimming has been removed as requested: cards remain fully visible at all times */

          // Update card focus sizing/dulling on scroll
          updateFocus();
        },

        onRefresh() {
          updateFocus();
        },

        snap: {
          snapTo: (value) => {
            const G = getGalleryDist();
            if (G <= 0) return value;
            const S_base = Math.max(window.innerHeight * 2, Math.round(G / 0.43));
            const S = Math.round(0.94 * S_base + PAUSE_PX);

            const p1_end = 0.25 * S_base;
            const p2_end = p1_end + 0.43 * S_base;
            const scrollDist = 0.43 * S_base;

            const pStart = p1_end / S;
            const pEnd = p2_end / S;

            // Snap only when scrolling horizontally in Phase 2
            if (value > pStart && value < pEnd) {
              const currentGalleryP = (value - pStart) / (scrollDist / S);
              const cardCount = PROJECTS.length;
              const index = Math.round(currentGalleryP * (cardCount - 1));
              const snappedGalleryP = index / (cardCount - 1);
              return pStart + snappedGalleryP * (scrollDist / S);
            }
            return value;
          },
          duration: { min: 0.2, max: 0.5 },
          delay: 0.1, // Snap 100ms after scroll ends
          ease: 'power2.out',
        }
      });

      // Set initial scales and positions on mount
      requestAnimationFrame(updateFocus);

    }, section);

    return () => {
      ctx.revert();
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.style.opacity = '';
        navbar.style.transform = '';
        navbar.style.pointerEvents = '';
      }
      const trackElement = galleryTrackRef.current;
      if (trackElement) {
        const cards = trackElement.querySelectorAll('.project-card');
        cards.forEach((card) => {
          card.style.transform = '';
          card.style.opacity = '';
        });
      }
    };
  }, [isDark]);

  return (
    <section className="works-section" ref={sectionRef} id="projects">
      {/* Dynamic background color layer for stacking order */}
      <div className="works-bg-layer" />

      {/* Dynamic 3D backgrounds rendering only when Works is active */}
      {isActive && (
        <div className="works-3d-bg">
          {isDark ? <GalaxyBackground /> : <SphereBackground />}
        </div>
      )}

      {/* ── Curtains (open on entry, close on exit) ──────────── */}
      <div className="curtain curtain-top" ref={curtainTopRef}>
        <h2 className="works-title">WORKS</h2>
      </div>

      <div className="curtain curtain-bottom" ref={curtainBottomRef}>
        <h2 className="works-title">WORKS</h2>
      </div>

      {/* ── Gallery ──────────────────────────────────────────── */}
      <div className="gallery-container" ref={galleryContainerRef}>

        <div className="gallery-meta">
          <span className="gallery-label">SELECTED WORKS</span>
          <span className="gallery-count">05 PROJECTS</span>
        </div>

        <div className="gallery-track" ref={galleryTrackRef}>
          {PROJECTS.map((project) => (
            <article
              key={project.id}
              className="project-card"
              style={{ '--card-hue': project.hue }}
            >
              <div className="project-card-inner" style={glassStyle}>
                <div className="card-visual">
                  <div className="card-glow" />
                  <div className="card-grid" />
                  <span className="card-bg-number" aria-hidden="true">
                    {project.id}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-header">
                    <span className="card-id">{project.id}</span>
                    <span className="card-year">{project.year}</span>
                  </div>

                  <div className="card-text">
                    <h3 className="card-name">{project.name}</h3>
                    <p className="card-tagline">{project.tagline}</p>
                    <p className="card-desc">{project.description}</p>
                  </div>

                  <div className="card-bottom">
                    <div className="card-stack">
                      {project.stack.map((tag) => (
                        <span key={tag} className="stack-pill">{tag}</span>
                      ))}
                    </div>
                    <a
                      href="#"
                      className="card-arrow"
                      aria-label={`View ${project.name} project`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Glassmorphism content dimmer to keep container opacity at 1.0 */}
                <div className="card-dimmer" />
              </div>
            </article>
          ))}
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
          <span>SCROLL</span>
        </div>
      </div>

      {/* Film-grain overlay */}
      <div className="works-grain" aria-hidden="true" />
    </section>
  );
}
