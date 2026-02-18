
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';
const API_KEY = process.env.ASAAS_API_KEY;

export const asaasService = {
  async createCustomer(data: { name: string, cpfCnpj: string, phone: string }) {
    console.log('[Asaas Debug] Iniciando createCustomer:', data);
    console.log('[Asaas Debug] API_KEY presente:', !!API_KEY);
    
    try {
      const response = await fetch(`${ASAAS_URL}/customers`, {
        method: 'POST',
        headers: { 
          'access_token': API_KEY || '', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      console.log('[Asaas Debug] Resposta createCustomer:', result);
      return result;
    } catch (error) {
      console.error('[Asaas Debug] Erro fatal em createCustomer:', error);
      throw error;
    }
  },

  async createPayment(data: any) {
    console.log('[Asaas Debug] Iniciando createPayment:', data);
    try {
      const response = await fetch(`${ASAAS_URL}/payments`, {
        method: 'POST',
        headers: { 
          'access_token': API_KEY || '', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      console.log('[Asaas Debug] Resposta createPayment:', result);
      return result;
    } catch (error) {
      console.error('[Asaas Debug] Erro fatal em createPayment:', error);
      throw error;
    }
  },

  async getPixQrCode(paymentId: string) {
    console.log('[Asaas Debug] Buscando QR Code para:', paymentId);
    try {
      const response = await fetch(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: { 
          'access_token': API_KEY || ''
        }
      });
      
      const result = await response.json();
      console.log('[Asaas Debug] Resposta getPixQrCode:', result);
      return result;
    } catch (error) {
      console.error('[Asaas Debug] Erro fatal em getPixQrCode:', error);
      throw error;
    }
  }
};
