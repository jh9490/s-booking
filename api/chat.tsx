import { baseUrl } from "@/config/config";

export async function getChatMessages(requestId: number, token: string) {
    const res = await fetch(`${baseUrl}/items/chat_messages?filter[request][_eq]=
        ${requestId}&sort=date_created&fields=request.id,sender.*,*`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    if (!res.ok) throw new Error('Failed to load chat messages');
    const data = await res.json();
    return data.data; // array of messages
  }
  

  export async function sendChatMessage(requestId: number, text: string, token: string) {
    const res = await fetch(`${baseUrl}/items/chat_messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        request: requestId,
        message: text
        // sender is auto-filled via Directus preset
      })
    });
  
    if (!res.ok) throw new Error("Failed to send message");
    return await res.json();
  }