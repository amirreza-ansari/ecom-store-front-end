import { useState, useEffect, useRef } from "react";
import { chatApi } from "./chatApi";
import { useAppSelector } from "../../app/hooks";
import {
  HiPaperAirplane,
  HiShieldCheck,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowsPointingOut,
  HiOutlineXMark,
  HiOutlineFaceSmile,
  HiOutlinePaperClip,
  HiCheck,
} from "react-icons/hi2";
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

  const handleQuickReply = (text) => {
    setNewMessage(text);
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
    <div className='fixed bottom-6 right-6 w-80 sm:w-[360px] h-[550px] bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col z-50 overflow-hidden font-sans border border-gray-200/60 animate-in fade-in slide-in-from-bottom-4 duration-300'>
      {/* Header */}
      <div className='bg-[#0F1423] p-4 flex items-center justify-between shrink-0 z-10'>
        <div className='flex items-center gap-3'>
          <div className='w-11 h-11 bg-[#FF7F11] rounded-full flex items-center justify-center shrink-0'>
            <HiShieldCheck className='w-[22px] h-[22px] text-white' />
          </div>
          <div>
            <h3 className='text-[15px] font-semibold text-white tracking-wide'>
              Customer Support
            </h3>
            <div className='flex items-center gap-1.5 mt-0.5'>
              <span className='w-2 h-2 bg-[#10B981] rounded-full'></span>
              <p className='text-xs text-gray-300 font-medium'>
                We're online and ready to help!
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3 text-gray-400'>
          <button className='hover:text-white transition-colors'>
            <HiOutlineMagnifyingGlass className='w-5 h-5' />
          </button>
          <button className='hover:text-white transition-colors'>
            <HiOutlineArrowsPointingOut className='w-5 h-5' />
          </button>
          <button
            onClick={onClose}
            className='hover:text-white transition-colors'
          >
            <HiOutlineXMark className='w-6 h-6' />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-5 bg-white [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-2'>
        {loading ? (
          <div className='flex justify-center items-center h-full'>
            <div className='w-8 h-8 border-3 border-gray-200 border-t-[#FF7F11] rounded-full animate-spin' />
          </div>
        ) : showStartForm ? (
          <div className='flex flex-col items-center justify-center h-full text-center px-4'>
            <div className='w-16 h-16 bg-[#FF7F11]/10 rounded-full flex items-center justify-center mb-4'>
              <HiShieldCheck className='w-8 h-8 text-[#FF7F11]' />
            </div>
            <h4 className='text-gray-800 font-semibold mb-2'>
              How can we help?
            </h4>
            <p className='text-sm text-gray-500'>
              Send us a message below to start a conversation with our support
              team.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <p className='text-sm text-gray-400 font-medium bg-gray-50 px-4 py-2 rounded-full'>
              No messages yet. Send a message below!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isCustomer = msg.senderModel === "User";
            return (
              <div
                key={msg._id || i}
                className={`flex gap-3 ${isCustomer ? "justify-end" : "justify-start"}`}
              >
                {!isCustomer && (
                  <div className='w-8 h-8 bg-[#FF7F11] rounded-full flex items-center justify-center shrink-0 mt-auto mb-1'>
                    <HiShieldCheck className='w-4 h-4 text-white' />
                  </div>
                )}

                <div
                  className={`max-w-[75%] px-4 py-2.5 flex flex-col relative ${
                    isCustomer
                      ? "bg-[#FF7F11] text-white rounded-[20px] rounded-br-sm"
                      : "bg-[#F3F4F6] text-[#1F2937] rounded-[20px] rounded-bl-sm"
                  }`}
                >
                  <p className='text-[14px] leading-[1.4] break-words'>
                    {msg.message}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 ${
                      isCustomer ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    <span className='text-[10px] font-medium'>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isCustomer && (
                      <div className='flex -space-x-1 mt-0.5'>
                        <HiCheck className='w-3 h-3' />
                        <HiCheck className='w-3 h-3' />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className='h-1' />
      </div>

      {/* Quick Replies */}
      {!loading && !showStartForm && (
        <div className='px-4 pb-3 bg-white flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0'>
          <button
            onClick={() => handleQuickReply("👋 Hello")}
            className='px-3 py-1.5 border border-gray-200 text-gray-700 bg-white rounded-full text-[13px] font-medium hover:bg-gray-50 whitespace-nowrap shadow-sm'
          >
            👋 Hello
          </button>
          <button
            onClick={() => handleQuickReply("🛍️ Track my order")}
            className='px-3 py-1.5 border border-gray-200 text-gray-700 bg-white rounded-full text-[13px] font-medium hover:bg-gray-50 whitespace-nowrap shadow-sm'
          >
            🛍️ Track my order
          </button>
          <button
            onClick={() => handleQuickReply("📦 Return & Refund")}
            className='px-3 py-1.5 border border-gray-200 text-gray-700 bg-white rounded-full text-[13px] font-medium hover:bg-gray-50 whitespace-nowrap shadow-sm'
          >
            📦 Return & Refund
          </button>
          <button className='px-3 py-1.5 border border-gray-200 text-gray-500 bg-white rounded-full text-[13px] font-medium hover:bg-gray-50 whitespace-nowrap shadow-sm'>
            •••
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className='px-4 py-3 bg-white shrink-0 z-10'>
        {showStartForm ? (
          <form onSubmit={handleStartChat} className='space-y-3'>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='Subject (optional)'
              className='w-full px-4 py-3 text-[14px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF7F11] transition-colors placeholder:text-gray-400 shadow-sm'
            />
            <div className='flex gap-2 items-center'>
              <div className='relative flex-1'>
                <input
                  type='text'
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder='Type a message...'
                  className='w-full pl-4 pr-16 py-3 text-[14px] bg-white border border-gray-200 rounded-[18px] focus:outline-none focus:border-[#FF7F11] transition-colors placeholder:text-gray-400 shadow-sm'
                />
                <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400'>
                  <HiOutlineFaceSmile className='w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors' />
                  <HiOutlinePaperClip className='w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors' />
                </div>
              </div>
              <button
                type='submit'
                disabled={sending || !newMessage.trim()}
                className='w-12 h-12 bg-[#FF7F11] text-white rounded-[16px] flex items-center justify-center hover:bg-[#E66D00] disabled:opacity-50 disabled:hover:bg-[#FF7F11] transition-all shadow-md shrink-0'
              >
                <HiPaperAirplane className='w-5 h-5 ml-0.5' />
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className='flex gap-2 items-center'
          >
            <div className='relative flex-1'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Type a message...'
                className='w-full pl-4 pr-16 py-3.5 text-[14px] bg-white border border-gray-200 rounded-[18px] focus:outline-none focus:border-[#FF7F11] transition-colors placeholder:text-gray-400 shadow-sm'
              />
              <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400'>
                <HiOutlineFaceSmile className='w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors' />
                <HiOutlinePaperClip className='w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors' />
              </div>
            </div>
            <button
              type='submit'
              disabled={sending || !newMessage.trim()}
              className='w-[50px] h-[50px] bg-[#FF7F11] text-white rounded-[16px] flex items-center justify-center hover:bg-[#E66D00] disabled:opacity-50 disabled:hover:bg-[#FF7F11] transition-all shadow-md shrink-0'
            >
              <HiPaperAirplane className='w-5 h-5 -rotate-45 mb-0.5 ml-0.5' />
            </button>
          </form>
        )}
      </div>

      {/* Footer Area */}
      <div className='bg-[#F8F9FA] py-2.5 text-center shrink-0 border-t border-gray-100'>
        <p className='text-[11px] text-gray-400 font-medium'>
          We typically reply in a few minutes ⚡
        </p>
      </div>
    </div>
  );
}
