import React, { useEffect } from "react";
import { X, Download, Smartphone, Monitor, CheckCircle2, Share, PlusSquare, ArrowUpRight } from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
  isStandalone: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
  isStandalone,
}) => {
  const [activeTab, setActiveTab] = React.useState<"auto" | "pc" | "android" | "ios">("auto");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="install-modal-title" className="text-base sm:text-lg font-bold text-white">
                Télécharger / Installer l'App
              </h2>
              <p className="text-xs text-teal-400 font-medium">
                Disponible pour PC, Mac, Android & iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre d'installation"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab("auto")}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "auto"
                ? "bg-teal-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installation</span>
          </button>
          <button
            onClick={() => setActiveTab("pc")}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "pc"
                ? "bg-teal-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Mac</span>
          </button>
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "android"
                ? "bg-teal-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "ios"
                ? "bg-teal-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-sm">
          {isStandalone ? (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-200 text-sm">Application déjà installée !</h3>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Vous utilisez actuellement le traducteur en mode application indépendante.
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "auto" && (
                <div className="space-y-4">
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">
                      Installez le traducteur sous forme d'application native sur votre appareil (PC, Mac, Smartphone). Elle s'exécutera sans navigateur et sera accessible depuis votre écran d'accueil ou bureau.
                    </p>

                    {deferredPrompt ? (
                      <button
                        onClick={onInstallClick}
                        className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-5 h-5" />
                        <span>Installer l'application maintenant</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-200 space-y-1">
                        <span className="font-semibold block">Installation automatique :</span>
                        <span>
                          Si le bouton d'installation automatique ne déclenche rien sur votre navigateur actuel, choisissez votre appareil ci-dessus pour suivre le guide manuel rapide (1 click).
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Avantages de l'application :
                    </h4>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Accès instantané depuis votre bureau ou écran d'accueil</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Mode hors-ligne disponible pour le dictionnaire</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Interface plein écran rapide et sans barre d'adresse</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "pc" && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-teal-400" />
                    <span>Installation sur PC (Windows / Mac / Linux)</span>
                  </h3>
                  <ol className="space-y-2.5 text-slate-300 list-decimal list-inside bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                    <li>
                      Ouvrez ce site dans <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong> ou <strong>Brave</strong>.
                    </li>
                    <li>
                      Regardez tout en haut à droite dans la <strong>barre d'adresse de votre navigateur</strong>.
                    </li>
                    <li>
                      Cliquez sur l'icône de téléchargement ou d'écran <span className="inline-flex items-center gap-1 font-semibold text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded"><Download className="w-3 h-3" /> "Installer l'application"</span>.
                    </li>
                    <li>
                      Validez : le logiciel est maintenant installé sur votre bureau Windows/Mac !
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === "android" && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-teal-400" />
                    <span>Installation sur Smartphone Android</span>
                  </h3>
                  <ol className="space-y-2.5 text-slate-300 list-decimal list-inside bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                    <li>
                      Ouvrez ce site dans <strong>Chrome</strong> sur votre téléphone Android.
                    </li>
                    <li>
                      Appuyez sur le menu <span className="font-bold text-white">⋮</span> (les 3 petits points en haut à droite).
                    </li>
                    <li>
                      Sélectionnez <span className="font-semibold text-teal-300">"Ajouter à l'écran d'accueil"</span> ou <span className="font-semibold text-teal-300">"Installer l'application"</span>.
                    </li>
                    <li>
                      L'icône du traducteur apparaît sur votre téléphone comme une vraie application Play Store !
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === "ios" && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Share className="w-4 h-4 text-teal-400" />
                    <span>Installation sur iPhone / iPad (Safari)</span>
                  </h3>
                  <ol className="space-y-2.5 text-slate-300 list-decimal list-inside bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                    <li>
                      Ouvrez ce site dans le navigateur <strong>Safari</strong> de votre iPhone/iPad.
                    </li>
                    <li>
                      Appuyez sur le bouton de <strong>Partage</strong> <Share className="w-3.5 h-3.5 text-teal-400 inline mx-1" /> (le carré avec la flèche vers le haut en bas de l'écran).
                    </li>
                    <li>
                      Faites défiler vers le bas et appuyez sur <span className="font-semibold text-teal-300 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-teal-400" /> "Sur l'écran d'accueil"</span>.
                    </li>
                    <li>
                      Appuyez sur <strong>Ajouter</strong> en haut à droite. L'application est installée sur votre iPhone !
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
