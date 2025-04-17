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
import { TaskDetailsModal } from "../components/TaskDetailsModal";

export const DashBoardPage = () => {
  const { tasksOfTheDay, dailyTasks } = useContext(TaskContext);
  const { currentUser } = useContext(AuthContext);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(
    (currentUser.progression / (currentUser.level + 1)) * 100
  );
  useEffect(() => {
    if (currentUser.plan) {
      tasksOfTheDay();
    }

    const events = currentUser?.plan?.tasks?.map((oneTask, key) => {
      const startDate = new Date(oneTask?.startDate);
      const endDate = new Date(oneTask?.endDate);
      // const hours = oneTask.time;
      // date.setHours(hours, 0, 0, 0)
      // console.log(oneTask)
      return {
        title: oneTask?.task?.content,
        start: startDate,
        end: endDate,
        id: oneTask._id,
        allDay: false,
        done: oneTask.done,
        color: oneTask.done ? "#4CAF50" : "#f44336",
        details: oneTask?.task?.description,
        taskId: oneTask?.task?._id,
      };
    });
    setProgressPercentage(
      (currentUser.progression / (currentUser.level + 1)) * 100
    );
    setCalendarEvents(events);
  }, [currentUser]);

  function handleEventClick(info) {
    info.jsEvent.preventDefault(); // Prevent default action
    const task = info.event;
    setSelectedTask({
      title: task.title,
      start: task.start,
      end: task.end,
      details: task.extendedProps.details,
      done: task.extendedProps.done,
      id: task.id,
      taskId: task.extendedProps.taskId,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedTask(null);
  }

  return (
    <div className="container">
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridWeek"
          events={calendarEvents || []}
          height="100%"
          locale="en-gb"
          titleFormat={{
            day: "numeric",
            month: "long",
            year: "numeric",
          }}
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
          eventClick={handleEventClick}

          // dateClick={(info) => alert(`Tu as cliqué le ${info.dateStr}`)}
          // eventClick={(info) => {
          //   info.jsEvent.preventDefault(); // évite d'ouvrir un lien si présent
          //   const task = info.event;
          //   const { title, start, end, extendedProps } = task;
          //   alert(`details: ${extendedProps.details}`);  }}
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
            <h3 className="text-center">LEVEL</h3>
            <p className="text-center lvl-number">{currentUser.level}</p>
            <div className="empty-progression-bar">
              <div
                className="progression-bar"
                style={{
                  width: `${progressPercentage}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>

            {/* <div className="dashboard-card">
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
            </div> */}
          </div>
        </div>
      </div>
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskDetails={selectedTask || {}}
      />
    </div>
  );
};
