import React, { useEffect } from "react";
import axios from "axios";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { TaskContext } from "../context/TaskContext";
import { DailyTask } from "../components/DailyTask";

export const TaskPage = () => {
  const [formTask, setFormTask] = useState(null);
  const [taskData, setTaskData] = useState({
    content: "",
    duration: 5,
  });

  const [timeData, setTimeData] = useState(0);
  const [dateData, setDateData] = useState(new Date());
  const [dateTaskDisplay, setDateTaskDisplay] = useState(new Date());
  const [dailyTasks, setDailyTasks] = useState([]);
  const { currentUser, refetchUser, updateUserPlan } = useContext(AuthContext);
  // const { doneTask, deleteUserTask } = useContext(TaskContext);

  const hours = Array.from({ length: 24 }, (_, index) => {
    const hour = index < 10 ? `0${index}` : index;
    return `${hour}:00`;
  });

  useEffect(() => {
    // filter for task base on date and time
    if (currentUser?.plan?.tasks) {
      const selectedDate = dateTaskDisplay.toISOString().split("T")[0];
      const filtered = currentUser.plan.tasks
        .filter((oneTask) => {
          const taskDate = new Date(oneTask.date).toISOString().split("T")[0];
          return taskDate === selectedDate;
        })
        .sort((a, b) => a.time - b.time);

      setDailyTasks(filtered);
    }
  }, [currentUser, dateTaskDisplay]);

  // toggle form
  function openForm() {
    if (!formTask) {
      setFormTask(1);
    } else {
      setFormTask(null);
    }
  }
  //   change day
  function goToPreviousDay() {
    const prevDay = new Date(dateTaskDisplay);
    prevDay.setDate(prevDay.getDate() - 1);
    setDateTaskDisplay(prevDay);
  }

  function goToNextDay() {
    const nextDay = new Date(dateTaskDisplay);
    nextDay.setDate(nextDay.getDate() + 1);
    setDateTaskDisplay(nextDay);
  }

  
  //   change date form
  const handleDateChange = (event) => {
    setDateData(new Date(event.target.value));
  };
  // change all Task property
  function handleTaskChange(e) {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value,
    });
  }

  //   function submit form
  async function handleTaskSubmit(e) {
    e.preventDefault();
    try {
      const newTask = await axios.post(
        `${import.meta.env.VITE_API_URL}/task`,
        taskData
      );

      if (!currentUser.plan) {
        const planData = {
          tasks: [
            {
              task: newTask.data._id,
              date: dateData,
              time: timeData,
            },
          ],
        };

        const newPlan = await axios.post(
          `${import.meta.env.VITE_API_URL}/plan`,
          planData
        );
       await updateUserPlan(newPlan.data);
      } else {
        const newTaskForPlan = {
          task: newTask.data._id,
          date: dateData,
          time: timeData,
        };
        const newTasksPlan = [...currentUser.plan.tasks, newTaskForPlan];
        const updatePlan = await axios.patch(
          `${import.meta.env.VITE_API_URL}/plan/${currentUser.plan._id}`,
          { tasks: newTasksPlan }
        );
      }
      //   end if else so now need refresh user toggle the form and reset all form value
      await refetchUser(currentUser._id);
      openForm();
      setTaskData({
        content: "",
        duration: 5,
      });
      setTimeData(0);
      setDateData(new Date());
    } catch (err) {
      console.log(err);
    }
  }

  //  console.log(currentUser)
  return (
    <>
      <div className="container">
        {new Date().toISOString().split("T")[0] ===
        dateTaskDisplay.toISOString().split("T")[0] ? (
          <h2>Today</h2>
        ) : (
          <h2>{dateTaskDisplay.toISOString().split("T")[0]}</h2>
        )}
        <div className="container-line">
          <div className="previous-daily-task" onClick={goToPreviousDay}>
            <i className="fa-solid fa-chevron-left"></i>
          </div>
          <div className="task-container task-page-container">
            {currentUser.plan && dailyTasks ? (
              <DailyTask dailyTasks={dailyTasks}/>
            ) : (
              <div>No task today</div>
            )}
            {/* Form Task */}
            {formTask ? (
              <form className="task-form" onSubmit={handleTaskSubmit}>
                <div className="input-container input-task">
                  <input
                    type="text"
                    id="content"
                    placeholder=" "
                    name="content"
                    onChange={handleTaskChange}
                  />
                  <label htmlFor="content" className="label label-task">
                    New Task
                  </label>
                  <div className="underline"></div>
                </div>
                <div className="input-container input-task">
                  <select
                    name="duration"
                    id="duration"
                    onChange={handleTaskChange}
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                  <select
                    name="time"
                    id="time"
                    onChange={(e) => setTimeData(e.target.value)}
                  >
                    {hours.map((hour, index) => (
                      <option key={index} value={index}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-container input-task">
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={dateData.toISOString().split("T")[0]}
                    placeholder=" "
                    onChange={handleDateChange}
                  />
                </div>
                <button className="btn btn-success">add task</button>
              </form>
            ) : (
              <></>
            )}
          </div>
          <div className="next-daily-task" onClick={goToNextDay}>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
        </div>
        <button className="btn btn-success" onClick={openForm}>
          Create new Task
        </button>
      </div>
    </>
  );
};
