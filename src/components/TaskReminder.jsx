import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export const TaskReminder = () => {
  const { currentUser } = useContext(AuthContext);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [remindersSent, setRemindersSent] = useState({});

  useEffect(() => {
    if (!currentUser || !currentUser.plan) return;

    // Load previously sent reminders from localStorage
    const savedReminders = localStorage.getItem(
      `${currentUser._id}_sentReminders`
    );
    if (savedReminders) {
      setRemindersSent(JSON.parse(savedReminders));
    }

    const checkInterval = setInterval(checkForUpcomingTasks, 60000); // Check every minute

    // Initial check
    checkForUpcomingTasks();

    return () => clearInterval(checkInterval);
  }, [currentUser]);

  // Save sent reminders to localStorage whenever they change
  useEffect(() => {
    if (currentUser && Object.keys(remindersSent).length > 0) {
      localStorage.setItem(
        `${currentUser._id}_sentReminders`,
        JSON.stringify(remindersSent)
      );
    }
  }, [remindersSent, currentUser]);

  const checkForUpcomingTasks = async () => {
    if (!currentUser || !currentUser.plan) return;

    try {
      const today = new Date();
      const response = await axios.get(
        `${API_URL}/plan/tasks/${
          currentUser.plan._id
        }?date=${today.toISOString()}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const now = new Date();
        const tasksToRemind = response.data.filter((taskItem) => {
          const taskTime = new Date(taskItem.startDate);
          const timeDiff = taskTime - now;
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));

          // Check for tasks coming up in 60 minutes or 10 minutes
          return (
            (minutesDiff <= 60 && minutesDiff >= 55) || // Wider window for 1-hour
            (minutesDiff <= 10 && minutesDiff >= 5) // Wider window for 10-min
          );
        });

        setUpcomingTasks(tasksToRemind);
        sendReminders(tasksToRemind);
      }
    } catch (error) {
      console.error("Error checking for upcoming tasks:", error);
    }
  };

  const sendReminders = (tasks) => {
    tasks.forEach((taskItem) => {
      const taskTime = new Date(taskItem.startDate);
      const now = new Date();
      const timeDiff = taskTime - now;
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      const taskId = taskItem.task._id;

      // Create specific reminder types
      const reminderType = minutesDiff <= 10 ? "10min" : "60min";
      const reminderKey = `${taskId}-${reminderType}`;

      // Check if we've already sent this specific reminder
      if (!remindersSent[reminderKey]) {
        // Create notification content
        const notificationTitle =
          reminderType === "10min"
            ? "Task Starting Soon!"
            : "Upcoming Task Reminder";
        const notificationBody =
          reminderType === "10min"
            ? `Your task "${taskItem.task.content}" is starting in about 10 minutes!`
            : `You have "${taskItem.task.content}" scheduled in about 1 hour.`;

        // Show notification
        if (Notification.permission === "granted") {
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: "/favicon.ico",
          });
        }

        // Add custom message to chatbot
        addReminderMessage(taskItem, reminderType);

        // Mark this reminder as sent
        setRemindersSent((prev) => ({
          ...prev,
          [reminderKey]: true,
        }));

        // Open the chatbot
        openChatbot();
      }
    });
  };

  const openChatbot = () => {
    // Set the chatbot state to open
    localStorage.setItem("chatbotState", JSON.stringify(true));

    // Dispatch a custom event to notify FloatingChatbot component
    const event = new CustomEvent("openChatbot");
    window.dispatchEvent(event);
  };

  const addReminderMessage = async (taskItem, reminderType) => {
    if (!currentUser || !currentUser._id) return;

    try {
      // Format the bot message
      const botMessage =
        reminderType === "10min"
          ? `🔔 REMINDER: Your task "${taskItem.task.content}" is starting in about 10 minutes!`
          : `📆 REMINDER: You have "${taskItem.task.content}" scheduled in about 1 hour.`;

      // Get current chat history
      const userResponse = await axios.get(
        `${API_URL}/user/${currentUser._id}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const currentChatHistory = userResponse.data.chat_history || [];

      // Add the reminder message to chat history
      const newChatHistory = [
        ...currentChatHistory,
        { user_message: "", ai_message: botMessage },
      ];

      // Update the database with new chat history
      await axios.patch(
        `${API_URL}/user/update/chat_history/${currentUser._id}`,
        {
          chat_history: newChatHistory,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error adding reminder message:", error);
    }
  };

  return null;
};
