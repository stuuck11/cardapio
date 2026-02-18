
/**
 * Serviço de rastreamento para Meta Pixel e Conversion API (CAPI).
 * Implementado para rodar no lado do cliente, adaptando a lógica de hash SHA-256.
 */

async function hashValue(val: string | undefined): Promise<string | undefined> {
  if (!val) return undefined;
  const encoder = new TextEncoder();
  const data = encoder.encode(val.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface TrackData {
  pixelId: string;
  accessToken: string;
  email?: string;
  phone?: string;
  amount?: number;
  contentName?: string;
  originUrl: string;
}

export const metaService = {
  // Inicializa o Pixel no navegador
  init(pixelId: string) {
    if (typeof window === 'undefined') return;
    const fb = (window as any).fbq;
    if (!fb) {
      const n: any = (window as any).fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!(window as any)._fbq) (window as any)._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      const t = document.createElement('script'); t.async = !0; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s = document.getElementsByTagName('script')[0]; s.parentNode?.insertBefore(t, s);
      n('init', pixelId);
    }
  },

  async trackEvent(eventName: 'PageView' | 'InitiateCheckout' | 'Purchase', data: TrackData) {
    if (typeof window === 'undefined') return;
    
    // 1. Browser Pixel Tracking
    const fb = (window as any).fbq;
    if (fb) {
      const browserData: any = {
        content_type: 'product',
        content_name: data.contentName,
      };
      if (data.amount) {
        browserData.value = data.amount;
        browserData.currency = 'BRL';
      }
      fb('track', eventName, browserData);
    }

    // 2. Conversion API (CAPI) Tracking - Direto do cliente conforme lógica do usuário
    if (data.accessToken && data.pixelId) {
      try {
        const hashedEmail = await hashValue(data.email);
        const hashedPhone = await hashValue(data.phone);
        
        const event = {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: data.originUrl,
          user_data: {
            client_user_agent: navigator.userAgent,
            em: hashedEmail ? [hashedEmail] : undefined,
            ph: hashedPhone ? [hashedPhone] : undefined,
          },
          custom_data: {
            currency: 'BRL',
            value: data.amount || 0,
            content_name: data.contentName,
            content_type: 'product'
          }
        };

        fetch(`https://graph.facebook.com/v17.0/${data.pixelId}/events?access_token=${data.accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [event] })
        }).catch(e => console.error("[Meta CAPI Error]", e));
      } catch (err) {
        console.error("[Meta Service Error]", err);
      }
    }
  }
};
