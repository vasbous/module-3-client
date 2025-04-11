import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../css/DiaryPage.css";

export const DiaryPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const navigate = useNavigate();
  const flipBookRef = useRef();

  // Function to format date as DD/MM/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    const entryDate = new Date(date);
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  };

  // Split text into pages
  const splitTextIntoPages = (text, charsPerPage = 900) => {
    if (!text) return [""];

    const pages = [];
    let currentPage = "";
    const words = text.split(" ");

    for (const word of words) {
      if ((currentPage + word + " ").length > charsPerPage) {
        pages.push(currentPage.trim());
        currentPage = word + " ";
      } else {
        currentPage += word + " ";
      }
    }

    if (currentPage.trim().length > 0) {
      pages.push(currentPage.trim());
    }

    return pages;
  };

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        if (!currentUser || !currentUser._id) {
          setLoading(false);
          return;
        }

        // const response = await axios.get(
        //   `${import.meta.env.VITE_API_URL}/diary/today`,
        //   {
        //     headers: {
        //       authorization: `Bearer ${localStorage.getItem("authToken")}`,
        //     },
        //   }
        // );

        // Sort diaries by date (newest first)
        const sortedDiaries = currentUser.diaries.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Check if there's an entry for today
        const todayEntryFound = sortedDiaries.find((diary) =>
          isToday(diary.createdAt)
        );
        setTodayEntry(todayEntryFound);

        setDiaries(sortedDiaries);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching diaries:", err);
        setError("Failed to load diary entries");
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [currentUser]);

  const handleCreateOrEdit = () => {
    if (todayEntry) {
      // Navigate to edit today's entry
      navigate(`/diary/edit/${todayEntry._id}`);
    } else {
      // Navigate to create new entry
      navigate("/diary/create");
    }
  };

  // Go back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading)
    return <div className="container diary-loading">Loading your diary...</div>;
  if (error) return <div className="container diary-error">{error}</div>;

  return (
    <div className="container diary-main-container">
      <div className="diary-book-container">
        {diaries.length === 0 ? (
          <div className="empty-diary">
            <p>Your diary is empty. Start writing today!</p>
          </div>
        ) : (
          <HTMLFlipBook
            width={350}
            height={500}
            size="stretch"
            minWidth={300}
            maxWidth={500}
            minHeight={400}
            maxHeight={500}
            showCover={true}
            flippingTime={1000}
            className="diary-book"
            ref={flipBookRef}
          >
            {/* Cover page */}
            <div className="diary-page cover">
              <div className="cover-content">
                <h1>My Journal</h1>
                <p className="subtitle">
                  {currentUser?.username || "Personal Diary"}
                </p>
              </div>
            </div>

            {/* Blank page after cover */}
            <div className="diary-page blank-page"></div>

            {/* Diary entries */}
            {diaries.flatMap((diary, diaryIndex) => {
              const textPages = splitTextIntoPages(diary.content);

              return textPages.map((pageContent, pageIndex) => (
                <div
                  key={`${diary._id}-page-${pageIndex}`}
                  className="diary-page"
                >
                  {pageIndex === 0 && (
                    <div className="page-header">
                      <div className="page-date">
                        {formatDate(diary.createdAt)}
                      </div>
                      <div className="page-mood">
                        Mood: {diary.mood_score}/10
                      </div>
                    </div>
                  )}
                  <div className="page-content">
                    {pageContent}
                    {pageIndex === textPages.length - 1 &&
                      diary.ai_response && (
                        <div className="ai-response">
                          <h4>AI Feedback:</h4>
                          <p>{diary.ai_response}</p>
                        </div>
                      )}
                  </div>
                  <div className="page-number">
                    {pageIndex + 1}/{textPages.length}
                  </div>
                </div>
              ));
            })}

            {/* Last page */}
            <div className="diary-page blank-page"></div>
            <div className="diary-page cover back-cover">
              <div className="cover-content">
                <h2>Journal End</h2>
              </div>
            </div>
          </HTMLFlipBook>
        )}
      </div>

      {diaries.length > 0 && (
        <div className="diary-navigation">
          <button className="btn btn-success" onClick={handleBackToDashboard}>
            Back To Dashboard
          </button>
          <button
            className="btn btn-navi"
            onClick={() => flipBookRef.current.pageFlip().flipPrev()}
          >
            Previous
          </button>
          <button
            className="btn btn-navi"
            onClick={() => flipBookRef.current.pageFlip().flipNext()}
          >
            Next
          </button>
          <button className="btn btn-success" onClick={handleCreateOrEdit}>
            {todayEntry ? "Edit Today's Entry" : "Create New Entry"}
          </button>
        </div>
      )}
    </div>
  );
};
