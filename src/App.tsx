/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Egg,
  ShoppingCart,
  Wheat,
  Coins,
  Receipt,
  BookOpen,
  Bell,
  Smartphone,
  Share2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  Download,
  Users,
  Search,
  Filter,
  DollarSign,
  Package
} from 'lucide-react';
import { useFarmSocket } from './utils/useFarmSocket';
import { NotificationToast } from './components/NotificationToast';
import { DeviceSelectorModal } from './components/DeviceSelectorModal';
import { AllHistoryModal } from './components/AllHistoryModal';
import { ShareDeviceModal } from './components/ShareDeviceModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { InstallAppModal } from './components/InstallAppModal';
import { usePWAInstall } from './utils/usePWAInstall';

const EGGS_PER_TRAY = 30;

type AppTab = 'prod' | 'sale' | 'summary' | 'feed' | 'history';

export default function App() {
  const {
    device,
    updateDevice,
    farmState,
    activeDevices,
    isConnected,
    activeToast,
    dismissToast,
    saveRecord,
    deleteRecord,
    sendTestBroadcast,
  } = useFarmSocket();

  // Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<AppTab>('prod');

  // Sub-tab for Feed & Extras
  const [feedSubTab, setFeedSubTab] = useState<'feedStock' | 'feedCost' | 'income'>('feedStock');

  // Filter for in-app history tab
  const [historyFilter, setHistoryFilter] = useState<'all' | 'p' | 's' | 'feedStock' | 'feedCost' | 'income'>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // PWA Install state
  const { isInstalled, isInstallable } = usePWAInstall();

  // Form states
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [pDate, setPDate] = useState(todayStr);
  const [pTrays, setPTrays] = useState('');
  const [isSavingProd, setIsSavingProd] = useState(false);

  const [saleRate, setSaleRate] = useState('');
  const [isSavingSale, setIsSavingSale] = useState(false);

  const [fsDate, setFsDate] = useState(todayStr);
  const [fsQty, setFsQty] = useState('');

  const [fcDate, setFcDate] = useState(todayStr);
  const [fcAmt, setFcAmt] = useState('');

  const [inDate, setInDate] = useState(todayStr);
  const [inAmt, setInAmt] = useState('');

  // Local notification message
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const showNote = (msg: string) => {
    setLocalMessage(msg);
    setTimeout(() => setLocalMessage(null), 3500);
  };

  // Calculations
  const totalEggsProduced = useMemo(() => {
    return farmState.p.reduce((acc, curr) => acc + (Number(curr.eggs) || 0), 0);
  }, [farmState.p]);

  const totalEggsSold = useMemo(() => {
    return farmState.s.reduce((acc, curr) => acc + (Number(curr.eggs) || 0), 0);
  }, [farmState.s]);

  const totalRevenue = useMemo(() => {
    return farmState.s.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [farmState.s]);

  const totalFeedCost = useMemo(() => {
    return farmState.feedCost.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [farmState.feedCost]);

  const totalIncome = useMemo(() => {
    return farmState.income.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [farmState.income]);

  const totalFeedBags = useMemo(() => {
    return farmState.feedStock.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  }, [farmState.feedStock]);

  const availableEggs = Math.max(0, totalEggsProduced - totalEggsSold);
  const availableTrays = Math.floor(availableEggs / EGGS_PER_TRAY);
  const availableLooseEggs = availableEggs % EGGS_PER_TRAY;

  const totalFullTrays = Math.floor(totalEggsProduced / EGGS_PER_TRAY);
  const totalLooseEggs = totalEggsProduced % EGGS_PER_TRAY;

  const netBalance = totalRevenue + totalIncome - totalFeedCost;

  // Hints
  const prodTrayNum = Number(pTrays) || 0;
  const prodCalculatedEggs = Math.round(prodTrayNum * EGGS_PER_TRAY);

  const saleRateNum = Number(saleRate) || 0;
  const calculatedSaleAmount = availableEggs * saleRateNum;

  // Formatters
  const formatMoney = (val: number) => {
    return '₹' + (Math.round((Number(val) || 0) * 100) / 100).toLocaleString('en-IN');
  };

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

  // Handlers
  const handleSaveProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(prodTrayNum > 0)) {
      showNote('⚠️ தட்டுகளின் எண்ணிக்கையை உள்ளிடவும்');
      return;
    }

    setIsSavingProd(true);
    try {
      await saveRecord('p', {
        date: pDate || todayStr,
        trays: prodTrayNum,
        eggs: prodCalculatedEggs,
      });
      setPTrays('');
      showNote('✓ உற்பத்தி பதிவு சேமிக்கப்பட்டது! 5 சாதனங்களுக்கும் ஒலி எழுப்பப்பட்டது');
    } catch {
      showNote('சேமிப்பதில் பிழை ஏற்பட்டது');
    } finally {
      setIsSavingProd(false);
    }
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availableEggs <= 0) {
      showNote('⚠️ விற்பனைக்கு முட்டை இருப்பு இல்லை');
      return;
    }
    if (!(saleRateNum > 0)) {
      showNote('⚠️ ஒரு முட்டையின் விலையை உள்ளிடவும்');
      return;
    }

    setIsSavingSale(true);
    try {
      await saveRecord('s', {
        date: todayStr,
        eggs: availableEggs,
        price: saleRateNum,
        amount: calculatedSaleAmount,
      });
      setSaleRate('');
      showNote('✓ விற்பனை பதிவு செய்யப்பட்டது! அனைத்து 5 போன்களுக்கும் மணி ஒலித்தது');
    } catch {
      showNote('விற்பனை பதிவில் பிழை ஏற்பட்டது');
    } finally {
      setIsSavingSale(false);
    }
  };

  const handleSaveExtra = async (type: 'feedStock' | 'feedCost' | 'income') => {
    let dateVal = todayStr;
    let numVal = 0;

    if (type === 'feedStock') {
      dateVal = fsDate || todayStr;
      numVal = Number(fsQty) || 0;
      if (numVal <= 0) {
        showNote('⚠️ மூட்டைகளின் எண்ணிக்கையை உள்ளிடவும்');
        return;
      }
    } else if (type === 'feedCost') {
      dateVal = fcDate || todayStr;
      numVal = Number(fcAmt) || 0;
      if (numVal <= 0) {
        showNote('⚠️ செலவுத் தொகையை உள்ளிடவும்');
        return;
      }
    } else if (type === 'income') {
      dateVal = inDate || todayStr;
      numVal = Number(inAmt) || 0;
      if (numVal <= 0) {
        showNote('⚠️ வரவுத் தொகையை உள்ளிடவும்');
        return;
      }
    }

    try {
      const payload: any = { date: dateVal };
      if (type === 'feedStock') payload.qty = numVal;
      else payload.amount = numVal;

      await saveRecord(type, payload);

      if (type === 'feedStock') setFsQty('');
      else if (type === 'feedCost') setFcAmt('');
      else if (type === 'income') setInAmt('');

      showNote('✓ பதிவு மற்றும் All History-ல் சேமிக்கப்பட்டது');
    } catch {
      showNote('பதிவு செய்வதில் பிழை ஏற்பட்டது');
    }
  };

  const handleDelete = async (type: 'p' | 's' | 'feedStock' | 'feedCost' | 'income', id: number) => {
    try {
      await deleteRecord(type, id);
      showNote('முக்கிய பட்டியலிலிருந்து நீக்கப்பட்டது (All History-ல் பாதுகாப்பாக உள்ளது)');
    } catch {
      showNote('நீக்குவதில் பிழை ஏற்பட்டது');
    }
  };

  // Filtered in-app history
  const filteredHistory = useMemo(() => {
    let list = farmState.history || [];
    if (historyFilter !== 'all') {
      list = list.filter((item) => item.type === historyFilter);
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.deviceName && item.deviceName.toLowerCase().includes(q)) ||
          item.savedAt.includes(q)
      );
    }
    return list;
  }, [farmState.history, historyFilter, historySearch]);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fffaf0] select-none text-stone-900">
      {/* Real-time Notification Banner / Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={dismissToast}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* FIXED TOP HEADER */}
      <header className="shrink-0 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-md border-b-2 border-amber-900/30 z-30">
        <div className="max-w-lg mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          {/* Brand & Device Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl drop-shadow shrink-0">🥚</span>
            <div className="min-w-0">
              <h1 className="text-base font-black tracking-tight leading-tight truncate">
                முட்டை பண்ணை கணக்கு
              </h1>
              {/* Active device pill with tap to change */}
              <button
                onClick={() => setIsDeviceModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-white transition truncate text-left cursor-pointer"
                title="சாதனத்தை மாற்ற தொடவும்"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="truncate">{device.name}</span>
                <span className="text-[10px] text-amber-300 font-normal underline shrink-0">(மாற்று)</span>
              </button>
            </div>
          </div>

          {/* Action Icons Bar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Active devices counter */}
            <div 
              onClick={() => setIsShareModalOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-[11px] font-bold cursor-pointer transition"
              title="ஆன்லைனில் உள்ள சாதனங்கள்"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeDevices.length > 0 ? activeDevices.length : 1} ஆன்லைன்</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifCenterOpen(true)}
              className="relative p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-white transition cursor-pointer"
              title="அறிவிப்புகள்"
            >
              <Bell className="w-4 h-4" />
              {farmState.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {farmState.notifications.length > 9 ? '9+' : farmState.notifications.length}
                </span>
              )}
            </button>

            {/* Share / Connect 5 Devices */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-white transition cursor-pointer"
              title="மற்ற 4 போன்களுக்கு லிங்க் & QR"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* App / APK button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-95 text-amber-950 rounded-xl text-xs font-black shadow-md border border-amber-500/30 transition cursor-pointer"
              title="போனில் APK / ஆப் பதிவிறக்க"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>APK பதிவிறக்கு</span>
            </button>
          </div>
        </div>
      </header>

      {/* Local Flash Feedback Message */}
      {localMessage && (
        <div className="shrink-0 bg-[#432d1d] text-amber-100 text-xs font-bold py-1.5 px-3 shadow-sm text-center animate-fade-in flex items-center justify-center gap-1.5 z-20">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{localMessage}</span>
        </div>
      )}

      {/* SCROLLABLE BODY CONTENT (Fixed to viewport height, no horizontal scrolling) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-24 touch-pan-y max-w-lg w-full mx-auto">
        {/* =========================================
            TAB 1: 🥚 உற்பத்தி (PRODUCTION)
        ========================================= */}
        {activeTab === 'prod' && (
          <div className="space-y-3 animate-fade-in">
            {/* Today's Production Form */}
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-extrabold text-[#432d1d] flex items-center gap-1.5">
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                    <PlusCircle className="w-4 h-4" />
                  </span>
                  <span>இன்றைய உற்பத்தி பதிவு</span>
                </h2>
                <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full">
                  1 தட்டு = 30 முட்டை
                </span>
              </div>

              <form onSubmit={handleSaveProduction} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">தேதி</label>
                  <input
                    type="date"
                    value={pDate}
                    onChange={(e) => setPDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border-2 border-[#e6cea0] rounded-xl font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">
                    முட்டை தட்டுகள் எண்ணிக்கை (Trays)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="எ.கா. 34 அல்லது 15.5"
                    value={pTrays}
                    onChange={(e) => setPTrays(e.target.value)}
                    className="w-full p-2.5 text-base bg-white border-2 border-[#e6cea0] rounded-xl font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                {/* Live Tray to Egg Hint */}
                <div className="p-2.5 bg-[#f2e0b8] border border-[#e6cea0] rounded-xl text-xs font-bold text-[#624127] flex items-center justify-between">
                  <span>மொத்த முட்டைகள்:</span>
                  <span className="text-sm font-black text-[#432d1d]">
                    {prodCalculatedEggs.toLocaleString('en-IN')} முட்டை ({prodTrayNum} × 30)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProd}
                  className="w-full py-3 bg-gradient-to-b from-[#5c823e] to-[#3c5a28] text-white font-extrabold rounded-xl shadow-[0_3px_0_#2b411d] hover:brightness-110 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Egg className="w-4 h-4" />
                  <span>{isSavingProd ? 'சேமிக்கப்படுகிறது...' : 'உற்பத்தி பதிவை சேமி'}</span>
                </button>
              </form>
            </div>

            {/* Production History List */}
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>உற்பத்தி பதிவுகள் ({farmState.p.length})</span>
                </h3>
              </div>

              {farmState.p.length === 0 ? (
                <div className="text-center py-6 text-stone-500 text-xs">
                  இன்னும் எந்த உற்பத்தி பதிவும் இல்லை
                </div>
              ) : (
                <div className="divide-y divide-[#e6cea0]">
                  {farmState.p
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-stone-900">{formatDate(item.date)}</div>
                          <div className="text-[11px] text-stone-500">
                            {item.deviceName || 'சாதனம்'} • {item.trays} தட்டுகள்
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-black text-sm text-amber-900">
                              {Number(item.eggs).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-stone-500 block">முட்டைகள்</span>
                          </div>
                          <button
                            onClick={() => handleDelete('p', item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="நீக்கு"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: 🛒 விற்பனை (SALES)
        ========================================= */}
        {activeTab === 'sale' && (
          <div className="space-y-3 animate-fade-in">
            {/* Ready to Sell Status Card */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-b from-white to-[#fdf4e4] border-2 border-[#e6cea0] rounded-xl p-3 text-center shadow-xs">
                <span className="text-[11px] font-bold text-stone-600 block">விற்க தயாரான முட்டை</span>
                <b className="text-xl font-black text-amber-900">{availableEggs.toLocaleString('en-IN')}</b>
              </div>
              <div className="bg-gradient-to-b from-white to-[#fdf4e4] border-2 border-[#e6cea0] rounded-xl p-3 text-center shadow-xs">
                <span className="text-[11px] font-bold text-stone-600 block">இருப்பு தட்டுகள்</span>
                <b className="text-xl font-black text-amber-900">
                  {availableTrays} {availableLooseEggs > 0 ? `+ ${availableLooseEggs}` : ''}
                </b>
              </div>
            </div>

            {/* Sales Record Form */}
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0]">
              <h2 className="text-base font-extrabold text-[#432d1d] flex items-center gap-1.5 mb-3">
                <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                  <ShoppingCart className="w-4 h-4" />
                </span>
                <span>விற்பனை பதிவு</span>
              </h2>

              <form onSubmit={handleSaveSale} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">
                    ஒரு முட்டை விலை (₹)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    placeholder="எ.கா. 5.50"
                    value={saleRate}
                    onChange={(e) => setSaleRate(e.target.value)}
                    className="w-full p-2.5 text-base bg-white border-2 border-[#e6cea0] rounded-xl font-bold text-stone-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Live Sale Amount Hint */}
                <div className="p-2.5 bg-[#e8f1f7] border border-[#bed8e8] rounded-xl text-xs font-bold text-[#1d435a] flex items-center justify-between">
                  <span>மொத்த விற்பனை தொகை:</span>
                  <span className="text-sm font-black text-blue-950">
                    {formatMoney(calculatedSaleAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSale || availableEggs <= 0}
                  className="w-full py-3 bg-gradient-to-b from-[#4385ad] to-[#275a77] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-[0_3px_0_#1d435a] hover:brightness-110 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isSavingSale ? 'சேமிக்கப்படுகிறது...' : 'விற்பனையை பதிவு செய்'}</span>
                </button>
              </form>
            </div>

            {/* Sales History List */}
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-700" />
                  <span>விற்பனை வரலாறு ({farmState.s.length})</span>
                </h3>
              </div>

              {farmState.s.length === 0 ? (
                <div className="text-center py-6 text-stone-500 text-xs">
                  இன்னும் எந்த விற்பனை பதிவும் இல்லை
                </div>
              ) : (
                <div className="divide-y divide-[#e6cea0]">
                  {farmState.s
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-stone-900">{formatDate(item.date)}</div>
                          <div className="text-[11px] text-stone-500">
                            {Number(item.eggs).toLocaleString('en-IN')} முட்டை × ₹{item.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-black text-sm text-emerald-800">
                              {formatMoney(item.amount)}
                            </span>
                            <span className="text-[10px] text-stone-500 block">{item.deviceName || 'சாதனம்'}</span>
                          </div>
                          <button
                            onClick={() => handleDelete('s', item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="நீக்கு"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: 📊 மொத்த கணக்கு (ACCOUNTS & SUMMARY)
        ========================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-3 animate-fade-in">
            {/* Top Net Balance Hero Card */}
            <div className="bg-gradient-to-br from-[#456b31] to-[#2b411d] text-white rounded-2xl p-4 shadow-md text-center border-b-4 border-[#1b2b13]">
              <span className="text-xs text-amber-200 font-bold block uppercase tracking-wider">
                மொத்த விற்பனை வருமானம்
              </span>
              <div className="text-3xl font-black mt-1 tracking-tight text-white">
                {formatMoney(totalRevenue)}
              </div>
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-around text-xs">
                <div>
                  <span className="text-white/70 block text-[10px]">தீவனச் செலவு</span>
                  <span className="font-bold text-rose-200">{formatMoney(totalFeedCost)}</span>
                </div>
                <div>
                  <span className="text-white/70 block text-[10px]">தொகை வரவு</span>
                  <span className="font-bold text-amber-200">{formatMoney(totalIncome)}</span>
                </div>
                <div>
                  <span className="text-white/70 block text-[10px]">நிகர லாபம் / இருப்பு</span>
                  <span className="font-black text-emerald-200">{formatMoney(netBalance)}</span>
                </div>
              </div>
            </div>

            {/* Egg Production Summary Cards */}
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0]">
              <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5 mb-3">
                <Egg className="w-4 h-4 text-amber-700" />
                <span>முட்டை உற்பத்தி & இருப்பு நிலை</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white border border-[#e6cea0] rounded-xl">
                  <span className="text-stone-500 block text-[11px]">மொத்த உற்பத்தி</span>
                  <b className="text-lg font-black text-amber-900">
                    {totalEggsProduced.toLocaleString('en-IN')}
                  </b>
                  <span className="text-[10px] text-stone-500 block">முட்டைகள்</span>
                </div>

                <div className="p-3 bg-white border border-[#e6cea0] rounded-xl">
                  <span className="text-stone-500 block text-[11px]">மொத்த தட்டுகள்</span>
                  <b className="text-lg font-black text-amber-900">
                    {totalFullTrays} {totalLooseEggs > 0 ? `+ ${totalLooseEggs}` : ''}
                  </b>
                  <span className="text-[10px] text-stone-500 block">தட்டுகள் (1×30)</span>
                </div>

                <div className="p-3 bg-white border border-[#e6cea0] rounded-xl">
                  <span className="text-stone-500 block text-[11px]">விற்ற முட்டைகள்</span>
                  <b className="text-lg font-black text-blue-900">
                    {totalEggsSold.toLocaleString('en-IN')}
                  </b>
                  <span className="text-[10px] text-stone-500 block">முட்டைகள்</span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-emerald-700 block text-[11px] font-bold">கையிருப்பு முட்டை</span>
                  <b className="text-lg font-black text-emerald-950">
                    {availableEggs.toLocaleString('en-IN')}
                  </b>
                  <span className="text-[10px] text-emerald-800 block">({availableTrays} தட்டுகள்)</span>
                </div>
              </div>
            </div>

            {/* Feed Stock & Quick Stats */}
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0] space-y-2">
              <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-amber-700" />
                <span>தீவன விவரம்</span>
              </h3>
              <div className="flex items-center justify-between p-2.5 bg-white border border-[#e6cea0] rounded-xl text-xs">
                <span className="font-bold text-stone-700">மொத்த தீவன இருப்பு</span>
                <span className="font-black text-amber-900 text-sm">{totalFeedBags} மூட்டை</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white border border-[#e6cea0] rounded-xl text-xs">
                <span className="font-bold text-stone-700">மொத்த தீவனச் செலவு</span>
                <span className="font-black text-rose-800 text-sm">{formatMoney(totalFeedCost)}</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: 🌾 தீவனம் & வரவு (FEED & EXTRAS)
        ========================================= */}
        {activeTab === 'feed' && (
          <div className="space-y-3 animate-fade-in">
            {/* Segmented Sub Tabs */}
            <div className="flex p-1 bg-amber-100 border border-amber-200 rounded-xl gap-1 text-xs font-bold">
              <button
                onClick={() => setFeedSubTab('feedStock')}
                className={`flex-1 py-2 rounded-lg transition ${
                  feedSubTab === 'feedStock'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                🌾 தீவன இருப்பு
              </button>
              <button
                onClick={() => setFeedSubTab('feedCost')}
                className={`flex-1 py-2 rounded-lg transition ${
                  feedSubTab === 'feedCost'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                💸 தீவனச் செலவு
              </button>
              <button
                onClick={() => setFeedSubTab('income')}
                className={`flex-1 py-2 rounded-lg transition ${
                  feedSubTab === 'income'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                💰 வரவு
              </button>
            </div>

            {/* Sub-Tab 1: தீவன இருப்பு */}
            {feedSubTab === 'feedStock' && (
              <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0] space-y-3">
                <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5">
                  <Wheat className="w-4 h-4 text-amber-700" />
                  <span>தீவன இருப்பு பதிவு (மூட்டை)</span>
                </h3>
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">தேதி</label>
                  <input
                    type="date"
                    value={fsDate}
                    onChange={(e) => setFsDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border-2 border-[#e6cea0] rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">மூட்டைகள் எண்ணிக்கை</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="எ.கா. 15"
                    value={fsQty}
                    onChange={(e) => setFsQty(e.target.value)}
                    className="w-full p-2.5 text-base bg-white border-2 border-[#e6cea0] rounded-xl font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveExtra('feedStock')}
                  className="w-full py-2.5 bg-gradient-to-b from-[#5c823e] to-[#3c5a28] text-white font-extrabold rounded-xl shadow-[0_2px_0_#2b411d]"
                >
                  சேமி
                </button>

                <div className="pt-2 border-t border-[#e6cea0] divide-y divide-[#e6cea0]">
                  {farmState.feedStock.slice().reverse().map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold">{formatDate(item.date)}</span>
                        <span className="text-[10px] text-stone-500 block">{item.deviceName || 'சாதனம்'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <b className="text-amber-900">{item.qty} மூட்டை</b>
                        <button
                          onClick={() => handleDelete('feedStock', item.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: தீவனச் செலவு */}
            {feedSubTab === 'feedCost' && (
              <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0] space-y-3">
                <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-700" />
                  <span>தீவனச் செலவு பதிவு (₹)</span>
                </h3>
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">தேதி</label>
                  <input
                    type="date"
                    value={fcDate}
                    onChange={(e) => setFcDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border-2 border-[#e6cea0] rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">செலவு தொகை (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="எ.கா. 4500"
                    value={fcAmt}
                    onChange={(e) => setFcAmt(e.target.value)}
                    className="w-full p-2.5 text-base bg-white border-2 border-[#e6cea0] rounded-xl font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveExtra('feedCost')}
                  className="w-full py-2.5 bg-gradient-to-b from-[#5c823e] to-[#3c5a28] text-white font-extrabold rounded-xl shadow-[0_2px_0_#2b411d]"
                >
                  சேமி
                </button>

                <div className="pt-2 border-t border-[#e6cea0] divide-y divide-[#e6cea0]">
                  {farmState.feedCost.slice().reverse().map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold">{formatDate(item.date)}</span>
                        <span className="text-[10px] text-stone-500 block">{item.deviceName || 'சாதனம்'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <b className="text-rose-800">{formatMoney(Number(item.amount) || 0)}</b>
                        <button
                          onClick={() => handleDelete('feedCost', item.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: தொகை வரவு */}
            {feedSubTab === 'income' && (
              <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0] space-y-3">
                <h3 className="text-sm font-extrabold text-[#432d1d] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>தொகை வரவு பதிவு (₹)</span>
                </h3>
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">தேதி</label>
                  <input
                    type="date"
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border-2 border-[#e6cea0] rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#624127] mb-1">வரவு தொகை (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="எ.கா. 8000"
                    value={inAmt}
                    onChange={(e) => setInAmt(e.target.value)}
                    className="w-full p-2.5 text-base bg-white border-2 border-[#e6cea0] rounded-xl font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveExtra('income')}
                  className="w-full py-2.5 bg-gradient-to-b from-[#5c823e] to-[#3c5a28] text-white font-extrabold rounded-xl shadow-[0_2px_0_#2b411d]"
                >
                  சேமி
                </button>

                <div className="pt-2 border-t border-[#e6cea0] divide-y divide-[#e6cea0]">
                  {farmState.income.slice().reverse().map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold">{formatDate(item.date)}</span>
                        <span className="text-[10px] text-stone-500 block">{item.deviceName || 'சாதனம்'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <b className="text-emerald-800">{formatMoney(Number(item.amount) || 0)}</b>
                        <button
                          onClick={() => handleDelete('income', item.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB 5: 📚 வரலாறு (ALL HISTORY AUDIT)
        ========================================= */}
        {activeTab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-[#fffaf0] border-2 border-[#e6cea0] rounded-2xl p-4 shadow-[0_2px_0_#e6cea0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#432d1d] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                    <span>நிரந்தர All History</span>
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    இங்குள்ள பதிவுகளை நீக்க முடியாது; யார் எப்போது சேர்த்தார்கள் என பாதுகாப்பாக இருக்கும்.
                  </p>
                </div>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="தேதி அல்லது சாதனம் பெயர் தேட..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#e6cea0] rounded-xl text-xs font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                    historyFilter === 'all'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  அனைத்தும் ({farmState.history.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('p')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                    historyFilter === 'p'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  🥚 உற்பத்தி
                </button>
                <button
                  onClick={() => setHistoryFilter('s')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                    historyFilter === 's'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  🛒 விற்பனை
                </button>
                <button
                  onClick={() => setHistoryFilter('feedCost')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                    historyFilter === 'feedCost'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  💸 தீவனம்
                </button>
                <button
                  onClick={() => setHistoryFilter('income')}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                    historyFilter === 'income'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  💰 வரவு
                </button>
              </div>

              {/* History list */}
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  வரலாறு பதிவுகள் எதுவும் இல்லை
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {filteredHistory
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-[#e6cea0] rounded-xl text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#432d1d] flex items-center gap-1">
                            {item.type === 'p' && '🥚'}
                            {item.type === 's' && '🛒'}
                            {item.type === 'feedStock' && '🌾'}
                            {item.type === 'feedCost' && '💸'}
                            {item.type === 'income' && '💰'}
                            <span>{item.label}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                            {item.deviceName || 'சாதனம்'}
                          </span>
                        </div>

                        <div className="text-stone-700 text-[11px] font-medium">
                          {item.type === 'p' && (
                            <span>
                              தேதி: <strong>{formatDate(item.row.date)}</strong> • {item.row.eggs} முட்டைகள் ({item.row.trays} தட்டுகள்)
                            </span>
                          )}
                          {item.type === 's' && (
                            <span>
                              தேதி: <strong>{formatDate(item.row.date)}</strong> • {item.row.eggs} முட்டைகள் × ₹{item.row.price} = <strong>{formatMoney(item.row.amount)}</strong>
                            </span>
                          )}
                          {item.type === 'feedStock' && (
                            <span>
                              தேதி: <strong>{formatDate(item.row.date)}</strong> • {item.row.qty} மூட்டை
                            </span>
                          )}
                          {(item.type === 'feedCost' || item.type === 'income') && (
                            <span>
                              தேதி: <strong>{formatDate(item.row.date)}</strong> • தொகை: <strong>{formatMoney(item.row.amount)}</strong>
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-stone-400">
                          பதிவான நேரம்: {new Date(item.savedAt).toLocaleString('ta-IN')}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#e6cea0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto grid grid-cols-5 py-1.5 px-1">
          {/* Tab 1: உற்பத்தி */}
          <button
            onClick={() => setActiveTab('prod')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'prod'
                ? 'text-amber-800 font-black scale-105'
                : 'text-stone-500 font-medium hover:text-stone-800'
            }`}
          >
            <Egg className={`w-5 h-5 ${activeTab === 'prod' ? 'text-amber-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">உற்பத்தி</span>
          </button>

          {/* Tab 2: விற்பனை */}
          <button
            onClick={() => setActiveTab('sale')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'sale'
                ? 'text-blue-800 font-black scale-105'
                : 'text-stone-500 font-medium hover:text-stone-800'
            }`}
          >
            <ShoppingCart className={`w-5 h-5 ${activeTab === 'sale' ? 'text-blue-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">விற்பனை</span>
          </button>

          {/* Tab 3: கணக்கு */}
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'summary'
                ? 'text-emerald-800 font-black scale-105'
                : 'text-stone-500 font-medium hover:text-stone-800'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'summary' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">கணக்கு</span>
          </button>

          {/* Tab 4: தீவனம் */}
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'feed'
                ? 'text-amber-800 font-black scale-105'
                : 'text-stone-500 font-medium hover:text-stone-800'
            }`}
          >
            <Wheat className={`w-5 h-5 ${activeTab === 'feed' ? 'text-amber-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">தீவனம்</span>
          </button>

          {/* Tab 5: வரலாறு */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'history'
                ? 'text-indigo-800 font-black scale-105'
                : 'text-stone-500 font-medium hover:text-stone-800'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'history' ? 'text-indigo-700 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">வரலாறு</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      <DeviceSelectorModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        currentDevice={device}
        onSelectDevice={updateDevice}
        activeDevices={activeDevices}
        onSendTestNotification={sendTestBroadcast}
      />

      <ShareDeviceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <AllHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={farmState.history}
      />

      <NotificationCenterModal
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
        notifications={farmState.notifications}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        appUrl={window.location.origin}
      />
    </div>
  );
}

