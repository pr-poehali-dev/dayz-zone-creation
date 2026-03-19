import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface OrderPageProps {
  initialCategory?: string;
  user: { name: string; avatar: string; isAdmin: boolean } | null;
  onLogin: () => void;
  onOrderCreated: (order: Order) => void;
}

export interface Order {
  id: string;
  category: string;
  title: string;
  status: 'pending' | 'reviewing' | 'in_progress' | 'done' | 'cancelled';
  createdAt: string;
  budget: string;
  deadline: string;
  details: Record<string, string>;
  clientName: string;
  reports: { date: string; text: string; author: string }[];
}

const categories = [
  { id: 'server', label: 'Сервер DayZ', icon: 'Server', color: '#00ff88' },
  { id: 'bot', label: 'Discord бот', icon: 'Bot', color: '#00ffff' },
  { id: 'website', label: 'Веб-сайт', icon: 'Globe', color: '#ff0040' },
  { id: 'design', label: 'Инфографика / Оформление', icon: 'Palette', color: '#ffff00' },
];

const deadlines = ['1–3 дня', '1 неделя', '2 недели', '1 месяц', 'Свой срок'];
const budgets = ['до 1 000 ₽', '1 000–3 000 ₽', '3 000–10 000 ₽', '10 000–30 000 ₽', 'Свой бюджет'];

const formFields: Record<string, { label: string; type: string; placeholder: string; required: boolean }[]> = {
  server: [
    { label: 'Название сервера', type: 'text', placeholder: 'Например: BlackOut DayZ', required: true },
    { label: 'Версия DayZ', type: 'text', placeholder: 'Например: 1.25', required: true },
    { label: 'Количество слотов', type: 'text', placeholder: 'Например: 60', required: true },
    { label: 'Тип сервера (PvP/PvE/RP)', type: 'text', placeholder: 'Например: PvP с элементами PvE', required: true },
    { label: 'Список желаемых модов', type: 'textarea', placeholder: 'Перечислите моды или опишите желаемый геймплей', required: true },
    { label: 'Особые пожелания', type: 'textarea', placeholder: 'Уникальные механики, лор, трейдеры и т.д.', required: false },
  ],
  bot: [
    { label: 'Название бота', type: 'text', placeholder: 'Например: Zone Guardian', required: true },
    { label: 'Назначение бота', type: 'text', placeholder: 'Модерация, статистика, музыка...', required: true },
    { label: 'Основные команды', type: 'textarea', placeholder: 'Перечислите нужные команды и функции', required: true },
    { label: 'Интеграции', type: 'text', placeholder: 'Например: связь с DayZ сервером, Twitch API', required: false },
    { label: 'Особые пожелания', type: 'textarea', placeholder: 'Дополнительный функционал или детали', required: false },
  ],
  website: [
    { label: 'Тип сайта', type: 'text', placeholder: 'Лендинг, портал, магазин, панель...', required: true },
    { label: 'Цель сайта', type: 'textarea', placeholder: 'Для чего нужен сайт, кто будет им пользоваться', required: true },
    { label: 'Примеры сайтов (референсы)', type: 'text', placeholder: 'Ссылки на похожие сайты, которые нравятся', required: false },
    { label: 'Нужные разделы', type: 'textarea', placeholder: 'Главная, каталог, форум, личный кабинет...', required: true },
    { label: 'Особые пожелания', type: 'textarea', placeholder: 'Авторизация, оплата, интеграции...', required: false },
  ],
  design: [
    { label: 'Тип работы', type: 'text', placeholder: 'Баннер, логотип, оформление дискорда...', required: true },
    { label: 'Стиль', type: 'text', placeholder: 'Тёмный, киберпанк, реалистичный...', required: true },
    { label: 'Цветовая гамма', type: 'text', placeholder: 'Например: зелёный + чёрный + серый', required: false },
    { label: 'Размеры/форматы', type: 'text', placeholder: 'Например: 1920x1080 PNG, SVG', required: false },
    { label: 'Описание проекта', type: 'textarea', placeholder: 'Детально опишите что нужно сделать', required: true },
    { label: 'Референсы', type: 'text', placeholder: 'Ссылки на примеры, которые нравятся', required: false },
  ],
};

