import React, { useState, useEffect, useContext } from "react";
import { Chatbot } from "./Chatbot";
import { AuthContext } from "../context/AuthContext";
import "../css/FloatingChatbot.css";

export const FloatingChatbot = () => {
  const { currentUser, isLoggedIn } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState("");

  // Load chatbot state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("chatbotState");
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
    }

    // Load last read message ID
    const savedLastReadId = localStorage.getItem("lastReadMessageId");
    if (savedLastReadId) {
      setLastReadMessageId(savedLastReadId);
    }
  }, []);

  // Check for unread messages when user data changes
  useEffect(() => {
    if (
      currentUser &&
      currentUser.chat_history &&
      currentUser.chat_history.length > 0
    ) {
      calculateUnreadMessages();
    }
  }, [currentUser]);

  // Save chatbot state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("chatbotState", JSON.stringify(isOpen));

    // If chatbot is opened, mark all messages as read
    if (
      isOpen &&
      currentUser &&
      currentUser.chat_history &&
      currentUser.chat_history.length > 0
    ) {
      const lastMessageIndex = currentUser.chat_history.length - 1;
      const lastMessageId = `${currentUser._id}-${lastMessageIndex}`;
      setLastReadMessageId(lastMessageId);
      localStorage.setItem("lastReadMessageId", lastMessageId);
      setUnreadCount(0);
    }
  }, [isOpen, currentUser]);

  const calculateUnreadMessages = () => {
    if (!currentUser || !currentUser.chat_history) return;

    // If no messages have been read yet
    if (!lastReadMessageId) {
      setUnreadCount(currentUser.chat_history.length);
      return;
    }

    // Extract the index from the lastReadMessageId
    const parts = lastReadMessageId.split("-");
    if (parts.length !== 2) {
      setUnreadCount(currentUser.chat_history.length);
      return;
    }

    const userId = parts[0];
    const lastReadIndex = parseInt(parts[1]);

    // If user ID has changed, all messages are unread
    if (userId !== currentUser._id) {
      setUnreadCount(currentUser.chat_history.length);
      return;
    }

    // Calculate unread count
    const newMessages = currentUser.chat_history.length - (lastReadIndex + 1);
    setUnreadCount(newMessages > 0 ? newMessages : 0);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Handler for new messages from the Chatbot component
  const handleNewMessage = () => {
    if (!isOpen && currentUser) {
      setUnreadCount((prevCount) => prevCount + 1);
    }
  };

  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="floating-chatbot-container">
      {isOpen ? (
        <div className="chatbot-popup">
          <div className="chatbot-popup-header">
            <h3>Life Coach Assistant</h3>
            <button className="close-button" onClick={toggleChatbot}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="chatbot-popup-content">
            <Chatbot hideHeader={true} onNewMessage={handleNewMessage} />
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle-button" onClick={toggleChatbot}>
          <i className="fas fa-comment"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
      )}
    </div>
  );
};
