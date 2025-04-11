import { StrictMode, React } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContext, AuthContextWrapper } from "./context/AuthContext.jsx";

import App from "./App.jsx";
import { TaskContextWrapper } from "./context/TaskContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthContextWrapper>
        <TaskContextWrapper>
          <App />
        </TaskContextWrapper>
      </AuthContextWrapper>
    </Router>
  </StrictMode>
);
