import React from "react";

interface MadrasRibbonProps {
  height?: string;
  className?: string;
}

export const MadrasRibbon: React.FC<MadrasRibbonProps> = ({
  height = "h-1.5",
  className = "",
}) => {
  return (
    <div className={`w-full ${height} ${className} relative overflow-hidden bg-gradient-to-r from-amber-500 via-rose-600 via-emerald-600 to-amber-500 shadow-sm`}>
      {/* Plaid criss-cross texture effect */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0, #ffffff 2px, transparent 0, transparent 8px), repeating-linear-gradient(-45deg, #000000 0, #000000 2px, transparent 0, transparent 8px)`
        }}
      />
    </div>
  );
};
