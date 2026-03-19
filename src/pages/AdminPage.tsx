import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Order } from './OrderPage';

interface AdminPageProps {
  orders: Order[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onLogin: () => void;
}

interface AdminLoginProps {
  onSuccess: () => void;
}

const statusConfig: Record<Order['status'], { label: string; color: string; icon: string }> = {
  pending: { label: 'Ожидает', color: '#ffff00', icon: 'Clock' },
  reviewing: { label: 'Рассматривается', color: '#00ffff', icon: 'Eye' },
  in_progress: { label: 'В работе', color: '#00ff88', icon: 'Zap' },
  done: { label: 'Выполнен', color: '#00ff88', icon: 'CheckCircle' },
  cancelled: { label: 'Отменён', color: '#ff0040', icon: 'XCircle' },
};

function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (login === 'Admin' && password === 'Admin2026') {
      onSuccess();
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,0,64,0.15)', border: '2px solid rgba(255,0,64,0.5)', boxShadow: '0 0 30px rgba(255,0,64,0.3)' }}>
            <Icon name="Shield" size={28} style={{ color: '#ff0040' }} />
          </div>
          <h1 className="font-orbitron text-2xl font-900 mb-2" style={{ color: '#ff0040', textShadow: '0 0 15px rgba(255,0,64,0.5)' }}>ADMIN PANEL</h1>
          <div className="text-xs font-mono text-gray-600">// ДОСТУП ОГРАНИЧЕН</div>
        </div>

