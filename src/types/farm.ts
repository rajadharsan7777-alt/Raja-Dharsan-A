export interface ProductionRow {
  id: number;
  date: string;
  eggs: number;
  trays: number;
  deviceId?: string;
  deviceName?: string;
  createdAt?: string;
}

export interface SaleRow {
  id: number;
  date: string;
  eggs: number;
  price: number;
  amount: number;
  deviceId?: string;
  deviceName?: string;
  createdAt?: string;
}

export interface ExtraRow {
  id: number;
  date: string;
  qty?: number;
  amount?: number;
  deviceId?: string;
  deviceName?: string;
  createdAt?: string;
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

export interface ConnectedDevice {
  deviceId: string;
  deviceName: string;
  connectedAt: string;
}

export const PRESET_DEVICES = [
  { id: 'dev-1', name: 'சாதனம் 1 (மேலாளர் / அலுவலகம்)', icon: '👑', role: 'மேலாளர்' },
  { id: 'dev-2', name: 'சாதனம் 2 (கோழி கொட்டகை - 1)', icon: '🐔', role: 'கொட்டகை 1' },
  { id: 'dev-3', name: 'சாதனம் 3 (கோழி கொட்டகை - 2)', icon: '🐣', role: 'கொட்டகை 2' },
  { id: 'dev-4', name: 'சாதனம் 4 (முட்டை சேகரிப்பு & தட்டு)', icon: '🥚', role: 'சேகரிப்பு' },
  { id: 'dev-5', name: 'சாதனம் 5 (விற்பனை & கல்லா)', icon: '💰', role: 'விற்பனை' },
];
