import { useState, useEffect, useRef } from 'react';
import ConstructionScene from './UnderConstruction';
import './PreUI.css';

export default function PreUI() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '200px' } // Pre-load 200px before entering viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="preui-section" id="preui" ref={containerRef}>
      {isVisible ? (
        <div className="preui-flex-container">
          <div className="preui-left">
            <h2 className="preui-main-title">PreUI</h2>
            <p className="preui-sub-title">
              <span className="highlight-text">Under Construction</span>
            </p>
            <p className="preui-desc">
              PreUI is a ready-to-use UI component library providing copy-pasteable code with detailed implementation instructions.
            </p>
          </div>
          <div className="preui-right">
            <ConstructionScene />
          </div>
        </div>
      ) : (
        /* Placeholder to preserve height and layout bounds while unmounted */
        <div className="preui-placeholder" />
      )}
    </section>
  );
}
