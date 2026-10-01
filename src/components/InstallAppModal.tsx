import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Share2, 
  ExternalLink, 
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  HelpCircle,
  Check,
  FolderArchive,
  FileCode
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'direct' | 'zip' | 'apk' | 'help'>('apk');
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl || window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com?site=${encodeURIComponent(appUrl || window.location.href)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-amber-50 border-2 border-amber-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-inner shrink-0">
              <img src="/pwa-192x192.png" alt="App Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">போனில் ஆப் (App / APK)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950">
                  5 சாதனங்கள்
                </span>
              </div>
              <p className="text-[11px] text-amber-100">
                போனில் நேரடி ஆப்பாக வைத்துப் பயன்படுத்தும் வழிகாட்டல்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 text-white shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-amber-200 bg-amber-100/70 p-1.5 gap-1 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'apk'
                ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                : 'text-stone-700 hover:text-stone-900 bg-white/70'
            }`}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>APK பதிவிறக்கு</span>
            <span className="bg-amber-200 text-amber-950 text-[9px] px-1 py-0.2 rounded font-black">APK</span>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 min-w-[85px] py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'direct'
                ? 'bg-white text-amber-950 shadow-sm border border-amber-200 font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>நேரடி ஆப்</span>
          </button>
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex-1 min-w-[90px] py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'zip'
                ? 'bg-white text-amber-950 shadow-sm border border-amber-200 font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-600" />
            <span>ZIP கோப்புகள்</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'help'
                ? 'bg-white text-amber-950 shadow-sm border border-amber-200 font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>உதவி</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-stone-800 flex-1">
          {activeTab === 'zip' && (
            <div className="space-y-3">
              {/* Primary ZIP Download Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-amber-400 shadow-md space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shrink-0">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-stone-900">
                        முழு செயலி கோப்புகள் (Complete Source ZIP)
                      </h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        181 KB
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      இந்த செயலியில் பயன்படுத்தப்பட்டுள்ள <strong>அனைத்து கோப்புகளும் (ஒன்றும் விடுபடாமல்)</strong> இந்த ZIP கோப்பில் முழுமையாக அடங்கியுள்ளது.
                    </p>
                  </div>
                </div>

                {/* Direct Download Button */}
                <a
                  href="/muttai-farm-app.zip"
                  download="muttai-farm-app.zip"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-black text-sm shadow-lg shadow-amber-900/20 transition flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>ZIP கோப்பை பதிவிறக்கு (Download .ZIP)</span>
                </a>

                {/* What's included checklist */}
                <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    <span>இந்த ZIP-ல் உள்ள அனைத்து கோப்புகள்:</span>
                  </div>
                  <ul className="space-y-1 text-stone-700 font-medium pl-1 text-[11px]">
                    <li>📦 <strong>src/</strong> : அனைத்து React & TypeScript கோப்புகள், மாடல்கள் & ஒலிக் கோப்புகள்</li>
                    <li>🌐 <strong>public/</strong> : PWA ஐகான்கள், Offline HTML கோப்பு, Service Worker</li>
                    <li>⚡ <strong>server.ts</strong> : 5 சாதனங்கள் நேரடி ஒத்திசைவுக்கான WebSocket சர்வர்</li>
                    <li>📄 <strong>muttai_pannai.html</strong> : சர்வர் இன்றியே இயங்கும் நேரடி தனி ஆப்லைன் கோப்பு</li>
                    <li>⚙️ <strong>package.json, tsconfig.json, vite.config.ts</strong> : பில்ட் அமைப்புகள்</li>
                    <li>📖 <strong>README.md</strong> : இயக்கும் முறை வழிகாட்டி (தமிழ் & English)</li>
                  </ul>
                </div>
              </div>

              {/* Offline standalone HTML direct download */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">தனி ஆப்லைன் HTML கோப்பு</h5>
                    <p className="text-[11px] text-stone-500">Node.js இல்லாமலே பிரவுசரில் உடனே இயங்கும்</p>
                  </div>
                </div>
                <a
                  href="/muttai_pannai.html"
                  download="muttai_pannai.html"
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>HTML சேமி</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <>
              {/* Direct Install Card */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-stone-900">
                      போனின் Home Screen-ல் முழு ஆப்பாக நிறுவுதல்
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      இது உங்கள் போனில் சாதாரண APK ஆப் போல முகப்புத் திரையில் நிறுவப்பட்டு தனி ஆப்பாக இயங்கும். URL பார் இருக்காது!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5 font-semibold text-stone-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0 MB இடம் (No Lag)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5 font-semibold text-stone-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>உடனடி மணி ஒலி</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5 font-semibold text-stone-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>5 போன் ஆட்டோ-சிங்க்</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5 font-semibold text-stone-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>தானியங்கி அப்டேட்</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-1">
                  {isInstalled || installSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ஆப் உங்கள் சாதனத்தில் வெற்றிகரமாக இன்ஸ்டால் செய்யப்பட்டுள்ளது!</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>இப்போதே போனில் இன்ஸ்டால் செய் (Install App)</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-xl text-xs space-y-2">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-800" />
                        <span>Chrome பிரவுசரில் 2 வினாடியில் இன்ஸ்டால் செய்யும் முறை:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-stone-800 font-medium pl-1">
                        <li>Chrome பிரவுசரின் வலது மேல் மூலையில் உள்ள <strong>3 புள்ளிகளை (⋮)</strong> தொடவும்.</li>
                        <li>அதில் <strong>"Install app"</strong> அல்லது <strong>"Add to Home screen" (முகப்புத்திரையில் சேர்)</strong> என்பதைத் தொடவும்.</li>
                        <li>உடனே போனில் வாட்ஸ்அப் போல <strong>"முட்டை பண்ணை"</strong> ஐகான் வந்துவிடும்!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-3.5">
              {/* Option 1: Instant Native Android WebAPK (Recommended) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-400 shadow-md space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-stone-900">
                        1. போனில் நேரடி APK இன்ஸ்டால் (WebAPK)
                      </h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        பரிந்துரை
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      ஆண்ட்ராய்டு இயங்குதளமே நேரடியாக உருவாக்கும் அதிகாரப்பூர்வ <strong>WebAPK</strong>. இது Play Store ஆப் போல போன் மெனுவில் தனி ஆப்பாக வரும் (URL பார் இருக்காது).
                    </p>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div>
                  {isInstalled || installSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ஆப் APK-ஆக உங்கள் போனில் வெற்றிகரமாக நிறுவப்பட்டது!</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                    >
                      <Download className="w-5 h-5 stroke-[2.5]" />
                      <span>இப்போதே போனில் APK ஆக இன்ஸ்டால் செய் (Install)</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-2">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-700" />
                        <span>Chrome பிரவுசரில் APK இன்ஸ்டால் செய்யும் 3 படிகள்:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-stone-700 font-medium pl-1 text-[11px]">
                        <li>Chrome பிரவுசரின் வலது மேல் மூலையில் உள்ள <strong>3 புள்ளிகளை (⋮)</strong> தொடவும்.</li>
                        <li>அதில் <strong>"Install app"</strong> அல்லது <strong>"Add to Home screen" (முகப்புத்திரையில் சேர்)</strong> என்பதைத் தொடவும்.</li>
                        <li>உடனே போனில் வாட்ஸ்அப் போல <strong>"முட்டை பண்ணை"</strong> அதிகாரப்பூர்வ ஆப்பாக வந்துவிடும்!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2: PWABuilder Standalone .APK Generator */}
              <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-stone-900">
                      2. PWABuilder மூலம் நேரடி .APK கோப்பு பதிவிறக்கம்
                    </h5>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      மைக்ரோசாஃப்ட் / கூகுளின் அதிகாரப்பூர்வ PWABuilder கருவி மூலம் உடனே ஆண்ட்ராய்டு <strong>.APK / .AAB</strong> கோப்பை டவுன்லோட் செய்து கொள்ளலாம்.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.pwabuilder.com/publish?site=${encodeURIComponent(appUrl || window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>PWABuilder-ல் .APK கோப்பைத் தொகுத்து டவுன்லோட் செய்</span>
                </a>
              </div>

              {/* Option 3: Android Studio Ready Project ZIP */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm shrink-0">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-stone-900">
                        3. Android Studio திட்டக் கோப்பு (Compile APK)
                      </h5>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                        12 KB ZIP
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Android Studio-வில் திறந்து "Build APK" கொடுத்தால் உடனே ஆப்லைன் வசதியுடன் கூடிய சொந்த .APK கோப்பை உருவாக்கலாம்.
                    </p>
                  </div>
                </div>

                <a
                  href="/muttai-pannai-android-project.zip"
                  download="muttai-pannai-android-project.zip"
                  className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-900 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Android Studio Project ZIP பதிவிறக்கு (.ZIP)</span>
                </a>
              </div>

              {/* Option 4: Online Web2APK Converter */}
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-stone-800">4. AppsGeyser ஆன்லைன் APK மாற்றி:</div>
                  <div className="text-[11px] text-stone-500">இந்த லிங்கை ஒட்டி 1 நிமிடத்தில் இலவச APK தயாரிக்கலாம்</div>
                </div>
                <a
                  href="https://appsgeyser.com/create-url-app/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition"
                >
                  <span>திற</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)</span>
              </h4>

              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="font-bold text-stone-900">கேள்வி: ஆப் டவுன்லோட் பட்டன் தெரியவில்லையா?</div>
                  <p className="text-stone-600 mt-1 leading-relaxed">
                    Chrome-ன் மேல் வலது 3 புள்ளிகளைத் தொட்டு <strong>"Add to Home Screen"</strong> அல்லது <strong>"Install App"</strong> கொடுக்கவும்.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="font-bold text-stone-900">கேள்வி: 5 போன்களுக்கும் மணி ஒலி கேட்குமா?</div>
                  <p className="text-stone-600 mt-1 leading-relaxed">
                    ஆம்! ஒவ்வொரு போனிலும் ஆப்பைத் திறந்து தனித்தனி சாதனத்தை (சாதனம் 1 - 5) தேர்வு செய்துகொண்டால், யார் முட்டை உள்ளிட்டாலும் உடனே மணி ஒலிக்கும்.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="font-bold text-stone-900">கேள்வி: "Google Cookie Blocked" என வருகிறதா?</div>
                  <p className="text-stone-600 mt-1 leading-relaxed">
                    Chrome-ல் மேலே உள்ள கண் சின்னத்தைத் (👁️) தொட்டு <strong>"Allow cookies" (அனுமதி)</strong> கொடுக்கவும். அல்லது இந்த ஆப்பை <strong>"Add to Home Screen"</strong> செய்து போனில் நிறுவிவிட்டால் எந்தக் குக்கீ பிழையும் இன்றி இயங்கும்.
                  </p>
                </div>
              </div>

              {/* Copy app link */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block font-bold text-stone-700 mb-1 text-[11px]">ஆப் இணைப்பு (Copy Link):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl || window.location.href}
                    className="flex-1 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-stone-600 text-xs select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 text-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'நகலானது' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-amber-100 border-t border-amber-200 flex items-center justify-between">
          <span className="text-[11px] text-amber-900 font-semibold">
            தமிழ்நாடு முட்டை பண்ணை மேலாண்மை
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition"
          >
            மூடு (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
