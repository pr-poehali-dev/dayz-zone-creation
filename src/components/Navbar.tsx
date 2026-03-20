import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; avatar: string; isAdmin: boolean } | null;
  onLogin: () => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'home', label: 'Главная', icon: 'Home' },
  { id: 'services', label: 'Услуги', icon: 'Layers' },
  { id: 'portfolio', label: 'Портфолио', icon: 'FolderOpen' },
  { id: 'orders', label: 'Заказы', icon: 'ShoppingCart' },
  { id: 'promocodes', label: 'Промокоды', icon: 'Tag' },
  { id: 'support', label: 'Поддержка', icon: 'Headphones' },
];

export default function Navbar({ currentPage, onNavigate, user, onLogin, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(5,10,14,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,255,136,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 border-2 border-neon-green rotate-45 group-hover:rotate-90 transition-transform duration-500" style={{ boxShadow: '0 0 10px #00ff88' }}></div>
            <div className="absolute inset-1 border border-neon-cyan rotate-12"></div>
          </div>
          <span className="font-orbitron font-900 text-xl tracking-widest" style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88' }}>
            DAYZ<span style={{ color: '#00ffff' }}>ZONE</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-rajdhani font-600 tracking-wider uppercase transition-all duration-300 ${
                currentPage === item.id
                  ? 'text-neon-green'
                  : 'text-gray-400 hover:text-neon-green'
              }`}
              style={currentPage === item.id ? { textShadow: '0 0 8px #00ff88' } : {}}
            >
              <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={14} />
              {item.label}
              {currentPage === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-px" style={{ background: '#00ff88', boxShadow: '0 0 5px #00ff88' }}></span>
              )}
            </button>
          ))}
          {user && (
            <>
              <button
                onClick={() => onNavigate('my-orders')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-rajdhani font-600 tracking-wider uppercase transition-all duration-300 ${currentPage === 'my-orders' ? 'text-neon-green' : 'text-gray-400 hover:text-neon-green'}`}
              >
                <Icon name="FileText" size={14} />
                Мои заявки
              </button>
              {user.isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-rajdhani font-600 tracking-wider uppercase transition-all duration-300 ${currentPage === 'admin' ? 'text-neon-red' : 'text-red-400 hover:text-neon-red'}`}
                  style={currentPage === 'admin' ? { textShadow: '0 0 8px #ff0040' } : {}}
                >
                  <Icon name="Shield" size={14} />
                  Админ
                </button>
              )}
            </>
          )}
        </div>

        {/* Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full overflow-hidden neon-border">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-card text-neon-green text-xs font-orbitron">
                      {user.name[0]}
                    </div>
                  )}
                </div>
                <span className="text-sm font-rajdhani text-neon-green group-hover:text-neon-cyan transition-colors">{user.name}</span>
              </button>
              <button onClick={onLogout} className="text-gray-500 hover:text-neon-red transition-colors">
                <Icon name="LogOut" size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="neon-btn px-5 py-2 text-xs rounded">
              <span className="flex items-center gap-2">
                <Icon name="Gamepad2" size={14} />
                Войти через Discord
              </span>
            </button>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-neon-green">
          <Icon name={menuOpen ? 'X' : 'Menu'} size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t" style={{ borderColor: 'rgba(0,255,136,0.15)', background: 'rgba(5,10,14,0.98)' }}>
          <div className="px-4 py-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-rajdhani font-600 tracking-wider uppercase ${currentPage === item.id ? 'text-neon-green' : 'text-gray-400'}`}
              >
                <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={16} />
                {item.label}
              </button>
            ))}
            {user && (
              <button onClick={() => { onNavigate('my-orders'); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-rajdhani text-gray-400">
                <Icon name="FileText" size={16} />
                Мои заявки
              </button>
            )}
            <div className="pt-3 border-t" style={{ borderColor: 'rgba(0,255,136,0.1)' }}>
              {user ? (
                <button onClick={() => { onNavigate('profile'); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-neon-green font-rajdhani">
                  <Icon name="User" size={16} />
                  {user.name}
                </button>
              ) : (
                <button onClick={() => { onLogin(); setMenuOpen(false); }} className="neon-btn w-full px-4 py-3 text-xs rounded">
                  Войти через Discord
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}