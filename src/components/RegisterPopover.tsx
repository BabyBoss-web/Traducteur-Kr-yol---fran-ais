import React, { useState, useRef, useEffect } from "react";
import { Info, X, Sparkles, Clock, Compass, BookOpen } from "lucide-react";

interface RegisterPopoverProps {
  register?: string;
  explanation?: string;
  word?: string;
  isLight?: boolean;
  inline?: boolean;
  className?: string;
}

export const RegisterPopover: React.FC<RegisterPopoverProps> = ({
  register = "Courant",
  explanation,
  word,
  isLight = false,
  inline = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Determine badge styling based on register type
  const getRegisterBadgeProps = (regString: string) => {
    const lower = regString.toLowerCase();
    if (lower.includes("ancien") || lower.includes("tradi") || lower.includes("vieu")) {
      return {
        label: "Traditionnel / Ancien",
        icon: Clock,
        bgClass: "bg-amber-500/20 text-amber-500 border-amber-500/40",
        badgeLight: "bg-amber-100 text-amber-900 border-amber-300",
        defaultDesc: "Tournure traditionnelle ou ancienne du patrimoine créole guadeloupéen.",
      };
    } else if (lower.includes("famili") || lower.includes("popul")) {
      return {
        label: "Familier / Informel",
        icon: Compass,
        bgClass: "bg-yellow-500/20 text-yellow-500 border-yellow-500/40",
        badgeLight: "bg-yellow-100 text-yellow-900 border-yellow-300",
        defaultDesc: "Langage parlé informel, très usité entre amis ou proches.",
      };
    } else if (lower.includes("formel") || lower.includes("polit")) {
      return {
        label: "Formel / Politesse",
        icon: BookOpen,
        bgClass: "bg-sky-500/20 text-sky-400 border-sky-500/40",
        badgeLight: "bg-sky-100 text-sky-900 border-sky-300",
        defaultDesc: "Registre soigné utilisé pour manifester le respect et la courtoisie.",
      };
    } else if (lower.includes("prov") || lower.includes("imag") || lower.includes("prik")) {
      return {
        label: "Proverbe / Image",
        icon: Sparkles,
        bgClass: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        badgeLight: "bg-purple-100 text-purple-900 border-purple-300",
        defaultDesc: "Expression métaphorique, dicton ou sagesse créole populaire.",
      };
    } else {
      return {
        label: "Langage courant",
        icon: Info,
        bgClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        badgeLight: "bg-emerald-100 text-emerald-900 border-emerald-300",
        defaultDesc: "Expression fréquemment employée dans la vie quotidienne en Guadeloupe.",
      };
    }
  };

  const badgeProps = getRegisterBadgeProps(register);
  const IconComponent = badgeProps.icon;
  const descText = explanation || badgeProps.defaultDesc;

  return (
    <div
      ref={popoverRef}
      className={`relative ${inline ? "inline-flex" : "flex"} items-center ${className}`}
    >
      {/* Discreet Trigger Button with Mini Asterisk * */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-label={`Précision de registre pour ${word || "l'expression"} : ${badgeProps.label}`}
        title={`Registre : ${badgeProps.label} (cliquez pour en savoir plus)`}
        className={`group inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded-md transition-all cursor-pointer border select-none ${
          isOpen
            ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md scale-105"
            : isLight
            ? "bg-amber-100/90 hover:bg-amber-200 text-amber-900 border-amber-300/80"
            : "bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700"
        }`}
      >
        <span className="text-amber-500 dark:text-amber-400 font-black text-xs group-hover:scale-125 transition-transform">
          *
        </span>
        <span className="opacity-90">{register || "Courant"}</span>
      </button>

      {/* Mini Floating Window / Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Informations sur le registre de langue"
          className={`absolute bottom-full left-0 mb-2 w-64 sm:w-72 p-3.5 rounded-2xl shadow-2xl border z-50 text-xs animate-in fade-in zoom-in-95 duration-150 ${
            isLight
              ? "bg-white text-slate-800 border-amber-300/90 shadow-amber-900/10"
              : "bg-slate-900 text-slate-100 border-slate-700 shadow-black/80"
          }`}
          style={{ transform: "translateX(-20%)" }}
        >
          {/* Popover Arrow */}
          <div
            className={`absolute top-full left-6 -mt-1.5 border-8 border-transparent ${
              isLight ? "border-t-white" : "border-t-slate-900"
            }`}
          />

          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight ? badgeProps.badgeLight : badgeProps.bgClass
                }`}
              >
                <IconComponent className="w-3 h-3" />
                {badgeProps.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-slate-800 text-slate-400"
              }`}
              aria-label="Fermer la fenêtre d'information"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Popover Body */}
          <div className="mt-2.5 space-y-1.5">
            {word && (
              <p className="font-serif font-bold text-sm text-amber-600 dark:text-amber-400">
                « {word} »
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {descText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
