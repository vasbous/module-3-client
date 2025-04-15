import { useState, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import "./css/form.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { HomePage } from "./pages/HomePage";
import { DashBoardPage } from "./pages/DashBoardPage";
import { TaskPage } from "./pages/TaskPage";
import { DiaryPage } from "./pages/DiaryPage";
import { DiaryEntry } from "./components/DiaryEntry";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignupQuestionsPage } from "./pages/SignupQuestionsPage";
import { ProtectedQuestionRoute } from "./components/ProtectedQuestionRoute";
import { CreatePlan } from "./components/CreatePlan";
import { ProfilPage } from "./pages/ProfilPage";
import { FloatingChatbot } from "./components/FloatingChatbot";
import { AuthContext } from "./context/AuthContext";
import { TaskReminder } from "./components/TaskReminder";
import { API_URL } from "./config/config";

function App() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/signup-questions"
          element={
            <ProtectedRoute>
              <SignupQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedQuestionRoute>
              <DashBoardPage />
            </ProtectedQuestionRoute>
          }
        />
        <Route
          path="/task"
          element={
            <ProtectedQuestionRoute>
              <TaskPage />
            </ProtectedQuestionRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedQuestionRoute>
              <DiaryPage />
            </ProtectedQuestionRoute>
          }
        />
        <Route
          path="/diary/create"
          element={
            <ProtectedQuestionRoute>
              <DiaryEntry />
            </ProtectedQuestionRoute>
          }
        />
        <Route
          path="/diary/edit/:diaryId"
          element={
            <ProtectedQuestionRoute>
              <DiaryEntry />
            </ProtectedQuestionRoute>
          }
        />

        <Route
          path="/create-plan"
          element={
            <ProtectedQuestionRoute>
              <CreatePlan />
            </ProtectedQuestionRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <ProtectedQuestionRoute>
              <ProfilPage />
            </ProtectedQuestionRoute>
          }
        />
      </Routes>
      <Toaster position="top-left" reverseOrder={false} />
      <Footer />
      <TaskReminder />
      {/* Only show the chatbot for logged-in users */}
      {isLoggedIn && <FloatingChatbot />}
    </>
  );
}

export default App;
