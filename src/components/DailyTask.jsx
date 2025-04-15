import { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import dayjs from "dayjs";
import { TaskDetailsModal } from "./TaskDetailsModal";

export const DailyTask = ({ dailyTasks }) => {
  const { doneTask, deleteUserTask } = useContext(TaskContext);
const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  function formatLocalTime(data) {
    return dayjs(data).format("HH:mm");
  }
  function closeModal() {
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  function handleEventClick(planTask, key){
    // console.log(planTask.task)
    setSelectedTask({
      title: planTask.task.content,
      start: planTask.startDate,
      end: planTask.endDate,
      details: planTask.task.description,
      done: planTask.done,
      id: planTask._id,
      taskId:planTask.task._id
    });
    setIsModalOpen(true);
  };
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
          <div className="content-task" onClick={() => {handleEventClick(oneTask)}}>{oneTask.task.content}</div>
          <div className="time-task">
            {formatLocalTime(oneTask.startDate)} -
            {formatLocalTime(oneTask.endDate)}
          </div>
          {!oneTask.task.plan_task && (
            <i
              className="fa-regular fa-trash-can"
              onClick={() => deleteUserTask(oneTask)}
            ></i>
          )}
        </div>
        
      ))}
      <TaskDetailsModal 
              isOpen={isModalOpen} 
              onClose={closeModal} 
              taskDetails={selectedTask || {}} 
            />
    </>
  );
};
