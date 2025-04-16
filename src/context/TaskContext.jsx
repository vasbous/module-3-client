import axios from "axios";
import { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import dayjs from "dayjs";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "../config/config";

const TaskContext = createContext();

const TaskContextWrapper = ({ children }) => {
  const { currentUser, refetchUser, lvlProgression } = useContext(AuthContext);
  const [dailyTasks, setDailyTasks] = useState("");

  async function doneTask(taskToUpdate) {
    // Vérification si la tâche est d'un jour antérieur
    if (
      dayjs(taskToUpdate.startDate).isBefore(dayjs(), "day") ||
      dayjs(taskToUpdate.startDate).isAfter(dayjs(), "day")
    ) {
      toast.error("can't done previous or futur day tasks");
      return; // stop the submit
    }

    try {
      let taskCompleted = false;
      const updatedTasks = currentUser.plan.tasks.map((task) => {
        if (
          task.task._id === taskToUpdate.task._id &&
          new Date(task.startDate).toISOString() ===
            new Date(taskToUpdate.startDate).toISOString()
        ) {
          if (task.done) {
            return task;
          }
          taskCompleted = true;
          toast.success("Task Completed! Good Job!!!");
          return { ...task, done: true };
        }
        return task;
      });

      await axios.patch(`${API_URL}/plan/${currentUser.plan._id}`, {
        tasks: updatedTasks,
      });
      if (taskCompleted) {
        const up = await lvlProgression();
        console.log(up);
        return up;
      } else {
        refetchUser(currentUser._id);
      }
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
              new Date(oneTask.startDate).toISOString() ===
                new Date(taskToDelete.startDate).toISOString()
            )
        );

        //update the plan with new array Tasks
        await axios.patch(`${API_URL}/plan/${currentUser.plan._id}`, {
          tasks: updatedTasks,
        });
        // delete Task
        await axios.delete(`${API_URL}/task/${taskToDelete.task._id}`);
        // refetch the user

        await refetchUser(currentUser._id);
      } catch (err) {
        console.log("error delete task", err);
      }
    }
  }
  async function getTasksForDate(date) {
    try {
      const response = await axios.get(
        `${API_URL}/plan/tasks/${currentUser.plan._id}?date=${date}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      // console.log("taks for the date", date, response.data); //
      return response.data;
    } catch (error) {
      console.error("task date error", error);
      return [];
    }
  }

  async function tasksOfTheDay() {
    try {
      const tasks = await axios.get(
        `${API_URL}/plan/tasks/${currentUser.plan._id}`,
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

  // change mandatory task inside plan
  async function changeTaskPlan(data) {
    try {
      if (currentUser) {
        await axios.put(
          `${API_URL}/plan/${currentUser.plan._id}/replace-task`,
          { data }
        );
      } else {
        toast.error("Need to be connected");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  }

  return (
    <TaskContext.Provider
      value={{
        doneTask,
        deleteUserTask,
        tasksOfTheDay,
        dailyTasks,
        getTasksForDate,
        changeTaskPlan,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export { TaskContext, TaskContextWrapper };
