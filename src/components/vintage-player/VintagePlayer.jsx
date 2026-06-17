import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './VintagePlayer.css';

const VintagePlayer = ({ theme = 'dark' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isDraggingKnob, setIsDraggingKnob] = useState(false);
  const [scale, setScale] = useState(1);

  const audioRef = useRef(null);
  const vinylRef = useRef(null);
  const tonearmRef = useRef(null);
  const rotationRef = useRef(null);
  const knobRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (vinylRef.current) {
      rotationRef.current = gsap.to(vinylRef.current, {
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: 'none',
        paused: !isPlaying
      });
    }

    return () => {
      if (rotationRef.current) {
        rotationRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width < 380) {
          setScale(width / 380);
        } else {
          setScale(1);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const handleTonearmClick = () => {
    const tonearm = tonearmRef.current;
    if (!tonearm) return;

    if (!isPlaying) {
      gsap.to(tonearm, {
        rotation: -15,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          setIsPlaying(true);
          if (audioRef.current) audioRef.current.play();
          if (rotationRef.current) rotationRef.current.play();
        }
      });
    } else {
      gsap.to(tonearm, {
        rotation: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.pause();
          if (rotationRef.current) rotationRef.current.pause();
        }
      });
    }
  };

  const handleKnobMouseDown = (e) => {
    setIsDraggingKnob(true);
    updateKnobRotation(e);
  };

  const handleKnobMouseMove = (e) => {
    if (isDraggingKnob) updateKnobRotation(e);
  };

  const handleKnobMouseUp = () => {
    setIsDraggingKnob(false);
  };

  const updateKnobRotation = (e) => {
    const knob = knobRef.current;
    if (!knob) return;

    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = angle * (180 / Math.PI) + 90;
    const normalizedRotation = ((degrees % 360) + 360) % 360;
    const volumeValue = Math.max(0, Math.min(1, normalizedRotation / 270));

    setVolume(volumeValue);
    if (audioRef.current) audioRef.current.volume = volumeValue;

    gsap.to(knob, {
      rotation: normalizedRotation,
      duration: 0.1
    });
  };

  useEffect(() => {
    if (isDraggingKnob) {
      window.addEventListener('mousemove', handleKnobMouseMove);
      window.addEventListener('mouseup', handleKnobMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleKnobMouseMove);
        window.removeEventListener('mouseup', handleKnobMouseUp);
      };
    }
  }, [isDraggingKnob]);

  return (
    <div ref={containerRef} className={`vintage-player theme-${theme}`}>
      <div
        className="vintage-player-base-wrapper"
        style={{
          width: `${380 * scale}px`,
          height: `${480 * scale}px`,
        }}
      >
        <div
          className="vintage-player-base"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {/* Wood Texture Overlay */}
          <div className="vintage-player-wood-texture" />

          {/* Corner Screws */}
          <div className="vintage-player-screw vintage-player-screw-tl" />
          <div className="vintage-player-screw vintage-player-screw-tr" />
          <div className="vintage-player-screw vintage-player-screw-bl" />
          <div className="vintage-player-screw vintage-player-screw-br" />

          {/* Vinyl Record */}
          <div className="vintage-player-vinyl-wrapper">
            <div ref={vinylRef} className="vintage-player-vinyl">
              <div className="vintage-player-grooves" />
              <div className="vintage-player-reflection" />
              <div className="vintage-player-center-label">
                {/* Album Art (Tilted to the right a little bit) */}
                <div className="vintage-player-album-art">
                  <img
                    src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop"
                    alt="Album"
                  />
                </div>
                <div className="vintage-player-spindle" />
              </div>
            </div>
          </div>

          {/* Tonearm Wrapper */}
          <div className="vintage-player-tonearm-wrapper">
            <div
              ref={tonearmRef}
              className="vintage-player-tonearm"
              onClick={handleTonearmClick}
            >
              <div className="vintage-player-arm-base" />
              <div className="vintage-player-arm-structure">
                <svg className="vintage-player-arm-svg" width="300" height="80" viewBox="0 0 300 80">
                  <defs>
                    <linearGradient id={`pipe-grad-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      {theme === 'dark' ? (
                        <>
                          <stop offset="0%" stopColor="#f3f4f6" />
                          <stop offset="50%" stopColor="#d1d5db" />
                          <stop offset="100%" stopColor="#9ca3af" />
                        </>
                      ) : (
                        <>
                          <stop offset="0%" stopColor="#d1d5db" />
                          <stop offset="50%" stopColor="#9ca3af" />
                          <stop offset="100%" stopColor="#4b5563" />
                        </>
                      )}
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 20,40 L 155,40 L 270,12" 
                    fill="none" 
                    stroke={`url(#pipe-grad-${theme})`} 
                    strokeWidth="5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="vintage-player-arm-connector" style={{ left: '11px', top: '31px' }} />
                <div className="vintage-player-arm-head" style={{ left: '260px', top: '2px' }} />
              </div>
            </div>
          </div>

          {/* Control Panel elements positioned directly */}
          <div className="vintage-player-knob-section">
            <div
              ref={knobRef}
              className="vintage-player-knob"
              onMouseDown={handleKnobMouseDown}
            >
              <div className="vintage-player-knob-center">
                <div className="vintage-player-knob-indicator" />
              </div>
            </div>
          </div>

          <div className="vintage-player-led-section">
            <div className={`vintage-player-led ${isPlaying ? 'active' : ''}`} />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        loop
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />
    </div>
  );
};

export default VintagePlayer;
