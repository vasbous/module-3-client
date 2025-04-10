import React from "react";
import { DiaryDashboard } from "../components/DiaryDashboard";

export const DashBoardPage = () => {
  return (
    <div className="container">
      <div className="calendar-container"></div>
      <div className="task-diary-score-container">
        <div className="task-container"></div>
        <div className="diary-score-container">
          <div className="diary-container">
            <DiaryDashboard />
          </div>
          <div className="score-container"></div>
        </div>
      </div>
    </div>
  );
};
