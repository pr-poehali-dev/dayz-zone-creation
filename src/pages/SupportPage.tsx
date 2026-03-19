import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { ticketsApi, type AppTicket } from '@/lib/api';

interface SupportPageProps {
  user: { name: string; avatar: string; isAdmin: boolean } | null;
  onLogin: () => void;
}

export default function SupportPage({ user, onLogin }: SupportPageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'tickets'>('create');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<AppTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<AppTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'tickets') {
      loadTickets();
    }
  }, [user, activeTab]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketsApi.list();
      setTickets(data.tickets);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    try {
      const data = await ticketsApi.create({ subject, message, clientName: user?.name || 'Гость' });
      setTickets(prev => [data.ticket, ...prev]);
      setSubject('');
      setMessage('');
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setActiveTab('tickets'); }, 2000);
    } catch {
      // silent
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const data = await ticketsApi.reply(selectedTicket.id, replyText);
      setSelectedTicket(data.ticket);
      setTickets(prev => prev.map(t => t.id === data.ticket.id ? data.ticket : t));
      setReplyText('');
    } catch {
      // silent
    }
  };

  const ticketStatusCfg = {
    open: { label: 'Открыт', color: '#ffff00' },
    answered: { label: 'Отвечен', color: '#00ff88' },
    closed: { label: 'Закрыт', color: '#888' },
  };

  if (selectedTicket) {
    const cfg = ticketStatusCfg[selectedTicket.status];
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-gray-500 hover:text-neon-green transition-colors mb-8">
            <Icon name="ArrowLeft" size={16} />
            <span className="font-rajdhani text-sm">Назад к тикетам</span>
          </button>

          <div className="glass-card p-6 rounded-xl mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-xs text-gray-500 mb-1">{selectedTicket.id} · {selectedTicket.createdAt}</div>
                <h2 className="font-orbitron font-700 text-white">{selectedTicket.subject}</h2>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                {cfg.label}
              </div>
            </div>
            <div className="font-rajdhani text-gray-300 text-sm leading-relaxed p-4 rounded-lg" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
              {selectedTicket.message}
            </div>
          </div>

          {selectedTicket.replies.map((r, i) => (
            <div key={i} className="glass-card p-5 rounded-xl mb-3" style={{ borderColor: r.isAdmin ? 'rgba(255,0,64,0.3)' : 'rgba(0,255,136,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron"
                  style={{ background: r.isAdmin ? 'rgba(255,0,64,0.2)' : 'rgba(0,255,136,0.1)', color: r.isAdmin ? '#ff0040' : '#00ff88' }}>
                  {r.author[0]}
                </div>
                <div>
                  <span className="font-orbitron text-xs font-600" style={{ color: r.isAdmin ? '#ff0040' : '#00ff88' }}>
                    {r.isAdmin ? '⚡ Admin' : r.author}
                  </span>
                  <span className="font-mono text-xs text-gray-600 ml-2">{r.date}</span>
                </div>
              </div>
              <p className="font-rajdhani text-gray-300 text-sm">{r.text}</p>
            </div>
          ))}

          {user && selectedTicket.status !== 'closed' && (
            <div className="glass-card p-5 rounded-xl">
              <div className="text-xs font-mono text-gray-500 mb-3 tracking-widest">// ОТВЕТИТЬ</div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Ваш ответ..." rows={4}
                className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none mb-3"
                style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }} />
              <button onClick={handleReply} disabled={!replyText.trim()} className="neon-btn px-6 py-2 text-xs rounded disabled:opacity-40">
                <span className="flex items-center gap-2"><Icon name="Send" size={14} />Отправить</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// ПОДДЕРЖКА</div>
          <h1 className="font-orbitron text-4xl font-900 mb-4 text-white">Тех. Поддержка</h1>
          <div className="w-32 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #00ffff, transparent)' }}></div>
          <p className="font-rajdhani text-gray-400">Создайте тикет и мы ответим в ближайшее время</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <a href="#" className="glass-card p-5 rounded-xl text-center hover:scale-105 transition-all duration-300 block">
            <span className="text-3xl block mb-2">✈️</span>
            <div className="font-orbitron text-xs font-600 text-white mb-1">Telegram</div>
            <div className="font-rajdhani text-xs text-gray-400">Ответим за 15 мин</div>
          </a>
          <a href="#" className="glass-card p-5 rounded-xl text-center hover:scale-105 transition-all duration-300 block">
            <span className="text-3xl block mb-2">🎮</span>
            <div className="font-orbitron text-xs font-600 text-white mb-1">Discord</div>
            <div className="font-rajdhani text-xs text-gray-400">Войти на сервер</div>
          </a>
          <div className="glass-card p-5 rounded-xl text-center" style={{ borderColor: 'rgba(0,255,136,0.3)' }}>
            <span className="text-3xl block mb-2">📝</span>
            <div className="font-orbitron text-xs font-600 text-neon-green mb-1">Тикет</div>
            <div className="font-rajdhani text-xs text-gray-400">Прямо здесь</div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {[{ id: 'create', label: 'Создать тикет', icon: 'Plus' }, { id: 'tickets', label: 'Мои тикеты', icon: 'List' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as 'create' | 'tickets')}
              className="flex items-center gap-2 px-5 py-2 text-xs font-orbitron font-600 tracking-wider uppercase rounded transition-all duration-300"
              style={activeTab === t.id ? { background: '#00ff88', color: '#050a0e', boxShadow: '0 0 20px rgba(0,255,136,0.4)' } : { border: '1px solid rgba(0,255,136,0.2)', color: '#666' }}>
              <Icon name={t.icon as any} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'create' && (
          <div className="glass-card p-6 rounded-xl">
            {submitted ? (
              <div className="text-center py-10">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4" style={{ color: '#00ff88' }} />
                <h3 className="font-orbitron text-lg font-700 text-white mb-2">Тикет создан!</h3>
                <p className="font-rajdhani text-gray-400">Мы ответим вам в ближайшее время</p>
              </div>
            ) : (
              <>
                {!user && (
                  <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ background: 'rgba(255,255,0,0.05)', border: '1px solid rgba(255,255,0,0.3)' }}>
                    <Icon name="AlertTriangle" size={16} style={{ color: '#ffff00' }} />
                    <span className="font-rajdhani text-sm text-gray-300">Для создания тикета войдите через Discord</span>
                    <button onClick={onLogin} className="ml-auto text-xs neon-btn px-4 py-1 rounded">Войти</button>
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ТЕМА <span className="text-neon-red">*</span></label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="Кратко опишите вопрос..." className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">СООБЩЕНИЕ <span className="text-neon-red">*</span></label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Подробно опишите проблему или вопрос..." rows={6}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }} />
                  </div>
                  <button onClick={handleCreateTicket} disabled={!user || !subject.trim() || !message.trim()}
                    className="neon-btn px-8 py-3 text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed">
                    <span className="flex items-center gap-2"><Icon name="Send" size={16} />Отправить тикет</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            {!user ? (
              <div className="text-center py-16">
                <Icon name="Lock" size={40} className="mx-auto mb-4 text-gray-700" />
                <p className="font-rajdhani text-gray-600 mb-4">Войдите чтобы видеть свои тикеты</p>
                <button onClick={onLogin} className="neon-btn px-6 py-2 text-xs rounded">Войти</button>
              </div>
            ) : loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin mx-auto mb-4"></div>
                <p className="font-rajdhani text-gray-500">Загрузка...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="Inbox" size={40} className="mx-auto mb-4 text-gray-700" />
                <p className="font-rajdhani text-gray-600">Тикетов пока нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => {
                  const cfg = ticketStatusCfg[ticket.status];
                  return (
                    <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                      className="glass-card w-full p-5 rounded-xl text-left group hover:scale-101 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-orbitron text-xs font-600 text-white">{ticket.subject}</span>
                            <span className="font-mono text-xs text-gray-600">{ticket.id}</span>
                          </div>
                          <div className="font-rajdhani text-xs text-gray-500">{ticket.createdAt} · {ticket.replies.length} ответов</div>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                          <Icon name="ChevronRight" size={14} className="text-gray-600 group-hover:text-neon-green transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
