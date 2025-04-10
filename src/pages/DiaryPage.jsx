import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../css/DiaryPage.css";

export const DiaryPage = () => {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useContext(AuthContext);
  const notebookRef = useRef(null);

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch all diary entries
  const fetchDiaryEntries = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/diary`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Sort entries by date, newest first
      const sortedEntries = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setDiaryEntries(sortedEntries);
      setTotalPages(Math.ceil(sortedEntries.length / 2) + 1); // +1 for cover
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      setError("Failed to load your diary entries. Please try again later.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchDiaryEntries();
    }
  }, [isLoggedIn]);

  const handleTurnPage = (direction) => {
    if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }

    // Apply the page turn effect
    if (notebookRef.current) {
      notebookRef.current.classList.add("page-turning");
      setTimeout(() => {
        notebookRef.current.classList.remove("page-turning");
      }, 500);
    }
  };

  const handleEditEntry = (entry) => {
    setIsEditing(true);
    setEditContent(entry.content);
    setCurrentEditingId(entry._id);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/diary/${currentEditingId}`,
        { content: editContent },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setIsEditing(false);
      setCurrentEditingId(null);
      fetchDiaryEntries(); // Refresh the entries
    } catch (error) {
      console.error("Error updating diary entry:", error);
      setError("Failed to update your entry. Please try again.");
    }
  };

  const handleCreateNewEntry = () => {
    // Navigate to dashboard to create a new entry
    window.location.href = "/dashboard";
  };

  const getEntriesForCurrentPage = () => {
    if (currentPage === 0) return []; // Cover page

    const startIdx = (currentPage - 1) * 2;
    return diaryEntries.slice(startIdx, startIdx + 2);
  };

  if (isLoading) {
    return (
      <div className="diary-page-container">
        <div className="loading-indicator">Loading your diary entries...</div>
      </div>
    );
  }

  return (
    <div className="diary-page-container">
      {error && <div className="diary-error">{error}</div>}

      <div className="moleskine-notebook" ref={notebookRef}>
        <div
          className="notebook-cover"
          style={{ display: currentPage === 0 ? "block" : "none" }}
        >
          <h1>My Journal</h1>
          <div className="notebook-elastic"></div>
        </div>

        {currentPage > 0 && (
          <div className="notebook-pages">
            <div className="page page-left">
              {getEntriesForCurrentPage()[0] && !isEditing && (
                <>
                  <div className="page-header">
                    <div className="page-date">
                      {formatDate(getEntriesForCurrentPage()[0].createdAt)}
                    </div>
                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEditEntry(getEntriesForCurrentPage()[0])
                      }
                    >
                      Edit
                    </button>
                  </div>
                  <div className="page-content">
                    {getEntriesForCurrentPage()[0].content}
                  </div>
                </>
              )}

              {isEditing &&
                currentEditingId === getEntriesForCurrentPage()[0]?._id && (
                  <>
                    <div className="page-header">
                      <div className="page-date">
                        {formatDate(getEntriesForCurrentPage()[0].createdAt)}
                      </div>
                      <button className="save-button" onClick={handleSaveEdit}>
                        Save
                      </button>
                    </div>
                    <textarea
                      className="edit-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    ></textarea>
                  </>
                )}
            </div>

            <div className="page page-right">
              {getEntriesForCurrentPage()[1] && !isEditing && (
                <>
                  <div className="page-header">
                    <div className="page-date">
                      {formatDate(getEntriesForCurrentPage()[1].createdAt)}
                    </div>
                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEditEntry(getEntriesForCurrentPage()[1])
                      }
                    >
                      Edit
                    </button>
                  </div>
                  <div className="page-content">
                    {getEntriesForCurrentPage()[1].content}
                  </div>
                </>
              )}

              {isEditing &&
                currentEditingId === getEntriesForCurrentPage()[1]?._id && (
                  <>
                    <div className="page-header">
                      <div className="page-date">
                        {formatDate(getEntriesForCurrentPage()[1].createdAt)}
                      </div>
                      <button className="save-button" onClick={handleSaveEdit}>
                        Save
                      </button>
                    </div>
                    <textarea
                      className="edit-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    ></textarea>
                  </>
                )}
            </div>

            <div className="notebook-spine"></div>
          </div>
        )}
      </div>

      <div className="diary-controls">
        <button
          className="btn page-turn-btn"
          onClick={() => handleTurnPage("prev")}
          disabled={currentPage === 0}
        >
          Previous Page
        </button>

        <button className="btn btn-success" onClick={handleCreateNewEntry}>
          Create New Entry
        </button>

        <button
          className="btn page-turn-btn"
          onClick={() => handleTurnPage("next")}
          disabled={currentPage === totalPages - 1}
        >
          Next Page
        </button>
      </div>
    </div>
  );
};
