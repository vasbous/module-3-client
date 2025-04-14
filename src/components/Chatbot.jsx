import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../css/Chatbot.css";

export const Chatbot = ({ hideHeader = false, onNewMessage }) => {
  const { currentUser, refetchUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const MAX_HISTORY = 30; // Set maximum history length to 30

  // Load chat history from user profile when component mounts or currentUser changes
  useEffect(() => {
    if (
      currentUser &&
      currentUser.chat_history &&
      currentUser.chat_history.length > 0
    ) {
      // Load messages from user's chat history
      const loadedMessages = currentUser.chat_history.map((msg, index) => ({
        id: index,
        user: msg.user_message,
        bot: msg.ai_message,
      }));

      setMessages(loadedMessages);
    } else {
      // Add welcome message if no history exists
      setMessages([
        {
          id: 0,
          bot: "Hi there! I'm your Life Coach assistant. How can I help you today with your goals or tasks?",
        },
      ]);
    }
  }, [currentUser]);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateGeminiPrompt = (userMessage) => {
    // Extract goal details and task information from user
    const goalDetails = currentUser?.goal_details || {};
    const selectedGoal = goalDetails.selectedGoal || "No specific goal set";
    const planTasks = extractTasksFromPlan();

    // Format goal-related questions and answers
    let questionsAndAnswers = "";
    if (goalDetails.questions && goalDetails.questions.length > 0) {
      questionsAndAnswers = goalDetails.questions
        .map(
          (q) =>
            `Question: ${q.question || q.title}\nAnswer: ${
              q.user_answer || "Not answered"
            }`
        )
        .join("\n");
    }

    // Format conversation history (limit to last 5 exchanges)
    const recentMessages = messages
      .slice(-5)
      .map((msg) => {
        return `${msg.user ? "User: " + msg.user : ""}${
          msg.bot ? "\nAssistant: " + msg.bot : ""
        }`;
      })
      .join("\n\n");

    return `
    You are a friendly, concise life coach assistant helping a user with their personal development journey.
    
    USER INFORMATION:
    Goal: ${selectedGoal}
    User's Tasks: ${planTasks}
    Goal-Related Questions & Answers: ${
      questionsAndAnswers || "No specific questions answered yet"
    }
    
    CONVERSATION CONTEXT:
    ${recentMessages}
    
    USER'S CURRENT QUESTION: ${userMessage}
    
    Guidelines for your response:
    1. Keep answers concise - between one line and a short paragraph
    2. Be supportive, empathetic, and motivational
    3. Focus specifically on the user's goal and planned tasks when relevant
    4. If you need clarification to give a good answer, ask ONE brief follow-up question
    5. Don't introduce yourself or use unnecessary pleasantries - just answer directly
    6. If asked about tasks, provide specific implementation advice when possible
    7. Maintain a warm, personal coaching style
    
    Respond conversationally as if you're a supportive coach:
    `;
  };

  // Helper function to extract tasks from user's plan
  const extractTasksFromPlan = () => {
    if (!currentUser || !currentUser.plan || !currentUser.plan.tasks) {
      return "No tasks in current plan";
    }

    return currentUser.plan.tasks
      .map((taskItem) => {
        const taskDetails = taskItem.task;
        if (taskDetails) {
          const startDate = new Date(taskItem.startDate).toLocaleDateString();
          return `Task: ${taskDetails.content} (${startDate}) - ${
            taskItem.done ? "Completed" : "Pending"
          }`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");
  };

  const getAIResponse = async (userMessage) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const prompt = generateGeminiPrompt(userMessage);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }
      );

      // Extract the text response from Gemini
      let aiResponse = "";
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]
      ) {
        aiResponse = response.data.candidates[0].content.parts[0].text.trim();
      }

      return aiResponse;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const newMessages = [
      ...messages,
      { id: messages.length, user: userMessage },
    ];
    setMessages(newMessages);

    // Show loading state
    setLoading(true);
    setError(null);

    try {
      // Get AI response
      const botResponse = await getAIResponse(userMessage);

      // Add bot response to chat
      setMessages((prev) => [...prev, { id: prev.length, bot: botResponse }]);

      // Notify parent component about new message (for notification badge)
      if (onNewMessage) {
        onNewMessage();
      }

      // Save to user's chat history in database
      if (currentUser && currentUser._id) {
        try {
          // Get the most recent chat history directly from the database
          const userResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/user/${currentUser._id}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          // Get current chat history
          const currentChatHistory = userResponse.data.chat_history || [];

          // Create new chat history, limiting to MAX_HISTORY items
          const newChatHistory = [
            ...currentChatHistory,
            { user_message: userMessage, ai_message: botResponse },
          ].slice(-MAX_HISTORY); // Keep only the most recent MAX_HISTORY messages

          // Update the database with new chat history
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/user/update/chat_history/${
              currentUser._id
            }`,
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

          // Refresh user data to update the chat history in context
          await refetchUser(currentUser._id);
        } catch (err) {
          console.error("Error saving chat history:", err);
        }
      }
    } catch (err) {
      console.error("Error in chat submission:", err);
      setError("Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!hideHeader && (
        <div className="chatbot-header">
          <h3>Life Coach Assistant</h3>
        </div>
      )}

      <div className="chatbot-messages">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            {message.user && (
              <div className="message user-message">
                <p>{message.user}</p>
              </div>
            )}
            {message.bot && (
              <div className="message bot-message">
                <p>{message.bot}</p>
              </div>
            )}
          </React.Fragment>
        ))}
        {loading && (
          <div className="message bot-message loading">
            <div className="typing-indicator"></div>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chatbot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your goals or tasks..."
          disabled={loading}
          className="chatbot-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="chatbot-send-btn"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};
