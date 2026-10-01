import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure data folder exists
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'egg_farm_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface ProductionRow {
  id: number;
  date: string;
  eggs: number;
  trays: number;
  deviceId?: string;
  deviceName?: string;
  createdAt: string;
}

export interface SaleRow {
  id: number;
  date: string;
  eggs: number;
  price: number;
  amount: number;
  deviceId?: string;
  deviceName?: string;
  createdAt: string;
}

export interface ExtraRow {
  id: number;
  date: string;
  qty?: number;
  amount?: number;
  deviceId?: string;
  deviceName?: string;
  createdAt: string;
}

export interface HistoryItem {
  id: number;
  type: 'p' | 's' | 'feedStock' | 'feedCost' | 'income';
  label: string;
  savedAt: string;
  deviceId?: string;
  deviceName?: string;
  row: any;
}

export interface FarmNotification {
  id: string;
  type: 'p' | 's' | 'feedStock' | 'feedCost' | 'income' | 'delete' | 'system';
  title: string;
  body: string;
  senderName: string;
  senderDeviceId: string;
  timestamp: string;
}

export interface FarmStore {
  p: ProductionRow[];
  s: SaleRow[];
  feedStock: ExtraRow[];
  feedCost: ExtraRow[];
  income: ExtraRow[];
  history: HistoryItem[];
  notifications: FarmNotification[];
}

const defaultState: FarmStore = {
  p: [
    {
      id: 1711600000000,
      date: new Date().toISOString().slice(0, 10),
      trays: 34,
      eggs: 1020,
      deviceId: 'dev-1',
      deviceName: 'சாதனம் 1 (பண்ணை கொட்டகை)',
      createdAt: new Date().toISOString(),
    },
  ],
  s: [],
  feedStock: [
    {
      id: 1711500000000,
      date: new Date().toISOString().slice(0, 10),
      qty: 15,
      deviceId: 'dev-2',
      deviceName: 'சாதனம் 2 (தீவன அறை)',
      createdAt: new Date().toISOString(),
    },
  ],
  feedCost: [],
  income: [],
  history: [
    {
      id: 1711600000000,
      type: 'p',
      label: 'உற்பத்தி பதிவு',
      savedAt: new Date().toISOString(),
      deviceId: 'dev-1',
      deviceName: 'சாதனம் 1 (பண்ணை கொட்டகை)',
      row: {
        id: 1711600000000,
        date: new Date().toISOString().slice(0, 10),
        trays: 34,
        eggs: 1020,
      },
    },
    {
      id: 1711500000000,
      type: 'feedStock',
      label: 'தீவன இருப்பு',
      savedAt: new Date().toISOString(),
      deviceId: 'dev-2',
      deviceName: 'சாதனம் 2 (தீவன அறை)',
      row: {
        id: 1711500000000,
        date: new Date().toISOString().slice(0, 10),
        qty: 15,
      },
    },
  ],
  notifications: [
    {
      id: 'init-1',
      type: 'system',
      title: 'நிகழ்நேர அமைப்பு தயார்',
      body: 'முட்டை பண்ணை கணக்கு செயலி 5 சாதனங்களுக்கும் நிகழ்நேர பகிர்வுடன் இணைக்கப்பட்டுள்ளது.',
      senderName: 'மைய சேவையகம் (Server)',
      senderDeviceId: 'server',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'init-2',
      type: 'p',
      title: '🥚 புதிய உற்பத்தி பதிவு',
      body: 'சாதனம் 1 (பண்ணை கொட்டகை): 34 தட்டுகள் (1,020 முட்டைகள்) சேர்த்துள்ளார்.',
      senderName: 'சாதனம் 1 (பண்ணை கொட்டகை)',
      senderDeviceId: 'dev-1',
      timestamp: new Date().toISOString(),
    },
  ],
};

function loadStore(): FarmStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        p: Array.isArray(parsed.p) ? parsed.p : [],
        s: Array.isArray(parsed.s) ? parsed.s : [],
        feedStock: Array.isArray(parsed.feedStock) ? parsed.feedStock : [],
        feedCost: Array.isArray(parsed.feedCost) ? parsed.feedCost : [],
        income: Array.isArray(parsed.income) ? parsed.income : [],
        history: Array.isArray(parsed.history) ? parsed.history : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      };
    }
  } catch (err) {
    console.error('Error loading data file:', err);
  }
  saveStore(defaultState);
  return defaultState;
}

function saveStore(data: FarmStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data file:', err);
  }
}

let farmState: FarmStore = loadStore();

interface ClientMeta {
  ws: WebSocket;
  deviceId: string;
  deviceName: string;
  ip?: string;
  connectedAt: string;
  lastPing: number;
}

const connectedClients = new Map<WebSocket, ClientMeta>();

function getActiveDevicesList() {
  const devices: { deviceId: string; deviceName: string; connectedAt: string }[] = [];
  const seenIds = new Set<string>();

  for (const client of connectedClients.values()) {
    if (!seenIds.has(client.deviceId)) {
      seenIds.add(client.deviceId);
      devices.push({
        deviceId: client.deviceId,
        deviceName: client.deviceName,
        connectedAt: client.connectedAt,
      });
    }
  }
  return devices;
}

