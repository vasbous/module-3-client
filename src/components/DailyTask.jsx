import { useContext } from "react";
import { TaskContext } from "../context/TaskContext";
import dayjs from "dayjs"; 

export const DailyTask = ({ dailyTasks }) => {
  const { doneTask, deleteUserTask } = useContext(TaskContext);

  
  function formatLocalTime(data) {
    return dayjs(data).format("HH:mm"); 
  }

  return (
    <>
      {dailyTasks.map((oneTask, index) => (
        <div
          key={index}
          className={`oneTask ${oneTask.done ? "task-done" : ""}`}
        >
          <div className="checkbox-task">
            <input
              type="checkbox"
              checked={oneTask.done}
              value={oneTask}
              onChange={() => doneTask(oneTask)}
            />
          </div>
          <div className="content-task">{oneTask.task.content}</div>
          <div className="time-task">
            {formatLocalTime(oneTask.date)} - {formatLocalTime(oneTask.endDate)}
          </div>
          {!oneTask.task.plan_task && (
            <i
              className="fa-regular fa-trash-can"
              onClick={() => deleteUserTask(oneTask)}
            ></i>
          )}
        </div>
      ))}
    </>
  );
};
