const URLS = {
  auth: 'https://functions.poehali.dev/d88a5964-4db9-4c78-8d80-625aae312795',
  news: 'https://functions.poehali.dev/dba8bf1d-edda-4abb-a661-8d96fa287260',
  orders: 'https://functions.poehali.dev/5de8036e-1716-4a5d-9c14-21c34c313489',
  tickets: 'https://functions.poehali.dev/bf20b078-72fe-48d9-808b-3ce481cdffe2',
};

function getSessionId(): string {
  return localStorage.getItem('sessionId') || '';
}

function headers(extra?: Record<string, string>) {
  return {
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
    ...extra,
  };
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data as T;
}

// AUTH
export const authApi = {
  me: () => req<{ user: AppUser }>(URLS.auth + '/me', { headers: headers() }),
  logout: () => req<{ ok: boolean }>(URLS.auth + '/logout', { method: 'POST', headers: headers() }),
  updateProfile: (data: { name?: string; bio?: string; email?: string }) =>
    req<{ user: AppUser }>(URLS.auth + '/profile', { method: 'PUT', headers: headers(), body: JSON.stringify(data) }),
  discordCallback: (code: string) =>
    req<{ sessionId: string; user: AppUser }>(URLS.auth + '/discord', {
      method: 'POST', headers: headers(), body: JSON.stringify({ code }),
    }),
};

// NEWS
export const newsApi = {
  list: () => req<{ news: NewsItem[] }>(URLS.news, { headers: headers() }),
  create: (data: Partial<NewsItem>) =>
    req<{ news: NewsItem }>(URLS.news, { method: 'POST', headers: headers(), body: JSON.stringify(data) }),
  update: (data: Partial<NewsItem>) =>
    req<{ news: NewsItem }>(URLS.news, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }),
};

// ORDERS
export const ordersApi = {
  list: () => req<{ orders: AppOrder[] }>(URLS.orders, { headers: headers() }),
  create: (data: Partial<AppOrder>) =>
    req<{ order: AppOrder }>(URLS.orders, { method: 'POST', headers: headers(), body: JSON.stringify(data) }),
  update: (id: string, status?: string, report?: string) =>
    req<{ order: AppOrder }>(URLS.orders, { method: 'PUT', headers: headers(), body: JSON.stringify({ id, status, report }) }),
};

// TICKETS
export const ticketsApi = {
  list: () => req<{ tickets: AppTicket[] }>(URLS.tickets, { headers: headers() }),
  create: (data: Partial<AppTicket>) =>
    req<{ ticket: AppTicket }>(URLS.tickets, { method: 'POST', headers: headers(), body: JSON.stringify(data) }),
  reply: (id: string, reply: string) =>
    req<{ ticket: AppTicket }>(URLS.tickets, { method: 'PUT', headers: headers(), body: JSON.stringify({ id, reply }) }),
  setStatus: (id: string, status: string) =>
    req<{ ticket: AppTicket }>(URLS.tickets, { method: 'PUT', headers: headers(), body: JSON.stringify({ id, status }) }),
};

// Types
export interface AppUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  email: string;
  isAdmin: boolean;
  discordId?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  tag: string;
  color: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppOrder {
  id: string;
  clientId: string;
  clientName: string;
  category: string;
  title: string;
  status: 'pending' | 'reviewing' | 'in_progress' | 'done' | 'cancelled';
  budget: string;
  deadline: string;
  details: Record<string, string>;
  createdAt: string;
  reports: { author: string; text: string; date: string }[];
}

export interface AppTicket {
  id: string;
  userId: string;
  clientName: string;
  subject: string;
  message: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
  replies: { author: string; text: string; isAdmin: boolean; date: string }[];
}
