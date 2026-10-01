import { useEffect, useRef, useState, useCallback } from 'react';
import { FarmStore, FarmNotification, ConnectedDevice, PRESET_DEVICES } from '../types/farm';
import { notificationAudio, sendBrowserNotification } from './sound';

const STORAGE_DEVICE_ID = 'egg_farm_device_id';
const STORAGE_DEVICE_NAME = 'egg_farm_device_name';

export function getLocalDevice() {
  let id = localStorage.getItem(STORAGE_DEVICE_ID);
  let name = localStorage.getItem(STORAGE_DEVICE_NAME);

  if (!id) {
    id = 'dev-1';
    localStorage.setItem(STORAGE_DEVICE_ID, id);
  }
  if (!name) {
    const preset = PRESET_DEVICES.find((p) => p.id === id);
    name = preset ? preset.name : 'சாதனம் 1 (பண்ணை)';
    localStorage.setItem(STORAGE_DEVICE_NAME, name);
  }

  return { id, name };
}

export function saveLocalDevice(id: string, name: string) {
  localStorage.setItem(STORAGE_DEVICE_ID, id);
  localStorage.setItem(STORAGE_DEVICE_NAME, name);
}

export function useFarmSocket() {
  const [device, setDevice] = useState(getLocalDevice);
  const [farmState, setFarmState] = useState<FarmStore>({
    p: [],
    s: [],
    feedStock: [],
    feedCost: [],
    income: [],
    history: [],
    notifications: [],
  });
  const [activeDevices, setActiveDevices] = useState<ConnectedDevice[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<FarmNotification | null>(null);
  const [toastQueue, setToastQueue] = useState<FarmNotification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Fallback initial REST load
  const loadInitialState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setFarmState(json.data);
        }
        if (json.activeDevices) {
          setActiveDevices(json.activeDevices);
        }
      }
    } catch (e) {
      console.warn('Initial state fetch error (will rely on socket):', e);
    }
  }, []);

  // Connect WebSocket
  useEffect(() => {
    loadInitialState();

    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?deviceId=${encodeURIComponent(
        device.id
      )}&deviceName=${encodeURIComponent(device.name)}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Identify with device info
        ws.send(
          JSON.stringify({
            type: 'IDENTIFY',
            deviceId: device.id,
            deviceName: device.name,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'INITIAL_STATE') {
            if (data.state) setFarmState(data.state);
            if (data.activeDevices) setActiveDevices(data.activeDevices);
          } else if (data.type === 'ACTIVE_DEVICES_UPDATE') {
            if (data.activeDevices) setActiveDevices(data.activeDevices);
          } else if (data.type === 'RECORD_ADDED') {
            if (data.fullState) {
              setFarmState(data.fullState);
            }
            if (data.notification) {
              // Trigger audio alert and toast
              notificationAudio.playNotificationChime();
              sendBrowserNotification(data.notification.title, data.notification.body);
              showToast(data.notification);
            }
          } else if (data.type === 'RECORD_DELETED') {
            if (data.fullState) {
              setFarmState(data.fullState);
            }
            if (data.notification) {
              showToast(data.notification);
            }
          } else if (data.type === 'NOTIFICATION_BROADCAST') {
            if (data.notification) {
              notificationAudio.playNotificationChime();
              sendBrowserNotification(data.notification.title, data.notification.body);
              showToast(data.notification);
              setFarmState((prev) => ({
                ...prev,
                notifications: [data.notification, ...prev.notifications].slice(0, 80),
              }));
            }
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    // Heartbeat ping
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 20000);

    return () => {
      isUnmounted = true;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [device.id, device.name, loadInitialState]);

  const showToast = (notif: FarmNotification) => {
    setActiveToast(notif);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  // Change current device
  const updateDevice = (newId: string, newName: string) => {
    saveLocalDevice(newId, newName);
    setDevice({ id: newId, name: newName });
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'IDENTIFY',
          deviceId: newId,
          deviceName: newName,
        })
      );
    }
  };

  // Action: Save record
  const saveRecord = async (type: 'p' | 's' | 'feedStock' | 'feedCost' | 'income', row: any) => {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          row,
          deviceId: device.id,
          deviceName: device.name,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setFarmState(data.data);
      }
      return data;
    } catch (e) {
      console.error('Save record error:', e);
      throw e;
    }
  };

  // Action: Delete record
  const deleteRecord = async (type: 'p' | 's' | 'feedStock' | 'feedCost' | 'income', id: number) => {
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id,
          deviceId: device.id,
          deviceName: device.name,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setFarmState(data.data);
      }
      return data;
    } catch (e) {
      console.error('Delete record error:', e);
      throw e;
    }
  };

  // Action: Send test broadcast notification
  const sendTestBroadcast = async (customDeviceName?: string, customText?: string) => {
    try {
      const res = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: customDeviceName || 'சாதனம் 2 (கோழி கொட்டகை)',
          text: customText || 'இன்று 40 தட்டுகள் (1,200 முட்டைகள்) புதியதாக சேர்க்கப்பட்டது!',
        }),
      });
      return await res.json();
    } catch (e) {
      console.error('Test notification error:', e);
    }
  };

  return {
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
  };
}