export default function OrderPage({ initialCategory, user, onLogin, onOrderCreated }: OrderPageProps) {
  const [step, setStep] = useState(initialCategory ? 2 : 1);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customDeadline, setCustomDeadline] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [selectedDeadline, setSelectedDeadline] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const cat = categories.find(c => c.id === selectedCategory);

  const handleSubmit = () => {
    const order: Order = {
      id: `ZN-${Date.now().toString(36).toUpperCase()}`,
      category: cat?.label || selectedCategory,
      title: formData[Object.keys(formData)[0]] || 'Новый заказ',
      status: 'pending',
      createdAt: new Date().toLocaleDateString('ru-RU'),
      budget: selectedBudget === 'Свой бюджет' ? customBudget : selectedBudget,
      deadline: selectedDeadline === 'Свой срок' ? customDeadline : selectedDeadline,
      details: formData,
      clientName: user?.name || 'Гость',
      reports: [],
    };
    onOrderCreated(order);
    setCreatedOrder(order);
    setSubmitted(true);
  };

  if (submitted && createdOrder) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-glow-pulse" style={{ background: 'rgba(0,255,136,0.15)', border: '2px solid #00ff88', boxShadow: '0 0 30px rgba(0,255,136,0.4)' }}>
            <Icon name="CheckCircle" size={36} style={{ color: '#00ff88' }} />
          </div>
          <h2 className="font-orbitron text-2xl font-700 text-white mb-2">Заявка создана!</h2>
          <div className="font-mono text-sm mb-6" style={{ color: '#00ff88' }}>ID: {createdOrder.id}</div>
          <p className="font-rajdhani text-gray-400 mb-8">Мы рассмотрим вашу заявку в течение нескольких часов и свяжемся с вами.</p>
          
          <div className="glass-card p-6 rounded-xl mb-8 text-left">
            <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">// БЫСТРАЯ СВЯЗЬ</div>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-white/5" style={{ border: '1px solid rgba(0,136,204,0.3)' }}>
                <span className="text-xl">✈️</span>
                <div>
                  <div className="font-orbitron text-xs font-600 text-white">Telegram</div>
                  <div className="font-rajdhani text-xs text-gray-400">Быстрый ответ за 15 минут</div>
                </div>
                <Icon name="ExternalLink" size={14} className="ml-auto text-gray-600" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-white/5" style={{ border: '1px solid rgba(88,101,242,0.3)' }}>
                <span className="text-xl">🎮</span>
                <div>
                  <div className="font-orbitron text-xs font-600 text-white">Discord</div>
                  <div className="font-rajdhani text-xs text-gray-400">Создать тикет на сервере</div>
                </div>
                <Icon name="ExternalLink" size={14} className="ml-auto text-gray-600" />
              </a>
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="neon-btn px-8 py-3 text-sm rounded">
            Отслеживать заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// НОВЫЙ ЗАКАЗ</div>
          <h1 className="font-orbitron text-4xl font-900 mb-4" style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>
            Сделать заказ
          </h1>
          <div className="w-32 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }}></div>
        </div>

        {!user && (
          <div className="glass-card p-6 rounded-xl mb-8 text-center" style={{ borderColor: 'rgba(255,255,0,0.3)' }}>
            <Icon name="AlertTriangle" size={24} className="mx-auto mb-3" style={{ color: '#ffff00' }} />
            <p className="font-rajdhani text-gray-300 mb-4">Для создания заявки необходимо войти через Discord</p>
            <button onClick={onLogin} className="neon-btn px-6 py-2 text-xs rounded">
              Войти через Discord
            </button>
          </div>
        )}

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron font-700 transition-all duration-300 ${step >= s ? 'text-dark-bg' : 'text-gray-600 border border-gray-700'}`} style={step >= s ? { background: '#00ff88', boxShadow: '0 0 15px rgba(0,255,136,0.5)' } : {}}>
                {s}
              </div>
              <span className={`text-xs font-rajdhani ${step >= s ? 'text-neon-green' : 'text-gray-600'}`}>
                {s === 1 ? 'Категория' : s === 2 ? 'Детали' : 'Сроки и бюджет'}
              </span>
              {s < 3 && <div className={`w-8 h-px ${step > s ? '' : 'opacity-30'}`} style={{ background: step > s ? '#00ff88' : '#333' }}></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-xs font-mono text-gray-500 mb-6 tracking-widest">// ВЫБЕРИТЕ КАТЕГОРИЮ</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.id); setStep(2); }}
                  className="glass-card p-6 rounded-xl text-left group hover:scale-105 transition-all duration-300"
                  style={{ borderColor: `${c.color}20` }}
                >
                  <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                    <Icon name={c.icon as any} size={24} style={{ color: c.color }} />
                  </div>
                  <h3 className="font-orbitron font-700 text-white text-sm mb-1">{c.label}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Выбрать</span>
                    <Icon name="ArrowRight" size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && selectedCategory && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-gray-500 hover:text-neon-green transition-colors">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <div className="text-xs font-mono text-gray-500 tracking-widest">// ТЕХНИЧЕСКОЕ ЗАДАНИЕ</div>
              <div className="ml-auto flex items-center gap-2">
                <Icon name={cat?.icon as any} size={16} style={{ color: cat?.color }} />
                <span className="font-rajdhani text-xs" style={{ color: cat?.color }}>{cat?.label}</span>
              </div>
            </div>

            <div className="space-y-5">
              {formFields[selectedCategory]?.map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-mono text-gray-400 mb-2 tracking-wider">
                    {field.label}{field.required && <span className="text-neon-red ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.label] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm text-gray-200 resize-none focus:outline-none transition-all duration-300"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,255,136,0.2)'}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.label] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none transition-all duration-300"
                      style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.2)', color: '#e0e0e0' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,255,136,0.2)'}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(3)}
                className="neon-btn px-8 py-3 text-sm rounded"
                disabled={!user}
              >
                <span className="flex items-center gap-2">
                  Далее
                  <Icon name="ArrowRight" size={16} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deadline & Budget */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(2)} className="text-gray-500 hover:text-neon-green transition-colors">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <div className="text-xs font-mono text-gray-500 tracking-widest">// СРОКИ И БЮДЖЕТ</div>
            </div>

            <div className="space-y-8">
              {/* Deadline */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-4 tracking-wider">ЖЕЛАЕМЫЕ СРОКИ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {deadlines.map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDeadline(d)}
                      className={`px-4 py-3 rounded-lg text-xs font-rajdhani font-600 transition-all duration-300 ${selectedDeadline === d ? 'text-dark-bg' : 'text-gray-400 hover:text-white'}`}
                      style={selectedDeadline === d ? {
                        background: '#00ff88',
                        boxShadow: '0 0 15px rgba(0,255,136,0.5)'
                      } : {
                        border: '1px solid rgba(0,255,136,0.2)',
                        background: 'transparent'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {selectedDeadline === 'Свой срок' && (
                  <input
                    type="text"
                    placeholder="Укажите ваш срок..."
                    value={customDeadline}
                    onChange={e => setCustomDeadline(e.target.value)}
                    className="mt-3 w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.3)', color: '#e0e0e0' }}
                  />
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-4 tracking-wider">БЮДЖЕТ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {budgets.map(b => (
                    <button
                      key={b}
                      onClick={() => setSelectedBudget(b)}
                      className={`px-4 py-3 rounded-lg text-xs font-rajdhani font-600 transition-all duration-300 ${selectedBudget === b ? 'text-dark-bg' : 'text-gray-400 hover:text-white'}`}
                      style={selectedBudget === b ? {
                        background: '#00ffff',
                        boxShadow: '0 0 15px rgba(0,255,255,0.5)'
                      } : {
                        border: '1px solid rgba(0,255,255,0.2)',
                        background: 'transparent'
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {selectedBudget === 'Свой бюджет' && (
                  <input
                    type="text"
                    placeholder="Укажите ваш бюджет..."
                    value={customBudget}
                    onChange={e => setCustomBudget(e.target.value)}
                    className="mt-3 w-full px-4 py-3 rounded-lg font-rajdhani text-sm focus:outline-none"
                    style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,255,0.3)', color: '#e0e0e0' }}
                  />
                )}
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={handleSubmit}
                disabled={!selectedDeadline || !selectedBudget || !user}
                className="neon-btn w-full py-4 text-sm rounded disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Send" size={16} />
                  Отправить заявку
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
