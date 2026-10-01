import React, { useState } from 'react';
import { PRESET_DEVICES, ConnectedDevice } from '../types/farm';
import { Smartphone, Check, Send, Users, Volume2, VolumeX, Bell } from 'lucide-react';
import { notificationAudio, requestBrowserNotificationPermission } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDevice: { id: string; name: string };
  onSelectDevice: (id: string, name: string) => void;
  activeDevices: ConnectedDevice[];
  onSendTestNotification: (deviceName: string, msg: string) => Promise<any>;
}

export const DeviceSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentDevice,
  onSelectDevice,
  activeDevices,
  onSendTestNotification,
}) => {
  const [customName, setCustomName] = useState(currentDevice.name);
  const [selectedId, setSelectedId] = useState(currentDevice.id);
  const [soundEnabled, setSoundEnabled] = useState(notificationAudio.isEnabled());
  const [browserNotifStatus, setBrowserNotifStatus] = useState<NotificationPermission | 'unknown'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unknown'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSelectDevice(selectedId, customName.trim() || 'சாதனம்');
    onClose();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    notificationAudio.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      notificationAudio.playNotificationChime();
    }
  };

  const handleEnableBrowserNotifs = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (typeof Notification !== 'undefined') {
      setBrowserNotifStatus(Notification.permission);
    }
  };

  const handleTestBroadcast = async () => {
    setIsSendingTest(true);
    try {
      await onSendTestNotification(
        customName || currentDevice.name,
        'இன்று 40 தட்டுகள் (1,200 முட்டைகள்) உற்பத்தி வெற்றிகரமாக பதிவு செய்யப்பட்டது!'
      );
      setTestSentMsg('✓ அனைத்து 5 சாதனங்களுக்கும் ஒலி மற்றும் அறிவிப்பு அனுப்பப்பட்டது!');
      setTimeout(() => setTestSentMsg(''), 4000);
    } catch (e) {
      setTestSentMsg('அறிவிப்பு அனுப்ப முடியவில்லை');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-50 border-2 border-amber-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 leading-tight">
                5 சாதனங்கள் அமைப்பு (Device Setup)
              </h3>
              <p className="text-xs text-stone-600">
                இந்த போன் / கம்ப்யூட்டருக்கான சாதனப் பெயரைத் தேர்ந்தெடுக்கவும்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-200/60"
          >
            ✕
          </button>
        </div>

        {/* Live connected status */}
        <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold">
              {activeDevices.length} சாதனம்(கள்) தற்போது நேரலையில் இணைப்பில் உள்ளது
            </span>
          </div>
          <span className="font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            Realtime Sync Active
          </span>
        </div>

        {/* 5 Preset device selection */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            5 சாதனங்களின் முன்னிருப்பு (Preset Roles):
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_DEVICES.map((preset) => {
              const isSelected = selectedId === preset.id;
              const isOnline = activeDevices.some((d) => d.deviceId === preset.id);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(preset.id);
                    setCustomName(preset.name);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-amber-600 bg-amber-100/70 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        {preset.name}
                        {isOnline && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-md">
                            ஆன்லைன்
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 font-medium">{preset.role}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom device label */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-stone-700 mb-1">
            சாதனம் / நபரின் பெயர் (Custom Name):
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="எ.கா. பண்ணை மேலாளர் செல்வா"
            className="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 rounded-xl text-stone-900 font-medium text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Notification Sound & Browser Push Permissions */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-500" />
              )}
              அறிவிப்பு ஒலி (Chime Sound):
            </span>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                soundEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700'
              }`}
            >
              {soundEnabled ? 'இயக்கத்தில் (ON)' : 'நிறுத்தப்பட்டுள்ளது (OFF)'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200/60">
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              போன் புஷ் அறிவிப்பு (Phone Notification):
            </span>
            {browserNotifStatus === 'granted' ? (
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                ✓ இயக்கத்தில் உள்ளது
              </span>
            ) : (
              <button
                type="button"
                onClick={handleEnableBrowserNotifs}
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg font-semibold text-xs transition"
              >
                அனுமதி கொடு (Allow)
              </button>
            )}
          </div>
        </div>

        {/* Test Notification Trigger */}
        <div className="p-3 bg-stone-100 rounded-2xl border border-stone-300 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-stone-900">
                அறிவிப்பு சோதனை (Test Notification):
              </div>
              <div className="text-[11px] text-stone-500">
                எல்லா 5 சாதனங்களுக்கும் ஒலி மற்றும் தகவல் போவதை உடனே சோதிக்கவும்.
              </div>
            </div>
            <button
              type="button"
              disabled={isSendingTest}
              onClick={handleTestBroadcast}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
              {isSendingTest ? 'அனுப்பப்படுகிறது...' : 'Test அனுப்பு'}
            </button>
          </div>
          {testSentMsg && (
            <p className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-lg text-center">
              {testSentMsg}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-stone-300 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition"
          >
            ரத்து செய்
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl text-sm shadow-md transition"
          >
            இந்த சாதனமாக மாற்று ✓
          </button>
        </div>
      </div>
    </div>
  );
};
