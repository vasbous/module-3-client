import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../css/DiaryEntry.css";

export const DiaryEntry = () => {
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const { currentUser, refetchUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!diaryId;

  useEffect(() => {
    if (isEditMode) {
      // Fetch the diary entry if we're in edit mode
      const fetchDiaryEntry = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/diary/${diaryId}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          setContent(response.data.content || "");
          setMoodScore(response.data.mood_score || 5);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching diary entry:", err);
          setError("Failed to load diary entry");
          setLoading(false);
        }
      };

      fetchDiaryEntry();
    } else {
      setLoading(false);
    }
  }, [diaryId, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please write something in your diary");
      return;
    }

    setSubmitting(true);

    try {
      const diaryData = {
        content,
        mood_score: moodScore,
      };

      let response;

      if (isEditMode) {
        // Update existing entry
        response = await axios.patch(
          `${import.meta.env.VITE_API_URL}/diary/${diaryId}`,
          diaryData,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Create new entry
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/diary`,
          diaryData,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!currentUser) {
          return <div>Loading user data...</div>; // Or a spinner, or null
        }

        // Update user's diary field
        if (response.data && response.data._id) {
          // change the diary array
          // console.log("sleep");
          const newArrayDiaries = [...currentUser.diaries, response.data._id];
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/user/update/diaries/${
              currentUser._id
            }`,
            { diaries: newArrayDiaries },
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
      refetchUser(currentUser._id);
      // Navigate back to diary page
      navigate("/diary");
    } catch (err) {
      console.error("Error saving diary entry:", err);
      setError("Failed to save your diary entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/diary");
  };

  if (loading)
    return <div className="container diary-entry-loading">Loading...</div>;

  return (
    <div className="container diary-entry-container">
      <h2 className="diary-entry-title">
        {isEditMode ? "Edit Diary Entry" : "New Diary Entry"}
      </h2>

      {error && <div className="diary-entry-error">{error}</div>}

      <form onSubmit={handleSubmit} className="diary-entry-form">
        <div className="mood-selector">
          <label htmlFor="mood-score">
            How are you feeling today? ({moodScore}/10)
          </label>
          <input
            type="range"
            id="mood-score"
            min="1"
            max="10"
            value={moodScore}
            onChange={(e) => setMoodScore(parseInt(e.target.value))}
            className="mood-slider"
          />
          <div className="mood-labels">
            <span>😔</span>
            <span>😐</span>
            <span>🙂</span>
            <span>😊</span>
            <span>😁</span>
          </div>
        </div>
        <div className="diary-content-wrapper">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="diary-content"
            placeholder="Write your thoughts here..."
            rows="12"
          ></textarea>
        </div>
        <div className="diary-entry-buttons">
          <button
            type="button"
            className="btn"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : isEditMode
              ? "Update Entry"
              : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};
