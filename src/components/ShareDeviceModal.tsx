import React, { useState } from 'react';
import { Copy, Check, Smartphone, QrCode, ExternalLink, ShieldCheck, AlertTriangle, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareDeviceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // Ensure other devices receive the public preview URL (ais-pre) instead of internal dev URL (ais-dev)
  const currentUrl = typeof window !== 'undefined'
    ? window.location.origin.replace('ais-dev-', 'ais-pre-')
    : 'https://ais-pre-3ek4cxzol6mpjo7rllpjs4-963468854939.asia-southeast1.run.app';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsAppShare = () => {
    const text = `🥚 முட்டை பண்ணை கணக்கு (எல்லா சாதனங்களுக்கும் பொதுவான வலைப்பக்கம்):\n\nகீழே உள்ள இணைப்பைத் திறந்து பயன்படுத்தவும்:\n${currentUrl}\n\n(குறிப்பு: எந்த கூகுள் லாகினும் தேவையில்லை. Chrome பிரவுசரில் திறந்து மேலே 3 புள்ளிகளைத் தொட்டு "Add to Home screen" கொடுத்தால் ஆப்பாக மாறிவிடும்!)`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-stone-50 border-2 border-amber-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                மற்ற போன்களில் திறப்பது எப்படி?
              </h3>
              <p className="text-xs text-stone-500">5 சாதனங்களையும் எளிதாக இணைக்கவும்</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl transition hover:bg-stone-200/50"
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-3.5">
          {/* Google Cookie Blocked & 403 Error Fix */}
          <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs space-y-2">
            <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>"Google Cookie Blocked" அல்லது "403" பிழைக்கான உடனடி தீர்வு:</span>
            </div>
            <div className="text-[11px] text-stone-700 space-y-1.5 leading-relaxed">
              <p>
                Chrome பிரவுசர் தானாகவே மூன்றாம் தரப்பு குக்கீகளைத் தடுப்பதால் <strong>"Cookie blocked"</strong> அல்லது <strong>"Google cookie blocked"</strong> என வரலாம்.
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 space-y-1 text-stone-800">
                <div className="font-bold text-amber-900">👉 இதைச் செய்தால் உடனே சரியாகிவிடும்:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                  <li>Chrome முகவரிப் பட்டியில் மேலே உள்ள <strong>கண் சின்னத்தை (👁️)</strong> தொட்டு <strong>"Allow cookies" (அனுமதி)</strong> என்பதைத் தொடவும்.</li>
                  <li>அல்லது கீழே உள்ள <strong>"WhatsApp-ல் அனுப்பு"</strong> அல்லது <strong>"Copy Link"</strong> மூலமாக மட்டுமே லிங்கைத் திறக்கவும். (எந்த கூகுள் லாகினும் தேவையில்லை).</li>
                  <li>Chrome-ல் <strong>"Install app"</strong> அல்லது <strong>"Add to Home screen"</strong> கொடுத்தால் ஆப்பாக மாறி குக்கீ பிழையே வராது!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-3 bg-white border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shadow-inner my-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                  currentUrl
                )}`}
                alt="QR Code"
                className="w-28 h-28 rounded-lg"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-stone-600 font-medium mt-1">
              மற்ற போன் கேமராவால் இந்த QR-ஐ ஸ்கேன் செய்யவும்
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp-ல் அனுப்பு
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'லிங்க் காப்பி ஆனது!' : 'சரியான லிங்க் Copy'}
            </button>
          </div>

          {/* Setup guide */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-stone-700 space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              5 போன்களையும் இணைப்பது எப்படி?
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600">
              <li>மற்ற 4 போன்களிலும் Chrome பிரவுசரில் உங்கள் Gmail கணக்கு அல்லது இந்த நேரடி லிங்கைத் திறக்கவும்.</li>
              <li>Chrome-ல் வலதுபுறம் உள்ள <strong>3 புள்ளிகளை (⋮) தொட்டு "Install app" (அல்லது Add to Home screen)</strong> கொடுத்தால் ஆப்பாக மாறிவிடும்.</li>
              <li>மேலே உள்ள "சாதனம்" பட்டனை அழுத்தி <strong>சாதனம் 1 முதல் 5 வரை</strong> தனித்தனியாக தேர்வு செய்யவும்.</li>
              <li>எந்தப் போனில் பதிவு செய்தாலும் 5 போன்களுக்கும் உடனே மணி ஒலிக்கும்!</li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          சரி (Done)
        </button>
      </div>
    </div>
  );
};
