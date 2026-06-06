import { useState, useEffect, useRef, useCallback } from "react";
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
  HiOutlineMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiArrowLeft,
  HiBars3,
  HiOutlineChatBubbleOvalLeftEllipsis,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ChatManager() {
  const [allConversations, setAllConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const tabs = ["All", "Open", "Unassigned", "Closed"];

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await adminChatApi.getAllConversations({});
      const chats = data.data.chats || [];
      setAllConversations(chats);
    } catch (error) {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters when data, tab, or search changes
  useEffect(() => {
    let filtered = [...allConversations];

    // Filter by tab
    if (activeTab === "Open") {
      filtered = filtered.filter((c) => c.status === "open");
    } else if (activeTab === "Unassigned") {
      filtered = filtered.filter((c) => c.status === "open" && !c.admin);
    } else if (activeTab === "Closed") {
      filtered = filtered.filter((c) => c.status === "closed");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.user?.name?.toLowerCase().includes(query) ||
          c.subject?.toLowerCase().includes(query) ||
          c.lastMessage?.toLowerCase().includes(query),
      );
    }

    setFilteredConversations(filtered);
  }, [allConversations, activeTab, searchQuery]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        // Refresh conversations to update assignment status
        fetchConversations();
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
    setLoading(true);
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
  }, [selectedChat, fetchConversations]);

  return (
    <div className='flex flex-col h-[calc(100vh-100px)] max-h-[900px] w-full max-w-[1400px] mx-auto bg-[#F8F9FA] rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-sans'>
      {/* Top Main Header (Desktop only) */}
      <div className='hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-[#FF8C00] rounded-xl flex items-center justify-center shadow-sm text-white'>
            <HiChatBubbleLeftRight className='w-6 h-6' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900 leading-tight'>
              Live Chat
            </h1>
            <p className='text-sm text-gray-500'>
              Manage customer conversations in real-time
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm'
        >
          <HiArrowPath className='w-4 h-4' /> Refresh
        </button>
      </div>

      {/* Main Layout Container */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar - Conversation List */}
        <div
          className={`w-full md:w-[380px] lg:w-[420px] flex-col bg-white border-r border-gray-200 shrink-0 ${
            selectedChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Mobile App-like Header */}
          <div className='md:hidden flex items-center justify-between px-4 py-4 border-b border-gray-100'>
            <HiBars3 className='w-6 h-6 text-gray-700' />
            <h1 className='text-lg font-bold text-gray-900'>Live Chat</h1>
            <HiArrowPath
              className='w-6 h-6 text-gray-700 cursor-pointer'
              onClick={handleRefresh}
            />
          </div>

          {/* Sub Header / Tabs Area */}
          <div className='px-4 pt-4 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4 md:hidden'>
              <h2 className='font-bold text-gray-900 flex items-center gap-2'>
                Conversations
                <span className='w-5 h-5 bg-[#FF8C00] text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
                  {filteredConversations.length}
                </span>
              </h2>
            </div>

            {/* Desktop Header for list */}
            <div className='hidden md:flex items-center justify-between mb-4'>
              <h2 className='font-bold text-gray-900 flex items-center gap-2'>
                Conversations
                <span className='w-5 h-5 bg-[#FF8C00] text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
                  {filteredConversations.length}
                </span>
              </h2>
            </div>

            {/* Tabs */}
            <div className='flex items-center justify-between gap-4'>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? "text-[#FF8C00]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className='absolute bottom-0 left-0 w-full h-[2px] bg-[#FF8C00] rounded-t-md'></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className='p-3 flex gap-2 border-b border-gray-100'>
            <div className='relative flex-1'>
              <HiOutlineMagnifyingGlass className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search conversations...'
                className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/20 focus:border-[#FF8C00] transition-all placeholder:text-gray-400'
              />
            </div>
          </div>

          {/* List Area */}
          <div className='flex-1 overflow-y-auto bg-white'>
            {loading ? (
              <div className='p-8 flex justify-center items-center h-32'>
                <Spinner />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className='p-8 text-center text-gray-500 text-sm'>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : activeTab === "Closed"
                    ? "No closed conversations"
                    : activeTab === "Unassigned"
                      ? "No unassigned conversations"
                      : "No conversations found"}
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isSelected = selectedChat?._id === chat._id;
                return (
                  <button
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full text-left p-4 border-b border-gray-100 transition-all flex gap-3 relative ${
                      isSelected
                        ? "bg-[#FFF5EB] border-l-4 border-l-[#FF8C00]"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className='relative shrink-0'>
                      <div className='w-12 h-12 bg-[#1A1B26] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm'>
                        {chat.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                          chat.status === "open"
                            ? "bg-[#10B981]"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-0.5'>
                        <p className='text-[15px] font-bold text-gray-900 truncate pr-2'>
                          {chat.user?.name || "Unknown"}
                        </p>
                        <span className='text-xs text-gray-500 shrink-0'>
                          {new Date(
                            chat.lastMessageAt || Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className='text-xs text-gray-500 mb-1.5'>
                        {chat.subject || "General Inquiry"}
                        {chat.status === "closed" && " • Closed"}
                        {!chat.admin &&
                          chat.status === "open" &&
                          " • Unassigned"}
                      </p>

                      <div className='flex items-center justify-between gap-2'>
                        <p className='text-[13px] text-gray-600 truncate'>
                          {chat.lastMessage || "No messages yet"}
                        </p>
                        {chat.unreadCustomer > 0 && (
                          <span className='w-5 h-5 bg-[#FF8C00] text-white text-[11px] font-bold rounded-full flex items-center justify-center shrink-0 shadow-sm'>
                            {chat.unreadCustomer}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          {/* Footer count indicator */}
          <div className='p-3 text-xs text-gray-500 text-center border-t border-gray-100 bg-gray-50 shrink-0'>
            Showing {filteredConversations.length} of {allConversations.length}{" "}
            conversations
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <div
          className={`flex-1 flex-col bg-white relative ${
            !selectedChat ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedChat ? (
            <div className='flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8F9FA]'>
              <div className='w-24 h-24 bg-[#FF8C00]/10 rounded-3xl flex items-center justify-center mb-6'>
                <HiOutlineChatBubbleOvalLeftEllipsis className='w-12 h-12 text-[#FF8C00]' />
              </div>
              <h2 className='text-xl font-bold text-gray-900 mb-2'>
                No conversation selected
              </h2>
              <p className='text-gray-500 mb-8 max-w-sm'>
                Select a conversation from the list to start chatting and
                managing support queries.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className='px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10'>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => setSelectedChat(null)}
                    className='md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full'
                  >
                    <HiArrowLeft className='w-5 h-5' />
                  </button>

                  <div className='relative shrink-0'>
                    <div className='w-10 h-10 bg-[#1A1B26] rounded-full flex items-center justify-center text-white font-bold shadow-sm'>
                      {selectedChat.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                        selectedChat.status === "open"
                          ? "bg-[#10B981]"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className='text-[15px] font-bold text-gray-900'>
                      {selectedChat.user?.name}
                    </h3>
                    <p className='text-xs text-gray-500'>
                      {selectedChat.subject}
                      {selectedChat.status === "closed" && " • Closed"}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {selectedChat.status === "open" && (
                    <button
                      onClick={handleCloseChat}
                      className='px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center gap-1'
                    >
                      <HiXMark className='w-4 h-4' />
                      <span className='hidden sm:inline'>Close Chat</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F8F9FA]'>
                {messages.length === 0 ? (
                  <div className='flex justify-center items-center h-full'>
                    <p className='text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full'>
                      Start of conversation
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isCustomer = msg.senderModel === "User";
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex items-end gap-2 ${
                          isCustomer ? "justify-start" : "justify-end"
                        }`}
                      >
                        {isCustomer && (
                          <div className='w-8 h-8 bg-[#1A1B26] rounded-full flex items-center justify-center shrink-0 mb-1'>
                            <HiUser className='w-4 h-4 text-white' />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] md:max-w-[70%] flex flex-col ${
                            isCustomer ? "items-start" : "items-end"
                          }`}
                        >
                          <div
                            className={`px-4 py-3 rounded-[20px] text-[15px] shadow-sm leading-relaxed ${
                              isCustomer
                                ? "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                                : "bg-[#FF8C00] text-white rounded-br-sm"
                            }`}
                          >
                            {msg.message}
                          </div>
                          <div className='flex items-center gap-1 mt-1 px-1 text-[11px] font-medium text-gray-400'>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {!isCustomer && (
                              <HiCheck className='w-3.5 h-3.5 text-[#10B981]' />
                            )}
                          </div>
                        </div>
                        {!isCustomer && (
                          <div className='w-8 h-8 bg-[#FF8C00] rounded-full flex items-center justify-center shrink-0 mb-1 shadow-sm'>
                            <HiShieldCheck className='w-4 h-4 text-white' />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Only show for open chats */}
              {selectedChat.status === "open" ? (
                <div className='p-4 bg-white border-t border-gray-200 shrink-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]'>
                  <form
                    onSubmit={handleSendMessage}
                    className='flex items-end gap-3 max-w-4xl mx-auto relative'
                  >
                    <div className='flex-1 relative bg-gray-50 border border-gray-200 rounded-[20px] focus-within:ring-2 focus-within:ring-[#FF8C00]/20 focus-within:border-[#FF8C00] focus-within:bg-white transition-all shadow-sm'>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder='Type your reply here...'
                        className='w-full px-4 py-3.5 bg-transparent border-none focus:outline-none focus:ring-0 resize-none max-h-32 text-[15px] placeholder:text-gray-400'
                        rows='1'
                        style={{ minHeight: "52px" }}
                      />
                    </div>
                    <button
                      type='submit'
                      disabled={sending || !newMessage.trim()}
                      className='w-[52px] h-[52px] shrink-0 bg-[#FF8C00] text-white rounded-[20px] flex items-center justify-center hover:bg-[#E67E00] disabled:opacity-50 disabled:hover:bg-[#FF8C00] transition-all shadow-md group'
                    >
                      <HiPaperAirplane className='w-6 h-6 -rotate-45 ml-1 mb-1 group-hover:scale-110 transition-transform' />
                    </button>
                  </form>
                  <div className='text-center mt-2'>
                    <span className='text-[11px] text-gray-400 font-medium'>
                      Press Enter to send, Shift + Enter for new line
                    </span>
                  </div>
                </div>
              ) : (
                <div className='p-6 text-center bg-gray-50 border-t border-gray-200'>
                  <p className='text-sm text-gray-500'>
                    This conversation has been closed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
