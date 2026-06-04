import api from "../../utils/axios";

export const chatApi = {
  startConversation: (data) => api.post("/chat/start", data),
  getConversations: () => api.get("/chat/conversations"),
  getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  sendMessage: (chatId, message) =>
    api.post(`/chat/${chatId}/message`, { message }),
};

export const adminChatApi = {
  getAllConversations: (params) =>
    api.get("/chat/admin/conversations", { params }),
  closeConversation: (chatId) => api.put(`/chat/${chatId}/close`),
  assignToMe: (chatId) => api.put(`/chat/${chatId}/assign`),
};
