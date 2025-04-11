import React, { useEffect } from "react";
import { DiaryDashboard } from "../components/DiaryDashboard";
import { DailyTask } from "../components/DailyTask";
import { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import { AuthContext } from "../context/AuthContext";
  

export const DashBoardPage = () => {
  const { tasksOfTheDay , dailyTasks} = useContext(TaskContext);
  const { currentUser} = useContext(AuthContext);
  useEffect(()=>{
    tasksOfTheDay()
    
  }, [currentUser])
 
  return (
    <div className="container">
      <div className="calendar-container"></div>
      <div className="task-diary-score-container">
        <div className="task-container">
          {
            dailyTasks? <DailyTask dailyTasks={dailyTasks}/> : <></>
          }
          
        </div>
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
