import React, { useState } from 'react';
import { HistoryItem } from '../types/farm';
import { BookOpen, Search, Filter, ShieldCheck, Calendar, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

export const AllHistoryModal: React.FC<Props> = ({ isOpen, onClose, history }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const formatDate = (d: string) => {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('ta-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const formatMoney = (n: number) => {
    return '₹' + (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-IN');
  };

  const filteredHistory = history
    .filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const dev = (item.deviceName || '').toLowerCase();
      const date = (item.row?.date || '').toLowerCase();
      const label = (item.label || '').toLowerCase();
      return dev.includes(term) || date.includes(term) || label.includes(term);
    })
    .slice()
    .reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#e6cea0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl font-extrabold text-[#432d1d]">
                நிரந்தர All History (Permanent Audit Log)
              </h2>
            </div>
            <p className="text-xs text-[#93633c] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              ஒவ்வொரு பதிவும் நிரந்தரமானது. Main டேபிளில் delete செய்தாலும் இங்கு பாதுகாப்பாக இருக்கும்.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-amber-100"
          >
            ✕
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="my-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="தேதி அல்லது சாதனம் தேடுக..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#e6cea0] rounded-xl focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'அனைத்தும்' },
              { id: 'p', label: '🥚 உற்பத்தி' },
              { id: 's', label: '🛒 விற்பனை' },
              { id: 'feedStock', label: '🌾 தீவன இருப்பு' },
              { id: 'feedCost', label: '💸 தீவனச் செலவு' },
              { id: 'income', label: '💰 தொகை வரவு' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-lg shrink-0 transition-all ${
                  filterType === f.id
                    ? 'bg-[#432d1d] text-white shadow-sm'
                    : 'bg-white text-[#624127] border border-[#e6cea0] hover:bg-amber-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-[#a0683a] text-sm">
              எந்த வரலாற்றுப் பதிவும் இல்லை.
            </div>
          ) : (
            filteredHistory.map((h) => {
              const x = h.row || {};
              return (
                <div
                  key={h.id}
                  className="bg-white border border-[#e6cea0] rounded-2xl p-3.5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2 mb-2">
                    <span className="font-bold text-sm text-[#432d1d] flex items-center gap-1.5">
                      {h.type === 'p' && '🥚'}
                      {h.type === 's' && '🛒'}
                      {h.type === 'feedStock' && '🌾'}
                      {h.type === 'feedCost' && '💸'}
                      {h.type === 'income' && '💰'}
                      {h.label}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      {h.deviceName || 'சாதனம்'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#93633c] mb-2 flex items-center justify-between">
                    <span>
                      பதிவு தேதி: <b>{formatDate(x.date || '')}</b>
                    </span>
                    <span>
                      நேரம்:{' '}
                      {new Date(h.savedAt).toLocaleString('ta-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      {h.type === 'p' && (
                        <tr className="border-t border-[#e6cea0]/50">
                          <td className="py-1 text-stone-600">முட்டைகள்: <b className="text-stone-900">{Number(x.eggs).toLocaleString('en-IN')}</b></td>
                          <td className="py-1 text-stone-600 text-right">தட்டுகள்: <b className="text-stone-900">{x.trays}</b> (×30)</td>
                        </tr>
                      )}
                      {h.type === 's' && (
                        <tr className="border-t border-[#e6cea0]/50">
                          <td className="py-1 text-stone-600">முட்டை: <b className="text-stone-900">{Number(x.eggs).toLocaleString('en-IN')}</b></td>
                          <td className="py-1 text-stone-600 text-center">விலை: <b className="text-stone-900">₹{x.price}</b></td>
                          <td className="py-1 text-stone-600 text-right">மொத்தம்: <b className="text-emerald-700">{formatMoney(x.amount)}</b></td>
                        </tr>
                      )}
                      {h.type === 'feedStock' && (
                        <tr className="border-t border-[#e6cea0]/50">
                          <td className="py-1 text-stone-600">தீவன இருப்பு:</td>
                          <td className="py-1 font-bold text-stone-900 text-right">{x.qty} மூட்டை</td>
                        </tr>
                      )}
                      {h.type === 'feedCost' && (
                        <tr className="border-t border-[#e6cea0]/50">
                          <td className="py-1 text-stone-600">தீவனச் செலவு:</td>
                          <td className="py-1 font-bold text-rose-700 text-right">{formatMoney(x.amount)}</td>
                        </tr>
                      )}
                      {h.type === 'income' && (
                        <tr className="border-t border-[#e6cea0]/50">
                          <td className="py-1 text-stone-600">வரவு தொகை:</td>
                          <td className="py-1 font-bold text-emerald-700 text-right">{formatMoney(x.amount)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-[#e6cea0] flex items-center justify-between">
          <span className="text-xs text-[#93633c]">
            மொத்த பதிவுகள்: <b>{filteredHistory.length}</b>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#624127] hover:bg-[#432d1d] text-white rounded-xl text-xs font-bold transition"
          >
            மூடு (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
