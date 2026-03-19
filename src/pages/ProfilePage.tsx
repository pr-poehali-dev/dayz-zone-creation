import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Order } from './OrderPage';

interface User {
  name: string;
  avatar: string;
  isAdmin: boolean;
  discord?: string;
  bio?: string;
  email?: string;
}

interface ProfilePageProps {
  user: User | null;
  orders: Order[];
  onLogin: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
}

export default function ProfilePage({ user, orders, onLogin, onUpdateUser }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name || '', bio: user?.bio || '', email: user?.email || '' });
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="User" size={48} className="mx-auto mb-6 text-gray-700" />
          <h2 className="font-orbitron text-xl font-700 text-white mb-3">Профиль</h2>
          <p className="font-rajdhani text-gray-400 mb-6">Войдите чтобы просматривать и редактировать профиль</p>
          <button onClick={onLogin} className="neon-btn px-8 py-3 text-sm rounded">
            Войти через Discord
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onUpdateUser(editData);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const userOrders = orders;
  const completedOrders = userOrders.filter(o => o.status === 'done').length;
  const activeOrders = userOrders.filter(o => o.status === 'in_progress' || o.status === 'reviewing' || o.status === 'pending').length;

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// МОЙ ПРОФИЛЬ</div>
          <h1 className="font-orbitron text-3xl font-900 text-white">Профиль</h1>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.4)' }}>
            <Icon name="CheckCircle" size={16} style={{ color: '#00ff88' }} />
            <span className="font-rajdhani text-sm" style={{ color: '#00ff88' }}>Профиль обновлён!</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-xl mb-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden relative" style={{ border: '2px solid #00ff88', boxShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-orbitron font-900" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                      {user.name[0]}
                    </div>
                  )}
                </div>
                <h2 className="font-orbitron font-700 text-white text-lg">{user.name}</h2>
                {user.isAdmin && (
                  <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-mono" style={{ background: 'rgba(255,0,64,0.15)', color: '#ff0040', border: '1px solid rgba(255,0,64,0.3)' }}>
                    <Icon name="Shield" size={10} />
                    Администратор
                  </div>
                )}
                {user.bio && (
                  <p className="font-rajdhani text-gray-400 text-sm mt-3 leading-relaxed">{user.bio}</p>
                )}
              </div>

              {/* Discord badge */}
              <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.3)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎮</span>
                  <div>
                    <div className="font-orbitron text-xs font-600 text-white">Discord</div>
                    <div className="font-mono text-xs text-gray-400">{user.discord || user.name + '#0000'}</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                </div>
              </div>

              <button onClick={() => setEditing(!editing)} className="neon-btn w-full py-2 text-xs rounded">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Edit2" size={14} />
                  {editing ? 'Отмена' : 'Редактировать'}
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="glass-card p-5 rounded-xl">
              <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// СТАТИСТИКА</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-rajdhani text-sm text-gray-400">Всего заявок</span>
                  <span className="font-orbitron text-sm font-700 text-white">{userOrders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-rajdhani text-sm text-gray-400">Активных</span>
                  <span className="font-orbitron text-sm font-700" style={{ color: '#00ffff' }}>{activeOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-rajdhani text-sm text-gray-400">Выполнено</span>
                  <span className="font-orbitron text-sm font-700" style={{ color: '#00ff88' }}>{completedOrders}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: edit form + orders */}
          <div className="lg:col-span-2 space-y-6">
            {editing && (
              <div className="glass-card p-6 rounded-xl">
                <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// РЕДАКТИРОВАНИЕ</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2">ОТОБРАЖАЕМОЕ ИМЯ</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2">О СЕБЕ</label>
                    <textarea
                      value={editData.bio}
                      onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Расскажите о себе..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none resize-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2">EMAIL (для уведомлений)</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@mail.com"
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <button onClick={handleSave} className="neon-btn px-6 py-3 text-sm rounded">
                    <span className="flex items-center gap-2">
                      <Icon name="Save" size={16} />
                      Сохранить изменения
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Recent orders */}
            <div className="glass-card p-6 rounded-xl">
              <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// МОИ ПОСЛЕДНИЕ ЗАЯВКИ</div>
              {userOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="FileText" size={32} className="mx-auto mb-3 text-gray-700" />
                  <p className="font-rajdhani text-gray-600 text-sm">У вас пока нет заявок</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.slice(0, 5).map(order => {
                    const statusColors: Record<Order['status'], string> = {
                      pending: '#ffff00', reviewing: '#00ffff', in_progress: '#00ff88', done: '#00ff88', cancelled: '#ff0040'
                    };
                    const statusLabels: Record<Order['status'], string> = {
                      pending: 'Ожидает', reviewing: 'Рассматривается', in_progress: 'В работе', done: 'Выполнен', cancelled: 'Отменён'
                    };
                    return (
                      <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="font-orbitron text-xs font-600 text-white truncate">{order.title}</div>
                          <div className="font-mono text-xs text-gray-600">{order.id} · {order.createdAt}</div>
                        </div>
                        <div className="text-xs font-mono px-2 py-1 rounded flex-shrink-0" style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status] }}>
                          {statusLabels[order.status]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
