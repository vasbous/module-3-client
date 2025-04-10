import React from "react";
import axios from "axios";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const TaskPage = () => {
  const [formTask, setFormTask] = useState(null);
  const [taskData, setTaskData] = useState({
    content: "",
    duration: "",
  });
  const [timeData, setTimeData] = useState("");
  const [dateData, setDateData] = useState(new Date());
  const { currentUser, setCurrentUser, refetchUser } = useContext(AuthContext);

  const hours = Array.from({ length: 24 }, (_, index) => {
    const hour = index < 10 ? `0${index}` : index;
    return `${hour}:00`;
  });

  function openForm() {
    if (!formTask) {
      setFormTask(1);
    } else {
      setFormTask(null);
    }
  }
  const handleDateChange = (event) => {
    setDateData(new Date(event.target.value));
  };

  function handleTaskChange(e) {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value,
    });
  }
  // console.log(timeData)
  async function handleTaskSubmit(e) {
    e.preventDefault();
    try {
      const newTask = await axios.post(
        `${import.meta.env.VITE_API_URL}/task`,
        taskData
      );
    //   console.log(currentUser);
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
        // console.log(planData);
        const newPlan = await axios.post(
          `${import.meta.env.VITE_API_URL}/plan`,
          planData
        );

        const userUpdate = await axios.patch(
          `${import.meta.env.VITE_API_URL}/user/update/plan/${currentUser._id}`,
          { plan: newPlan.data }
        );
        
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
        const userUpdate = await axios.patch(
          `${import.meta.env.VITE_API_URL}/user/update/plan/${currentUser._id}`,
          { plan: updatePlan.data }
        );
        
        
        // console.log(currentUser);
      }
      await refetchUser(currentUser._id)
      openForm()
    } catch (err) {
      console.log(err);
    }
  }

  //  console.log(currentUser)
  return (
    <div className="container">
      <div className="task-container task-page-container">
        {currentUser.plan && currentUser.plan.tasks ? (
          currentUser.plan.tasks.map((oneTask, index) => (
            <div key={index} className="oneTask">
              <div className="checkbox-task">
                <input type="checkbox" checked={oneTask.done} />
              </div>
              <div className="content-task">{oneTask.task.content}</div>
              <div className="time-task"></div>
            </div>
          ))
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
              <select name="duration" id="duration" onChange={handleTaskChange}>
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
      <button className="btn btn-success" onClick={openForm}>
        Create new Task
      </button>
    </div>
  );
};
