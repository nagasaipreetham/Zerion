import { useEffect, useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import './Resume.css';

export default function Resume() {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef(null);

  // Fetch and cache the PDF as a Blob URL gracefully in the background
  useEffect(() => {
    window.scrollTo(0, 0);
    
    let active = true;
    let localUrl = null;

    const fetchPdf = async () => {
      try {
        const response = await fetch('https://pub-64eaf935fdac4b6bae628841ce7c1e12.r2.dev/PreethamDev.pdf');
        if (response.ok && active) {
          const blob = await response.blob();
          localUrl = URL.createObjectURL(blob);
          if (active) {
            setPdfBlobUrl(localUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
      }
    };
    
    fetchPdf();

    return () => {
      active = false;
      // Clean up the blob URL when component unmounts
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 10));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 10));
  const handleReset = () => setZoom(100);

  // Listen to wheel zoom (Ctrl + Mouse Scroll) on the viewer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 10 : -10;
        setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Listen to multi-touch pinch gestures for mobile zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDist = 0;
    let initialZoom = 100;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && initialDist > 0) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / initialDist;
        const targetZoom = Math.round(initialZoom * factor);
        // Step zoom level smoothly within bounds
        setZoom(Math.min(200, Math.max(50, targetZoom)));
      }
    };

    const handleTouchEnd = () => {
      initialDist = 0;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom]);

  return (
    <section className="resume-page-section">
      {/* Header section */}
      <div className="resume-page-header">
        <h1 className="resume-page-title">Resume</h1>
        <p className="resume-page-caption">
          Explore my professional background, technical expertise, and career journey.
        </p>
      </div>

      {/* Image viewer component */}
      <div className="resume-viewer-widget">
        
        {/* Top bar controls */}
        <div className="resume-viewer-controls">
          <div className="resume-controls-left">
            <button 
              className="resume-control-btn" 
              onClick={handleZoomOut} 
              disabled={zoom <= 50 || !pdfBlobUrl}
              aria-label="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="resume-zoom-percentage">{zoom}%</span>
            <button 
              className="resume-control-btn" 
              onClick={handleZoomIn} 
              disabled={zoom >= 200 || !pdfBlobUrl}
              aria-label="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          <div className="resume-controls-middle">
            <span className="resume-document-title">Preetham_Dev Resume</span>
          </div>

          <div className="resume-controls-right">
            <button 
              className="resume-control-btn" 
              onClick={handleReset} 
              disabled={!pdfBlobUrl}
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              <RotateCw size={15} />
            </button>
            {pdfBlobUrl ? (
              <a 
                href={pdfBlobUrl} 
                download="Preetham_Resume.pdf" 
                className="resume-download-link-btn"
                title="Download PDF"
                aria-label="Download PDF"
              >
                <Download size={15} />
                <span className="download-text">Download</span>
              </a>
            ) : (
              <button className="resume-download-link-btn disabled" disabled>
                <Download size={15} />
                <span className="download-text">Loading...</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom image displayer */}
        <div className="resume-viewer-display" ref={containerRef}>
          {pdfBlobUrl ? (
            <div 
              className="resume-image-wrapper"
              style={{ 
                padding: '40px',
                width: `${zoom}%`,
                maxWidth: 'none',
                transition: 'width 0.1s ease-out'
              }}
            >
              <img 
                src="https://pub-64eaf935fdac4b6bae628841ce7c1e12.r2.dev/PreethamDev_page.jpg" 
                alt="Preetham Maddula Resume" 
                className="resume-image" 
              />
            </div>
          ) : (
            <div className="resume-viewer-loading">
              <div className="resume-spinner"></div>
              <span>Fetching from Cloud...</span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
