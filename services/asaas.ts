
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';
const API_KEY = process.env.ASAAS_API_KEY;

export const asaasService = {
  async createCustomer(data: { name: string, cpfCnpj: string, phone: string }) {
    const response = await fetch(`${ASAAS_URL}/customers`, {
      method: 'POST',
      headers: { 
        'access_token': API_KEY || '', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async createPayment(data: any) {
    const response = await fetch(`${ASAAS_URL}/payments`, {
      method: 'POST',
      headers: { 
        'access_token': API_KEY || '', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getPixQrCode(paymentId: string) {
    const response = await fetch(`${ASAAS_URL}/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: { 
        'access_token': API_KEY || ''
      }
    });
    return response.json();
  }
};
