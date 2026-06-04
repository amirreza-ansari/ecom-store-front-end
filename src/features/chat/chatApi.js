import api from "../../utils/axios";

export const chatApi = {
  startConversation: (data) => api.post("/chat/start", data),
  getConversations: () => api.get("/chat/conversations"),
  getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  sendMessage: (chatId, message) =>
    api.post(`/chat/${chatId}/message`, { message }),
};
