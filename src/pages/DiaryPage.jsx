import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { AuthContext } from "../context/AuthContext";
import "../css/DiaryPage.css";

export const DiaryPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
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

  // Improved split content function that keeps AI response with user content when possible
  const splitContentIntoPages = (diary, charsPerPage = 900) => {
    if (!diary) return [];

    const pages = [];
    const userContent = diary.content || "";
    const aiResponse = diary.ai_response || "";

    // Keep track of where we are in processing content
    let currentPage = "";
    let processingAiResponse = false;

    // Format the complete content with user content and AI response
    let fullContent = userContent;

    if (aiResponse) {
      fullContent += "\n\n--- AI Feedback ---\n\n" + aiResponse;
    }

    // Split the full content into paragraphs to preserve structure
    const paragraphs = fullContent.split("\n");
    let aiResponseStartIndex = -1;

    // Find where AI response starts
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i] === "--- AI Feedback ---") {
        aiResponseStartIndex = i;
        break;
      }
    }

    // Process paragraphs one by one
    for (let i = 0; i < paragraphs.length; i++) {
      // Check if this paragraph starts the AI response
      if (i === aiResponseStartIndex) {
        processingAiResponse = true;
      }

      const paragraph = paragraphs[i];
      const paragraphWithNewline = paragraph + "\n";

      // Check if adding this paragraph would exceed the page limit
      if ((currentPage + paragraphWithNewline).length > charsPerPage) {
        // Current page is full, save it and start a new one
        pages.push({
          content: currentPage.trim(),
          containsAIResponse:
            processingAiResponse || currentPage.includes("--- AI Feedback ---"),
          isUserContentEnd: false,
        });

        // Start new page with this paragraph
        currentPage = paragraphWithNewline;
      } else {
        // Add to current page
        currentPage += paragraphWithNewline;
      }
    }

    // Add the final page if there's content left
    if (currentPage.trim().length > 0) {
      pages.push({
        content: currentPage.trim(),
        containsAIResponse:
          processingAiResponse || currentPage.includes("--- AI Feedback ---"),
        isUserContentEnd: false,
      });
    }

    // If no pages were created (empty content), return at least one empty page
    if (pages.length === 0) {
      pages.push({
        content: "",
        containsAIResponse: false,
        isUserContentEnd: false,
      });
    }

    return pages;
  };

  const fetchDiaries = async () => {
    try {
      if (!currentUser || !currentUser._id) {
        setLoading(false);
        return;
      }

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

  useEffect(() => {
    // This will run when the component mounts and when location changes
    // (i.e., after navigating back from creating/editing an entry)
    fetchDiaries();
  }, [currentUser, location.pathname]);

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
            {/* Front cover with image */}
            <div className="diary-page cover">
              <div className="cover-content">
                <h1>{currentUser?.username}'s Journal</h1>
              </div>
            </div>

            {/* Blank page after cover */}
            <div className="diary-page blank-page"></div>

            {/* Diary entries */}
            {diaries.flatMap((diary, diaryIndex) => {
              const contentPages = splitContentIntoPages(diary);

              return contentPages.map((pageData, pageIndex) => (
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
                    {/* Apply different styling for content with AI response */}
                    <div
                      className={
                        pageData.containsAIResponse
                          ? "mixed-content"
                          : "user-content"
                      }
                      dangerouslySetInnerHTML={{
                        __html: pageData.content
                          .replace(
                            /--- AI Feedback ---/g,
                            '<div class="ai-response-header">AI Feedback:</div>'
                          )
                          .replace(/\n/g, "<br>")
                          // Apply AI response class to text after the AI Feedback header
                          .replace(
                            /(<div class="ai-response-header">AI Feedback:<\/div>)(.*)/s,
                            '$1<div class="ai-response-text">$2</div>'
                          ),
                      }}
                    />
                  </div>
                  <div className="page-number">
                    {pageIndex + 1}/{contentPages.length}
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
