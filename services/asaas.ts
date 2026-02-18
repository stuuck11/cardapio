
// O prefixo /asaas-api-prod é redirecionado pelo vercel.json para a API de PRODUÇÃO do Asaas (api.asaas.com)
const ASAAS_URL = '/asaas-api-prod';

/**
 * Tenta capturar a chave de API. 
 * Na Vercel, variáveis para o FRONT-END devem começar com VITE_ para serem expostas.
 */
const getApiKey = (): string => {
  try {
    // @ts-ignore
    return process.env.VITE_ASAAS_API_KEY || process.env.ASAAS_API_KEY || '';
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
        throw new Error(`Não autorizado (401). A chave enviada foi: ${apiKey ? 'Detectada (***' + apiKey.slice(-4) + ')' : 'VAZIA/AUSENTE'}. IMPORTANTE: Renomeie a variável no Vercel para VITE_ASAAS_API_KEY.`);
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
      
      if (response.status === 401) throw new Error('Não autorizado (401). Certifique-se de usar o prefixo VITE_ no nome da variável no painel da Vercel.');
      
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
