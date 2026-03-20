import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import ChatWidget from "@/components/ChatWidget";
import type { NewsItem, AppUser } from "@/lib/api";

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOrderClick: () => void;
  news?: NewsItem[];
  user?: AppUser | null;
  onLogin?: () => void;
}

const services = [
  {
    icon: "Server",
    title: "Сервер DayZ",
    desc: "Разработка сервера под ключ с уникальными модами, настройкой лора и экономики",
    color: "#00ff88",
    price: "от 5 000 ₽",
  },
  {
    icon: "Bot",
    title: "Discord боты",
    desc: "Умные боты с модерацией, статистикой, музыкой и уникальным функционалом",
    color: "#00ffff",
    price: "от 2 000 ₽",
  },
  {
    icon: "Globe",
    title: "Веб-сайты",
    desc: "Современные сайты под заказ: лендинги, порталы, административные панели",
    color: "#ff0040",
    price: "от 3 000 ₽",
  },
  {
    icon: "Palette",
    title: "Инфографика",
    desc: "Оформление проекта: баннеры, иконки, промо-материалы в едином стиле",
    color: "#ffff00",
    price: "от 1 000 ₽",
  },
];

const reviews = [
  {
    name: "DarkWolf",
    avatar: "🐺",
    text: "Заказывал сервер DayZ — всё сделали чётко, в срок. Плюс добавили пару фич бесплатно. Топовая команда!",
    rating: 5,
    date: "15 марта 2026",
  },
  {
    name: "ShadowFox",
    avatar: "🦊",
    text: "Бот для дискорда работает без сбоев уже 3 месяца. Техподдержка отзывчивая. Рекомендую!",
    rating: 5,
    date: "10 марта 2026",
  },
  {
    name: "NightRaven",
    avatar: "🦅",
    text: "Сделали сайт за неделю. Дизайн огонь, всё по ТЗ. Уже второй раз обращаюсь.",
    rating: 5,
    date: "5 марта 2026",
  },
  {
    name: "IronBear",
    avatar: "🐻",
    text: "Инфографика и оформление сервера — просто шедевр. Все игроки в восторге!",
    rating: 5,
    date: "1 марта 2026",
  },
];

const defaultNews = [
  {
    id: "n1",
    tag: "Обновление",
    title: "Новый мод для выживания v2.5 уже доступен",
    content: "Добавили систему голода, температуры и уникальные локации...",
    createdAt: "19.03.2026",
    color: "#00ff88",
    authorName: "Admin",
    updatedAt: "",
  },
  {
    id: "n2",
    tag: "Релиз",
    title: "Discord бот ZONE Guard обновлён до v3.0",
    content: "Умная антиспам защита, система рейтинга и ежедневные квесты...",
    createdAt: "15.03.2026",
    color: "#00ffff",
    authorName: "Admin",
    updatedAt: "",
  },
  {
    id: "n3",
    tag: "Портфолио",
    title: "Завершён крупный проект: сервер BlackOut",
    content: "Кастомный сервер на 150 игроков с уникальной экономикой...",
    createdAt: "10.03.2026",
    color: "#ff0040",
    authorName: "Admin",
    updatedAt: "",
  },
];

const stats = [
  { value: "50+", label: "Серверов запущено", icon: "Server" },
  { value: "120+", label: "Ботов создано", icon: "Bot" },
  { value: "200+", label: "Довольных клиентов", icon: "Users" },
  { value: "3+", label: "Года опыта", icon: "Trophy" },
];

