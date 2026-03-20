import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { newsApi, ordersApi, ticketsApi, promocodesApi, type NewsItem, type AppOrder, type AppTicket, type Promocode, type AppUser } from '@/lib/api';

interface AdminPageProps {
  user: AppUser | null;
  onLogin: () => void;
}

const statusConfig: Record<AppOrder['status'], { label: string; color: string; icon: string }> = {
  pending: { label: 'Ожидает', color: '#ffff00', icon: 'Clock' },
  reviewing: { label: 'Рассматривается', color: '#00ffff', icon: 'Eye' },
  in_progress: { label: 'В работе', color: '#00ff88', icon: 'Zap' },
  done: { label: 'Выполнен', color: '#00ff88', icon: 'CheckCircle' },
  cancelled: { label: 'Отменён', color: '#ff0040', icon: 'XCircle' },
};

const ticketStatusConfig: Record<AppTicket['status'], { label: string; color: string }> = {
  open: { label: 'Открыт', color: '#ffff00' },
  answered: { label: 'Отвечен', color: '#00ff88' },
  closed: { label: 'Закрыт', color: '#888' },
};

const NEWS_TAGS = ['Обновление', 'Релиз', 'Портфолио', 'Новость', 'Акция', 'Событие'];
const NEWS_COLORS = [
  { label: 'Зелёный', value: '#00ff88' },
  { label: 'Циан', value: '#00ffff' },
  { label: 'Красный', value: '#ff0040' },
  { label: 'Жёлтый', value: '#ffff00' },
];

type Tab = 'dashboard' | 'orders' | 'tickets' | 'news' | 'promocodes';

