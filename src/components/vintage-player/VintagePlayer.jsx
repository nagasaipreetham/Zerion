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
  const volumeRef = useRef(0.7);

  // Sync volume with audio component
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Initial load: Set initial tonearm angle (off disk) and volume knob position
  useEffect(() => {
    // 1. Tonearm starts off the disk (rotation: 0) — user must click to play
    if (tonearmRef.current) {
      gsap.set(tonearmRef.current, { rotation: 0 });
    }

    // 2. Set the volume knob rotation initially based on default volume state (0.7)
    if (knobRef.current) {
      const initialRotation = 0.7 * (324 - 36) + 36;
      gsap.set(knobRef.current, { rotation: initialRotation });
    }
  }, []);

  // Vinyl continuous rotation layout initialization
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

  // Sync visual tonearm rotation, vinyl animation state, and audio element with isPlaying state
  useEffect(() => {
    const tonearm = tonearmRef.current;
    if (!tonearm) return;

    if (isPlaying) {
      // Move tonearm to disk
      gsap.to(tonearm, {
        rotation: -15,
        duration: 0.7,
        ease: "power2.inOut"
      });
      // Play vinyl rotation
      if (rotationRef.current) rotationRef.current.play();
      // Play audio element
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio play failed on isPlaying state change:", err);
        });
      }
    } else {
      // Move tonearm back off disk
      gsap.to(tonearm, {
        rotation: 0,
        duration: 0.7,
        ease: "power2.inOut"
      });
      // Pause vinyl rotation
      if (rotationRef.current) rotationRef.current.pause();
      // Pause audio element
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

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
    setIsPlaying(prev => !prev);
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
    let degrees = angle * (180 / Math.PI) + 90;
    degrees = ((degrees % 360) + 360) % 360;

    let finalRotation = degrees;
    let volumeValue = 0;

    // Active zone: [36, 324] (clockwise through the bottom)
    // Dead zone: < 36 or > 324 (top 20% on top)
    if (degrees < 36 || degrees > 324) {
      // It's in the dead zone. Snap to nearest boundary stop based on volumeRef.
      // This forces rotation through the bottom only, preventing jumping across the top.
      if (volumeRef.current <= 0.5) {
        finalRotation = 36;
        volumeValue = 0;
      } else {
        finalRotation = 324;
        volumeValue = 1;
      }
    } else {
      // In active zone [36, 324]
      finalRotation = degrees;
      volumeValue = (degrees - 36) / (324 - 36);
    }

    setVolume(volumeValue);
    volumeRef.current = volumeValue;
    if (audioRef.current) audioRef.current.volume = volumeValue;

    gsap.to(knob, {
      rotation: finalRotation,
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
          <div className="vintage-player-tonearm-onoff-label vintage-player-engraved">
            ON/OFF
          </div>

          {/* Control Panel elements positioned directly */}
          <div className="vintage-player-knob-section">
            <div className="vintage-player-knob-label-plus vintage-player-engraved">+</div>
            <div className="vintage-player-knob-label-minus vintage-player-engraved">-</div>
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
        playsInline
        loop
        src="https://pub-64eaf935fdac4b6bae628841ce7c1e12.r2.dev/Peaches.mp3"
      />
    </div>
  );
};

export default VintagePlayer;
