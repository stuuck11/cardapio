
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';
// Importante: Verifique se ASAAS_API_KEY está configurada nas variáveis de ambiente do Vercel
const API_KEY = process.env.ASAAS_API_KEY;

export const asaasService = {
  async createCustomer(data: { name: string, cpfCnpj: string, phone: string, email?: string }) {
    console.log('[Asaas Debug] Criando cliente:', data.name);
    
    try {
      const response = await fetch(`${ASAAS_URL}/customers`, {
        method: 'POST',
        headers: { 
          'access_token': API_KEY || '', 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
          phone: data.phone.replace(/\D/g, ''),
          email: data.email || `${data.phone.replace(/\D/g, '')}@cliente.com.br`
        })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
      return result;
    } catch (error) {
      console.error('[Asaas Debug] Erro em createCustomer:', error);
      throw error;
    }
  },

  async createPayment(data: any) {
    console.log('[Asaas Debug] Criando pagamento:', data.billingType);
    try {
      const response = await fetch(`${ASAAS_URL}/payments`, {
        method: 'POST',
        headers: { 
          'access_token': API_KEY || '', 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao criar pagamento no Asaas');
      return result;
    } catch (error) {
      console.error('[Asaas Debug] Erro em createPayment:', error);
      throw error;
    }
  },

  async getPixQrCode(paymentId: string) {
    console.log('[Asaas Debug] Solicitando QR Code PIX:', paymentId);
    try {
      const response = await fetch(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: { 
          'access_token': API_KEY || '',
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Erro ao obter QR Code PIX');
      return result;
    } catch (error) {
      console.error('[Asaas Debug] Erro em getPixQrCode:', error);
      throw error;
    }
  }
};
