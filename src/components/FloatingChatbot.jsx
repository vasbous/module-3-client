import React, { useState, useEffect, useContext } from "react";
import { Chatbot } from "./Chatbot";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../css/FloatingChatbot.css";
import { API_URL } from "../config/config";

export const FloatingChatbot = () => {
  const { currentUser, isLoggedIn, refetchUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(null);

  // Load chatbot state and last read timestamp from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("chatbotState");
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
    }

    // Load last read timestamp
    if (currentUser) {
      const savedTimestamp = localStorage.getItem(
        `${currentUser._id}_lastReadTimestamp`
      );
      if (savedTimestamp) {
        setLastReadTimestamp(parseInt(savedTimestamp));
      } else {
        // If no timestamp exists, set it to now
        const now = new Date().getTime();
        setLastReadTimestamp(now);
        localStorage.setItem(
          `${currentUser._id}_lastReadTimestamp`,
          now.toString()
        );
      }
    }

    // Listen for the custom openChatbot event
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener("openChatbot", handleOpenChatbot);

    return () => {
      window.removeEventListener("openChatbot", handleOpenChatbot);
    };
  }, [currentUser]);

  // First-time visitor welcome message
  useEffect(() => {
    // Check if this is the first visit to dashboard specifically
    const isFirstDashboardVisit = !localStorage.getItem("hasVisitedDashboard");

    if (
      isFirstDashboardVisit &&
      window.location.pathname === "/dashboard" && // Only show welcome on dashboard
      currentUser &&
      currentUser.plan &&
      !hasShownWelcome
    ) {
      // Set flag immediately to prevent multiple triggers
      localStorage.setItem("hasVisitedDashboard", "true");
      setHasShownWelcome(true);

      // Set timeout to open chatbot after page loads
      const welcomeTimeout = setTimeout(() => {
        setIsOpen(true);
        sendWelcomeMessage();
      }, 1500); // Reduced slightly to ensure it happens before user interaction

      return () => clearTimeout(welcomeTimeout);
    }
  }, [currentUser, window.location.pathname]);

  // Check for unread messages when user data changes
  useEffect(() => {
    if (currentUser && currentUser.chat_history) {
      calculateUnreadMessages();
    }
  }, [currentUser, lastReadTimestamp]);

  // Save chatbot state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("chatbotState", JSON.stringify(isOpen));
    // If chatbot is opened, mark all messages as read
    if (isOpen && currentUser) {
      const now = new Date().getTime();
      setLastReadTimestamp(now);
      localStorage.setItem(
        `${currentUser._id}_lastReadTimestamp`,
        now.toString()
      );
      setUnreadCount(0);
    }
  }, [isOpen, currentUser]);

  const calculateUnreadMessages = () => {
    if (!currentUser || !currentUser.chat_history || !lastReadTimestamp) return;

    // Count messages that have a system/notification type (no user_message)
    let unreadCount = 0;
    currentUser.chat_history.forEach((msg) => {
      if (!msg.user_message && msg.ai_message) {
        // This indicates it's a notification/system message - count as unread
        unreadCount++;
      }
    });

    setUnreadCount(unreadCount);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendWelcomeMessage = async () => {
    if (!currentUser || !currentUser._id) return;

    try {
      // Format welcome message
      const welcomeMessage = `Welcome to your personal dashboard! 👋 I'm your Life Coach assistant and I'm here to help you achieve your goals. You can ask me about:

\n\n
- Your current tasks and goals\n
- Tips for completing tasks effectively\n
- Motivation when you're feeling stuck\n
- Tracking your progress\n\n

Feel free to send me a message anytime you need assistance!`;

      // Get current chat history
      const userResponse = await axios.get(
        `${API_URL}/user/${currentUser._id}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const currentChatHistory = userResponse.data.chat_history || [];

      // Add the welcome message to chat history
      const newChatHistory = [
        ...currentChatHistory,
        { user_message: "", ai_message: welcomeMessage },
      ];

      // Update the database with new chat history
      await axios.patch(
        `${API_URL}/user/update/chat_history/${currentUser._id}`,
        {
          chat_history: newChatHistory,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Force a refetch of user data to show the welcome message in the chat
      if (currentUser && currentUser._id) {
        await refetchUser(currentUser._id);
      }
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
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
