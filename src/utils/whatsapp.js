/**
 * Zuro WhatsApp Integration Utility
 * Sends requests to the backend server to dispatch real WhatsApp messages using whatsapp-web.js
 */
export async function sendWhatsAppMessage(phone, body) {
  try {
    const response = await fetch('http://localhost:5001/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, body })
    });
    
    const data = await response.json();
    if (!data.success) {
      console.error('[WhatsApp Real API Error]:', data.error);
    }
    return data;
  } catch (error) {
    console.error('[WhatsApp Real API Network Error]:', error);
    return { success: false, error: error.message };
  }
}
