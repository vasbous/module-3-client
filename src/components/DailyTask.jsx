import { useContext, useState, useEffect, useRef } from "react";
import { TaskContext } from "../context/TaskContext";
import dayjs from "dayjs";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import clappingSound from "../assets/clapping1.mp3";

export const DailyTask = ({ dailyTasks }) => {
  const { doneTask, deleteUserTask } = useContext(TaskContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const soundRef = useRef(new Audio(clappingSound));

  function formatLocalTime(data) {
    return dayjs(data).format("HH:mm");
  }
  function closeModal() {
    setIsModalOpen(false);
    setSelectedTask(null);
  }
  function handleEventClick(planTask) {
    // console.log(planTask.task)
    setSelectedTask({
      title: planTask.task.content,
      start: planTask.startDate,
      end: planTask.endDate,
      details: planTask.task.description,
      done: planTask.done,
      id: planTask._id,
      taskId: planTask.task._id,
    });
    setIsModalOpen(true);
  }
  useEffect(() => {
    if (showConfetti) {
      soundRef.current.volume = 0.5;
      soundRef.current.play();
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);

      return () => {
        clearTimeout(timer);
        soundRef.current.pause(); // Pause the sound if confetti disappears
        soundRef.current.currentTime = 0; // Reset sound to beginning
      };
    }
  }, [showConfetti]);

  async function handleTaskCompletion(task) {
    if (!task.done) {
      const didLevelUp = await doneTask(task);

      if (didLevelUp === true) {
        setShowConfetti(true);

        if (levelUpSoundRef.current) {
          levelUpSoundRef.current.currentTime = 0;
          levelUpSoundRef.current.play();
        }
      }
    }
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
              onChange={() => {
                if (!oneTask.done) handleTaskCompletion(oneTask);
              }}
            />
          </div>
          <div
            className="content-task"
            onClick={() => {
              handleEventClick(oneTask);
            }}
          >
            {oneTask.task.content}
          </div>
          <div className="time-task">
            {formatLocalTime(oneTask.startDate)} -
            {formatLocalTime(oneTask.endDate)}
          </div>
          {!oneTask.task.plan_task && (
            <i
              className="fa-regular fa-trash-can"
              onClick={() => {
                if (!oneTask.done) deleteUserTask(oneTask);
              }}
            ></i>
          )}
        </div>
      ))}
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskDetails={selectedTask || {}}
      />
      {showConfetti && (
        <Confetti width={width} height={height} numberOfPieces={600} />
      )}
    </>
  );
};
