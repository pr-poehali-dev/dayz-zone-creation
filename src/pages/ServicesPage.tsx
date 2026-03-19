import Icon from '@/components/ui/icon';

interface ServicesPageProps {
  onOrderClick: (category?: string) => void;
}

const services = [
  {
    id: 'server',
    icon: 'Server',
    title: 'Сервер DayZ под ключ',
    color: '#00ff88',
    desc: 'Полная разработка и настройка сервера DayZ Standalone с нуля. Устанавливаем моды, настраиваем экономику, лор, систему рейдов и многое другое.',
    features: [
      'Установка и настройка модов',
      'Создание уникального лора',
      'Настройка спавна, лута, погоды',
      'Система трейдеров и экономики',
      'Защита от читеров (AntiCheat)',
      'Настройка карт и локаций',
      'Документация и обучение',
    ],
    price: 'от 5 000 ₽',
    time: '5–14 дней'
  },
  {
    id: 'bot',
    icon: 'Bot',
    title: 'Discord боты',
    color: '#00ffff',
    desc: 'Создание умных Discord ботов под любые задачи: модерация, статистика, автоматизация, игровые функции, экономика сервера.',
    features: [
      'Система модерации (бан, мут, варны)',
      'Статистика игроков',
      'Тикет-система поддержки',
      'Музыкальный бот',
      'Игровые команды и квесты',
      'Система уровней и рейтинга',
      'Интеграция с DayZ сервером',
    ],
    price: 'от 2 000 ₽',
    time: '2–7 дней'
  },
  {
    id: 'website',
    icon: 'Globe',
    title: 'Веб-сайты под заказ',
    color: '#ff0040',
    desc: 'Разработка современных сайтов: лендинги для серверов, порталы сообщества, интернет-магазины, административные панели.',
    features: [
      'Адаптивный дизайн (мобильный)',
      'Современный React/Vue/Next.js стек',
      'Административная панель',
      'Система авторизации',
      'База данных и API',
      'SEO оптимизация',
      'Хостинг и деплой',
    ],
    price: 'от 3 000 ₽',
    time: '7–21 день'
  },
  {
    id: 'design',
    icon: 'Palette',
    title: 'Оформление и инфографика',
    color: '#ffff00',
    desc: 'Профессиональное оформление Discord сервера, создание баннеров, иконок, промо-материалов и брендинга проекта.',
    features: [
      'Баннер и аватар сервера',
      'Иконки каналов и ролей',
      'Промо-баннеры',
      'Брендбук проекта',
      'Карты и инфографика',
      'Оформление форумов',
      'Социальные сети',
    ],
    price: 'от 1 000 ₽',
    time: '1–5 дней'
  }
];

export default function ServicesPage({ onOrderClick }: ServicesPageProps) {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// НАШИ УСЛУГИ</div>
          <h1 className="font-orbitron text-4xl md:text-5xl font-900 mb-4" style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>
            Услуги
          </h1>
          <div className="w-32 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }}></div>
          <p className="font-rajdhani text-gray-400 text-lg max-w-2xl mx-auto">
            Полный цикл разработки для вашего DayZ проекта. От идеи до готового продукта.
          </p>
        </div>

        {/* Services */}
        <div className="space-y-8">
          {services.map((s, i) => (
            <div key={s.id} className="glass-card rounded-xl overflow-hidden group" style={{ borderColor: `${s.color}20` }}>
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left */}
                  <div className="lg:w-1/3">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, boxShadow: `0 0 20px ${s.color}20` }}>
                        <Icon name={s.icon as any} size={28} style={{ color: s.color }} />
                      </div>
                      <div>
                        <h2 className="font-orbitron font-700 text-white text-sm">{s.title}</h2>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="font-orbitron text-xs font-700" style={{ color: s.color }}>{s.price}</span>
                          <span className="text-xs font-mono text-gray-500">{s.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-rajdhani text-gray-400 text-sm leading-relaxed mb-6">{s.desc}</p>
                    <button
                      onClick={() => onOrderClick(s.id)}
                      className="neon-btn w-full py-3 text-xs rounded"
                      style={{ borderColor: s.color, color: s.color, boxShadow: `0 0 15px ${s.color}30` }}
                    >
                      Заказать сейчас
                    </button>
                  </div>

                  {/* Right - features */}
                  <div className="lg:w-2/3">
                    <div className="text-xs font-mono text-gray-600 mb-4 tracking-widest">// ЧТО ВХОДИТ</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {s.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                            <Icon name="Check" size={10} style={{ color: s.color }} />
                          </div>
                          <span className="font-rajdhani text-gray-300 text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)` }}></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 glass-card rounded-xl" style={{ borderColor: 'rgba(0,255,136,0.3)' }}>
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// НУЖЕН ИНДИВИДУАЛЬНЫЙ ПОДХОД?</div>
          <h3 className="font-orbitron text-xl font-700 text-white mb-3">Не нашли что искали?</h3>
          <p className="font-rajdhani text-gray-400 mb-6">Опишите вашу задачу — мы обязательно найдём решение</p>
          <button onClick={() => onOrderClick()} className="neon-btn px-8 py-3 text-sm rounded">
            <span className="flex items-center gap-2">
              <Icon name="MessageSquare" size={16} />
              Обсудить проект
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
