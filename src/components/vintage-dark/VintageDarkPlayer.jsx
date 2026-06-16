import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './VintageDarkPlayer.css';

const VintageDarkPlayer = () => {
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
    <div className="vintage-dark-player">
      <div className="vintage-dark-base">
        {/* Wood Texture Overlay */}
        <div className="vintage-dark-wood-texture" />

        {/* Corner Screws */}
        <div className="vintage-dark-screw vintage-dark-screw-tl" />
        <div className="vintage-dark-screw vintage-dark-screw-tr" />
        <div className="vintage-dark-screw vintage-dark-screw-bl" />
        <div className="vintage-dark-screw vintage-dark-screw-br" />

        {/* Vinyl Record */}
        <div className="vintage-dark-vinyl-wrapper">
          <div ref={vinylRef} className="vintage-dark-vinyl">
            <div className="vintage-dark-grooves" />
            <div className="vintage-dark-reflection" />
            <div className="vintage-dark-center-label">
              {/* Album Art (Tilted to the right a little bit) */}
              <div className="vintage-dark-album-art">
                <img
                  src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop"
                  alt="Album"
                />
              </div>
              <div className="vintage-dark-spindle" />
            </div>
          </div>
        </div>

        {/* Tonearm Wrapper */}
        <div className="vintage-dark-tonearm-wrapper">
          <div
            ref={tonearmRef}
            className="vintage-dark-tonearm"
            onClick={handleTonearmClick}
          >
            <div className="vintage-dark-arm-base" />
            <div className="vintage-dark-arm-structure">
              <svg className="vintage-dark-arm-svg" width="300" height="80" viewBox="0 0 300 80">
                <defs>
                  <linearGradient id="dark-pipe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f3f4f6" />
                    <stop offset="50%" stopColor="#d1d5db" />
                    <stop offset="100%" stopColor="#9ca3af" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 20,40 L 155,40 L 270,12" 
                  fill="none" 
                  stroke="url(#dark-pipe-grad)" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="vintage-dark-arm-connector" style={{ left: '11px', top: '31px' }} />
              <div className="vintage-dark-arm-head" style={{ left: '260px', top: '2px' }} />
            </div>
          </div>
        </div>

        {/* Control Panel elements positioned directly */}
        <div className="vintage-dark-knob-section">
          <div
            ref={knobRef}
            className="vintage-dark-knob"
            onMouseDown={handleKnobMouseDown}
          >
            <div className="vintage-dark-knob-center">
              <div className="vintage-dark-knob-indicator" />
            </div>
          </div>
        </div>

        <div className="vintage-dark-led-section">
          <div className={`vintage-dark-led ${isPlaying ? 'active' : ''}`} />
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

export default VintageDarkPlayer;
