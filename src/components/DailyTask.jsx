import { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";
  
export const DailyTask = ({dailyTasks}) => {
const { doneTask, deleteUserTask } = useContext(TaskContext);
  return (
    <>
    {
        
            dailyTasks.map((oneTask, index) => (
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
                <div className="time-task">{oneTask.time}H00</div>
                {!oneTask.task.plan_task ? (
                  <i
                    className="fa-regular fa-trash-can"
                    onClick={() => deleteUserTask(oneTask)}
                  ></i>
                ) : (
                  <></>
                )}
              </div>
            ))
    }
    </>
  )
}
