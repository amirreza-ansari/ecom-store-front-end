import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  // Only show for authenticated customers
  if (!isAuthenticated) return null;

  return (
    <>
      <ChatBubble isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}
