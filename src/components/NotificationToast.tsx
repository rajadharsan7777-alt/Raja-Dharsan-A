import React, { useEffect } from 'react';
import { FarmNotification } from '../types/farm';
import { Bell, X, CheckCircle2, AlertCircle, ShoppingCart, Egg, Wheat, Coins } from 'lucide-react';

interface Props {
  notification: FarmNotification | null;
  onDismiss: () => void;
  onOpenHistory?: () => void;
}

export const NotificationToast: React.FC<Props> = ({ notification, onDismiss, onOpenHistory }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'p':
        return <Egg className="w-5 h-5 text-amber-600" />;
      case 's':
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case 'feedStock':
      case 'feedCost':
        return <Wheat className="w-5 h-5 text-emerald-600" />;
      case 'income':
        return <Coins className="w-5 h-5 text-yellow-600" />;
      case 'delete':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-short">
      <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-amber-500/30 ring-4 ring-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200">
                நேரலை அறிவிப்பு • {notification.senderName || 'சாதனம்'}
              </span>
              <button
                onClick={onDismiss}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition"
                title="மூடு"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-bold text-sm text-amber-100 mt-1">{notification.title}</h4>
            <p className="text-xs text-stone-200 mt-1 leading-relaxed">{notification.body}</p>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-800">
              <span className="text-[11px] text-stone-400">
                {new Date(notification.timestamp).toLocaleTimeString('ta-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              {onOpenHistory && (
                <button
                  onClick={() => {
                    onDismiss();
                    onOpenHistory();
                  }}
                  className="text-xs font-medium text-amber-300 hover:text-amber-200 underline decoration-amber-400/50"
                >
                  வரலாற்றில் காண்க →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
