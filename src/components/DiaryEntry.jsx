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
  const [previousEntries, setPreviousEntries] = useState([]);
  const isEditMode = !!diaryId;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch previous diary entries
        if (
          currentUser &&
          currentUser.diaries &&
          currentUser.diaries.length > 0
        ) {
          const diariesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/diary/user/recent`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          setPreviousEntries(diariesResponse.data || []);
        }

        // If in edit mode, fetch the current diary entry
        if (isEditMode) {
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
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load necessary data");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [diaryId, isEditMode, currentUser]);

  const generateGeminiPrompt = () => {
    // Extract goal details from user
    const goalDetails = currentUser.goal_details || {};
    const selectedGoal = goalDetails.selectedGoal || "No specific goal set";

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

    // Format previous entries
    const lastEntries = previousEntries
      .slice(0, 7)
      .map(
        (entry) =>
          `Date: ${new Date(entry.createdAt).toLocaleDateString()}\nMood: ${
            entry.mood_score
          }/10\nContent: ${entry.content}`
      )
      .join("\n\n---\n\n");

    return `
You are a compassionate life coach providing feedback on a user's journal entry. Below, you'll find the following information:

Current Journal Entry: ${content}
Mood Rating: ${moodScore}/10
User Goal: ${selectedGoal}
Relevant Questions & User's Answers: 
${questionsAndAnswers || "No specific questions answered yet"}

Last 7 Journal Entries: 
${lastEntries || "No previous entries available"}

Using the above context, please provide friendly, motivating feedback broken into three sections:
Mood Reflection: Reflect on the user's current mood and acknowledge their feelings.
What Went Well Today: Identify and highlight any positive aspects or progress from their journal entry.
Suggestion for Tomorrow: Offer a kind, practical suggestion to help the user continue progressing towards their goal.

Keep the tone positive, human, and encouraging. Your feedback should be warm and supportive, aiming to empower the user while validating their experiences.
Don't start with any preamble. Just provide the feedback in the three sections.
`;
  };

  const getAIFeedback = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const prompt = generateGeminiPrompt();
      console.log(prompt);
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
            maxOutputTokens: 1024,
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
        aiResponse = response.data.candidates[0].content.parts[0].text;
      }

      return aiResponse;
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      return "Sorry, I couldn't generate feedback at this time. Please try again later.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please write something in your diary");
      return;
    }

    setSubmitting(true);

    try {
      // Get AI feedback for this entry
      const aiResponse = await getAIFeedback();
      console.log(aiResponse);
      const diaryData = {
        content,
        mood_score: moodScore,
        ai_response: aiResponse,
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
          return <div>Loading user data...</div>;
        }

        // Update user's diary field
        if (response.data && response.data._id) {
          const newArrayDiaries = [
            ...(currentUser.diaries || []),
            response.data._id,
          ];
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
      navigate("/diary", { state: { refreshDiary: true } });
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
              ? "Generating Feedback..."
              : isEditMode
              ? "Update Entry"
              : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};