export default function HomePage({
  onNavigate,
  onOrderClick,
  news: newsProp,
  user,
  onLogin,
}: HomePageProps) {
  const news = newsProp && newsProp.length > 0 ? newsProp : defaultNews;
  const [currentStat, setCurrentStat] = useState(0);
  const [typedText, setTypedText] = useState("");
  const fullText = "ДОБРО ПОЖАЛОВАТЬ В ЗОНУ";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentStat((s) => (s + 1) % stats.length),
      3000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hex-bg">
        {/* Animated bg elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://cdn.poehali.dev/projects/63ab08af-497b-4b42-b320-7bdf9d9bb3ae/files/cab6b785-0934-40c2-a643-b89844e5bc0b.jpg"
            alt="DayZ Zone"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,10,14,0.3) 0%, rgba(5,10,14,0.6) 60%, rgba(5,10,14,1) 100%)",
            }}
          ></div>
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #00ff88, transparent)",
              filter: "blur(60px)",
              animation: "floatY 6s ease-in-out infinite",
            }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #00ffff, transparent)",
              filter: "blur(60px)",
              animation: "floatY 8s ease-in-out infinite reverse",
            }}
          ></div>
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px opacity-10"
              style={{
                top: `${20 + i * 15}%`,
                background:
                  "linear-gradient(90deg, transparent, #00ff88, transparent)",
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1 mb-8 text-xs font-mono tracking-widest"
            style={{
              border: "1px solid rgba(0,255,136,0.3)",
              color: "#00ff88",
              background: "rgba(0,255,136,0.05)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#00ff88" }}
            ></span>
            СИСТЕМА ОНЛАЙН · ЗОНА АКТИВНА
          </div>

          <h1
            className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-900 mb-4 leading-none tracking-tight glitch-text"
            data-text="DAYZ ZONE"
            style={{
              color: "#00ff88",
              textShadow: "0 0 20px #00ff88, 0 0 40px rgba(0,255,136,0.5)",
            }}
          >
            DAYZ ZONE
          </h1>

          <div className="font-mono text-lg md:text-xl text-gray-400 mb-6 h-8">
            {typedText}
            <span className="text-neon-green animate-pulse">█</span>
          </div>

          <p className="font-rajdhani text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Профессиональная разработка серверов DayZ, Discord ботов, сайтов и
            инфографики. Воплощаем твою идею в реальность.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onOrderClick}
              className="neon-btn px-8 py-4 text-sm rounded"
            >
              <span className="flex items-center gap-3">
                <Icon name="Zap" size={18} />
                Сделать заказ
              </span>
            </button>
            <button
              onClick={() => onNavigate("services")}
              className="px-8 py-4 text-sm font-orbitron font-600 tracking-wider uppercase border border-gray-600 text-gray-300 hover:border-neon-cyan hover:text-neon-cyan transition-all duration-300 rounded"
            >
              <span className="flex items-center gap-3">
                <Icon name="Layers" size={18} />
                Наши услуги
              </span>
            </button>
            <button
              onClick={() => onNavigate("portfolio")}
              className="px-8 py-4 text-sm font-orbitron font-600 tracking-wider uppercase border border-gray-600 text-gray-300 hover:border-gray-400 transition-all duration-300 rounded"
            >
              <span className="flex items-center gap-3">
                <Icon name="FolderOpen" size={18} />
                Портфолио
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="glass-card p-4 rounded text-center transition-all duration-300 hover:border-neon-green"
              >
                <div
                  className="text-2xl font-orbitron font-900 mb-1"
                  style={{ color: "#00ff88", textShadow: "0 0 10px #00ff88" }}
                >
                  {s.value}
                </div>
                <div className="text-xs font-rajdhani text-gray-400 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs font-mono tracking-widest">SCROLL</span>
          <div
            className="w-px h-12 relative overflow-hidden"
            style={{ background: "rgba(0,255,136,0.2)" }}
          >
            <div
              className="absolute top-0 left-0 w-full h-6 animate-scan"
              style={{
                background:
                  "linear-gradient(180deg, transparent, #00ff88, transparent)",
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* ABOUT / BENEFITS */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">
              // ПОЧЕМУ МЫ
            </div>
            <h2
              className="font-orbitron text-3xl md:text-4xl font-700 mb-4"
              style={{ color: "#00ff88" }}
            >
              Плюсы работы с нами
            </h2>
            <div
              className="w-24 h-px mx-auto"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00ff88, transparent)",
              }}
            ></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "Clock",
                title: "Чёткие сроки",
                desc: "Работаем строго по договорённости. Без переносов и пустых обещаний.",
                color: "#00ff88",
              },
              {
                icon: "Shield",
                title: "Гарантия качества",
                desc: "Исправляем баги и недоработки бесплатно в течение 30 дней после сдачи.",
                color: "#00ffff",
              },
              {
                icon: "Headphones",
                title: "Поддержка 24/7",
                desc: "Всегда на связи в Discord и Telegram. Отвечаем в течение часа.",
                color: "#ff0040",
              },
              {
                icon: "Code2",
                title: "Чистый код",
                desc: "Пишем только аккуратный, задокументированный код. Легко поддерживать.",
                color: "#00ff88",
              },
              {
                icon: "DollarSign",
                title: "Честные цены",
                desc: "Прозрачное ценообразование. Вы платите только за то, что нужно.",
                color: "#ffff00",
              },
              {
                icon: "Repeat",
                title: "Постоянным — бонусы",
                desc: "Скидки постоянным клиентам, приоритет в очереди и эксклюзивные фичи.",
                color: "#00ffff",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card p-6 rounded-lg group hover:scale-105 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 mb-4 rounded flex items-center justify-center"
                  style={{
                    background: `rgba(${item.color === "#00ff88" ? "0,255,136" : item.color === "#00ffff" ? "0,255,255" : item.color === "#ff0040" ? "255,0,64" : item.color === "#ffff00" ? "255,255,0" : "0,255,136"},0.1)`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <Icon
                    name={item.icon as Parameters<typeof Icon>[0]["name"]}
                    size={24}
                    style={{ color: item.color }}
                  />
                </div>
                <h3 className="font-orbitron font-700 text-white mb-2 text-sm tracking-wide">
                  {item.title}
                </h3>
                <p className="font-rajdhani text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section
        className="py-24 px-4 relative"
        style={{ background: "rgba(0,255,136,0.02)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">
              // УСЛУГИ
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-700 mb-4 text-white">
              Что мы делаем
            </h2>
            <div
              className="w-24 h-px mx-auto"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00ffff, transparent)",
              }}
            ></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((s, i) => (
              <div
                key={i}
                className="glass-card p-6 rounded-lg text-center group cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={() => onNavigate("services")}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                  style={{
                    background: `${s.color}15`,
                    border: `1px solid ${s.color}40`,
                    boxShadow: `0 0 20px ${s.color}20`,
                  }}
                >
                  <Icon
                    name={s.icon as Parameters<typeof Icon>[0]["name"]}
                    size={28}
                    style={{ color: s.color }}
                  />
                </div>
                <h3 className="font-orbitron font-700 text-white text-sm mb-2">
                  {s.title}
                </h3>
                <p className="font-rajdhani text-gray-400 text-xs leading-relaxed mb-4">
                  {s.desc}
                </p>
                <div
                  className="font-orbitron font-700 text-xs"
                  style={{ color: s.color }}
                >
                  {s.price}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onOrderClick}
              className="neon-btn px-8 py-3 text-sm rounded"
            >
              Сделать заказ прямо сейчас
            </button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">
              // ОТЗЫВЫ
            </div>
            <h2
              className="font-orbitron text-3xl md:text-4xl font-700 mb-4"
              style={{ color: "#00ff88" }}
            >
              Что говорят клиенты
            </h2>
            <div
              className="w-24 h-px mx-auto"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00ff88, transparent)",
              }}
            ></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="glass-card p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: "rgba(0,255,136,0.1)",
                      border: "1px solid rgba(0,255,136,0.3)",
                    }}
                  >
                    {r.avatar}
                  </div>
                  <div>
                    <div className="font-orbitron text-xs font-700 text-white">
                      {r.name}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(r.rating)].map((_, j) => (
                        <span
                          key={j}
                          style={{ color: "#00ff88", fontSize: "10px" }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-rajdhani text-gray-300 text-sm leading-relaxed mb-3">
                  "{r.text}"
                </p>
                <div className="font-mono text-xs text-gray-600">{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section
        className="py-24 px-4"
        style={{ background: "rgba(0,255,136,0.02)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">
              // НОВОСТИ
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-700 mb-4 text-white">
              Лента новостей
            </h2>
            <div
              className="w-24 h-px mx-auto"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00ffff, transparent)",
              }}
            ></div>
          </div>

          <div className="space-y-4">
            {news.map((n, i) => (
              <div
                key={n.id || i}
                className="glass-card p-6 rounded-lg flex items-start gap-6 group hover:border-opacity-60 transition-all duration-300 cursor-pointer"
              >
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{
                    background: n.color,
                    boxShadow: `0 0 10px ${n.color}`,
                  }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-mono px-2 py-1 rounded"
                      style={{
                        background: `${n.color}15`,
                        color: n.color,
                        border: `1px solid ${n.color}30`,
                      }}
                    >
                      {n.tag}
                    </span>
                    <span className="text-xs font-mono text-gray-600">
                      {n.createdAt}
                    </span>
                  </div>
                  <h3 className="font-orbitron font-700 text-white text-sm mb-2 group-hover:text-neon-green transition-colors">
                    {n.title}
                  </h3>
                  <p className="font-rajdhani text-gray-400 text-sm">
                    {n.content}
                  </p>
                </div>
                <Icon
                  name="ChevronRight"
                  size={16}
                  className="text-gray-600 group-hover:text-neon-green transition-colors flex-shrink-0 mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL BLOCKS */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">
              // СООБЩЕСТВО
            </div>
            <h2
              className="font-orbitron text-3xl md:text-4xl font-700 mb-4"
              style={{ color: "#00ff88" }}
            >
              Присоединяйся к зоне
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* VK */}
            <a
              href="#"
              className="glass-card p-8 rounded-lg text-center group hover:scale-105 transition-all duration-300 block"
              style={{ borderColor: "rgba(74,118,168,0.3)" }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(74,118,168,0.15)",
                  border: "1px solid rgba(74,118,168,0.4)",
                }}
              >
                <span className="text-3xl">🔵</span>
              </div>
              <h3 className="font-orbitron font-700 text-white text-sm mb-2">
                ВКонтакте
              </h3>
              <p className="font-rajdhani text-gray-400 text-sm mb-4">
                Новости, скриншоты, объявления
              </p>
              <span className="text-xs font-mono" style={{ color: "#4a76a8" }}>
                Подписаться →
              </span>
            </a>

            {/* Discord */}
            <a
              href="#"
              className="glass-card p-8 rounded-lg text-center group hover:scale-105 transition-all duration-300 block"
              style={{ borderColor: "rgba(88,101,242,0.3)" }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(88,101,242,0.15)",
                  border: "1px solid rgba(88,101,242,0.4)",
                }}
              >
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="font-orbitron font-700 text-white text-sm mb-2">
                Discord
              </h3>
              <p className="font-rajdhani text-gray-400 text-sm mb-4">
                Чат, поддержка, голосовые каналы
              </p>
              <span className="text-xs font-mono" style={{ color: "#5865f2" }}>
                Войти на сервер →
              </span>
            </a>

            {/* Telegram */}
            <a
              href="#"
              className="glass-card p-8 rounded-lg text-center group hover:scale-105 transition-all duration-300 block"
              style={{ borderColor: "rgba(0,136,204,0.3)" }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,136,204,0.15)",
                  border: "1px solid rgba(0,136,204,0.4)",
                }}
              >
                <span className="text-3xl">✈️</span>
              </div>
              <h3 className="font-orbitron font-700 text-white text-sm mb-2">
                Telegram
              </h3>
              <p className="font-rajdhani text-gray-400 text-sm mb-4">
                Уведомления, обновления, акции
              </p>
              <span className="text-xs font-mono" style={{ color: "#0088cc" }}>
                Подписаться →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CHAT */}
      <section
        className="py-24 px-4"
        style={{ background: "rgba(0,255,136,0.02)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3">
              // СООБЩЕСТВО
            </div>
            <h2
              className="font-orbitron text-3xl md:text-4xl font-700 mb-4"
              style={{ color: "#00ff88" }}
            >
              Общий <span style={{ color: "#00ffff" }}>чат</span>
            </h2>
            <p className="font-rajdhani text-gray-400">
              Общайся с другими участниками сайта в реальном времени
            </p>
          </div>
          <ChatWidget user={user ?? null} onLogin={onLogin ?? (() => {})} />
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-12 px-4 border-t"
        style={{ borderColor: "rgba(0,255,136,0.1)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 relative">
                <div
                  className="absolute inset-0 border border-neon-green rotate-45"
                  style={{ boxShadow: "0 0 5px #00ff88" }}
                ></div>
              </div>
              <span
                className="font-orbitron font-700 text-sm"
                style={{ color: "#00ff88" }}
              >
                DAYZ<span style={{ color: "#00ffff" }}>ZONE</span>
              </span>
            </div>
            <div className="font-mono text-xs text-gray-600">
              © 2026 DAYZ ZONE · Все права защищены
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate("support")}
                className="text-xs font-rajdhani text-gray-500 hover:text-neon-green transition-colors"
              >
                Поддержка
              </button>
              <button
                onClick={() => onNavigate("orders")}
                className="text-xs font-rajdhani text-gray-500 hover:text-neon-green transition-colors"
              >
                Заказать
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
