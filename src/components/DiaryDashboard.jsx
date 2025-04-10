import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../css/DiaryDashboard.css";

export const DiaryDashboard = () => {
  const [todayEntry, setTodayEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [entryContent, setEntryContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isLoggedIn } = useContext(AuthContext);

  // Fetch today's entry if it exists
  const fetchTodayEntry = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/diary/today`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data) {
        setTodayEntry(response.data);
        setEntryContent(response.data.content);
      } else {
        setTodayEntry(null);
        setEntryContent("");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching today's diary entry:", error);
      setError("Failed to load today's entry");
      setTodayEntry(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTodayEntry();
    }
  }, [isLoggedIn]);

  const handleCreateEntry = async () => {
    if (!isEditing) {
      setIsEditing(true);
      if (!todayEntry) {
        setEntryContent("");
      }
      return;
    }

    try {
      if (todayEntry) {
        // Update existing entry
        const response = await axios.patch(
          `${import.meta.env.VITE_API_URL}/diary/${todayEntry._id}`,
          { content: entryContent },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setTodayEntry(response.data);
      } else {
        // Create new entry
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/diary`,
          {
            content: entryContent,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setTodayEntry(response.data);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving diary entry:", error);
      setError("Failed to save your entry. Please try again.");
    }
  };

  const navigateToDiaryPage = () => {
    window.location.href = "/diary";
  };

  if (isLoading) {
    return (
      <div className="diary-dashboard">
        <h3 className="diary-title">Today's Entry</h3>
        <div className="diary-content-window">
          <div className="diary-placeholder">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="diary-dashboard">
      <h3 className="diary-title">Today's Entry</h3>

      <div className="diary-content-window">
        {error && !isEditing && <div className="diary-error">{error}</div>}
        {isEditing ? (
          <textarea
            value={entryContent}
            onChange={(e) => setEntryContent(e.target.value)}
            className="diary-textarea"
            placeholder="Write your thoughts for today..."
          />
        ) : todayEntry ? (
          <div className="diary-entry">{todayEntry.content}</div>
        ) : (
          <div className="diary-placeholder">
            You have still not created a journal entry for today
          </div>
        )}
      </div>

      <div className="diary-buttons">
        <button onClick={navigateToDiaryPage} className="btn">
          Diary Page
        </button>
        <button onClick={handleCreateEntry} className="btn btn-success">
          {isEditing
            ? "Save Entry"
            : todayEntry
            ? "Edit Entry"
            : "Create Entry"}
        </button>
      </div>
    </div>
  );
};
