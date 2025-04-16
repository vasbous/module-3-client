import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../css/Chatbot.css";
import { API_URL } from "../config/config";

export const Chatbot = ({ hideHeader = false }) => {
  const { currentUser, refetchUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const MAX_HISTORY = 30; // Set maximum history length to 30
  const inputRef = useRef(null);

  // Voice recognition states and refs
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const lastUserInputWasVoice = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load messages from user's chat history
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
    }
  }, [currentUser]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check if the browser supports SpeechRecognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);

        // Auto-submit after a short delay to allow user to see what was transcribed
        setTimeout(() => {
          // Create a synthetic event and call handleSubmit directly
          const syntheticEvent = { preventDefault: () => {} };
          handleSubmit(syntheticEvent);
        }, 500);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        setError("Sorry, I couldn't understand that. Please try again.");
      };
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      speechSynthesisRef.current = window.speechSynthesis;

      // Add event listener for speech synthesis end
      speechSynthesisRef.current.onend = () => {
        setIsSpeaking(false);
      };
    }

    // Check if we already have microphone permission
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setHasRecordingPermission(true);
      })
      .catch(() => {
        setHasRecordingPermission(false);
      });

    return () => {
      // Clean up
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // change 'smooth' to 'auto'
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError("Your browser doesn't support voice recognition");
      return;
    }

    if (!hasRecordingPermission && !permissionAsked) {
      // Ask for microphone permission
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          setHasRecordingPermission(true);
          setPermissionAsked(true);
          setIsRecording(true);
          recognitionRef.current.start();
        })
        .catch((err) => {
          console.error("Error getting microphone permission:", err);
          setError("Please enable microphone access to use voice input");
          setPermissionAsked(true);
        });
    } else if (hasRecordingPermission) {
      setIsRecording(true);
      recognitionRef.current.start();
    }

    lastUserInputWasVoice.current = true;
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text) => {
    if (!speechSynthesisRef.current) {
      console.error("Speech synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.5;
    utterance.pitch = 1.0;

    // Find a good voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") ||
        voice.name.includes("Microsoft") ||
        voice.name.includes("Female") ||
        voice.name.includes("Samantha")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  const getAIResponse = async (userMessage) => {
    try {
      // Prepare the data to send to the backend
      const requestData = {
        userMessage,
        messages,
        currentUser,
      };

      // Call the backend endpoint
      const response = await axios.post(`${API_URL}/gemini/chat`, requestData, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      // Return the AI response from the backend
      return response.data.aiResponse;
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

      // If the user input was voice, automatically speak the response
      if (lastUserInputWasVoice.current) {
        speakText(botResponse);
      }

      // Reset voice input flag
      lastUserInputWasVoice.current = false;

      // Save to user's chat history in database
      if (currentUser && currentUser._id) {
        try {
          // Get the most recent chat history directly from the database
          const userResponse = await axios.get(
            `${API_URL}/user/${currentUser._id}`,
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
      // Set focus back on input field after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Play or pause a specific message
  const togglePlayback = (message) => {
    if (!speechSynthesisRef.current) return;

    if (isSpeaking) {
      // If speaking, pause the speech
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    } else {
      // If not speaking, play the message
      speakText(message);
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
                <button
                  className="play-message-btn"
                  onClick={() => togglePlayback(message.bot)}
                  aria-label={isSpeaking ? "Pause message" : "Play message"}
                >
                  <i
                    className={`fas ${
                      isSpeaking ? "fa-pause" : "fa-volume-up"
                    }`}
                  ></i>
                </button>
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
          disabled={loading || isRecording}
          className="chatbot-input"
          ref={inputRef}
        />
        <button
          type="button"
          className={`chatbot-mic-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
        >
          <i
            className={`fas ${isRecording ? "fa-stop" : "fa-microphone"} ${
              isRecording ? "fa-beat" : ""
            }`}
          ></i>
        </button>
        <button
          type="submit"
          disabled={loading || !input.trim() || isRecording}
          className="chatbot-send-btn"
        >
          <i className="fas fa-paper-plane fa-beat"></i>
        </button>
      </form>
    </div>
  );
};
