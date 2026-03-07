import React from 'react';

/**
 * Smooth hero animation for login left panel: robot, chips, factory / data flow.
 * Pure SVG + CSS, no external assets. Feels like modern AI/software landing pages.
 */
const LoginHeroAnimation = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="w-full max-w-lg h-full max-h-[320px] flex items-center justify-center opacity-90">
        <svg
          viewBox="0 0 400 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain mx-auto block"
          aria-hidden
        >
          <defs>
            {/* Gradient for glow */}
            <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.4)" />
              <stop offset="100%" stopColor="rgba(148,163,184,0.1)" />
            </linearGradient>
            {/* Flowing line animation */}
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Chip glow */}
            <filter id="chipGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circuit grid (subtle) */}
          <g stroke="white" strokeOpacity="0.06" strokeWidth="0.5">
            {[40, 120, 200, 280, 360].map((x) => (
              <line key={`v${x}`} x1={x} y1={20} x2={x} y2={260} />
            ))}
            {[60, 140, 220].map((y) => (
              <line key={`h${y}`} x1={20} y1={y} x2={380} y2={y} />
            ))}
          </g>

          {/* Data flow lines (animated dash) - symmetric around center */}
          <g stroke="url(#flowGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="8 16" className="animate-hero-flow">
            <path d="M 70 80 Q 150 55 230 80 T 330 80" strokeOpacity="0.5" />
            <path d="M 70 200 Q 200 175 330 200" strokeOpacity="0.35" />
          </g>

          {/* Chip 1 - left of robot */}
          <g transform="translate(42, 98)" filter="url(#chipGlow)" className="animate-hero-pulse">
            <rect x="0" y="0" width="48" height="36" rx="4" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
            <line x1="8" y1="12" x2="40" y2="12" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="8" y1="18" x2="32" y2="18" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="8" y1="24" x2="36" y2="24" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.8" className="animate-hero-dot" />
            <circle cx="12" cy="24" r="1.5" fill="white" fillOpacity="0.6" className="animate-hero-dot" style={{ animationDelay: '0.5s' }} />
          </g>

          {/* Chip 2 - right of robot (symmetric) */}
          <g transform="translate(310, 98)" filter="url(#chipGlow)" className="animate-hero-pulse" style={{ animationDelay: '0.3s' }}>
            <rect x="0" y="0" width="48" height="36" rx="4" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
            <line x1="8" y1="12" x2="40" y2="12" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="8" y1="18" x2="28" y2="18" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="8" y1="24" x2="36" y2="24" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="12" cy="18" r="1.5" fill="white" fillOpacity="0.7" className="animate-hero-dot" style={{ animationDelay: '0.2s' }} />
          </g>

          {/* Robot - exact center of viewBox (200, 140); robot local center ≈ (44, 46) */}
          <g transform="translate(156, 94)" className="animate-hero-robot-float">
            {/* Head */}
            <rect x="24" y="0" width="40" height="36" rx="6" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" fill="none" />
            {/* Antenna */}
            <line x1="44" y1="0" x2="44" y2="-12" stroke="white" strokeOpacity="0.6" strokeWidth="1" className="animate-hero-antenna" />
            <circle cx="44" cy="-14" r="3" fill="white" fillOpacity="0.9" className="animate-hero-dot" />
            {/* Eyes */}
            <rect x="30" y="10" width="10" height="8" rx="2" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.6" strokeWidth="1" className="animate-hero-blink" />
            <rect x="48" y="10" width="10" height="8" rx="2" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.6" strokeWidth="1" className="animate-hero-blink" style={{ animationDelay: '0.1s' }} />
            {/* Body */}
            <rect x="20" y="38" width="48" height="44" rx="6" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" fill="none" />
            <line x1="28" y1="54" x2="60" y2="54" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="28" y1="62" x2="52" y2="62" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
            {/* Arm - moving */}
            <g className="animate-hero-arm">
              <line x1="20" y1="52" x2="4" y2="68" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
              <circle cx="4" cy="68" r="4" stroke="white" strokeOpacity="0.6" strokeWidth="1" fill="none" />
            </g>
            <g className="animate-hero-arm-reverse">
              <line x1="68" y1="52" x2="84" y2="68" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
              <circle cx="84" cy="68" r="4" stroke="white" strokeOpacity="0.6" strokeWidth="1" fill="none" />
            </g>
            {/* Base / wheels */}
            <rect x="26" y="80" width="36" height="12" rx="4" stroke="white" strokeOpacity="0.5" strokeWidth="1" fill="none" className="animate-hero-conveyor" />
          </g>

          {/* Factory / conveyor - centered under robot */}
          <g transform="translate(80, 228)" stroke="white" strokeOpacity="0.4" fill="none" strokeWidth="1">
            <path d="M 0 20 L 240 20 L 240 28 L 0 28 Z" fill="rgba(255,255,255,0.03)" />
            <line x1="0" y1="24" x2="240" y2="24" strokeDasharray="6 8" className="animate-hero-flow" />
            <g className="animate-hero-box-run">
              <rect x="8" y="12" width="16" height="16" rx="2" strokeOpacity="0.6" />
              <rect x="88" y="12" width="16" height="16" rx="2" strokeOpacity="0.6" />
              <rect x="168" y="12" width="16" height="16" rx="2" strokeOpacity="0.6" />
            </g>
          </g>

          {/* Gear - small (right) */}
          <g transform="translate(322, 68)" className="animate-hero-gear">
            <circle cx="0" cy="0" r="14" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i * 60 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={10 * Math.cos(a)}
                  y1={10 * Math.sin(a)}
                  x2={14 * Math.cos(a)}
                  y2={14 * Math.sin(a)}
                  stroke="white"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                />
              );
            })}
          </g>

          {/* Gear - larger (left), opposite rotation */}
          <g transform="translate(78, 198)" className="animate-hero-gear-reverse">
            <circle cx="0" cy="0" r="18" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const a = (i * 45 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={12 * Math.cos(a)}
                  y1={12 * Math.sin(a)}
                  x2={18 * Math.cos(a)}
                  y2={18 * Math.sin(a)}
                  stroke="white"
                  strokeOpacity="0.3"
                  strokeWidth="1.5"
                />
              );
            })}
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes heroFlow {
          to { stroke-dashoffset: -48; }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes heroDot {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes heroRobotFloat {
          0%, 100% { transform: translate(156px, 94px) translateY(0); }
          50% { transform: translate(156px, 94px) translateY(-4px); }
        }
        @keyframes heroArm {
          0%, 100% { transform: rotate(-8deg); transform-origin: 20px 52px; }
          50% { transform: rotate(6deg); transform-origin: 20px 52px; }
        }
        @keyframes heroArmReverse {
          0%, 100% { transform: rotate(8deg); transform-origin: 68px 52px; }
          50% { transform: rotate(-6deg); transform-origin: 68px 52px; }
        }
        @keyframes heroConveyor {
          to { transform: translateX(24px); }
        }
        @keyframes heroBoxRun {
          to { transform: translateX(-80px); }
        }
        @keyframes heroGear {
          to { transform: translate(322px, 68px) rotate(360deg); }
        }
        @keyframes heroGearReverse {
          to { transform: translate(78px, 198px) rotate(-360deg); }
        }
        @keyframes heroAntenna {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes heroBlink {
          0%, 45%, 55%, 100% { fill-opacity: 0.2; }
          50% { fill-opacity: 0.7; }
        }

        .animate-hero-flow {
          animation: heroFlow 2.5s linear infinite;
        }
        .animate-hero-pulse {
          animation: heroPulse 3s ease-in-out infinite;
        }
        .animate-hero-dot {
          animation: heroDot 2s ease-in-out infinite;
        }
        .animate-hero-robot-float {
          animation: heroRobotFloat 4s ease-in-out infinite;
        }
        .animate-hero-arm {
          animation: heroArm 2.5s ease-in-out infinite;
        }
        .animate-hero-arm-reverse {
          animation: heroArmReverse 2.5s ease-in-out infinite;
        }
        .animate-hero-conveyor {
          animation: heroConveyor 3s linear infinite;
        }
        .animate-hero-box-run {
          animation: heroBoxRun 4s linear infinite;
        }
        .animate-hero-gear {
          animation: heroGear 8s linear infinite;
        }
        .animate-hero-gear-reverse {
          animation: heroGearReverse 10s linear infinite;
        }
        .animate-hero-antenna {
          animation: heroAntenna 1.5s ease-in-out infinite;
        }
        .animate-hero-blink {
          animation: heroBlink 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginHeroAnimation;
