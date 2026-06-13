import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef(null);
  const curtainTopRef = useRef(null);
  const curtainBottomRef = useRef(null);
  const galleryTrackRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const curtainTop = curtainTopRef.current;
    const curtainBottom = curtainBottomRef.current;
    const track = galleryTrackRef.current;

    const ctx = gsap.context(() => {
      // Compute how far the gallery needs to scroll horizontally
      const getGalleryDist = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      // ── Master Timeline ──────────────────────────────
      // Total normalised duration = 1.0
      //  Phase 1 → [0.00 – 0.35] Curtains split open
      //  Phase 2 → [0.35 – 1.00] Gallery slides horizontally
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      tl.to(curtainTop, { yPercent: -100, duration: 0.35 }, 0)
        .to(curtainBottom, { yPercent: 100, duration: 0.35 }, 0)
        .to(
          track,
          {
            x: () => -getGalleryDist(),
            duration: 0.65,
            ease: 'none',
          },
          0.35
        );

      // ── ScrollTrigger ────────────────────────────────
      // Total scroll distance so the gallery phase (65 %) covers every pixel
      // of the horizontal track:  totalScroll = G / 0.65
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round(getGalleryDist() / 0.65)}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="works-section" ref={sectionRef} id="projects">
      {/* ── Top Curtain ──────────────────────────── */}
      <div className="curtain curtain-top" ref={curtainTopRef}>
        <h2 className="works-title">WORKS</h2>
      </div>

      {/* ── Bottom Curtain ───────────────────────── */}
      <div className="curtain curtain-bottom" ref={curtainBottomRef}>
        <h2 className="works-title">WORKS</h2>
      </div>

      {/* ── Gallery ──────────────────────────────── */}
      <div className="gallery-container">
        {/* Top-left section label */}
        <div className="gallery-meta">
          <span className="gallery-label">SELECTED WORKS</span>
          <span className="gallery-count">05 PROJECTS</span>
        </div>

        {/* Horizontal track */}
        <div className="gallery-track" ref={galleryTrackRef}>
          <div className="gallery-pad" aria-hidden="true" />

          {PROJECTS.map((project) => (
            <article
              key={project.id}
              className="project-card"
              style={{ '--card-hue': project.hue }}
            >
              {/* Abstract visual area */}
              <div className="card-visual">
                <div className="card-glow" />
                <div className="card-grid" />
                <span className="card-bg-number" aria-hidden="true">
                  {project.id}
                </span>
              </div>

              {/* Text body */}
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
                      <span key={tag} className="stack-pill">
                        {tag}
                      </span>
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
            </article>
          ))}

          <div className="gallery-pad" aria-hidden="true" />
        </div>

        {/* Scroll hint — visible while curtains are still open */}
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
