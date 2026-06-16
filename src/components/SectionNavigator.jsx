import { useState, useEffect } from 'react';
import './SectionNavigator.css';

const SECTIONS = [
  { id: 'hero', label: 'HERO' },
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'sponsors', label: 'SPONSORS' },
  { id: 'projects', label: 'WORKS' },
  { id: 'preui', label: 'PREUI' },
  { id: 'contact', label: 'CONTACT' },
  { id: 'footer', label: 'FOOTER' }
];

// Y coordinate arrays (defined relative to a 260x400 SVG ViewBox)
const Y_COLLAPSED = [151, 165, 179, 193, 207, 221, 235, 249];
const Y_RIGHT_EXPANDED = [137, 155, 173, 191, 209, 227, 245, 263]; // closer spacing on the right
const Y_LEFT_EXPANDED = [53, 95, 137, 179, 221, 263, 305, 347];    // wider diverging spacing on the left

export default function SectionNavigator() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // ── Track viewport scroll to update active section ─────────────────
  useEffect(() => {
    const checkActive = () => {
      // Query sections dynamically on scroll to prevent stale references or mounting delay issues
      const elements = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
      const viewportHeight = window.innerHeight;
      
      let maxVisibleHeight = -1;
      let activeId = null;

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        
        // Calculate the height bounds of the element visible in the viewport
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        // Track the section with the largest visible presence on screen
        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          activeId = el.id;
        }
      });

      if (activeId) {
        setActiveSection(activeId);
      }
    };

    // Run check once on mount and register scroll/resize event listeners
    checkActive();
    window.addEventListener('scroll', checkActive, { passive: true });
    window.addEventListener('resize', checkActive, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkActive);
      window.removeEventListener('resize', checkActive);
    };
  }, []);

  // ── Smooth Scroll on click ─────────────────────────────────────────
  const handleNavigate = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Resolve target element if pinned by GSAP ScrollTrigger
    const target = element.closest('.pin-spacer') || element;
    const rect = target.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementHeight = rect.height;

    let targetScrollY;
    if (id === 'hero') {
      targetScrollY = 0;
    } else if (id === 'footer') {
      targetScrollY = document.documentElement.scrollHeight - window.innerHeight;
    } else if (elementHeight > window.innerHeight) {
      // If the section is taller than the screen height (like Works), align to its top with nav offset
      targetScrollY = elementTop - 80;
    } else {
      // Align target vertically centered in the viewport
      targetScrollY = elementTop - (window.innerHeight - elementHeight) / 2;
    }

    if (window.__lenis) {
      window.__lenis.scrollTo(targetScrollY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`section-navigator ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredIndex(null);
      }}
      aria-label="Section navigation menu"
    >
      {/* SVG Canvas for drawing the curved connector lines */}
      <svg className="navigator-svg" viewBox="0 0 260 400" xmlns="http://www.w3.org/2000/svg">
        {SECTIONS.map((section, idx) => {
          const isActive = activeSection === section.id;
          const isItemHovered = hoveredIndex === idx;

          // Compute coordinates based on hover state
          const yRight = isHovered ? Y_RIGHT_EXPANDED[idx] : Y_COLLAPSED[idx];
          const yLeft = isHovered ? Y_LEFT_EXPANDED[idx] : Y_COLLAPSED[idx];

          const xRight = 250;
          const xLeft = isHovered ? 130 : 230;

          const cxRight = isHovered ? 190 : 243.3;
          const cxLeft = isHovered ? 190 : 236.7;

          // Cubic Bezier path
          const pathData = `M ${xRight},${yRight} C ${cxRight},${yRight} ${cxLeft},${yLeft} ${xLeft},${yLeft}`;

          return (
            <path
              key={section.id}
              d={pathData}
              className={`navigator-line ${isActive ? 'active' : ''} ${isItemHovered ? 'hovered' : ''}`}
            />
          );
        })}
      </svg>

      {/* Navigation Text Labels positioned to align with left ends of paths */}
      <div className="navigator-labels">
        {SECTIONS.map((section, idx) => {
          const isActive = activeSection === section.id;
          const isItemHovered = hoveredIndex === idx;

          // Match vertical coordinate of left end of line
          const topPosition = isHovered ? Y_LEFT_EXPANDED[idx] : Y_COLLAPSED[idx];

          return (
            <button
              key={section.id}
              className={`navigator-label-btn ${isActive ? 'active' : ''} ${isItemHovered ? 'hovered' : ''}`}
              style={{
                top: `${topPosition}px`,
                // Calculate correct transform translation when active or hovered
                transform: `translateY(-50%) scale(${isItemHovered ? 1.08 : 1})`,
              }}
              onClick={() => handleNavigate(section.id)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              tabIndex={isHovered ? 0 : -1}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
