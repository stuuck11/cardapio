
// O prefixo /asaas-api-prod é redirecionado pelo vercel.json para a API de PRODUÇÃO do Asaas (api.asaas.com)
const ASAAS_URL = '/asaas-api-prod';

export const asaasService = {
  async createCustomer(data: { name: string, cpfCnpj: string, phone: string, email?: string }) {
    // Acesso direto ao process.env dentro da função para garantir substituição estática pelo bundler/Vercel
    const apiKey = process.env.ASAAS_API_KEY || '';
    
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
        throw new Error('Chave de API do Asaas não autorizada (401). Verifique se a chave no Vercel está correta e se você REALIZOU UM NOVO DEPLOY após salvá-la.');
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
    const apiKey = process.env.ASAAS_API_KEY || '';
    
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
      
      if (response.status === 401) throw new Error('Não autorizado (401). Verifique a chave ASAAS_API_KEY no painel da Vercel e faça um novo Deploy para aplicar as mudanças.');
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao gerar cobrança');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha no pagamento:', error);
      throw error;
    }
  },

  async getPixQrCode(paymentId: string) {
    const apiKey = process.env.ASAAS_API_KEY || '';
    
    try {
      const response = await fetch(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: { 
          'access_token': apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) throw new Error('Não autorizado (401) ao buscar QR Code. Verifique as credenciais no Vercel.');
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao obter PIX');
      return result;
    } catch (error: any) {
      console.error('[Asaas Error] Falha no QR Code:', error);
      throw error;
    }
  }
};
