import React from "react";

interface GuadeloupeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  theme?: "dark" | "light";
}

export const GuadeloupeLogo: React.FC<GuadeloupeLogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  theme = "dark",
}) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Badge */}
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10 border border-amber-500/30 group`}>
        {/* SVG Tanbou Ka & Madras emblem */}
        <svg viewBox="0 0 512 512" className="w-full h-full">
          <defs>
            <radialGradient id="logoBgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b"/>
              <stop offset="100%" stopColor="#090d16"/>
            </radialGradient>
            
            <linearGradient id="logoMadrasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308"/>
              <stop offset="30%" stopColor="#dc2626"/>
              <stop offset="60%" stopColor="#16a34a"/>
              <stop offset="100%" stopColor="#d97706"/>
            </linearGradient>

            <linearGradient id="logoWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f"/>
              <stop offset="50%" stopColor="#b45309"/>
              <stop offset="100%" stopColor="#451a03"/>
            </linearGradient>

            <radialGradient id="logoSkinGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef3c7"/>
              <stop offset="85%" stopColor="#fde68a"/>
              <stop offset="100%" stopColor="#d97706"/>
            </radialGradient>

            <linearGradient id="logoGoldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/>
              <stop offset="50%" stopColor="#ef4444"/>
              <stop offset="100%" stopColor="#10b981"/>
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="512" height="512" fill="url(#logoBgGrad)"/>
          
          {/* Border Ring */}
          <circle cx="256" cy="256" r="230" fill="none" stroke="url(#logoGoldGlow)" strokeWidth="16" opacity="0.9"/>

          {/* GWO KA DRUM (Tanbou Ka) */}
          <path d="M176 210 Q 256 200 336 210 L 316 370 Q 256 385 196 370 Z" fill="url(#logoWoodGrad)" stroke="#292524" strokeWidth="4"/>
          
          {/* Ropes */}
          <path d="M186 215 L 216 370 M 216 212 L 256 375 M 256 210 L 296 370 M 296 212 L 326 365" stroke="#f59e0b" strokeWidth="4" opacity="0.85"/>
          
          {/* Drum Skin */}
          <ellipse cx="256" cy="210" rx="80" ry="28" fill="url(#logoSkinGrad)" stroke="#78350f" strokeWidth="6"/>
          <ellipse cx="256" cy="210" rx="68" ry="22" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="6 4"/>

          {/* MADRAS BAND */}
          <path d="M166 235 Q 256 250 346 235 L 342 260 Q 256 275 170 260 Z" fill="url(#logoMadrasGrad)"/>
          <path d="M190 238 L 190 268 M 220 241 L 220 271 M 250 242 L 250 272 M 280 241 L 280 271 M 310 238 L 310 268" stroke="#ffffff" strokeWidth="2.5" opacity="0.6"/>

          {/* HIBISCUS FLOWER */}
          <g transform="translate(350, 180) scale(0.75)">
            <circle cx="0" cy="0" r="14" fill="#ef4444"/>
            <path d="M0 -25 Q 12 -12 0 0 Q -12 -12 0 -25 Z" fill="#dc2626" transform="rotate(0)"/>
            <path d="M0 -25 Q 12 -12 0 0 Q -12 -12 0 -25 Z" fill="#dc2626" transform="rotate(72)"/>
            <path d="M0 -25 Q 12 -12 0 0 Q -12 -12 0 -25 Z" fill="#dc2626" transform="rotate(144)"/>
            <path d="M0 -25 Q 12 -12 0 0 Q -12 -12 0 -25 Z" fill="#dc2626" transform="rotate(216)"/>
            <path d="M0 -25 Q 12 -12 0 0 Q -12 -12 0 -25 Z" fill="#dc2626" transform="rotate(288)"/>
            <path d="M0 0 Q 15 -25 25 -30" stroke="#f59e0b" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <circle cx="25" cy="-30" r="5" fill="#fef08a"/>
          </g>

          {/* Text Emblem inside SVG */}
          <text x="256" y="425" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="44" fontWeight="900" fill="#ffffff" textAnchor="middle" letterSpacing="1">
            GWADA
          </text>
        </svg>
      </div>

      {/* Brand Title Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-black tracking-tight font-serif flex items-center gap-1.5">
              <span className={theme === "light" ? "text-amber-600" : "text-amber-400"}>Kréyol</span>
              <span className={theme === "light" ? "text-emerald-700" : "text-emerald-400"}>Gwada</span>
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              theme === "light" 
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
            }`}>
              Gwadloup • 971
            </span>
          </div>
          <p className={`text-xs font-medium flex items-center gap-1.5 ${
            theme === "light" ? "text-slate-600" : "text-slate-400"
          }`}>
            <span>GEREC Officiel</span>
            <span className={theme === "light" ? "text-amber-600" : "text-amber-500/80"}>•</span>
            <span className={`italic ${theme === "light" ? "text-amber-800 font-semibold" : "text-amber-300/90"}`}>An dousè !</span>
          </p>
        </div>
      )}
    </div>
  );
};
