import { useState, useEffect, useRef } from 'react';
import './FloatingBottomMenu.css';

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

const PILL_WIDTH = 36; // Constant width of the mother pill capsule

export default function FloatingBottomMenu() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: PILL_WIDTH });

  const rightSectionRef = useRef(null);
  const dotsRef = useRef([]);

  const activeIndex = SECTIONS.findIndex(s => s.id === activeSection);
  const currentIndex = previewIndex !== null ? previewIndex : activeIndex;
  const currentLabel = SECTIONS[currentIndex]?.label || '';

  const isScrollingProgrammatically = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // ── Toggle body class for layout padding ───────────────────────────
  useEffect(() => {
    document.body.classList.add('has-floating-menu');
    return () => {
      document.body.classList.remove('has-floating-menu');
    };
  }, []);

  // ── Track viewport scroll to update active section ─────────────────
  useEffect(() => {
    const checkActive = () => {
      // If we are currently scrolling programmatically, ignore normal scroll updates
      if (isScrollingProgrammatically.current) return;

      const elements = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
      const viewportHeight = window.innerHeight;
      
      let maxVisibleHeight = -1;
      let activeId = null;

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          activeId = el.id;
        }
      });

      if (activeId) {
        setActiveSection(activeId);
      }
    };

    checkActive();
    window.addEventListener('scroll', checkActive, { passive: true });
    window.addEventListener('resize', checkActive, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkActive);
      window.removeEventListener('resize', checkActive);
    };
  }, []);

  // ── Measure and update pill position ──────────────────────────────
  const updatePillPosition = () => {
    if (isDragging) return;

    const targetIndex = previewIndex !== null ? previewIndex : activeIndex;
    const activeDotEl = dotsRef.current[targetIndex];
    
    if (activeDotEl && rightSectionRef.current) {
      const centerX = activeDotEl.offsetLeft + activeDotEl.offsetWidth / 2;
      setPillStyle({
        left: centerX - PILL_WIDTH / 2,
        width: PILL_WIDTH
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(updatePillPosition, 50);
    return () => clearTimeout(timer);
  }, [activeSection, previewIndex, isDragging]);

  useEffect(() => {
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [activeIndex]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // ── Smooth Scroll Navigation ──────────────────────────────────────
  const handleNavigate = (id) => {
    // Lock scroll tracking updates during programmatic scroll
    isScrollingProgrammatically.current = true;
    setActiveSection(id); // snap state immediately

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 1300); // 1.3s covers the smooth scroll animation transition duration

    const element = document.getElementById(id);
    if (!element) return;

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
      targetScrollY = elementTop - 80;
    } else {
      targetScrollY = elementTop - (window.innerHeight - elementHeight) / 2;
    }

    if (window.__lenis) {
      window.__lenis.scrollTo(targetScrollY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  };

  // ── Drag Gestures Pointer Handlers ────────────────────────────────
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    setIsDragging(true);
    rightSectionRef.current.setPointerCapture(e.pointerId);
    
    handleDragUpdate(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    handleDragUpdate(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (rightSectionRef.current) {
      const rightRect = rightSectionRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rightRect.left;

      let closestIndex = 0;
      let minDistance = Infinity;

      SECTIONS.forEach((_, idx) => {
        const dotEl = dotsRef.current[idx];
        if (dotEl) {
          const dotCenterX = dotEl.offsetLeft + dotEl.offsetWidth / 2;
          const dist = Math.abs(relativeX - dotCenterX);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        }
      });

      handleNavigate(SECTIONS[closestIndex].id);
    }

    setPreviewIndex(null);
    rightSectionRef.current.releasePointerCapture(e.pointerId);
  };

  const handleDragUpdate = (clientX) => {
    if (rightSectionRef.current) {
      const rightRect = rightSectionRef.current.getBoundingClientRect();
      const relativeX = clientX - rightRect.left;

      // Find closest dot under pointer
      let closestIndex = 0;
      let minDistance = Infinity;

      SECTIONS.forEach((_, idx) => {
        const dotEl = dotsRef.current[idx];
        if (dotEl) {
          const dotCenterX = dotEl.offsetLeft + dotEl.offsetWidth / 2;
          const dist = Math.abs(relativeX - dotCenterX);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        }
      });

      setPreviewIndex(closestIndex);

      // Center the pill under pointer clamped inside right section track
      const left = Math.max(0, Math.min(rightRect.width - PILL_WIDTH, relativeX - PILL_WIDTH / 2));
      setPillStyle({ left, width: PILL_WIDTH });
    }
  };

  return (
    <nav className="floating-bottom-nav">
      <div className="floating-menu-bar">
        {/* Left Section: Active Label (Fixed width relative to viewport) */}
        <div className="floating-menu-left">
          <span key={currentLabel} className="floating-menu-active-label">
            {currentLabel}
          </span>
        </div>

        {/* Thin vertical divider line */}
        <div className="floating-menu-divider" />

        {/* Right Section: Dots + Draggable Mother Pill highlight */}
        <div
          ref={rightSectionRef}
          className={`floating-menu-right ${isDragging ? 'dragging' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Mother Pill Highlight */}
          <div
            className="floating-menu-pill"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`
            }}
          />

          {/* Symmetrical section dot/pill buttons */}
          {SECTIONS.map((section, idx) => {
            const isActive = activeSection === section.id;
            const isPreviewed = previewIndex === idx;
            const isDotActive = isPreviewed || (previewIndex === null && isActive);

            return (
              <button
                key={section.id}
                ref={el => (dotsRef.current[idx] = el)}
                className={`floating-menu-dot-btn ${isDotActive ? 'active' : ''}`}
                onClick={() => handleNavigate(section.id)}
                aria-label={`Navigate to ${section.label}`}
              >
                <span className="dot-pill-shape" />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