export default function AdminPage({ user, onLogin }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [tickets, setTickets] = useState<AppTicket[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [promos, setPromos] = useState<Promocode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AppOrder | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<AppTicket | null>(null);
  const [reportText, setReportText] = useState('');
  const [ticketReply, setTicketReply] = useState('');
  const [newsForm, setNewsForm] = useState({ title: '', content: '', tag: 'Обновление', color: '#00ff88' });
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsSaved, setNewsSaved] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: '', description: '', discountType: 'percent' as 'percent' | 'fixed', discountValue: 10, maxUses: '' });
  const [editingPromo, setEditingPromo] = useState<Promocode | null>(null);
  const [promoSaved, setPromoSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [o, t, n, p] = await Promise.all([
        ordersApi.list().catch(() => ({ orders: [] })),
        ticketsApi.list().catch(() => ({ tickets: [] })),
        newsApi.list().catch(() => ({ news: [] })),
        promocodesApi.list().catch(() => ({ promocodes: [] })),
      ]);
      setOrders(o.orders);
      setTickets(t.tickets);
      setNews(n.news);
      setPromos(p.promocodes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.isAdmin) load(); }, [user]);

  // Не админ — показываем заглушку
  if (!user) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,0,64,0.15)', border: '2px solid rgba(255,0,64,0.5)', boxShadow: '0 0 30px rgba(255,0,64,0.3)' }}>
            <Icon name="Shield" size={28} style={{ color: '#ff0040' }} />
          </div>
          <h1 className="font-orbitron text-2xl font-900 mb-2" style={{ color: '#ff0040', textShadow: '0 0 15px rgba(255,0,64,0.5)' }}>ADMIN PANEL</h1>
          <div className="text-xs font-mono text-gray-600 mb-8">// ТРЕБУЕТСЯ АВТОРИЗАЦИЯ</div>
          <div className="glass-card p-8 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
            <p className="font-rajdhani text-gray-400 mb-6">Для доступа к панели управления необходимо войти через Discord с аккаунтом администратора.</p>
            <button onClick={onLogin} className="neon-btn-red w-full py-3 text-sm rounded flex items-center justify-center gap-2">
              <Icon name="LogIn" size={16} />
              Войти через Discord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="ShieldOff" size={48} style={{ color: '#ff0040', margin: '0 auto 16px' }} />
          <h1 className="font-orbitron text-xl font-900 mb-2" style={{ color: '#ff0040' }}>ДОСТУП ЗАПРЕЩЁН</h1>
          <div className="font-rajdhani text-gray-500">Твой аккаунт не имеет прав администратора.</div>
        </div>
      </div>
    );
  }

  const stats = {
    orders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    news: news.length,
    promos: promos.length,
  };

  // ORDER DETAIL
  if (selectedOrder) {
    const cfg = statusConfig[selectedOrder.status];
    const handleStatus = async (status: AppOrder['status']) => {
      const updated = await ordersApi.update(selectedOrder.id, status);
      setSelectedOrder(updated.order);
      setOrders(prev => prev.map(o => o.id === updated.order.id ? updated.order : o));
    };
    const handleReport = async () => {
      if (!reportText.trim()) return;
      const updated = await ordersApi.update(selectedOrder.id, undefined, reportText);
      setSelectedOrder(updated.order);
      setOrders(prev => prev.map(o => o.id === updated.order.id ? updated.order : o));
      setReportText('');
    };
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-500 hover:text-neon-red transition-colors mb-8">
            <Icon name="ArrowLeft" size={16} /><span className="font-rajdhani text-sm">Назад к заказам</span>
          </button>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-gray-500 mb-1">{selectedOrder.id}</div>
                    <h2 className="font-orbitron font-700 text-white text-lg">{selectedOrder.title}</h2>
                    <div className="font-rajdhani text-sm text-gray-400">{selectedOrder.category} · {selectedOrder.clientName}</div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>{cfg.label}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t mb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div><div className="text-xs font-mono text-gray-600 mb-1">СОЗДАНА</div><div className="font-rajdhani text-sm text-gray-300">{selectedOrder.createdAt}</div></div>
                  <div><div className="text-xs font-mono text-gray-600 mb-1">СРОК</div><div className="font-rajdhani text-sm text-gray-300">{selectedOrder.deadline}</div></div>
                  <div><div className="text-xs font-mono text-gray-600 mb-1">БЮДЖЕТ</div><div className="font-rajdhani text-sm" style={{ color: '#00ff88' }}>{selectedOrder.budget}</div></div>
                </div>
                <div>
                  <div className="text-xs font-mono text-gray-600 mb-3">ДЕТАЛИ ТЗ</div>
                  <div className="space-y-3">
                    {Object.entries(selectedOrder.details).map(([k, v]) => (
                      <div key={k}><div className="text-xs font-mono text-gray-600">{k}</div><div className="font-rajdhani text-sm text-gray-300">{v || '—'}</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// ОТЧЁТЫ ПО РАБОТЕ</div>
                {selectedOrder.reports.length === 0 ? (
                  <p className="font-rajdhani text-gray-600 text-sm text-center py-4">Отчётов нет — добавьте первый</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {selectedOrder.reports.map((r, i) => (
                      <div key={i} className="border-l-2 pl-4" style={{ borderColor: '#ff0040' }}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-orbitron text-xs text-neon-red">Admin</span>
                          <span className="font-mono text-xs text-gray-600">{r.date}</span>
                        </div>
                        <p className="font-rajdhani text-sm text-gray-300">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <textarea value={reportText} onChange={e => setReportText(e.target.value)}
                  placeholder="Добавить отчёт о выполненной работе..."
                  rows={3} className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none mb-3"
                  style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }} />
                <button onClick={handleReport} disabled={!reportText.trim()} className="neon-btn-red px-6 py-2 text-xs rounded disabled:opacity-40">
                  <span className="flex items-center gap-2"><Icon name="Send" size={14} />Добавить отчёт</span>
                </button>
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl h-fit" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
              <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// СТАТУС ЗАЯВКИ</div>
              <div className="space-y-2">
                {(Object.keys(statusConfig) as AppOrder['status'][]).map(s => {
                  const c = statusConfig[s];
                  return (
                    <button key={s} onClick={() => handleStatus(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-rajdhani font-600 transition-all"
                      style={selectedOrder.status === s ? { background: `${c.color}20`, border: `1px solid ${c.color}50`, color: c.color } : { border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                      <Icon name={c.icon as Parameters<typeof Icon>[0]['name']} size={14} />{c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TICKET DETAIL
  if (selectedTicket) {
    const cfg = ticketStatusConfig[selectedTicket.status];
    const handleReply = async () => {
      if (!ticketReply.trim()) return;
      const updated = await ticketsApi.reply(selectedTicket.id, ticketReply);
      setSelectedTicket(updated.ticket);
      setTickets(prev => prev.map(t => t.id === updated.ticket.id ? updated.ticket : t));
      setTicketReply('');
    };
    const handleStatus = async (status: AppTicket['status']) => {
      const updated = await ticketsApi.setStatus(selectedTicket.id, status);
      setSelectedTicket(updated.ticket);
      setTickets(prev => prev.map(t => t.id === updated.ticket.id ? updated.ticket : t));
    };
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-gray-500 hover:text-neon-red transition-colors mb-8">
            <Icon name="ArrowLeft" size={16} /><span className="font-rajdhani text-sm">Назад к тикетам</span>
          </button>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono text-xs text-gray-500 mb-1">{selectedTicket.id} · {selectedTicket.createdAt}</div>
                    <h2 className="font-orbitron font-700 text-white">{selectedTicket.subject}</h2>
                    <div className="font-rajdhani text-sm text-gray-400">от {selectedTicket.clientName}</div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</div>
                </div>
                <div className="font-rajdhani text-gray-300 text-sm leading-relaxed p-4 rounded-lg" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
                  {selectedTicket.message}
                </div>
              </div>
              {selectedTicket.replies.map((r, i) => (
                <div key={i} className="glass-card p-5 rounded-xl" style={{ borderColor: r.isAdmin ? 'rgba(255,0,64,0.3)' : 'rgba(0,255,136,0.2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron"
                      style={{ background: r.isAdmin ? 'rgba(255,0,64,0.2)' : 'rgba(0,255,136,0.1)', color: r.isAdmin ? '#ff0040' : '#00ff88' }}>
                      {r.author[0]}
                    </div>
                    <span className="font-orbitron text-xs font-600" style={{ color: r.isAdmin ? '#ff0040' : '#00ff88' }}>
                      {r.isAdmin ? '⚡ ' : ''}{r.author}
                    </span>
                    <span className="font-mono text-xs text-gray-600">{r.date}</span>
                  </div>
                  <p className="font-rajdhani text-sm text-gray-300">{r.text}</p>
                </div>
              ))}
              {selectedTicket.status !== 'closed' && (
                <div className="glass-card p-5 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
                  <div className="text-xs font-mono text-gray-500 mb-3 tracking-widest">// ОТВЕТ АДМИНИСТРАТОРА</div>
                  <textarea value={ticketReply} onChange={e => setTicketReply(e.target.value)}
                    placeholder="Введите ответ клиенту..." rows={4}
                    className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none mb-3"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }} />
                  <button onClick={handleReply} disabled={!ticketReply.trim()} className="neon-btn-red px-6 py-2 text-xs rounded disabled:opacity-40">
                    <span className="flex items-center gap-2"><Icon name="Send" size={14} />Отправить ответ</span>
                  </button>
                </div>
              )}
            </div>
            <div className="glass-card p-5 rounded-xl h-fit" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
              <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// СТАТУС ТИКЕТА</div>
              <div className="space-y-2">
                {(['open', 'answered', 'closed'] as AppTicket['status'][]).map(s => {
                  const c = ticketStatusConfig[s];
                  return (
                    <button key={s} onClick={() => handleStatus(s)}
                      className="w-full px-4 py-3 rounded-lg text-xs font-rajdhani font-600 transition-all text-left"
                      style={selectedTicket.status === s ? { background: `${c.color}20`, border: `1px solid ${c.color}50`, color: c.color } : { border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveNews = async () => {
    if (!newsForm.title.trim() || !newsForm.content.trim()) return;
    if (editingNews) {
      const updated = await newsApi.update({ ...editingNews, ...newsForm });
      setNews(prev => prev.map(n => n.id === updated.news.id ? updated.news : n));
    } else {
      const created = await newsApi.create(newsForm);
      setNews(prev => [created.news, ...prev]);
    }
    setNewsForm({ title: '', content: '', tag: 'Обновление', color: '#00ff88' });
    setEditingNews(null);
    setNewsSaved(true);
    setTimeout(() => setNewsSaved(false), 2500);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Удалить новость?')) return;
    await newsApi.delete(id);
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const handleSavePromo = async () => {
    if (!promoForm.code.trim()) return;
    const data = {
      code: promoForm.code,
      description: promoForm.description,
      discountType: promoForm.discountType,
      discountValue: promoForm.discountValue,
      maxUses: promoForm.maxUses ? parseInt(promoForm.maxUses) : null,
    };
    if (editingPromo) {
      const updated = await promocodesApi.update({ ...editingPromo, ...data });
      setPromos(prev => prev.map(p => p.id === updated.promo.id ? updated.promo : p));
    } else {
      const created = await promocodesApi.create(data);
      setPromos(prev => [created.promo, ...prev]);
    }
    setPromoForm({ code: '', description: '', discountType: 'percent', discountValue: 10, maxUses: '' });
    setEditingPromo(null);
    setPromoSaved(true);
    setTimeout(() => setPromoSaved(false), 2500);
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Удалить промокод?')) return;
    await promocodesApi.delete(id);
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  const handleTogglePromo = async (promo: Promocode) => {
    const updated = await promocodesApi.update({ ...promo, isActive: !promo.isActive });
    setPromos(prev => prev.map(p => p.id === updated.promo.id ? updated.promo : p));
  };

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Обзор', icon: 'LayoutDashboard' },
    { id: 'orders', label: 'Заказы', icon: 'ShoppingCart', badge: stats.pendingOrders },
    { id: 'tickets', label: 'Тикеты', icon: 'Headphones', badge: stats.openTickets },
    { id: 'news', label: 'Новости', icon: 'Newspaper' },
    { id: 'promocodes', label: 'Промокоды', icon: 'Tag' },
  ];

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-1">// ПАНЕЛЬ УПРАВЛЕНИЯ</div>
            <h1 className="font-orbitron text-3xl font-900" style={{ color: '#ff0040', textShadow: '0 0 15px rgba(255,0,64,0.4)' }}>Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}>
              {user.avatar && <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />}
              <span className="font-mono text-xs" style={{ color: '#00ff88' }}>{user.username}</span>
            </div>
            <button onClick={load} className="flex items-center gap-2 text-xs font-rajdhani text-gray-500 hover:text-neon-green transition-colors px-3 py-2 rounded border border-gray-800 hover:border-neon-green">
              <Icon name="RefreshCw" size={14} />{loading ? '...' : 'Обновить'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-orbitron font-600 tracking-wider uppercase rounded transition-all duration-300 relative"
              style={tab === t.id ? { background: 'rgba(255,0,64,0.2)', border: '1px solid rgba(255,0,64,0.5)', color: '#ff0040' } : { border: '1px solid rgba(255,255,255,0.1)', color: '#666' }}>
              <Icon name={t.icon as Parameters<typeof Icon>[0]['name']} size={14} />
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-orbitron" style={{ background: '#ff0040', color: '#fff', fontSize: '9px' }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Всего заказов', value: stats.orders, color: '#00ff88', icon: 'ShoppingCart' },
                { label: 'Новых заказов', value: stats.pendingOrders, color: '#ffff00', icon: 'Clock' },
                { label: 'Открытых тикетов', value: stats.openTickets, color: '#ff0040', icon: 'Headphones' },
                { label: 'Новостей', value: stats.news, color: '#00ffff', icon: 'Newspaper' },
                { label: 'Промокодов', value: stats.promos, color: '#ff88ff', icon: 'Tag' },
              ].map((s, i) => (
                <div key={i} className="glass-card p-5 rounded-xl text-center" style={{ borderColor: `${s.color}20` }}>
                  <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={20} className="mx-auto mb-2" style={{ color: s.color }} />
                  <div className="font-orbitron text-2xl font-900" style={{ color: s.color, textShadow: `0 0 10px ${s.color}` }}>{s.value}</div>
                  <div className="font-rajdhani text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-5 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.15)' }}>
                <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// ПОСЛЕДНИЕ ЗАКАЗЫ</div>
                {orders.slice(0, 4).map(o => {
                  const cfg = statusConfig[o.status];
                  return (
                    <button key={o.id} onClick={() => { setTab('orders'); setSelectedOrder(o); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all text-left mb-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-orbitron text-xs text-white truncate">{o.title}</div>
                        <div className="font-mono text-xs text-gray-600">{o.clientName} · {o.createdAt}</div>
                      </div>
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: cfg.color }}>{cfg.label}</span>
                    </button>
                  );
                })}
                {orders.length === 0 && <p className="text-gray-600 font-rajdhani text-sm text-center py-4">Заказов нет</p>}
              </div>
              <div className="glass-card p-5 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.15)' }}>
                <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// ОТКРЫТЫЕ ТИКЕТЫ</div>
                {tickets.filter(t => t.status === 'open').slice(0, 4).map(t => (
                  <button key={t.id} onClick={() => { setTab('tickets'); setSelectedTicket(t); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all text-left mb-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-yellow-400"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-orbitron text-xs text-white truncate">{t.subject}</div>
                      <div className="font-mono text-xs text-gray-600">{t.clientName} · {t.createdAt}</div>
                    </div>
                    <span className="text-xs font-mono text-yellow-400">Открыт</span>
                  </button>
                ))}
                {tickets.filter(t => t.status === 'open').length === 0 && <p className="text-gray-600 font-rajdhani text-sm text-center py-4">Открытых тикетов нет</p>}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,0,64,0.1)' }}>
              <div className="text-xs font-mono text-gray-500 tracking-widest">// ЗАКАЗЫ ({orders.length})</div>
            </div>
            {orders.length === 0 ? (
              <div className="p-16 text-center"><Icon name="ShoppingCart" size={40} className="mx-auto mb-4 text-gray-700" /><p className="font-rajdhani text-gray-600">Заказов нет</p></div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {orders.map(order => {
                  const cfg = statusConfig[order.status];
                  return (
                    <button key={order.id} onClick={() => setSelectedOrder(order)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-orbitron text-xs font-600 text-white truncate">{order.title}</span>
                          <span className="font-mono text-xs text-gray-600 flex-shrink-0">{order.id}</span>
                        </div>
                        <div className="font-rajdhani text-xs text-gray-500">{order.clientName} · {order.createdAt} · {order.budget}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="px-2 py-1 rounded text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</div>
                        <Icon name="ChevronRight" size={14} className="text-gray-600 group-hover:text-neon-red transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TICKETS */}
        {tab === 'tickets' && (
          <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,0,64,0.1)' }}>
              <div className="text-xs font-mono text-gray-500 tracking-widest">// ТИКЕТЫ ({tickets.length})</div>
            </div>
            {tickets.length === 0 ? (
              <div className="p-16 text-center"><Icon name="Headphones" size={40} className="mx-auto mb-4 text-gray-700" /><p className="font-rajdhani text-gray-600">Тикетов нет</p></div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {tickets.map(ticket => {
                  const cfg = ticketStatusConfig[ticket.status];
                  return (
                    <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-orbitron text-xs font-600 text-white truncate">{ticket.subject}</span>
                          <span className="font-mono text-xs text-gray-600 flex-shrink-0">{ticket.id}</span>
                        </div>
                        <div className="font-rajdhani text-xs text-gray-500">{ticket.clientName} · {ticket.createdAt} · {ticket.replies.length} ответов</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="px-2 py-1 rounded text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</div>
                        <Icon name="ChevronRight" size={14} className="text-gray-600 group-hover:text-neon-red transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NEWS */}
        {tab === 'news' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
              <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest">// {editingNews ? 'РЕДАКТИРОВАТЬ НОВОСТЬ' : 'СОЗДАТЬ НОВОСТЬ'}</div>
              {newsSaved && (
                <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
                  <Icon name="CheckCircle" size={14} style={{ color: '#00ff88' }} />
                  <span className="font-rajdhani text-sm" style={{ color: '#00ff88' }}>Новость сохранена!</span>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ЗАГОЛОВОК <span className="text-neon-red">*</span></label>
                  <input type="text" value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Заголовок новости..." className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ТЕКСТ <span className="text-neon-red">*</span></label>
                  <textarea value={newsForm.content} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Текст новости..." rows={5} className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ТЕГ</label>
                    <select value={newsForm.tag} onChange={e => setNewsForm(p => ({ ...p, tag: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }}>
                      {NEWS_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ЦВЕТ</label>
                    <div className="flex gap-2">
                      {NEWS_COLORS.map(c => (
                        <button key={c.value} onClick={() => setNewsForm(p => ({ ...p, color: c.value }))}
                          className="w-8 h-8 rounded-full transition-all"
                          style={{ background: c.value, boxShadow: newsForm.color === c.value ? `0 0 12px ${c.value}` : 'none', border: newsForm.color === c.value ? `2px solid white` : '2px solid transparent' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveNews} disabled={!newsForm.title.trim() || !newsForm.content.trim()} className="neon-btn-red flex-1 py-3 text-xs rounded disabled:opacity-40">
                    <span className="flex items-center justify-center gap-2">
                      <Icon name={editingNews ? 'Save' : 'Plus'} size={14} />
                      {editingNews ? 'Сохранить' : 'Опубликовать'}
                    </span>
                  </button>
                  {editingNews && (
                    <button onClick={() => { setEditingNews(null); setNewsForm({ title: '', content: '', tag: 'Обновление', color: '#00ff88' }); }}
                      className="px-4 py-3 text-xs font-orbitron text-gray-500 hover:text-gray-300 rounded border border-gray-800 hover:border-gray-600 transition-all">
                      Отмена
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-mono text-gray-500 tracking-widest px-1">// ОПУБЛИКОВАННЫЕ НОВОСТИ ({news.length})</div>
              {news.length === 0 && <div className="glass-card p-8 rounded-xl text-center"><Icon name="Newspaper" size={32} className="mx-auto mb-3 text-gray-700" /><p className="font-rajdhani text-gray-600">Новостей нет</p></div>}
              {news.map(n => (
                <div key={n.id} className="glass-card p-4 rounded-xl" style={{ borderColor: `${n.color}20` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color, boxShadow: `0 0 6px ${n.color}` }}></div>
                        <span className="text-xs font-mono" style={{ color: n.color }}>{n.tag}</span>
                        <span className="font-mono text-xs text-gray-600">{n.createdAt}</span>
                      </div>
                      <h3 className="font-orbitron text-xs font-600 text-white truncate">{n.title}</h3>
                      <p className="font-rajdhani text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingNews(n); setNewsForm({ title: n.title, content: n.content, tag: n.tag, color: n.color }); }}
                        className="text-gray-600 hover:text-neon-green transition-colors p-1">
                        <Icon name="Edit2" size={14} />
                      </button>
                      <button onClick={() => handleDeleteNews(n.id)}
                        className="text-gray-600 hover:text-neon-red transition-colors p-1">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMOCODES */}
        {tab === 'promocodes' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl" style={{ borderColor: 'rgba(255,0,64,0.2)' }}>
              <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest">// {editingPromo ? 'РЕДАКТИРОВАТЬ ПРОМОКОД' : 'СОЗДАТЬ ПРОМОКОД'}</div>
              {promoSaved && (
                <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
                  <Icon name="CheckCircle" size={14} style={{ color: '#00ff88' }} />
                  <span className="font-rajdhani text-sm" style={{ color: '#00ff88' }}>Промокод сохранён!</span>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">КОД <span className="text-neon-red">*</span></label>
                  <input type="text" value={promoForm.code} onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="SUMMER2026" className="w-full px-4 py-3 rounded-lg font-mono text-sm focus:outline-none tracking-widest"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#00ff88' }} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ОПИСАНИЕ</label>
                  <input type="text" value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Летняя акция 2026..." className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ТИП СКИДКИ</label>
                    <select value={promoForm.discountType} onChange={e => setPromoForm(p => ({ ...p, discountType: e.target.value as 'percent' | 'fixed' }))}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }}>
                      <option value="percent">Процент (%)</option>
                      <option value="fixed">Фиксированная (₽)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">РАЗМЕР СКИДКИ</label>
                    <input type="number" value={promoForm.discountValue} onChange={e => setPromoForm(p => ({ ...p, discountValue: parseInt(e.target.value) || 0 }))}
                      min={1} max={promoForm.discountType === 'percent' ? 100 : 999999}
                      className="w-full px-4 py-3 rounded-lg font-mono text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#00ff88' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ЛИМИТ ИСПОЛЬЗОВАНИЙ (пусто = безлимит)</label>
                  <input type="number" value={promoForm.maxUses} onChange={e => setPromoForm(p => ({ ...p, maxUses: e.target.value }))}
                    placeholder="Без ограничений..." min={1}
                    className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(255,0,64,0.3)', color: '#e0e0e0' }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSavePromo} disabled={!promoForm.code.trim()} className="neon-btn-red flex-1 py-3 text-xs rounded disabled:opacity-40">
                    <span className="flex items-center justify-center gap-2">
                      <Icon name={editingPromo ? 'Save' : 'Plus'} size={14} />
                      {editingPromo ? 'Сохранить' : 'Создать промокод'}
                    </span>
                  </button>
                  {editingPromo && (
                    <button onClick={() => { setEditingPromo(null); setPromoForm({ code: '', description: '', discountType: 'percent', discountValue: 10, maxUses: '' }); }}
                      className="px-4 py-3 text-xs font-orbitron text-gray-500 hover:text-gray-300 rounded border border-gray-800 hover:border-gray-600 transition-all">
                      Отмена
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-mono text-gray-500 tracking-widest px-1">// ПРОМОКОДЫ ({promos.length})</div>
              {promos.length === 0 && <div className="glass-card p-8 rounded-xl text-center"><Icon name="Tag" size={32} className="mx-auto mb-3 text-gray-700" /><p className="font-rajdhani text-gray-600">Промокодов нет</p></div>}
              {promos.map(p => (
                <div key={p.id} className="glass-card p-4 rounded-xl" style={{ borderColor: p.isActive ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-900 tracking-widest" style={{ color: p.isActive ? '#00ff88' : '#555' }}>{p.code}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: p.isActive ? 'rgba(0,255,136,0.1)' : 'rgba(100,100,100,0.1)', color: p.isActive ? '#00ff88' : '#555' }}>
                          -{p.discountValue}{p.discountType === 'percent' ? '%' : '₽'}
                        </span>
                      </div>
                      {p.description && <div className="font-rajdhani text-xs text-gray-500 mb-1">{p.description}</div>}
                      <div className="font-mono text-xs text-gray-700">
                        {p.usesCount}{p.maxUses ? `/${p.maxUses}` : ''} использований · {p.createdAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handleTogglePromo(p)}
                        className="p-1 transition-colors"
                        style={{ color: p.isActive ? '#00ff88' : '#555' }}>
                        <Icon name={p.isActive ? 'ToggleRight' : 'ToggleLeft'} size={18} />
                      </button>
                      <button onClick={() => { setEditingPromo(p); setPromoForm({ code: p.code, description: p.description, discountType: p.discountType, discountValue: p.discountValue, maxUses: p.maxUses?.toString() || '' }); }}
                        className="text-gray-600 hover:text-neon-green transition-colors p-1">
                        <Icon name="Edit2" size={14} />
                      </button>
                      <button onClick={() => handleDeletePromo(p.id)}
                        className="text-gray-600 hover:text-neon-red transition-colors p-1">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
