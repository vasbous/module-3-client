import React, { useEffect } from "react";
import { DiaryDashboard } from "../components/DiaryDashboard";
import { DailyTask } from "../components/DailyTask";
import { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "../css/calendar.css";

export const DashBoardPage = () => {
  const { tasksOfTheDay, dailyTasks } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);
  const [calendarEvents, setCalendarEvents] = useState({});
  useEffect(() => {
    if (currentUser.plan) {
      tasksOfTheDay();
    }

    const events = currentUser?.plan?.tasks?.map((oneTask) => {
      const startDate = new Date(oneTask.startDate);
      const endDate = new Date(oneTask.endDate);
      // const hours = oneTask.time;
      // date.setHours(hours, 0, 0, 0)
      console.log(oneTask);
      return {
        title: oneTask.task.content,
        start: startDate,
        end: endDate,
        id: oneTask._id,
        allDay: false,
        done: oneTask.done,
        color: oneTask.done ? "#4CAF50" : "#f44336",
      };
    });
    setCalendarEvents(events);
  }, [currentUser]);

  return (
    <div className="container">
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridWeek"
          events={calendarEvents || []}
          height="100%"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // 24H
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridWeek,listWeek", // user can switch between the two
          }}
          firstDay={1}

          // dateClick={(info) => alert(`Tu as cliqué le ${info.dateStr}`)}
        />
      </div>
      <div className="task-diary-score-container">
        <div className="task-container">
          <div className="daily-task-title-container">
            <div></div>
            <h3>Daily task</h3>
            <Link to="/task" className="btn btn-success">
              Task
            </Link>
          </div>
          {dailyTasks ? <DailyTask dailyTasks={dailyTasks} /> : <></>}
        </div>
        <div className="diary-score-container">
          <div className="diary-container">
            <DiaryDashboard />
          </div>
          <div className="score-container">
            <div className="dashboard-card">
              <h3>Action Plan</h3>
              <p>
                Create a personalized 30-day action plan to achieve your goals
              </p>

              {currentUser?.plan ? (
                <div className="plan-actions">
                  <Link to="/plan" className="btn btn-primary">
                    View Current Plan
                  </Link>
                  <Link to="/create-plan" className="btn btn-secondary">
                    Create New Plan
                  </Link>
                </div>
              ) : (
                <Link to="/create-plan" className="btn btn-success">
                  Create Your Plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
