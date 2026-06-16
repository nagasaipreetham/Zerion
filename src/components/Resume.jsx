import { useEffect, useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import './Resume.css';

const IMAGE_URL = 'https://pub-64eaf935fdac4b6bae628841ce7c1e12.r2.dev/PreethamDev_page.jpg';
const PDF_URL   = 'https://pub-64eaf935fdac4b6bae628841ce7c1e12.r2.dev/PreethamDev.pdf';

export default function Resume() {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  // zoom stored as a plain number (50 – 150) representing percentage
  const [zoom, setZoom]             = useState(100);
  // key used to force re-fetch the image
  const [imgKey, setImgKey]         = useState(0);
  const containerRef                = useRef(null);
  // Ref to hold the current blob URL so the cleanup can always access it
  const blobUrlRef                  = useRef(null);

  /* ── Fetch the PDF blob (also called when Reload is clicked) ─ */
  const fetchPdf = useCallback(async () => {
    // Revoke previous blob URL if there is one
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPdfBlobUrl(null); // show loading state
    try {
      const response = await fetch(PDF_URL, { cache: 'no-store' });
      if (response.ok) {
        const blob = await response.blob();
        const url  = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setPdfBlobUrl(url);
      }
    } catch (error) {
      console.error('Failed to fetch PDF:', error);
    }
  }, []);

  /* ── Initial fetch on mount ─────────────────────────────────── */
  useEffect(() => {
    fetchPdf();
    return () => {
      // Cleanup blob URL on unmount
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [fetchPdf]);

  /* ── Zoom controls ──────────────────────────────────────────── */
  // Max 150%, min 50%, each step = 1% (smooth)
  const handleZoomIn  = () => setZoom(prev => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom(prev => Math.max(50,  prev - 10));

  /* ── Reload: reset zoom to 100%, re-fetch image and PDF ─────── */
  const handleReset = () => {
    setZoom(100);
    setImgKey(prev => prev + 1); // force image re-load
    fetchPdf();                   // re-fetch PDF blob
  };

  /* ── Ctrl + Mouse wheel zoom ────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        // Each wheel notch = 1%
        const delta = e.deltaY < 0 ? 1 : -1;
        setZoom(prev => Math.min(150, Math.max(50, prev + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  /* ── Pinch-to-zoom (touch) ──────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDist = 0;
    let initialZoom = zoom;

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
        const dist   = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor     = dist / initialDist;
        const targetZoom = Math.round(initialZoom * factor);
        setZoom(Math.min(150, Math.max(50, targetZoom)));
      }
    };

    const handleTouchEnd = () => { initialDist = 0; };

    container.addEventListener('touchstart',  handleTouchStart);
    container.addEventListener('touchmove',   handleTouchMove,  { passive: false });
    container.addEventListener('touchend',    handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove',  handleTouchMove);
      container.removeEventListener('touchend',   handleTouchEnd);
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

      {/* Image viewer widget */}
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
              disabled={zoom >= 150 || !pdfBlobUrl}
              aria-label="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          <div className="resume-controls-middle">
            <span className="resume-document-title">Preetham_Dev Resume</span>
          </div>

          <div className="resume-controls-right">
            {/* Reload: resets zoom AND re-fetches image + PDF */}
            <button
              className="resume-control-btn"
              onClick={handleReset}
              title="Reload &amp; Reset Zoom"
              aria-label="Reload and Reset Zoom"
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

        {/* Bottom image displayer — no fixed height; shows full image */}
        <div className="resume-viewer-display" ref={containerRef}>
          {pdfBlobUrl ? (
            <div
              className="resume-image-wrapper"
              style={{
                padding: '40px',
                /* Each 1% of zoom = 2px extra width beyond the base 100% */
                width: `calc(100% + ${(zoom - 100) * 2}px)`,
                maxWidth: 'none',
                transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <img
                key={imgKey}
                src={`${IMAGE_URL}?v=${imgKey}`}
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