        <div className="glass-card p-8 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ЛОГИН</label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ПАРОЛЬ</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs font-rajdhani" style={{ color: '#ff0040' }}>
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}
            <button onClick={handleLogin} className="neon-btn-red w-full py-3 text-sm rounded mt-2">
              Войти в панель
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ orders, onUpdateOrder, onLogin }: AdminPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'stats'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newReport, setNewReport] = useState('');
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');

  if (!isLoggedIn) {
    return <AdminLogin onSuccess={() => setIsLoggedIn(true)} />;
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    done: orders.filter(o => o.status === 'done').length,
  };

  const handleAddReport = () => {
    if (!selectedOrder || !newReport.trim()) return;
    const updated = {
      ...selectedOrder,
      reports: [
        ...selectedOrder.reports,
        { date: new Date().toLocaleDateString('ru-RU'), text: newReport, author: 'Admin' }
      ]
    };
    onUpdateOrder(selectedOrder.id, updated);
    setSelectedOrder(updated);
    setNewReport('');
  };

  const handleStatusChange = (status: Order['status']) => {
    if (!selectedOrder) return;
    setNewStatus(status);
    const updated = { ...selectedOrder, status };
    onUpdateOrder(selectedOrder.id, { status });
    setSelectedOrder(updated);
  };

  if (selectedOrder) {
    const cfg = statusConfig[selectedOrder.status];
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-500 hover:text-neon-red transition-colors mb-8">
            <Icon name="ArrowLeft" size={16} />
            <span className="font-rajdhani text-sm">Назад к заявкам</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: order info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-gray-500 mb-1">{selectedOrder.id}</div>
                    <h2 className="font-orbitron font-700 text-white text-lg">{selectedOrder.title}</h2>
                    <div className="font-rajdhani text-sm text-gray-400">{selectedOrder.category} · {selectedOrder.clientName}</div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                    {cfg.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t mb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div>
                    <div className="text-xs font-mono text-gray-600 mb-1">СОЗДАНА</div>
                    <div className="font-rajdhani text-sm text-gray-300">{selectedOrder.createdAt}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-gray-600 mb-1">СРОК</div>
                    <div className="font-rajdhani text-sm text-gray-300">{selectedOrder.deadline}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-gray-600 mb-1">БЮДЖЕТ</div>
                    <div className="font-rajdhani text-sm" style={{ color: '#00ff88' }}>{selectedOrder.budget}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-gray-600 mb-3">ДЕТАЛИ</div>
                  <div className="space-y-3">
                    {Object.entries(selectedOrder.details).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-xs font-mono text-gray-600">{k}</div>
                        <div className="font-rajdhani text-sm text-gray-300">{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reports */}
              <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// ОТЧЁТЫ</div>
                {selectedOrder.reports.length === 0 ? (
                  <p className="font-rajdhani text-gray-600 text-sm text-center py-4">Отчётов нет</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {selectedOrder.reports.map((r, i) => (
                      <div key={i} className="border-l-2 pl-4" style={{ borderColor: '#ff0040' }}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-orbitron text-xs text-neon-red">{r.author}</span>
                          <span className="font-mono text-xs text-gray-600">{r.date}</span>
                        </div>
                        <p className="font-rajdhani text-sm text-gray-300">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <textarea
                    value={newReport}
                    onChange={e => setNewReport(e.target.value)}
                    placeholder="Добавить отчёт о работе..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none mb-3"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }}
                  />
                  <button onClick={handleAddReport} className="neon-btn-red px-6 py-2 text-xs rounded">
                    Добавить отчёт
                  </button>
                </div>
              </div>
            </div>

            {/* Right: controls */}
            <div className="space-y-6">
              <div className="glass-card p-5 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// СТАТУС ЗАЯВКИ</div>
                <div className="space-y-2">
                  {(Object.keys(statusConfig) as Order['status'][]).map(s => {
                    const c = statusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-rajdhani font-600 transition-all ${selectedOrder.status === s ? '' : 'opacity-50 hover:opacity-80'}`}
                        style={selectedOrder.status === s ? { background: `${c.color}20`, border: `1px solid ${c.color}50`, color: c.color } : { border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
                      >
                        <Icon name={c.icon as any} size={14} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-1">// ПАНЕЛЬ УПРАВЛЕНИЯ</div>
            <h1 className="font-orbitron text-3xl font-900" style={{ color: '#ff0040', textShadow: '0 0 15px rgba(255,0,64,0.4)' }}>Admin Panel</h1>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-xs font-rajdhani text-gray-500 hover:text-neon-red transition-colors">
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Всего заявок', value: stats.total, color: '#00ff88', icon: 'FileText' },
            { label: 'Ожидают', value: stats.pending, color: '#ffff00', icon: 'Clock' },
            { label: 'В работе', value: stats.inProgress, color: '#00ffff', icon: 'Zap' },
            { label: 'Выполнено', value: stats.done, color: '#00ff88', icon: 'CheckCircle' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5 rounded-xl text-center" style={{ borderColor: `${s.color}20` }}>
              <Icon name={s.icon as any} size={20} className="mx-auto mb-2" style={{ color: s.color }} />
              <div className="font-orbitron text-2xl font-900" style={{ color: s.color, textShadow: `0 0 10px ${s.color}` }}>{s.value}</div>
              <div className="font-rajdhani text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,0,64,0.15)' }}>
            <div className="text-xs font-mono text-gray-500 tracking-widest">// ВСЕ ЗАЯВКИ</div>
            <span className="font-mono text-xs text-gray-600">{orders.length} заявок</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <Icon name="Inbox" size={40} className="mx-auto mb-4 text-gray-700" />
              <p className="font-rajdhani text-gray-600">Заявок пока нет</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {orders.map(order => {
                const cfg = statusConfig[order.status];
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <Icon name={cfg.icon as any} size={16} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-orbitron text-xs font-600 text-white truncate">{order.title}</span>
                        <span className="font-mono text-xs text-gray-600 flex-shrink-0">{order.id}</span>
                      </div>
                      <div className="font-rajdhani text-xs text-gray-500">{order.clientName} · {order.category} · {order.createdAt}</div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden md:block">
                        <div className="font-orbitron text-xs font-700" style={{ color: '#00ff88' }}>{order.budget}</div>
                        <div className="font-mono text-xs text-gray-600">{order.deadline}</div>
                      </div>
                      <div className="px-2 py-1 rounded text-xs font-mono flex-shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        {cfg.label}
                      </div>
                      <Icon name="ChevronRight" size={14} className="text-gray-600 group-hover:text-neon-red transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
