import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/DiaryDashboard.css";

export const DiaryDashboard = () => {
  const [todayEntry, setTodayEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch today's entry if it exists
  const fetchTodayEntry = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/diary/today`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.data) {
        setTodayEntry(response.data);
      } else {
        setTodayEntry(null);
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

  const handleCreateOrEdit = () => {
    if (todayEntry) {
      // Navigate to edit today's entry
      navigate(`/diary/edit/${todayEntry._id}`);
    } else {
      // Navigate to create new entry
      navigate("/diary/create");
    }
  };

  const navigateToDiaryPage = () => {
    navigate("/diary");
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
        {error && <div className="diary-error">{error}</div>}
        {todayEntry ? (
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
        <button onClick={handleCreateOrEdit} className="btn btn-success">
          {todayEntry ? "Edit Entry" : "Create Entry"}
        </button>
      </div>
    </div>
  );
};
