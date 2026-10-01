import React from 'react';
import { FarmNotification } from '../types/farm';
import { Bell, Egg, ShoppingCart, Wheat, Coins, AlertCircle, Clock, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: FarmNotification[];
}

export const NotificationCenterModal: React.FC<Props> = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'p':
        return <Egg className="w-4 h-4 text-amber-600" />;
      case 's':
        return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case 'feedStock':
      case 'feedCost':
        return <Wheat className="w-4 h-4 text-emerald-600" />;
      case 'income':
        return <Coins className="w-4 h-4 text-yellow-600" />;
      case 'delete':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-3xl max-w-lg w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6cea0]">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#432d1d]">
                அறிவிப்பு வரலாறு (Broadcast Notifications)
              </h3>
              <p className="text-xs text-[#93633c]">
                5 சாதனங்களுக்கும் அனுப்பப்பட்ட அனைத்து அறிவிப்புகளின் பட்டியல்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-amber-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs">
              இன்னும் எந்த அறிவிப்பும் வரவில்லை.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 bg-white border border-[#e6cea0] rounded-2xl shadow-sm flex items-start gap-3 transition hover:border-amber-400"
              >
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Smartphone className="w-2.5 h-2.5" />
                      {n.senderName || 'சாதனம்'}
                    </span>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(n.timestamp).toLocaleTimeString('ta-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900">{n.title}</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-snug">{n.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#624127] hover:bg-[#432d1d] text-white text-xs font-bold rounded-xl transition"
        >
          மூடு (Close)
        </button>
      </div>
    </div>
  );
};
