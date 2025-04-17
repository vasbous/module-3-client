import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../css/CreatePlan.css";
import { API_URL } from "../config/config";

export const CreatePlan = () => {
  const navigate = useNavigate();
  const { currentUser, refetchUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [allGoalTasks, setAllGoalTasks] = useState([]);

  useEffect(() => {
    const fetchGoalTasks = async () => {
      try {
        if (currentUser && currentUser.goal_details.selectedGoal) {
          const allTasksLibrary = await axios.get(
            `${API_URL}/task/category/${currentUser.goal_details.selectedGoal}`
          );
          setAllGoalTasks(allTasksLibrary.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load necessary data");
        setLoading(false);
      }
    };

    fetchGoalTasks();
  }, [currentUser]);

  const getAIPlan = async () => {
    try {
      // Prepare the data to send to the backend
      const requestData = {
        currentUser,
        allGoalTasks,
      };
      // console.log("Sending data to backend for plan generation:", requestData);

      // Call the backend endpoint
      const response = await axios.post(
        `${API_URL}/gemini/create-plan`,
        requestData,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Backend response for plan:", response.data);

      // Return the plan data from the backend
      return response.data.planData;
    } catch (error) {
      console.error("Error getting AI plan:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error("Failed to generate plan. Please try again later.");
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Get AI generated plan
      const planData = await getAIPlan();

      // Check if user already has a plan
      if (currentUser?.plan) {
        // Get current date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get existing plan
        const existingPlan = currentUser.plan;

        // Find if user has completed today's tasks
        // First get today's tasks
        const todayTasks = await axios.get(
          `${API_URL}/plan/tasks/${
            existingPlan._id
          }?date=${today.toISOString()}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        // Check if all of today's tasks are done
        const allTasksDone =
          todayTasks.data.length > 0 &&
          todayTasks.data.every((task) => task.done === true);

        // Set start date for new tasks
        let newTasksStartDate = new Date();
        if (allTasksDone) {
          // If today's tasks are done, start from tomorrow
          newTasksStartDate.setDate(newTasksStartDate.getDate() + 1);
        }
        newTasksStartDate.setHours(0, 0, 0, 0);

        // Set end date one month from new tasks start date
        const newEndDate = new Date(newTasksStartDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        // Filter out existing tasks that are in the past or today (if today's tasks are not all done)
        const pastTasks = existingPlan.tasks.filter((task) => {
          const taskStartDate = new Date(task.startDate);
          return taskStartDate < newTasksStartDate;
        });

        // Format new tasks
        const newTasks = planData.tasks.map((task) => ({
          task: task.task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          done: false,
        }));

        // Combine past tasks with new tasks
        const combinedTasks = [...pastTasks, ...newTasks];

        // Update plan with new end date and combined tasks
        await axios.patch(
          `${API_URL}/plan/${existingPlan._id}`,
          {
            end_date: newEndDate,
            tasks: combinedTasks,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // No existing plan, create a new one
        // First create the plan with start and end dates
        const planResponse = await axios.post(
          `${API_URL}/plan`,
          planData.plan,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const createdPlan = planResponse.data;
        // console.log("Created plan:", createdPlan);

        // Format tasks with task IDs, startDate, endDate, and done status
        const formattedTasks = planData.tasks.map((task) => ({
          task: task.task, // This should already be the ObjectId of the task
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          done: false,
        }));

        // Update the plan with the tasks
        await axios.patch(
          `${API_URL}/plan/${createdPlan._id}`,
          { tasks: formattedTasks },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Update user with the plan ID
        await axios.patch(
          `${API_URL}/user/update/plan/${currentUser._id}`,
          { plan: createdPlan._id },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Refresh user data
      await refetchUser(currentUser._id);

      // Show success notification
      setNotification("Your plan has been successfully updated!");

      // Navigate after a delay to let user see the notification
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error creating plan:", err);
      setError(err.message || "Failed to create your plan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const initiateCreatePlan = (e) => {
    e.preventDefault();
    if (currentUser?.plan) {
      setShowConfirmation(true);
    } else {
      handleCreatePlan(e);
    }
  };

  if (loading) return <div className="container plan-loading">Loading...</div>;

  return (
    <div className="container create-plan-container">
      <h2 className="create-plan-title">Create Your Monthly Action Plan</h2>
      {error && <div className="create-plan-error">{error}</div>}
      <div className="plan-info">
        <h3>
          Goal: {currentUser?.goal_details?.selectedGoal || "No goal selected"}
        </h3>
        <p>
          This will create a personalized 30-day action plan with specific tasks
          tailored to help you achieve your goal. The plan is based on your
          answers to the questions and any previous tasks you've completed.
        </p>
      </div>
      <div className="plan-actions">
        <button
          className="btn"
          onClick={() => navigate("/dashboard")}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          className="btn btn-success"
          onClick={initiateCreatePlan}
          disabled={submitting}
        >
          {submitting ? "Creating Your Plan..." : "Generate My Plan"}
        </button>
      </div>
      {submitting && (
        <div className="loading-message">
          <div className="typewriter">
            <div className="slide">
              <i></i>
            </div>
            <div className="paper"></div>
            <div className="keyboard"></div>
          </div>
          <p>
            Generating your customized plan... This may take a moment as we're
            creating personalized tasks based on your goal and preferences.
          </p>
        </div>
      )}
      {notification && (
        <div className="success-notification">{notification}</div>
      )}
      {showConfirmation && (
        <div className="confirmation-dialog">
          <div className="confirmation-content">
            <p>
              Creating a new plan will update your existing plan. All completed
              tasks will be preserved, and new tasks will be added for the next
              month. Are you sure you want to continue?
            </p>
            <div className="confirmation-actions">
              <button
                className="btn"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={(e) => {
                  setShowConfirmation(false);
                  handleCreatePlan(e);
                }}
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
