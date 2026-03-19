import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HomePage from './HomePage';
import ServicesPage from './ServicesPage';
import PortfolioPage from './PortfolioPage';
import OrderPage, { type Order } from './OrderPage';
import MyOrdersPage from './MyOrdersPage';
import AdminPage from './AdminPage';
import ProfilePage from './ProfilePage';
import SupportPage from './SupportPage';

interface User {
  name: string;
  avatar: string;
  isAdmin: boolean;
  discord?: string;
  bio?: string;
  email?: string;
}

export default function Index() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCategory, setOrderCategory] = useState<string | undefined>(undefined);

  const handleLogin = () => {
    setUser({
      name: 'SurvivorX',
      avatar: '',
      isAdmin: false,
      discord: 'SurvivorX#1337',
      bio: '',
      email: '',
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleOrderClick = (category?: string) => {
    setOrderCategory(category);
    setCurrentPage('orders');
  };

  const handleOrderCreated = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onOrderClick={handleOrderClick} />;
      case 'services':
        return <ServicesPage onOrderClick={handleOrderClick} />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'orders':
        return (
          <OrderPage
            initialCategory={orderCategory}
            user={user}
            onLogin={handleLogin}
            onOrderCreated={handleOrderCreated}
          />
        );
      case 'my-orders':
        return (
          <MyOrdersPage
            orders={orders}
            user={user}
            onLogin={handleLogin}
            onOrderClick={handleOrderClick}
          />
        );
      case 'admin':
        return (
          <AdminPage
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            onLogin={handleLogin}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            user={user}
            orders={orders}
            onLogin={handleLogin}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'support':
        return <SupportPage user={user} onLogin={handleLogin} />;
      default:
        return <HomePage onNavigate={setCurrentPage} onOrderClick={handleOrderClick} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#050a0e', fontFamily: 'Rajdhani, sans-serif' }}>
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="page-transition" key={currentPage}>
        {renderPage()}
      </main>
    </div>
  );
}