function broadcast(message: object, exceptWs?: WebSocket) {
  const jsonStr = JSON.stringify(message);
  for (const client of connectedClients.keys()) {
    if (client !== exceptWs && client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  }
}

function broadcastAll(message: object) {
  const jsonStr = JSON.stringify(message);
  for (const client of connectedClients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  app.use(express.json());
  app.use(express.static(path.resolve(__dirname, 'public')));

  // CORS & Security headers to prevent 3rd-party cookie & cross-origin blocking
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // REST API Routes
  app.get('/api/state', (req, res) => {
    res.json({
      success: true,
      data: farmState,
      activeDevices: getActiveDevicesList(),
    });
  });

  app.get('/api/devices', (req, res) => {
    res.json({
      success: true,
      activeDevices: getActiveDevicesList(),
      count: connectedClients.size,
    });
  });

  app.post('/api/save', (req, res) => {
    const { type, row, deviceName = 'சாதனம்', deviceId = 'unknown' } = req.body;
    if (!type || !row) {
      return res.status(400).json({ error: 'Missing type or row' });
    }

    const labels: Record<string, string> = {
      p: 'உற்பத்தி பதிவு',
      s: 'விற்பனை பதிவு',
      feedStock: 'தீவன இருப்பு',
      feedCost: 'தீவனச் செலவு',
      income: 'தொகை வரவு',
    };

    const newRow = {
      ...row,
      id: row.id || Date.now(),
      deviceId,
      deviceName,
      createdAt: new Date().toISOString(),
    };

    if (type === 'p') {
      farmState.p.push(newRow);
    } else if (type === 's') {
      farmState.s.push(newRow);
    } else if (type === 'feedStock') {
      farmState.feedStock.push(newRow);
    } else if (type === 'feedCost') {
      farmState.feedCost.push(newRow);
    } else if (type === 'income') {
      farmState.income.push(newRow);
    }

    // Add permanent history entry
    const historyItem: HistoryItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      label: labels[type] || type,
      savedAt: new Date().toISOString(),
      deviceId,
      deviceName,
      row: JSON.parse(JSON.stringify(newRow)),
    };
    farmState.history.push(historyItem);

    // Build notification message
    let notifTitle = 'புதிய பதிவு';
    let notifBody = `${deviceName} ஒரு புதிய பதிவைச் சேர்த்துள்ளார்.`;

    if (type === 'p') {
      notifTitle = '🥚 புதிய முட்டை உற்பத்தி!';
      notifBody = `${deviceName} ${newRow.trays} தட்டுகள் (${Number(newRow.eggs).toLocaleString('en-IN')} முட்டைகள்) சேர்த்துள்ளார்.`;
    } else if (type === 's') {
      notifTitle = '🛒 புதிய விற்பனை!';
      notifBody = `${deviceName} ${Number(newRow.eggs).toLocaleString('en-IN')} முட்டைகளை ₹${newRow.price} விலையில் (மொத்தம் ₹${Number(newRow.amount).toLocaleString('en-IN')}) விற்பனை செய்துள்ளார்.`;
    } else if (type === 'feedStock') {
      notifTitle = '🌾 தீவன இருப்பு சேர்க்கப்பட்டது!';
      notifBody = `${deviceName} ${newRow.qty} மூட்டை தீவனத்தை இருப்பு சேர்த்துள்ளார்.`;
    } else if (type === 'feedCost') {
      notifTitle = '💸 தீவனச் செலவு பதிவு!';
      notifBody = `${deviceName} ₹${Number(newRow.amount).toLocaleString('en-IN')} தீவனச் செலவு பதிவு செய்துள்ளார்.`;
    } else if (type === 'income') {
      notifTitle = '💰 தொகை வரவு!';
      notifBody = `${deviceName} ₹${Number(newRow.amount).toLocaleString('en-IN')} தொகை வரவு சேர்த்துள்ளார்.`;
    }

    const notification: FarmNotification = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      type,
      title: notifTitle,
      body: notifBody,
      senderName: deviceName,
      senderDeviceId: deviceId,
      timestamp: new Date().toISOString(),
    };

    farmState.notifications.unshift(notification);
    if (farmState.notifications.length > 80) {
      farmState.notifications = farmState.notifications.slice(0, 80);
    }

    saveStore(farmState);

    // Broadcast to all connected devices immediately!
    broadcastAll({
      type: 'RECORD_ADDED',
      recordType: type,
      row: newRow,
      historyItem,
      notification,
      fullState: farmState,
      senderDeviceId: deviceId,
    });

    res.json({
      success: true,
      row: newRow,
      notification,
      data: farmState,
    });
  });

  app.post('/api/delete', (req, res) => {
    const { type, id, deviceName = 'சாதனம்', deviceId = 'unknown' } = req.body;
    if (!type || !id) {
      return res.status(400).json({ error: 'Missing type or id' });
    }

    const typeKey = type as 'p' | 's' | 'feedStock' | 'feedCost' | 'income';
    const oldRow = (farmState[typeKey] as any[]).find((x) => x.id === id);

    if (typeKey === 'p') {
      farmState.p = farmState.p.filter((x) => x.id !== id);
    } else if (typeKey === 's') {
      farmState.s = farmState.s.filter((x) => x.id !== id);
    } else if (typeKey === 'feedStock') {
      farmState.feedStock = farmState.feedStock.filter((x) => x.id !== id);
    } else if (typeKey === 'feedCost') {
      farmState.feedCost = farmState.feedCost.filter((x) => x.id !== id);
    } else if (typeKey === 'income') {
      farmState.income = farmState.income.filter((x) => x.id !== id);
    }

    const typeNames: Record<string, string> = {
      p: 'உற்பத்தி',
      s: 'விற்பனை',
      feedStock: 'தீவன இருப்பு',
      feedCost: 'தீவனச் செலவு',
      income: 'தொகை வரவு',
    };

    const notifTitle = '🗑️ பதிவு நீக்கப்பட்டது';
    const notifBody = `${deviceName} ${typeNames[typeKey] || typeKey} பதிவை நீக்கியுள்ளார். (All History-ல் பாதுகாப்பாக உள்ளது)`;

    const notification: FarmNotification = {
      id: 'notif-del-' + Date.now(),
      type: 'delete',
      title: notifTitle,
      body: notifBody,
      senderName: deviceName,
      senderDeviceId: deviceId,
      timestamp: new Date().toISOString(),
    };

    farmState.notifications.unshift(notification);
    if (farmState.notifications.length > 80) {
      farmState.notifications = farmState.notifications.slice(0, 80);
    }

    saveStore(farmState);

    broadcastAll({
      type: 'RECORD_DELETED',
      recordType: typeKey,
      deletedId: id,
      notification,
      fullState: farmState,
      senderDeviceId: deviceId,
    });

    res.json({
      success: true,
      notification,
      data: farmState,
    });
  });

  app.post('/api/test-notification', (req, res) => {
    const { deviceName = 'சோதனை சாதனம்', text = 'இன்று 40 தட்டுகள் (1,200 முட்டைகள்) சேர்க்கப்பட்டுள்ளன!' } = req.body;
    const notification: FarmNotification = {
      id: 'notif-test-' + Date.now(),
      type: 'p',
      title: '🥚 சோதனை அறிவிப்பு!',
      body: `${deviceName}: ${text}`,
      senderName: deviceName,
      senderDeviceId: 'test-device',
      timestamp: new Date().toISOString(),
    };

    farmState.notifications.unshift(notification);
    saveStore(farmState);

    broadcastAll({
      type: 'NOTIFICATION_BROADCAST',
      notification,
      senderDeviceId: 'test-device',
    });

    res.json({ success: true, notification });
  });

  // WebSocket Server Setup
  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const deviceId = url.searchParams.get('deviceId') || `dev-${Math.floor(Math.random() * 10000)}`;
    const deviceName = url.searchParams.get('deviceName') || 'சாதனம்';

    const clientMeta: ClientMeta = {
      ws,
      deviceId,
      deviceName,
      connectedAt: new Date().toISOString(),
      lastPing: Date.now(),
    };

    connectedClients.set(ws, clientMeta);

    // Send initial state & welcome
    ws.send(
      JSON.stringify({
        type: 'INITIAL_STATE',
        state: farmState,
        activeDevices: getActiveDevicesList(),
        yourDeviceId: deviceId,
      })
    );

    // Broadcast updated device list to all
    broadcastAll({
      type: 'ACTIVE_DEVICES_UPDATE',
      activeDevices: getActiveDevicesList(),
      deviceCount: getActiveDevicesList().length,
      joinedDevice: { deviceId, deviceName },
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'IDENTIFY') {
          if (msg.deviceId) clientMeta.deviceId = msg.deviceId;
          if (msg.deviceName) clientMeta.deviceName = msg.deviceName;
          broadcastAll({
            type: 'ACTIVE_DEVICES_UPDATE',
            activeDevices: getActiveDevicesList(),
            deviceCount: getActiveDevicesList().length,
          });
        } else if (msg.type === 'PING') {
          clientMeta.lastPing = Date.now();
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
      broadcastAll({
        type: 'ACTIVE_DEVICES_UPDATE',
        activeDevices: getActiveDevicesList(),
        deviceCount: getActiveDevicesList().length,
      });
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
      connectedClients.delete(ws);
    });
  });

  // Dedicated WebSocket upgrade handling (ensures Vite dev server WebSocket is not intercepted)
  server.on('upgrade', (req, socket, head) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      if (url.pathname === '/api/ws' || url.pathname === '/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    } catch (e) {
      console.error('Upgrade routing error:', e);
      socket.destroy();
    }
  });

  // Dev server with Vite vs Production
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (Prod: ${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
