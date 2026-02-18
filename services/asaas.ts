
// O prefixo /asaas-api-prod é redirecionado pelo vercel.json para a API de PRODUÇÃO do Asaas (api.asaas.com)
const ASAAS_URL = '/asaas-api-prod';

/**
 * IMPORTANTE: No navegador, process.env não existe nativamente.
 * Este método tenta capturar a chave injetada pelo ambiente do Vercel.
 */
const getSafeApiKey = (): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.ASAAS_API_KEY) {
      return process.env.ASAAS_API_KEY;
    }
    return '';
  } catch (e) {
    return '';
  }
};

const API_KEY = getSafeApiKey();

export const asaasService = {
  async createCustomer(data: { name: string, cpfCnpj: string, phone: string, email?: string }) {
    console.log('[Asaas] Iniciando criação de cliente em PRODUÇÃO...');
    
    try {
      const response = await fetch(`${ASAAS_URL}/customers`, {
        method: 'POST',
        headers: { 
          'access_token': API_KEY, 
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
        throw new Error('Chave de API do Asaas não autorizada. Verifique se a chave de PRODUÇÃO está correta nas variáveis de ambiente do Vercel.');
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
    console.log('[Asaas] Criando cobrança em PRODUÇÃO:', data.billingType);
    try {
      const response = await fetch(`${ASAAS_URL}/payments`, {
        method: 'POST',
        headers: { 
          'access_token': API_KEY, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 401) throw new Error('Chave de API não autorizada para ambiente de produção.');
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao gerar cobrança');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha no pagamento:', error);
      throw error;
    }
  },

  async getPixQrCode(paymentId: string) {
    try {
      const response = await fetch(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: { 
          'access_token': API_KEY,
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao obter PIX');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha no QR Code:', error);
      throw error;
    }
  }
};
