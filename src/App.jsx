import { useState } from "react";
import "./App.css";
import "./css/form.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { HomePage } from "./pages/Homepage";
import { DashBoardPage } from "./pages/DashBoardPage";
import { TaskPage } from "./pages/TaskPage";
import { DiaryPage } from "./pages/DiaryPage";
import { DiaryEntry } from "./components/DiaryEntry";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task"
          element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <DiaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary/create"
          element={
            <ProtectedRoute>
              <DiaryEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary/edit/:diaryId"
          element={
            <ProtectedRoute>
              <DiaryEntry />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
