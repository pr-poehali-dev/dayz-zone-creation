import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Order } from './OrderPage';

interface MyOrdersPageProps {
  orders: Order[];
  user: { name: string; avatar: string; isAdmin: boolean } | null;
  onLogin: () => void;
  onOrderClick: () => void;
}

const statusConfig: Record<Order['status'], { label: string; color: string; icon: string }> = {
  pending: { label: 'Ожидает рассмотрения', color: '#ffff00', icon: 'Clock' },
  reviewing: { label: 'На рассмотрении', color: '#00ffff', icon: 'Eye' },
  in_progress: { label: 'В работе', color: '#00ff88', icon: 'Zap' },
  done: { label: 'Выполнен', color: '#00ff88', icon: 'CheckCircle' },
  cancelled: { label: 'Отменён', color: '#ff0040', icon: 'XCircle' },
};

export default function MyOrdersPage({ orders, user, onLogin, onOrderClick }: MyOrdersPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!user) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="Lock" size={48} className="mx-auto mb-6 text-gray-700" />
          <h2 className="font-orbitron text-xl font-700 text-white mb-3">Требуется авторизация</h2>
          <p className="font-rajdhani text-gray-400 mb-6">Войдите через Discord, чтобы видеть свои заявки</p>
          <button onClick={onLogin} className="neon-btn px-8 py-3 text-sm rounded">
            Войти через Discord
          </button>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    const cfg = statusConfig[selectedOrder.status];
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-500 hover:text-neon-green transition-colors mb-8">
            <Icon name="ArrowLeft" size={16} />
            <span className="font-rajdhani text-sm">Назад к заявкам</span>
          </button>

          {/* Order header */}
          <div className="glass-card p-6 rounded-xl mb-6" style={{ borderColor: `${cfg.color}30` }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-gray-500 mb-1">ID: {selectedOrder.id}</div>
                <h2 className="font-orbitron font-700 text-white text-lg">{selectedOrder.title}</h2>
                <div className="font-rajdhani text-sm text-gray-400 mt-1">{selectedOrder.category}</div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}40` }}>
                <Icon name={cfg.icon as any} size={14} style={{ color: cfg.color }} />
                <span className="font-orbitron text-xs font-600" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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
          </div>

          {/* Details */}
          <div className="glass-card p-6 rounded-xl mb-6">
            <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// ДЕТАЛИ ЗАЯВКИ</div>
            <div className="space-y-4">
              {Object.entries(selectedOrder.details).map(([key, val]) => (
                <div key={key}>
                  <div className="text-xs font-mono text-gray-600 mb-1">{key.toUpperCase()}</div>
                  <div className="font-rajdhani text-sm text-gray-300 leading-relaxed">{val || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports */}
          <div className="glass-card p-6 rounded-xl mb-6">
            <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// ОТЧЁТЫ ПО РАБОТЕ</div>
            {selectedOrder.reports.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileText" size={32} className="mx-auto mb-3 text-gray-700" />
                <p className="font-rajdhani text-gray-600 text-sm">Отчётов пока нет. Они появятся после начала работы.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedOrder.reports.map((r, i) => (
                  <div key={i} className="border-l-2 pl-4" style={{ borderColor: '#00ff88' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-orbitron text-xs font-600 text-neon-green">{r.author}</span>
                      <span className="font-mono text-xs text-gray-600">{r.date}</span>
                    </div>
                    <p className="font-rajdhani text-gray-300 text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick contact */}
          <div className="glass-card p-6 rounded-xl">
            <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// СВЯЗАТЬСЯ С НАМИ</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(0,136,204,0.3)' }}>
                <span className="text-xl">✈️</span>
                <div>
                  <div className="font-orbitron text-xs font-600 text-white">Telegram</div>
                  <div className="text-xs text-gray-500">Написать напрямую</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(88,101,242,0.3)' }}>
                <span className="text-xl">🎮</span>
                <div>
                  <div className="font-orbitron text-xs font-600 text-white">Discord</div>
                  <div className="text-xs text-gray-500">Создать тикет</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// МОИ ЗАЯВКИ</div>
          <h1 className="font-orbitron text-4xl font-900 mb-4 text-white">Мои заявки</h1>
          <div className="w-32 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }}></div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <Icon name="FileText" size={32} style={{ color: '#00ff88' }} />
            </div>
            <h3 className="font-orbitron text-lg font-700 text-white mb-3">Заявок пока нет</h3>
            <p className="font-rajdhani text-gray-400 mb-6">Создайте первую заявку и отслеживайте её прогресс здесь</p>
            <button onClick={onOrderClick} className="neon-btn px-8 py-3 text-sm rounded">
              <span className="flex items-center gap-2">
                <Icon name="Plus" size={16} />
                Создать заявку
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = statusConfig[order.status];
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="glass-card w-full p-5 rounded-xl text-left group hover:scale-101 transition-all duration-300"
                  style={{ borderColor: `${cfg.color}20` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                        <Icon name={cfg.icon as any} size={18} style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-orbitron text-xs font-600 text-white">{order.title}</span>
                          <span className="font-mono text-xs text-gray-600">{order.id}</span>
                        </div>
                        <div className="font-rajdhani text-xs text-gray-500">{order.category} · {order.createdAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-orbitron text-xs font-700" style={{ color: '#00ff88' }}>{order.budget}</div>
                        <div className="font-mono text-xs text-gray-600">{order.deadline}</div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        {cfg.label}
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-gray-600 group-hover:text-neon-green transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
