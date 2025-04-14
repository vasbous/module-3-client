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
  const [hasAutoFlipped, setHasAutoFlipped] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const flipBookRef = useRef();

  useEffect(() => {
    fetchDiaries();
  }, [currentUser, location.pathname]);

  // Separate useEffect just for the auto-flip functionality
  useEffect(() => {
    // Only do the auto-flip once when page loads, and only if we have diaries and a flipbook reference
    if (diaries.length > 0 && flipBookRef.current && !hasAutoFlipped) {
      const timer = setTimeout(() => {
        flipBookRef.current.pageFlip().flipNext();
        setHasAutoFlipped(true); // Mark that we've done the auto-flip
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [diaries.length, hasAutoFlipped]);

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

  // Get page height estimate in characters for current page size
  const getEstimatedPageHeight = () => {
    // A rough estimate based on average font size and page dimensions
    // This can be adjusted based on actual content density
    return 800; // Characters per page (equivalent to approx. 15-18 lines)
  };

  // Helper function to cut text at word boundaries
  const cutAtWordBoundary = (text, maxLength) => {
    if (text.length <= maxLength) return { cut: text, remaining: "" };

    // Find the last space within the maxLength limit
    let lastSpaceIndex = text.substring(0, maxLength).lastIndexOf(" ");

    // If no space found or too close to the beginning, cut at maxLength
    if (lastSpaceIndex <= 0 || lastSpaceIndex < maxLength * 0.5) {
      // If we're cutting in the middle of a word and near maxLength,
      // find the next space after maxLength
      const nextSpaceIndex = text.indexOf(" ", maxLength);

      // If next space is too far away, just cut at maxLength
      if (nextSpaceIndex === -1 || nextSpaceIndex > maxLength + 50) {
        lastSpaceIndex = maxLength;
      } else {
        // Otherwise cut at the next space
        lastSpaceIndex = nextSpaceIndex;
      }
    }

    return {
      cut: text.substring(0, lastSpaceIndex),
      remaining: text.substring(lastSpaceIndex + 1), // +1 to skip the space
    };
  };

  // Improved content splitting that maintains content integrity and word boundaries
  const splitContentIntoPages = (diary) => {
    if (!diary) return [];

    const userContent = diary.content || "";
    const aiResponse = diary.ai_response || "";
    const charsPerPage = getEstimatedPageHeight();
    const pages = [];

    // Process user content first
    let remainingUserContent = userContent;
    let firstPage = true;

    // Create pages for user content
    while (remainingUserContent.length > 0) {
      let currentPageContent = "";

      if (firstPage) {
        // If first page, we leave space for the header
        const effectiveCharsPerPage = charsPerPage - 100; // Approximate header space
        const { cut, remaining } = cutAtWordBoundary(
          remainingUserContent,
          effectiveCharsPerPage
        );
        currentPageContent = cut;
        remainingUserContent = remaining;
        firstPage = false;
      } else {
        // For subsequent pages, use full page
        const { cut, remaining } = cutAtWordBoundary(
          remainingUserContent,
          charsPerPage
        );
        currentPageContent = cut;
        remainingUserContent = remaining;
      }

      // Wrap with appropriate styling
      pages.push(
        `<div class="user-content">${currentPageContent.replace(
          /\n/g,
          "<br>"
        )}</div>`
      );
    }

    // If there's no AI response, we're done
    if (!aiResponse) return pages.length > 0 ? pages : [""];

    // If we have AI response, process it

    // If the last page of user content has enough space, add AI header there
    const lastUserPageEstimatedLength = pages[pages.length - 1].length;

    if (lastUserPageEstimatedLength < charsPerPage * 0.75) {
      // There's room for the AI header on the last user content page
      // Update the last page to include the AI header
      pages[
        pages.length - 1
      ] += `<div class="ai-response-header">AI Feedback:</div>`;

      // Check if there's still room for some AI content
      const remainingSpace = charsPerPage - lastUserPageEstimatedLength - 50; // 50 chars for header

      if (remainingSpace > 200 && aiResponse.length > 0) {
        // If there's meaningful space left (at least ~4 lines) and we have AI content
        const { cut, remaining } = cutAtWordBoundary(
          aiResponse,
          remainingSpace
        );

        // Add first part of AI response to current page
        pages[pages.length - 1] += `<div class="ai-response-text">${cut.replace(
          /\n/g,
          "<br>"
        )}</div>`;

        // Process rest of AI response on new pages if needed
        let remainingAIContent = remaining;

        while (remainingAIContent.length > 0) {
          const { cut, remaining } = cutAtWordBoundary(
            remainingAIContent,
            charsPerPage
          );
          remainingAIContent = remaining;

          pages.push(
            `<div class="ai-response-text">${cut.replace(/\n/g, "<br>")}</div>`
          );
        }
      } else {
        // Not enough meaningful space left, put all AI content on next page
        let remainingAIContent = aiResponse;

        while (remainingAIContent.length > 0) {
          const { cut, remaining } = cutAtWordBoundary(
            remainingAIContent,
            charsPerPage
          );
          remainingAIContent = remaining;

          // Add AI content to new page
          if (remainingAIContent === aiResponse) {
            // First AI page needs no header (it's on previous page)
            pages.push(
              `<div class="ai-response-text">${cut.replace(
                /\n/g,
                "<br>"
              )}</div>`
            );
          } else {
            // Continuation of AI content
            pages.push(
              `<div class="ai-response-text">${cut.replace(
                /\n/g,
                "<br>"
              )}</div>`
            );
          }
        }
      }
    } else {
      // Last user page is too full, create new page for AI content
      const { cut, remaining } = cutAtWordBoundary(
        aiResponse,
        charsPerPage - 50
      );

      pages.push(
        `<div class="ai-response-header">AI Feedback:</div><div class="ai-response-text">${cut.replace(
          /\n/g,
          "<br>"
        )}</div>`
      );

      // If AI content is longer than one page, continue to more pages
      let remainingAIContent = remaining;

      while (remainingAIContent.length > 0) {
        const { cut, remaining } = cutAtWordBoundary(
          remainingAIContent,
          charsPerPage
        );
        remainingAIContent = remaining;

        pages.push(
          `<div class="ai-response-text">${cut.replace(/\n/g, "<br>")}</div>`
        );
      }
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

  const handleCreateOrEdit = () => {
    if (todayEntry) {
      navigate(`/diary/edit/${todayEntry._id}`);
    } else {
      navigate("/diary/create");
    }
  };

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

              return contentPages.map((pageContent, pageIndex) => (
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
                    <div
                      dangerouslySetInnerHTML={{
                        __html: pageContent,
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
