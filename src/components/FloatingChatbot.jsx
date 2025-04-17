import React, { useState, useEffect, useContext } from "react";
import { Chatbot } from "./Chatbot";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../css/FloatingChatbot.css";
import { API_URL } from "../config/config";

export const FloatingChatbot = () => {
  const { currentUser, isLoggedIn, refetchUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  // Load chatbot state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("chatbotState");
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
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

  // Welcome message based on welcome_message field in user profile
  useEffect(() => {
    // Check if user hasn't seen the welcome message before (welcome_message is false)
    if (
      currentUser &&
      currentUser.welcome_message === false &&
      window.location.pathname === "/dashboard" // Only show welcome on dashboard
    ) {
      // console.log("Welcome message status:", currentUser.welcome_message);
      // Set flag immediately to prevent multiple triggers

      // Set timeout to open chatbot after 3 seconds
      const welcomeTimeout = setTimeout(() => {
        setIsOpen(true);
        // First update welcome_message to true in database
        updateWelcomeMessageStatus().then(() => {
          // Then send welcome message after status is updated
          sendWelcomeMessage();
        });
      }, 3000); // 3 second delay as requested

      return () => clearTimeout(welcomeTimeout);
    }
  }, [currentUser, window.location.pathname]);

  // Save chatbot state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("chatbotState", JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Function to update welcome_message status in database
  const updateWelcomeMessageStatus = async () => {
    if (!currentUser || !currentUser._id) {
      // console.log("No current user found, can't update welcome message");
      return;
    }

    // console.log(
    //   "Attempting to update welcome_message for user:",
    //   currentUser._id
    // );

    try {
      // Call the API endpoint to update welcome_message
      const response = await axios.patch(
        `${API_URL}/user/update/welcome_message/${currentUser._id}`,
        { welcome_message: true }, // Explicitly send the value we want to update to
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Welcome message update response:", response.data);

      // Force refresh user data to update the welcome_message status locally
      if (currentUser && currentUser._id) {
        await refetchUser(currentUser._id);
        // console.log("User data refreshed after welcome message update");
      }

      return true;
    } catch (error) {
      console.error(
        "Error updating welcome message status:",
        error.response ? error.response.data : error.message
      );
      return false;
    }
  };

  const sendWelcomeMessage = async () => {
    if (!currentUser || !currentUser._id) {
      // console.log("No current user found, can't send welcome message");
      return;
    }

    try {
      // Format welcome message exactly as specified
      const welcomeMessage = `Welcome to your personal dashboard! 👋 I'm your Life Coach assistant and I'm here to help you achieve your goals. You can ask me about:
    
- Your current tasks and goals
- Tips for completing tasks effectively
- Motivation when you're feeling stuck
- Tracking your progress
    
Feel free to send me a message anytime you need assistance!`;

      // console.log("Fetching current chat history");
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
      // console.log("Current chat history length:", currentChatHistory.length);

      // Add the welcome message to chat history
      const newChatHistory = [
        ...currentChatHistory,
        { user_message: "", ai_message: welcomeMessage },
      ];

      // console.log("Updating chat history with welcome message");
      // Update the database with new chat history
      const response = await axios.patch(
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

      // console.log("Chat history update response:", response.data);

      // Force a refetch of user data to show the welcome message in the chat
      if (currentUser && currentUser._id) {
        await refetchUser(currentUser._id);
        // console.log("User data refreshed after chat history update");
      }
    } catch (error) {
      console.error(
        "Error sending welcome message:",
        error.response ? error.response.data : error.message
      );
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
            <Chatbot hideHeader={true} />
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle-button" onClick={toggleChatbot}>
          <i className="fas fa-comment"></i>
        </button>
      )}
    </div>
  );
};
