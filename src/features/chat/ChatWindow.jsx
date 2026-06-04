import { useState, useEffect, useRef } from "react";
import { chatApi } from "./chatApi";
import { useAppSelector } from "../../app/hooks";
import { HiPaperAirplane, HiUser, HiShieldCheck } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ChatWindow({ onClose }) {
  const { user } = useAppSelector((state) => state.auth);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [showStartForm, setShowStartForm] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      const { data } = await chatApi.getConversations();
      const openChat = data.data.chats.find((c) => c.status === "open");
      if (openChat) {
        setConversation(openChat);
        setShowStartForm(false);
        fetchMessages(openChat._id);
      } else {
        setShowStartForm(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await chatApi.getMessages(chatId);
      setMessages(data.data.messages || []);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const { data } = await chatApi.startConversation({
        subject: subject || "General Inquiry",
        message: newMessage.trim(),
      });
      setConversation(data.data.chat);
      setShowStartForm(false);
      setNewMessage("");
      setSubject("");
      fetchMessages(data.data.chat._id);
      toast.success("Chat started!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start chat");
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    setSending(true);
    try {
      await chatApi.sendMessage(conversation._id, newMessage.trim());
      setNewMessage("");
      fetchMessages(conversation._id);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversation) return;
    const interval = setInterval(() => {
      fetchMessages(conversation._id);
    }, 5000);
    return () => clearInterval(interval);
  }, [conversation]);

  return (
    <div className='fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-[#D5D9D9] flex flex-col z-50 overflow-hidden'>
      {/* Header */}
      <div className='bg-[#1a1a2e] text-white p-4 flex items-center justify-between shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-[#FF9900] rounded-full flex items-center justify-center'>
            <HiShieldCheck className='w-5 h-5' />
          </div>
          <div>
            <h3 className='text-sm font-bold'>Customer Support</h3>
            <p className='text-[10px] text-white/60 flex items-center gap-1'>
              <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
              We're online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7FAFA]'>
        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='w-6 h-6 border-2 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin' />
          </div>
        ) : showStartForm ? (
          <div className='text-center py-8'>
            <p className='text-sm text-[#565959] mb-4'>
              How can we help you today?
            </p>
          </div>
        ) : messages.length === 0 ? (
          <p className='text-center text-sm text-[#565959] py-8'>
            No messages yet
          </p>
        ) : (
          messages.map((msg, i) => {
            const isCustomer = msg.senderModel === "User";
            return (
              <div
                key={msg._id || i}
                className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
              >
                {!isCustomer && (
                  <div className='w-7 h-7 bg-[#FF9900] rounded-full flex items-center justify-center mr-2 shrink-0 mt-1'>
                    <HiShieldCheck className='w-4 h-4 text-white' />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isCustomer
                      ? "bg-[#FF9900] text-white rounded-br-md"
                      : "bg-white text-[#0F1111] rounded-bl-md shadow-sm border border-[#D5D9D9]"
                  }`}
                >
                  <p>{msg.message}</p>
                  <p
                    className={`text-[10px] mt-1 ${isCustomer ? "text-white/60" : "text-[#565959]"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {isCustomer && (
                  <div className='w-7 h-7 bg-[#1a1a2e] rounded-full flex items-center justify-center ml-2 shrink-0 mt-1'>
                    <HiUser className='w-4 h-4 text-white' />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='p-3 border-t border-[#D5D9D9] bg-white shrink-0'>
        {showStartForm ? (
          <form onSubmit={handleStartChat} className='space-y-2'>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='Subject (optional)'
              className='w-full px-3 py-2 text-xs border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
            <div className='flex gap-2'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Type your message...'
                className='flex-1 px-3 py-2 text-xs border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
              />
              <button
                type='submit'
                disabled={sending || !newMessage.trim()}
                className='px-3 py-2 bg-[#FF9900] text-white rounded-lg hover:bg-[#E88B00] disabled:opacity-50 transition-colors'
              >
                <HiPaperAirplane className='w-4 h-4' />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendMessage} className='flex gap-2'>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Type a message...'
              className='flex-1 px-3 py-2 text-xs border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
            <button
              type='submit'
              disabled={sending || !newMessage.trim()}
              className='px-3 py-2 bg-[#FF9900] text-white rounded-lg hover:bg-[#E88B00] disabled:opacity-50 transition-colors'
            >
              <HiPaperAirplane className='w-4 h-4' />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
