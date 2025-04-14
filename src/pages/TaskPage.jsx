import React, { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { TaskContext } from "../context/TaskContext";
import { DailyTask } from "../components/DailyTask";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export const TaskPage = () => {
  const [formTask, setFormTask] = useState(null);
  const [taskData, setTaskData] = useState({
    content: "",
  });

  const [taskDuration, setTaskDuration] = useState(30);
  const [dateData, setDateData] = useState(dayjs().add(1, "minute"));
  const [endDateData, setEndDateData] = useState(
    dateData.add(taskDuration, "minute")
  );
  const [dateTaskDisplay, setDateTaskDisplay] = useState(dayjs());
  const [dailyTasks, setDailyTasks] = useState([]);
  const { currentUser, refetchUser, updateUserPlan } = useContext(AuthContext);
  const { getTasksForDate } = useContext(TaskContext);
  const minDuration = 3;
  const maxDuration = 120;
  // tz change time zone, dayjs.tz.guess() find local time zone, .toISOString() : This method converts the adjusted date to ISO 8601 format.
  function localTimezoneIso(date) {
    return date.tz(dayjs.tz.guess()).toISOString();
  }

  function formatDateToDatetimeLocal(date) {
    return date.format("YYYY-MM-DDTHH:mm");
  }

  useEffect(() => {
    const fetchTasks = async () => {
      const selectedDate = dateTaskDisplay.format("YYYY-MM-DD");

      if (currentUser?.plan?._id) {
        const tasks = await getTasksForDate(selectedDate);
        const sorted = tasks.sort(
          (a, b) => dayjs(a.startDate) - dayjs(b.startDate)
        );
        setDailyTasks(sorted);
      }
    };

    fetchTasks();
  }, [currentUser, dateTaskDisplay]);

  function openForm() {
    setFormTask(formTask ? null : 1);
  }

  function goToPreviousDay() {
    setDateTaskDisplay(dateTaskDisplay.subtract(1, "day"));
  }

  function goToNextDay() {
    setDateTaskDisplay(dateTaskDisplay.add(1, "day"));
  }

  function checkTaskConflict(newTaskStart, newTaskEnd, existingTasks) {
    // for task in task of the chosen day
    for (let task of existingTasks) {
      const taskStart = dayjs(task.startDate); //start date of the task
      const taskEnd = dayjs(task.endDate); // end date of the task

      //verify the new task dont have conflit with this task
      if (
        // new task start date is the same  Or if the new task start date is between start and end date (end date exclude)
        newTaskStart.isSame(taskStart) ||
        newTaskStart.isBetween(taskStart, taskEnd, null, "[)") ||
        // new task end date is the same  Or if the new task end date is between start and end date (start date exclude)
        newTaskEnd.isSame(taskEnd) ||
        newTaskEnd.isBetween(taskStart, taskEnd, null, "(]") ||
        // new task start is before the task start and new new task end is after the task end.
        (newTaskStart.isBefore(taskStart) && newTaskEnd.isAfter(taskEnd)) ||
        // new task start is after task start but new task end is before task end
        (newTaskStart.isAfter(taskStart) && newTaskEnd.isBefore(taskEnd))
      ) {
        return true; // conflict with previous task
      }
    }
    return false; // no conflict
  }

  const handleDateChange = (event) => {
    setDateData(dayjs(event.target.value));
    setEndDateData(dayjs(event.target.value).add(taskDuration, "minute"));
  };

  function handleDurationChange(e) {
    const value = e.target.value;
    // with that the input can be void
    if (value === "") {
      setTaskDuration("");
      return;
    }
    const duration = parseInt(e.target.value, 10);
    if (!isNaN(duration)) {
      // because i dont want to frustrate the user. and after i change it
      if (duration < minDuration) {
        // put the duration
        setTaskDuration(duration);
      } else if (duration > maxDuration) {
        setTaskDuration(maxDuration);
      } else {
        setTaskDuration(duration);
      }
      setEndDateData(dateData.add(duration, "minute"));
    }
  }
  const handleTaskChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleTaskSubmit(e) {
    e.preventDefault();
    const newTaskStart = dayjs(dateData); // start task
    const newTaskEnd = newTaskStart.add(taskDuration, "minute"); // endtask
    const selectedDate = dateData.format("YYYY-MM-DD"); //formated date
    const tasks = await getTasksForDate(selectedDate); // find all task for this date
    // check conflict
    const hasConflict = checkTaskConflict(newTaskStart, newTaskEnd, tasks);

    if (hasConflict) {
      alert("the task cannot be carried out at these times ");
      return; // stop the submit
    }
    if (!taskData.content) {
      alert("the task need a name ");
      return; // stop the submit
    }
    if (newTaskStart.isBefore(dayjs())) {
      alert("the new task can't be before now, stop this josh ");
      return; // stop the submit
    }
    try {
      const newTask = await axios.post(
        `${import.meta.env.VITE_API_URL}/task`,
        taskData
      );

      const taskDate = localTimezoneIso(dateData);
      const taskEndDate = localTimezoneIso(endDateData);

      if (!currentUser.plan) {
        const planData = {
          tasks: [
            {
              task: newTask.data._id,
              startDate: taskDate,
              endDate: taskEndDate,
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
          startDate: taskDate,
          endDate: taskEndDate,
        };
        const newTasksPlan = [...currentUser.plan.tasks, newTaskForPlan];
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/plan/${currentUser.plan._id}`,
          { tasks: newTasksPlan }
        );
      }

      await refetchUser(currentUser._id);
      openForm();
      setTaskData({ content: "" });
      setDateData(dayjs().add(1, "minute"));
      setTaskDuration(30);
      setEndDateData(dayjs().add(31, "minute"));
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="container">
      {dateTaskDisplay.isSame(dayjs(), "day") ? (
        <h2>Today</h2>
      ) : (
        <h2>{dateTaskDisplay.format("YYYY-MM-DD")}</h2>
      )}
      <div className="container-line">
        <div className="previous-daily-task" onClick={goToPreviousDay}>
          <i className="fa-solid fa-chevron-left"></i>
        </div>
        <div className="task-container task-page-container">
          {currentUser.plan && dailyTasks.length ? (
            <DailyTask dailyTasks={dailyTasks} />
          ) : (
            <div>No task today</div>
          )}
          {formTask && (
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
                <label htmlFor="date">Task Start</label>
                <input
                  type="datetime-local"
                  name="date"
                  id="date"
                  value={formatDateToDatetimeLocal(dateData)}
                  onChange={handleDateChange}
                />
              </div>

              <div className="input-container input-task">
                <label htmlFor="duration">Task Duration (minutes)</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={taskDuration}
                  onChange={handleDurationChange}
                  //  after stop focus the input change value
                  onBlur={() => {
                    if (
                      taskDuration === "" ||
                      parseInt(taskDuration, 10) < minDuration
                    ) {
                      setTaskDuration(minDuration);
                    }
                  }}
                  //  for phone use number keyboard
                  inputMode="numeric"
                  //  force number character
                  pattern="[0-9]*"
                />
              </div>
              <div className="task-end-info">
                <p>Task will end at: {endDateData.format("HH:mm")}</p>
              </div>
              <button className="btn btn-success">add task</button>
            </form>
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
  );
};
