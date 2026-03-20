import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { promocodesApi, type Promocode } from '@/lib/api';

export default function PromocodesPage() {
  const [promos, setPromos] = useState<Promocode[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkCode, setCheckCode] = useState('');
  const [checkResult, setCheckResult] = useState<{ promo: Promocode; valid: boolean } | null>(null);
  const [checkError, setCheckError] = useState('');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    promocodesApi.list()
      .then(d => setPromos(d.promocodes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheck = async () => {
    if (!checkCode.trim()) return;
    setChecking(true);
    setCheckResult(null);
    setCheckError('');
    try {
      const res = await promocodesApi.check(checkCode.trim());
      setCheckResult(res);
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setChecking(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono mb-6"
            style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}>
            <Icon name="Tag" size={12} />
            ПРОМОКОДЫ
          </div>
          <h1 className="font-orbitron text-3xl md:text-4xl font-900 text-white mb-4">
            СКИДКИ И <span style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>ПРОМОКОДЫ</span>
          </h1>
          <p className="font-rajdhani text-gray-400 text-lg max-w-2xl mx-auto">
            Используй промокод при оформлении заказа и получи скидку на наши услуги
          </p>
        </div>

        {/* Check Form */}
        <div className="glass-card p-6 rounded-xl mb-10" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
          <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">ПРОВЕРИТЬ ПРОМОКОД</div>
          <div className="flex gap-3">
            <input
              type="text"
              value={checkCode}
              onChange={e => setCheckCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder="ВВЕДИТЕ КОД..."
              className="flex-1 px-4 py-3 rounded-lg font-mono text-sm focus:outline-none tracking-widest"
              style={{ background: 'rgba(10,21,32,0.8)', border: '1px solid rgba(0,255,136,0.3)', color: '#e0e0e0' }}
            />
            <button
              onClick={handleCheck}
              disabled={checking}
              className="px-6 py-3 rounded-lg font-orbitron text-xs font-700 transition-all"
              style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.4)', color: '#00ff88' }}
            >
              {checking ? '...' : 'ПРОВЕРИТЬ'}
            </button>
          </div>
          {checkResult && (
            <div className="mt-4 p-4 rounded-lg flex items-center gap-3"
              style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
              <Icon name="CheckCircle" size={20} style={{ color: '#00ff88' }} />
              <div>
                <div className="font-orbitron text-sm font-700" style={{ color: '#00ff88' }}>
                  Промокод действителен!
                </div>
                <div className="font-rajdhani text-sm text-gray-300 mt-1">
                  Скидка: {checkResult.promo.discountValue}{checkResult.promo.discountType === 'percent' ? '%' : '₽'}
                  {checkResult.promo.description && ` · ${checkResult.promo.description}`}
                </div>
              </div>
            </div>
          )}
          {checkError && (
            <div className="mt-4 p-4 rounded-lg flex items-center gap-3"
              style={{ background: 'rgba(255,0,64,0.1)', border: '1px solid rgba(255,0,64,0.3)' }}>
              <Icon name="XCircle" size={20} style={{ color: '#ff0040' }} />
              <div className="font-rajdhani text-sm" style={{ color: '#ff0040' }}>{checkError}</div>
            </div>
          )}
        </div>

        {/* List */}
        <div className="text-xs font-mono text-gray-500 mb-6 tracking-widest">АКТИВНЫЕ ПРОМОКОДЫ</div>
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin mx-auto mb-4"></div>
            <div className="font-mono text-xs text-gray-600">ЗАГРУЗКА...</div>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <Icon name="Tag" size={40} style={{ color: '#333', margin: '0 auto 16px' }} />
            <div className="font-orbitron text-sm text-gray-600">Промокодов пока нет</div>
            <div className="font-rajdhani text-xs text-gray-700 mt-2">Следи за обновлениями — скоро появятся акции</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {promos.map(promo => (
              <div key={promo.id} className="glass-card p-5 rounded-xl hover:border-opacity-50 transition-all"
                style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="font-mono text-lg font-900 tracking-widest flex items-center gap-2 transition-opacity hover:opacity-70"
                      style={{ color: '#00ff88' }}
                    >
                      {promo.code}
                      <Icon name={copied === promo.code ? 'Check' : 'Copy'} size={14} style={{ color: '#00ff88' }} />
                    </button>
                  </div>
                  <div className="px-3 py-1 rounded-full font-orbitron text-xs font-700"
                    style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}>
                    -{promo.discountValue}{promo.discountType === 'percent' ? '%' : '₽'}
                  </div>
                </div>
                {promo.description && (
                  <div className="font-rajdhani text-sm text-gray-400 mb-3">{promo.description}</div>
                )}
                <div className="flex items-center gap-4 text-xs font-mono text-gray-600">
                  {promo.maxUses && (
                    <span className="flex items-center gap-1">
                      <Icon name="Users" size={11} />
                      {promo.usesCount}/{promo.maxUses} использований
                    </span>
                  )}
                  {promo.expiresAt && (
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={11} />
                      до {promo.expiresAt}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={11} />
                    {promo.createdAt}
                  </span>
                </div>
                {copied === promo.code && (
                  <div className="mt-2 text-xs font-mono" style={{ color: '#00ff88' }}>Скопировано!</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-10 p-5 rounded-xl" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
          <div className="flex items-start gap-3">
            <Icon name="Info" size={16} style={{ color: '#00ff88', flexShrink: 0, marginTop: 2 }} />
            <div className="font-rajdhani text-sm text-gray-500">
              Промокод нужно указать в поле "Промокод" при создании заказа. Скидка применяется к итоговой стоимости.
              Один промокод — один заказ.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
