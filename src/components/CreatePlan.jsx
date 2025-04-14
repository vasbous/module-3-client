import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../css/CreatePlan.css";
import { allTasksLibrary } from "../assets/all_tasks_list";

export const CreatePlan = () => {
  const navigate = useNavigate();
  const { currentUser, refetchUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previousTasks, setPreviousTasks] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Check if user has a plan
        if (currentUser && currentUser.plan) {
          // Fetch previous tasks
          const planId = currentUser.plan._id || currentUser.plan;
          const tasksResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/plan/tasks/${planId}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          setPreviousTasks(tasksResponse.data || []);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load necessary data");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  const allTasksLibraryString = JSON.stringify(allTasksLibrary, null, 2);

  const generateGeminiPrompt = () => {
    // Extract goal details from user
    const goalDetails = currentUser.goal_details || {};
    const selectedGoal = goalDetails.selectedGoal || "No specific goal set";

    // Format goal-related questions and answers
    let questionsAndAnswers = "";
    if (goalDetails.questions && goalDetails.questions.length > 0) {
      questionsAndAnswers = goalDetails.questions
        .map(
          (q) =>
            `Question: ${q.question || q.title}\nAnswer: ${
              q.user_answer || "Not answered"
            }`
        )
        .join("\n");
    }

    // Format previous tasks
    const lastTasks = previousTasks
      .slice(0, 10)
      .map(
        (task) =>
          `Title: ${task.task.content}\nCategory: ${
            task.task.category
          }\nDifficulty: ${task.task.difficulty_level}\nDuration: ${
            task.task.duration
          } minutes\nDate: ${new Date(
            task.date
          ).toLocaleDateString()}\nTime: ${new Date(
            task.date
          ).toLocaleTimeString()}\nCompleted: ${task.done ? "Yes" : "No"}`
      )
      .join("\n\n---\n\n");

    // Get current date and calculate one month from now
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    return `
You are an AI life coach creating a personalized action plan for a user. Below is the user information:

User Goal: ${selectedGoal}

Relevant Questions & User's Answers:
${questionsAndAnswers || "No specific questions answered yet"}

Last 10 Tasks (if available):
${lastTasks || "No previous tasks available"}

IMPORTANT: Instead of creating new tasks, you MUST select tasks ONLY from the provided task library below:
${allTasksLibraryString}

Create a 30-day action plan by selecting appropriate tasks from the library. Your plan should help the user achieve their goal progressively.

Your response should be in valid JSON format with the following structure:

{
  "plan": {
    "start_date": "${startDate.toISOString().split("T")[0]}",
    "end_date": "${endDate.toISOString().split("T")[0]}"
  },
  "tasks": [
    {
      "content": "Task title",
      "description": "Detailed task description",
      "category": "Category ('Lose weight', 'Get fitter', 'Less stress', 'Get happier', 'Stop procrastinating', 'Be more productive')",
      "duration": minutes (integer),
      "date": YYYY-MM-DD
      "startTime": HH:MM
      "endTime": HH:MM
    },
    // More tasks...
  ]
}

Guidelines:
1. Using the  1-3 tasks per day spread over the next month according to user answer about available days of the week.
2. Ensure tasks are specific, actionable, and directly related to the user's goal
3. Try not to repeat the same tasks if more options are available or at least not repeat them too close together.
4. If you schedule an easy or quick task (like drink a glass of water), also assign another task on that day.
5. Schedule tasks at times that align with the user's preferences from their answers
6. Ensure task durations are reasonable (5-90 minutes)
7. Avoid scheduling tasks too close together on the same day
8. Your response MUST be valid JSON only, with no additional text or explanations
9. YOU MUST ONLY SELECT TASKS FROM THE PROVIDED LIBRARY - do not create new tasks

IMPORTANT: Return ONLY the JSON object with no additional explanation or text.
`;
  };

  const getAIPlan = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const prompt = generateGeminiPrompt();
      console.log("Sending prompt to Gemini for plan generation:", prompt);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        }
      );

      // Log the full raw response
      console.log("Full Gemini API response for plan:", response);

      // Log the data portion
      console.log("Gemini plan response.data:", response.data);

      // Extract the text response from Gemini
      let aiResponse = "";
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]
      ) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
        console.log("Extracted AI plan response text:", aiResponse);
      }

      // Parse the JSON response
      console.log("Attempting to parse JSON response...");
      const planData = JSON.parse(aiResponse);
      console.log("Successfully parsed plan data:", planData);
      return planData;
    } catch (error) {
      console.error("Error getting AI plan:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      if (error instanceof SyntaxError) {
        console.error("JSON parsing error. Raw text received:", aiResponse);
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

      // First create plan
      const planResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/plan`,
        planData.plan,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdPlan = planResponse.data;

      // Create tasks and add them to the plan
      const createdTasks = [];
      const taskPromises = planData.tasks.map(async (taskData) => {
        // Extract the date and time
        const taskDate = new Date(taskData.date);
        taskDate.setHours(taskData.time, 0, 0, 0);

        // First create the task
        const taskResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/task`,
          {
            content: taskData.content,
            category: taskData.category,
            difficulty_level: taskData.difficulty_level,
            duration: taskData.duration,
            description: taskData.description,
            plan_task: true,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        createdTasks.push({
          task: taskResponse.data._id,
          date: taskDate,
          time: taskData.time,
          done: false,
        });
      });

      await Promise.all(taskPromises);

      // Update the plan with the tasks
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/plan/${createdPlan._id}`,
        { tasks: createdTasks },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update user with the plan ID
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/user/update/plan/${currentUser._id}`,
        { plan: createdPlan._id },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh user data
      await refetchUser(currentUser._id);

      // Show success notification
      setNotification("Your plan has been successfully created!");

      //   // Navigate after a delay to let user see the notification
      //   setTimeout(() => {
      //     navigate("/plan");
      //   }, 2000);
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
              Creating a new plan will replace your existing plan. Are you sure
              you want to continue?
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
                Replace Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
