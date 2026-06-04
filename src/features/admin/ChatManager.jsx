import { useState, useEffect, useRef } from "react";
import { adminChatApi, chatApi } from "../chat/chatApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import {
  HiChatBubbleLeftRight,
  HiUser,
  HiShieldCheck,
  HiPaperAirplane,
  HiXMark,
  HiCheck,
  HiArrowPath,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ChatManager() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const { data } = await adminChatApi.getAllConversations({
        status: "open",
      });
      setConversations(data.data.chats);
    } catch (error) {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await chatApi.getMessages(chatId);
      setMessages(data.data.messages || []);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat._id);
    // Auto-assign if not assigned
    if (!chat.admin) {
      try {
        await adminChatApi.assignToMe(chat._id);
      } catch (error) {
        // ignore
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    setSending(true);
    try {
      await chatApi.sendMessage(selectedChat._id, newMessage.trim());
      setNewMessage("");
      await fetchMessages(selectedChat._id);
      await fetchConversations();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (!confirm("Close this conversation?")) return;
    try {
      await adminChatApi.closeConversation(selectedChat._id);
      toast.success("Conversation closed");
      setSelectedChat(null);
      setMessages([]);
      fetchConversations();
    } catch (error) {
      toast.error("Failed to close");
    }
  };

  const handleRefresh = () => {
    fetchConversations();
    if (selectedChat) fetchMessages(selectedChat._id);
  };

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedChat) fetchMessages(selectedChat._id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-[#0F1111]'>Live Chat</h1>
          <p className='text-sm text-[#565959] mt-1'>
            Manage customer conversations in real-time
          </p>
        </div>
        <Button onClick={handleRefresh} variant='outline' size='sm'>
          <HiArrowPath className='w-4 h-4 mr-1' /> Refresh
        </Button>
      </div>

      <div
        className='grid grid-cols-1 lg:grid-cols-3 gap-6'
        style={{ height: "calc(100vh - 200px)" }}
      >
        {/* Conversation List */}
        <div className='lg:col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col'>
          <div className='p-4 border-b border-[#D5D9D9] bg-[#F7FAFA]'>
            <h2 className='text-sm font-bold text-[#0F1111] uppercase flex items-center gap-2'>
              <HiChatBubbleLeftRight className='w-4 h-4' />
              Conversations ({conversations.length})
            </h2>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='p-8 flex justify-center'>
                <Spinner />
              </div>
            ) : conversations.length === 0 ? (
              <div className='p-8 text-center text-[#565959] text-sm'>
                <HiChatBubbleLeftRight className='w-12 h-12 mx-auto mb-3 text-[#D5D9D9]' />
                No open conversations
              </div>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-4 border-b border-[#D5D9D9] hover:bg-[#F7FAFA] transition-colors ${
                    selectedChat?._id === chat._id
                      ? "bg-[#FFF8F0] border-l-4 border-l-[#FF9900]"
                      : ""
                  }`}
                >
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        {chat.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-[#0F1111]'>
                          {chat.user?.name || "Unknown"}
                        </p>
                        <p className='text-[10px] text-[#565959]'>
                          {chat.subject}
                        </p>
                      </div>
                    </div>
                    {chat.unreadCustomer > 0 && (
                      <span className='w-5 h-5 bg-[#FF9900] text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
                        {chat.unreadCustomer}
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-[#565959] truncate mt-1'>
                    {chat.lastMessage}
                  </p>
                  <p className='text-[10px] text-[#565959] mt-1'>
                    {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className='lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col'>
          {!selectedChat ? (
            <div className='flex-1 flex items-center justify-center text-[#565959]'>
              <div className='text-center'>
                <HiChatBubbleLeftRight className='w-16 h-16 mx-auto mb-4 text-[#D5D9D9]' />
                <p className='text-sm'>
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className='p-4 border-b border-[#D5D9D9] bg-[#F7FAFA] flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white text-sm font-bold'>
                    {selectedChat.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className='text-sm font-bold text-[#0F1111]'>
                      {selectedChat.user?.name}
                    </p>
                    <p className='text-[10px] text-[#565959]'>
                      {selectedChat.subject}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseChat}
                  className='p-2 hover:bg-red-50 rounded-lg text-[#565959] hover:text-[#B12704] transition-colors'
                  title='Close conversation'
                >
                  <HiXMark className='w-5 h-5' />
                </button>
              </div>

              {/* Messages */}
              <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7FAFA]'>
                {messages.length === 0 ? (
                  <p className='text-center text-sm text-[#565959] py-8'>
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg, i) => {
                    const isCustomer = msg.senderModel === "User";
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
                      >
                        {isCustomer && (
                          <div className='w-7 h-7 bg-[#1a1a2e] rounded-full flex items-center justify-center mr-2 shrink-0 mt-1'>
                            <HiUser className='w-4 h-4 text-white' />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                            isCustomer
                              ? "bg-white text-[#0F1111] rounded-bl-md shadow-sm border border-[#D5D9D9]"
                              : "bg-[#FF9900] text-white rounded-br-md"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p
                            className={`text-[10px] mt-1 ${isCustomer ? "text-[#565959]" : "text-white/60"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {!isCustomer && (
                              <HiCheck className='w-3 h-3 inline ml-1' />
                            )}
                          </p>
                        </div>
                        {!isCustomer && (
                          <div className='w-7 h-7 bg-[#FF9900] rounded-full flex items-center justify-center ml-2 shrink-0 mt-1'>
                            <HiShieldCheck className='w-4 h-4 text-white' />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className='p-3 border-t border-[#D5D9D9] bg-white'>
                <form onSubmit={handleSendMessage} className='flex gap-2'>
                  <input
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Type a reply...'
                    className='flex-1 px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
                  />
                  <button
                    type='submit'
                    disabled={sending || !newMessage.trim()}
                    className='px-4 py-2.5 bg-[#FF9900] text-white rounded-xl hover:bg-[#E88B00] disabled:opacity-50 transition-colors'
                  >
                    <HiPaperAirplane className='w-4 h-4' />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
