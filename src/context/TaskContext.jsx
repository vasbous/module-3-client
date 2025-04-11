import axios from "axios";
import { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

const TaskContext = createContext();

const TaskContextWrapper = ({ children }) => {
  const { currentUser, refetchUser } = useContext(AuthContext);
  const [dailyTasks, setDailyTasks] = useState("");

  //   toggle check task
  async function doneTask(taskToUpdate) {
    try {
      const updatedTasks = currentUser.plan.tasks.map((task) => {
        if (
          task.task._id === taskToUpdate.task._id &&
          new Date(task.date).toISOString() ===
            new Date(taskToUpdate.date).toISOString()
        ) {
          return { ...task, done: !task.done }; // toggle done status
        }
        return task;
      });

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/plan/${currentUser.plan._id}`,
        {
          tasks: updatedTasks,
        }
      );

      await refetchUser(currentUser._id);
    } catch (err) {
      console.error(err);
    }
  }

  //   delete user Task
  async function deleteUserTask(taskToDelete) {
    if (!taskToDelete.task.plan_task) {
      try {
        // filter the Tasks array without the deleted task
        const updatedTasks = currentUser.plan.tasks.filter(
          (oneTask) =>
            !(
              oneTask.task._id === taskToDelete.task._id &&
              new Date(oneTask.date).toISOString() ===
                new Date(taskToDelete.date).toISOString()
            )
        );

        //update the plan with new array Tasks
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/plan/${currentUser.plan._id}`,
          {
            tasks: updatedTasks,
          }
        );
        // delete Task
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/task/${taskToDelete.task._id}`
        );
        // refetch the user

        await refetchUser(currentUser._id);
      } catch (err) {
        console.log("error delete task", err);
      }
    }
  }

  async function tasksOfTheDay() {
    console.log(
      `${import.meta.env.VITE_API_URL}/plan/tasks/${currentUser.plan._id}`
    );
    try {
      const tasks = await axios.get(
        `${import.meta.env.VITE_API_URL}/plan/tasks/${currentUser.plan._id}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setDailyTasks(tasks.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <TaskContext.Provider
      value={{ doneTask, deleteUserTask, tasksOfTheDay, dailyTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export { TaskContext, TaskContextWrapper };
