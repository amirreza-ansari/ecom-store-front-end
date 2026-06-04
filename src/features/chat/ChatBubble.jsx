import { HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";

export default function ChatBubble({ isOpen, onClick, unreadCount }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 ${
        isOpen
          ? "w-14 h-14 bg-white text-[#0F1111] rotate-90"
          : "w-14 h-14 bg-[#FF9900] text-white animate-bounce-slow"
      }`}
    >
      {isOpen ? (
        <HiXMark className='w-6 h-6' />
      ) : (
        <>
          <HiChatBubbleLeftRight className='w-6 h-6' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 w-6 h-6 bg-[#B12704] text-white text-xs font-bold rounded-full flex items-center justify-center'>
              {unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
