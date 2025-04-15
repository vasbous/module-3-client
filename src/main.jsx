import { StrictMode, React } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContext, AuthContextWrapper } from "./context/AuthContext.jsx";
import {ThemeContext, ThemeContextWrapper } from "./context/ThemeContext";

import "./css/theme.css";

import App from "./App.jsx";
import { TaskContextWrapper } from "./context/TaskContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthContextWrapper>
      <ThemeContextWrapper>
        <TaskContextWrapper>
          <App />
        </TaskContextWrapper>
        </ThemeContextWrapper>
      </AuthContextWrapper>
    </Router>
  </StrictMode>
);
