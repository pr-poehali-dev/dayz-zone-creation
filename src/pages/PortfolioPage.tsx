import { useState } from 'react';
import Icon from '@/components/ui/icon';

const categories = ['Все', 'Сервер DayZ', 'Discord бот', 'Сайт', 'Дизайн'];

const projects = [
  {
    id: 1,
    title: 'BlackOut DayZ Server',
    category: 'Сервер DayZ',
    desc: 'Кастомный PvP/PvE сервер на 150 игроков с уникальной экономикой, кланами и ивент-системой.',
    tags: ['DayZ', 'Модинг', 'PvP/PvE'],
    color: '#00ff88',
    icon: 'Server',
    date: 'Март 2026',
    stats: { players: '150+', uptime: '99.9%', mods: '40+' }
  },
  {
    id: 2,
    title: 'Zone Guardian Bot',
    category: 'Discord бот',
    desc: 'Многофункциональный бот с системой тикетов, авто-модерацией, статистикой и ролевой системой.',
    tags: ['Discord.py', 'PostgreSQL', 'API'],
    color: '#00ffff',
    icon: 'Bot',
    date: 'Февраль 2026',
    stats: { servers: '25', commands: '80+', users: '5000+' }
  },
  {
    id: 3,
    title: 'SurvivalHub Portal',
    category: 'Сайт',
    desc: 'Портал сообщества для DayZ сервера с форумом, картами, профилями игроков и статистикой.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    color: '#ff0040',
    icon: 'Globe',
    date: 'Январь 2026',
    stats: { pages: '20+', users: '800+', speed: '100/100' }
  },
  {
    id: 4,
    title: 'DeadZone Брендинг',
    category: 'Дизайн',
    desc: 'Полный брендинг сервера: логотип, баннеры, иконки, карточки ролей, промо-материалы.',
    tags: ['Figma', 'Photoshop', 'Branding'],
    color: '#ffff00',
    icon: 'Palette',
    date: 'Декабрь 2025',
    stats: { files: '50+', formats: '4', revisions: '3' }
  },
  {
    id: 5,
    title: 'WasteLand Economy Server',
    category: 'Сервер DayZ',
    desc: 'Полноценная экономическая система с торговцами, денежной системой и крафтом редких предметов.',
    tags: ['DayZ SA', 'Экономика', 'Скрипты'],
    color: '#00ff88',
    icon: 'Server',
    date: 'Ноябрь 2025',
    stats: { players: '80+', traders: '15', items: '200+' }
  },
  {
    id: 6,
    title: 'NightWatch Admin Bot',
    category: 'Discord бот',
    desc: 'Бот для администрирования сервера с логированием, anti-cheat уведомлениями и RCON интеграцией.',
    tags: ['Python', 'RCON', 'Logging'],
    color: '#00ffff',
    icon: 'Bot',
    date: 'Октябрь 2025',
    stats: { servers: '8', events: '10000+', uptime: '99.8%' }
  },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filtered = activeCategory === 'Все' ? projects : projects.filter(p => p.category === activeCategory);

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">// НАШИ РАБОТЫ</div>
          <h1 className="font-orbitron text-4xl md:text-5xl font-900 mb-4 text-white">
            Портфолио
          </h1>
          <div className="w-32 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #00ffff, transparent)' }}></div>
          <p className="font-rajdhani text-gray-400 text-lg">Избранные проекты, которыми мы гордимся</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs font-orbitron font-600 tracking-wider uppercase rounded transition-all duration-300 ${
                activeCategory === cat
                  ? 'text-dark-bg'
                  : 'text-gray-400 hover:text-neon-green'
              }`}
              style={activeCategory === cat ? {
                background: '#00ff88',
                boxShadow: '0 0 20px rgba(0,255,136,0.5)'
              } : {
                border: '1px solid rgba(0,255,136,0.2)',
                background: 'transparent'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <div
              key={project.id}
              className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ borderColor: hoveredId === project.id ? `${project.color}50` : undefined }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview area */}
              <div className="h-40 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${project.color}10, #050a0e)` }}>
                <div className="absolute inset-0 hex-bg opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: `${project.color}20`, border: `2px solid ${project.color}40`, boxShadow: `0 0 30px ${project.color}30` }}>
                    <Icon name={project.icon as any} size={36} style={{ color: project.color }} />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-mono" style={{ background: `${project.color}15`, color: project.color, border: `1px solid ${project.color}30` }}>
                  {project.category}
                </div>
                <div className="absolute top-3 right-3 text-xs font-mono text-gray-500">{project.date}</div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-orbitron font-700 text-white text-sm mb-2 group-hover:text-neon-green transition-colors">{project.title}</h3>
                <p className="font-rajdhani text-gray-400 text-xs leading-relaxed mb-4">{project.desc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="pt-3 border-t flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {Object.entries(project.stats).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="font-orbitron text-xs font-700" style={{ color: project.color }}>{val}</div>
                      <div className="text-xs font-mono text-gray-600 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Icon name="FolderOpen" size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="font-rajdhani text-gray-500">Проектов в этой категории пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
