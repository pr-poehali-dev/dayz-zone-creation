import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { chatApi, type ChatMessage, type AppUser } from '@/lib/api';

interface ChatWidgetProps {
  user: AppUser | null;
  onLogin: () => void;
}

export default function ChatWidget({ user, onLogin }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = async () => {
    try {
      const d = await chatApi.list();
      setMessages(d.messages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    intervalRef.current = setInterval(loadMessages, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await chatApi.send(text.trim());
      setMessages(prev => [...prev, res.message]);
      setText('');
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'rgba(0,255,136,0.2)', height: 480 }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,255,136,0.1)', background: 'rgba(0,255,136,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88', boxShadow: '0 0 8px #00ff88' }}></div>
          <span className="font-orbitron text-sm font-700 text-white">ОБЩИЙ ЧАТ</span>
        </div>
        <span className="font-mono text-xs text-gray-600">{messages.length} сообщений</span>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-3" style={{ height: 340 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-2 border-neon-green border-t-transparent animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon name="MessageCircle" size={32} style={{ color: '#333', marginBottom: 12 }} />
            <div className="font-mono text-xs text-gray-600">Пока нет сообщений</div>
            <div className="font-rajdhani text-xs text-gray-700 mt-1">Будь первым!</div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${user?.id === msg.userId ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
                style={{ border: '1px solid rgba(0,255,136,0.2)' }}>
                {msg.avatar ? (
                  <img src={msg.avatar} alt={msg.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-orbitron text-xs"
                    style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                    {msg.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className={`max-w-[70%] ${user?.id === msg.userId ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`flex items-center gap-2 mb-1 ${user?.id === msg.userId ? 'flex-row-reverse' : ''}`}>
                  <span className="font-mono text-xs font-700" style={{ color: '#00ff88' }}>{msg.username}</span>
                  <span className="font-mono text-xs text-gray-700">{msg.createdAt}</span>
                </div>
                <div className="px-3 py-2 rounded-lg font-rajdhani text-sm text-gray-300 break-words"
                  style={{
                    background: user?.id === msg.userId ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${user?.id === msg.userId ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {user ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Написать сообщение..."
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-lg font-rajdhani text-sm focus:outline-none"
              style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)' }}
            >
              <Icon name="Send" size={16} style={{ color: '#00ff88' }} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="w-full py-2 rounded-lg font-rajdhani text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}
          >
            <Icon name="LogIn" size={14} />
            Войти через Discord чтобы писать
          </button>
        )}
      </div>
    </div>
  );
}
