import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface SupportPageProps {
  user: { name: string; avatar: string; isAdmin: boolean } | null;
  onLogin: () => void;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'answered' | 'closed';
  date: string;
  replies: { author: string; text: string; date: string; isAdmin: boolean }[];
}

export default function SupportPage({ user, onLogin }: SupportPageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'tickets'>('create');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCreateTicket = () => {
    if (!subject.trim() || !message.trim()) return;
    const ticket: Ticket = {
      id: `TK-${Date.now().toString(36).toUpperCase()}`,
      subject,
      message,
      status: 'open',
      date: new Date().toLocaleDateString('ru-RU'),
      replies: [],
    };
    setTickets(prev => [ticket, ...prev]);
    setSubject('');
    setMessage('');
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setActiveTab('tickets'); }, 2000);
  };

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim() || !user) return;
    const updated = {
      ...selectedTicket,
      replies: [...selectedTicket.replies, {
        author: user.name,
        text: replyText,
        date: new Date().toLocaleDateString('ru-RU'),
        isAdmin: false,
      }]
    };
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated : t));
    setSelectedTicket(updated);
    setReplyText('');
  };

  if (selectedTicket) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-gray-500 hover:text-neon-green transition-colors mb-8">
            <Icon name="ArrowLeft" size={16} />
            <span className="font-rajdhani text-sm">Назад к тикетам</span>
          </button>

          <div className="glass-card p-6 rounded-xl mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-xs text-gray-500 mb-1">{selectedTicket.id} · {selectedTicket.date}</div>
                <h2 className="font-orbitron font-700 text-white">{selectedTicket.subject}</h2>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: selectedTicket.status === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', color: selectedTicket.status === 'open' ? '#00ff88' : '#888', border: `1px solid ${selectedTicket.status === 'open' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                {selectedTicket.status === 'open' ? 'Открыт' : selectedTicket.status === 'answered' ? 'Отвечен' : 'Закрыт'}
              </div>
            </div>
            <div className="font-rajdhani text-gray-300 text-sm leading-relaxed p-4 rounded-lg" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
              {selectedTicket.message}
            </div>
          </div>

          {/* Replies */}
          {selectedTicket.replies.length > 0 && (
            <div className="space-y-4 mb-6">
              {selectedTicket.replies.map((r, i) => (
                <div key={i} className={`glass-card p-5 rounded-xl ${r.isAdmin ? 'border-neon-red' : ''}`} style={{ borderColor: r.isAdmin ? 'rgba(255,0,64,0.3)' : undefined }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron" style={{ background: r.isAdmin ? 'rgba(255,0,64,0.2)' : 'rgba(0,255,136,0.1)', border: `1px solid ${r.isAdmin ? 'rgba(255,0,64,0.4)' : 'rgba(0,255,136,0.3)'}`, color: r.isAdmin ? '#ff0040' : '#00ff88' }}>
                      {r.author[0]}
                    </div>
                    <div>
                      <span className="font-orbitron text-xs font-600" style={{ color: r.isAdmin ? '#ff0040' : '#00ff88' }}>{r.isAdmin ? '⚡ ' : ''}{r.author}</span>
                      <span className="font-mono text-xs text-gray-600 ml-2">{r.date}</span>
                    </div>
                  </div>
                  <p className="font-rajdhani text-gray-300 text-sm">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {user && selectedTicket.status !== 'closed' && (
            <div className="glass-card p-5 rounded-xl">
              <div className="text-xs font-mono text-gray-500 mb-3 tracking-widest">// ОТВЕТИТЬ</div>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Ваш ответ..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none mb-3"
                style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }}
              />
              <button onClick={handleReply} className="neon-btn px-6 py-2 text-xs rounded">
                Отправить ответ
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
          <p className="font-rajdhani text-gray-400">Создайте тикет и мы ответим вам в ближайшее время</p>
        </div>

        {/* Quick contacts */}
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

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[{ id: 'create', label: 'Создать тикет', icon: 'Plus' }, { id: 'tickets', label: 'Мои тикеты', icon: 'List' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'create' | 'tickets')}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-orbitron font-600 tracking-wider uppercase rounded transition-all duration-300 ${activeTab === tab.id ? 'text-dark-bg' : 'text-gray-400 hover:text-neon-green'}`}
              style={activeTab === tab.id ? { background: '#00ff88', boxShadow: '0 0 20px rgba(0,255,136,0.4)' } : { border: '1px solid rgba(0,255,136,0.2)' }}
            >
              <Icon name={tab.icon as any} size={14} />
              {tab.label}
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
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">ТЕМА ОБРАЩЕНИЯ <span className="text-neon-red">*</span></label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Кратко опишите проблему..."
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 tracking-widest">СООБЩЕНИЕ <span className="text-neon-red">*</span></label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Подробно опишите вашу проблему или вопрос..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }}
                    />
                  </div>
                  <button
                    onClick={handleCreateTicket}
                    disabled={!user || !subject.trim() || !message.trim()}
                    className="neon-btn px-8 py-3 text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="Send" size={16} />
                      Отправить тикет
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            {tickets.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="Inbox" size={40} className="mx-auto mb-4 text-gray-700" />
                <p className="font-rajdhani text-gray-600">Тикетов пока нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="glass-card w-full p-5 rounded-xl text-left group hover:scale-101 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-orbitron text-xs font-600 text-white">{ticket.subject}</span>
                          <span className="font-mono text-xs text-gray-600">{ticket.id}</span>
                        </div>
                        <div className="font-rajdhani text-xs text-gray-500">{ticket.date} · {ticket.replies.length} ответов</div>
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: ticket.status === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', color: ticket.status === 'open' ? '#00ff88' : '#888' }}>
                          {ticket.status === 'open' ? 'Открыт' : 'Закрыт'}
                        </span>
                        <Icon name="ChevronRight" size={14} className="text-gray-600 group-hover:text-neon-green transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
