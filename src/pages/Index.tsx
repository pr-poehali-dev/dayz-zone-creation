import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HomePage from './HomePage';
import ServicesPage from './ServicesPage';
import PortfolioPage from './PortfolioPage';
import OrderPage from './OrderPage';
import MyOrdersPage from './MyOrdersPage';
import AdminPage from './AdminPage';
import ProfilePage from './ProfilePage';
import SupportPage from './SupportPage';
import PromocodesPage from './PromocodesPage';
import { authApi, ordersApi, newsApi, type AppUser, type AppOrder, type NewsItem } from '@/lib/api';

interface NavUser {
  name: string;
  avatar: string;
  isAdmin: boolean;
  discord?: string;
  bio?: string;
  email?: string;
}

function toNavUser(u: AppUser): NavUser {
  return { name: u.username, avatar: u.avatar, isAdmin: u.isAdmin, bio: u.bio, email: u.email };
}

export default function Index() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<AppUser | null>(null);
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [orderCategory, setOrderCategory] = useState<string | undefined>(undefined);
  const [authChecked, setAuthChecked] = useState(false);
  const [discordClientId, setDiscordClientId] = useState('');

  useEffect(() => {
    // Загружаем Discord CLIENT_ID из бэкенда
    authApi.config().then(d => setDiscordClientId(d.clientId)).catch(() => {});

    const sid = localStorage.getItem('sessionId');
    if (sid) {
      authApi.me()
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('sessionId'))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }

    // Discord OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      authApi.discordCallback(code).then(data => {
        localStorage.setItem('sessionId', data.sessionId);
        setUser(data.user);
      }).catch(console.error);
    }

    newsApi.list().then(d => setNews(d.news)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      ordersApi.list().then(d => setOrders(d.orders)).catch(() => {});
    } else {
      setOrders([]);
    }
  }, [user]);

  const handleLogin = () => {
    if (!discordClientId) {
      alert('Discord авторизация не настроена. Добавьте DISCORD_CLIENT_ID в секреты проекта.');
      return;
    }
    const redirect = encodeURIComponent(window.location.origin);
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${redirect}&response_type=code&scope=identify`;
  };

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem('sessionId');
    setUser(null);
    setCurrentPage('home');
  };

  const handleOrderClick = (category?: string) => {
    setOrderCategory(category);
    setCurrentPage('orders');
  };

  const handleOrderCreated = (order: AppOrder) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleUpdateOrder = (_id: string, updates: Partial<AppOrder>) => {
    setOrders(prev => prev.map(o => o.id === updates.id ? { ...o, ...updates } : o));
  };

  const handleUpdateUser = async (updates: { name?: string; bio?: string; email?: string }) => {
    try {
      const data = await authApi.updateProfile(updates);
      setUser(data.user);
    } catch { /* silent */ }
  };

  void handleUpdateOrder;

  const navUser = user ? toNavUser(user) : null;

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onOrderClick={handleOrderClick} news={news} user={user} onLogin={handleLogin} />;
      case 'services':
        return <ServicesPage onOrderClick={handleOrderClick} />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'orders':
        return (
          <OrderPage
            initialCategory={orderCategory}
            user={navUser}
            onLogin={handleLogin}
            onOrderCreated={handleOrderCreated}
            apiUser={user}
          />
        );
      case 'my-orders':
        return (
          <MyOrdersPage
            orders={orders}
            user={navUser}
            onLogin={handleLogin}
            onOrderClick={handleOrderClick}
          />
        );
      case 'admin':
        return <AdminPage user={user} onLogin={handleLogin} />;
      case 'profile':
        return (
          <ProfilePage
            user={navUser}
            orders={orders}
            onLogin={handleLogin}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'support':
        return <SupportPage user={navUser} onLogin={handleLogin} />;
      case 'promocodes':
        return <PromocodesPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} onOrderClick={handleOrderClick} news={news} user={user} onLogin={handleLogin} />;
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050a0e' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-neon-green border-t-transparent animate-spin mx-auto mb-4"></div>
          <div className="font-orbitron text-xs text-gray-600 tracking-widest">ЗАГРУЗКА СИСТЕМЫ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#050a0e', fontFamily: 'Rajdhani, sans-serif' }}>
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={navUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="page-transition" key={currentPage}>
        {renderPage()}
      </main>
    </div>
  );
}
