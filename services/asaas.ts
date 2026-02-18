
// O prefixo /asaas-api-prod é redirecionado pelo vercel.json para a API de PRODUÇÃO do Asaas (api.asaas.com)
const ASAAS_URL = '/asaas-api-prod';

/**
 * Tenta capturar a chave de API de múltiplas fontes possíveis.
 * Na Vercel, chaves com '$' precisam de atenção especial no painel.
 */
const getApiKey = (): string => {
  try {
    // 1. Tenta padrão Vite (import.meta.env) - Comum quando se usa prefixo VITE_
    // @ts-ignore
    const viteKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_ASAAS_API_KEY : undefined;
    
    // 2. Tenta padrão Process (Vercel/Node)
    // @ts-ignore
    const processKey = typeof process !== 'undefined' && process.env ? (process.env.VITE_ASAAS_API_KEY || process.env.ASAAS_API_KEY) : undefined;
    
    const key = viteKey || processKey || '';
    return key.trim();
  } catch (e) {
    return '';
  }
};

export const asaasService = {
  async createCustomer(data: { name: string, cpfCnpj: string, phone: string, email?: string }) {
    const apiKey = getApiKey();
    
    try {
      const response = await fetch(`${ASAAS_URL}/customers`, {
        method: 'POST',
        headers: { 
          'access_token': apiKey, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
          phone: data.phone.replace(/\D/g, ''),
          email: data.email || `${data.phone.replace(/\D/g, '')}@japabox.com.br`
        })
      });
      
      if (response.status === 401) {
        const keyStatus = apiKey ? `Detectada (Início: ${apiKey.substring(0, 8)}...)` : 'VAZIA/AUSENTE';
        throw new Error(`Não autorizado (401). Chave: ${keyStatus}. DICA: Como sua chave começa com '$', você PRECISA editá-la na Vercel e colocá-la entre aspas duplas: "$aact_prod..." e depois fazer um NOVO DEPLOY.`);
      }
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro na API do Asaas');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha na requisição:', error);
      throw error;
    }
  },

  async createPayment(data: any) {
    const apiKey = getApiKey();
    
    try {
      const response = await fetch(`${ASAAS_URL}/payments`, {
        method: 'POST',
        headers: { 
          'access_token': apiKey, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 401) throw new Error('Não autorizado (401). Verifique o uso de aspas duplas na variável VITE_ASAAS_API_KEY no painel da Vercel.');
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao gerar cobrança');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha no pagamento:', error);
      throw error;
    }
  },

  async getPixQrCode(paymentId: string) {
    const apiKey = getApiKey();
    
    try {
      const response = await fetch(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: { 
          'access_token': apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) throw new Error('Não autorizado (401) ao buscar QR Code.');
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao obter PIX');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha no QR Code:', error);
      throw error;
    }
  }
};
