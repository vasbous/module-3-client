import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const ProtectedQuestionRoute = ({ children }) => {
  const { currentUser, isLoading } = useContext(AuthContext);

  // If still loading, return loading state
  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if signup is completed
  if (!currentUser.signupCompleted) {
    return <Navigate to="/signup-questions" />;
  }

  // If signup is completed, allow access to the protected route
  return children;
};
