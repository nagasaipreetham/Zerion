import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './VintageLightPlayer.css';

const VintageLightPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isDraggingKnob, setIsDraggingKnob] = useState(false);

  const audioRef = useRef(null);
  const vinylRef = useRef(null);
  const tonearmRef = useRef(null);
  const rotationRef = useRef(null);
  const knobRef = useRef(null);

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
    <div className="vintage-light-player">
      <div className="vintage-light-base">
        {/* Wood Texture Overlay */}
        <div className="vintage-light-wood-texture" />

        {/* Corner Screws */}
        <div className="vintage-light-screw vintage-light-screw-tl" />
        <div className="vintage-light-screw vintage-light-screw-tr" />
        <div className="vintage-light-screw vintage-light-screw-bl" />
        <div className="vintage-light-screw vintage-light-screw-br" />

        {/* Vinyl Record */}
        <div className="vintage-light-vinyl-wrapper">
          <div ref={vinylRef} className="vintage-light-vinyl">
            <div className="vintage-light-grooves" />
            <div className="vintage-light-reflection" />
            <div className="vintage-light-center-label">
              {/* Album Art (Tilted to the right a little bit) */}
              <div className="vintage-light-album-art">
                <img
                  src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop"
                  alt="Album"
                />
              </div>
              <div className="vintage-light-spindle" />
            </div>
          </div>
        </div>

        {/* Tonearm Wrapper */}
        <div className="vintage-light-tonearm-wrapper">
          <div
            ref={tonearmRef}
            className="vintage-light-tonearm"
            onClick={handleTonearmClick}
          >
            <div className="vintage-light-arm-base" />
            <div className="vintage-light-arm-structure">
              <svg className="vintage-light-arm-svg" width="300" height="80" viewBox="0 0 300 80">
                <defs>
                  <linearGradient id="pipe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d1d5db" />
                    <stop offset="50%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#4b5563" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 20,40 L 155,40 L 270,12" 
                  fill="none" 
                  stroke="url(#pipe-grad)" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="vintage-light-arm-connector" style={{ left: '11px', top: '31px' }} />
              <div className="vintage-light-arm-head" style={{ left: '260px', top: '2px' }} />
            </div>
          </div>
        </div>

        {/* Control Panel elements positioned directly */}
        <div className="vintage-light-knob-section">
          <div
            ref={knobRef}
            className="vintage-light-knob"
            onMouseDown={handleKnobMouseDown}
          >
            <div className="vintage-light-knob-center">
              <div className="vintage-light-knob-indicator" />
            </div>
          </div>
        </div>

        <div className="vintage-light-led-section">
          <div className={`vintage-light-led ${isPlaying ? 'active' : ''}`} />
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

export default VintageLightPlayer;
