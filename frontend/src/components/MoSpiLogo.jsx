import React from 'react';

export default function MoSpiLogo({ size = 'md', showText = true, lang = 'en' }) {
  const isHi = lang === 'hi';

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Golden Emblem SVG with subtle breathing glow */}
      <div className={`relative ${sizeClasses[size]} shrink-0 animate-float`}>
        {/* Ambient Amber Halo */}
        <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md -z-10" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Outer Shield Hexagon */}
          <path
            d="M50 4L88 24V60C88 78 72 92 50 96C28 92 12 78 12 60V24L50 4Z"
            fill="#0F172A"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Golden Border */}
          <path
            d="M50 11L81 28V58C81 73 68 85 50 89C32 85 19 73 19 58V28L50 11Z"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Statistical Bell Curve / Distribution Arc */}
          <path
            d="M26 68C34 68 40 36 50 36C60 36 66 68 74 68"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Statistical Data Histogram Bars */}
          <rect x="33" y="56" width="5" height="12" rx="1.5" fill="#38BDF8" />
          <rect x="42" y="44" width="5" height="24" rx="1.5" fill="#F59E0B" />
          <rect x="53" y="40" width="5" height="28" rx="1.5" fill="#10B981" />
          <rect x="62" y="52" width="5" height="16" rx="1.5" fill="#A855F7" />

          {/* Central Neural / AI Nexus Node */}
          <circle cx="50" cy="28" r="4.5" fill="#F59E0B" />
          <circle cx="50" cy="28" r="7" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />

          {/* Tri-color Accent Bar at Base */}
          <path d="M36 78H44" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 78H54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M56 78H64" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Title & Official Cadre Label */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-base sm:text-lg leading-tight flex items-center gap-1.5">
              <span>{isHi ? "सांख्यिकी समर्थ" : "SĀNKHYIKI SAMARTH"}</span>
              <span className="text-amber-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                AI
              </span>
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide">
            {isHi 
              ? "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI)" 
              : "Ministry of Statistics & Programme Implementation"}
          </span>
        </div>
      )}
    </div>
  );
}
