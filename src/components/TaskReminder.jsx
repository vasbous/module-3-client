import React, { useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config/config";

export const TaskReminder = () => {
  const { currentUser, refetchUser } = useContext(AuthContext);
  // Use a ref to track reminders that have been sent in the current session
  const sessionReminders = useRef(new Set());
  const isInitialMount = useRef(true);

  // Set up a custom event for our component to listen to
  useEffect(() => {
    if (!currentUser || !currentUser.plan) return;

    // console.log("TaskReminder component mounted");

    // Force the initial check to run after component is fully mounted
    setTimeout(() => {
      isInitialMount.current = false;
      checkForUpcomingTasks();
    }, 1000);

    // Set up interval for checking tasks
    const checkInterval = setInterval(() => {
      // refetchUser(currentUser._id);
      checkForUpcomingTasks();
    }, 30000); // Check every minute

    // Create a custom event handler to manually trigger the check
    const manualCheckHandler = () => {
      // console.log("Manual check triggered");
      checkForUpcomingTasks();
    };

    // Add the event listener
    window.addEventListener("checkTaskReminders", manualCheckHandler);

    return () => {
      // console.log("TaskReminder component unmounted");
      clearInterval(checkInterval);
      // setCurrentUser(currentUser);
      window.removeEventListener("checkTaskReminders", manualCheckHandler);
    };
  }, [currentUser, sessionReminders.length]);

  // Function to manually trigger a check from outside the component
  const triggerCheck = () => {
    const event = new CustomEvent("checkTaskReminders");
    window.dispatchEvent(event);
  };

  const checkForUpcomingTasks = async () => {
    if (!currentUser || !currentUser.plan) return;

    try {
      // console.log("Checking for upcoming tasks...");
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

      if (!response.data || response.data.length === 0) {
        // console.log("No tasks found for today");
        return;
      }

      // console.log(`Found ${response.data.length} tasks for today`);

      const now = new Date();
      const tasksToProcess = [];

      response.data.forEach((taskItem) => {
        const taskId = taskItem.task._id;
        const taskTime = new Date(taskItem.startDate);
        const minutesDiff = Math.floor((taskTime - now) / (1000 * 60));

        // console.log(
        //   `Task "${taskItem.task.content}" is ${minutesDiff} minutes away`
        // );

        // Generate unique reminder keys for this task
        const tenMinReminderKey = `${taskId}-10min`;
        const sixtyMinReminderKey = `${taskId}-60min`;

        // Check for 10-minute reminder (8-12 minute window)
        if (minutesDiff <= 10 && minutesDiff >= 9) {
          if (!sessionReminders.current.has(tenMinReminderKey)) {
            // console.log(
            //   `Task "${taskItem.task.content}" qualifies for 10-minute reminder`
            // );
            tasksToProcess.push({
              ...taskItem,
              reminderType: "10min",
              reminderKey: tenMinReminderKey,
            });
          } else {
            // console.log(
            //   `10-minute reminder already sent for task "${taskItem.task.content}"`
            // );
          }
        } else if (minutesDiff <= 60 && minutesDiff >= 59) {
          if (!sessionReminders.current.has(sixtyMinReminderKey)) {
            // console.log(
            //   `Task "${taskItem.task.content}" qualifies for 60-minute reminder`
            // );
            tasksToProcess.push({
              ...taskItem,
              reminderType: "60min",
              reminderKey: sixtyMinReminderKey,
            });
          } else {
            // console.log(
            //   `60-minute reminder already sent for task "${taskItem.task.content}"`
            // );
          }
        }
      });

      // Process each task that needs a reminder
      if (tasksToProcess.length > 0) {
        // console.log(`Processing ${tasksToProcess.length} task reminders`);

        for (const taskItem of tasksToProcess) {
          // Mark this reminder as processed immediately to prevent duplicates
          sessionReminders.current.add(taskItem.reminderKey);

          // Add reminder to localStorage as well for persistence across refreshes
          const savedReminders = JSON.parse(
            localStorage.getItem(`${currentUser._id}_sentReminders`) || "{}"
          );
          savedReminders[taskItem.reminderKey] = Date.now();
          localStorage.setItem(
            `${currentUser._id}_sentReminders`,
            JSON.stringify(savedReminders)
          );

          // Process the reminder
          await processReminder(taskItem);
        }
      } else {
        // console.log("No tasks need reminders at this time");
      }
    } catch (error) {
      console.error("Error checking for upcoming tasks:", error);
    }
  };

  const processReminder = async (taskItem) => {
    try {
      // console.log(`Processing reminder for task "${taskItem.task.content}"`);

      // 1. Add message to chat history first
      await addReminderMessage(taskItem);

      // 2. Open the chatbot
      await openChatbot(true);

      // 3. Create and show notification (do this last)
      setTimeout(() => {
        showNotification(taskItem);
      }, 500);
      // Small delay to ensure chat UI is ready

      // console.log(
      //   `Reminder processing complete for task "${taskItem.task.content}"`
      // );
    } catch (error) {
      console.error(
        `Error processing reminder for task "${taskItem.task.content}":`,
        error
      );
    }
  };

  const showNotification = (taskItem) => {
    const { reminderType } = taskItem;

    // Create notification content
    const notificationTitle =
      reminderType === "10min"
        ? "Task Starting Soon!"
        : "Upcoming Task Reminder";

    const notificationBody =
      reminderType === "10min"
        ? `Your task "${taskItem.task.content}" is starting in about 10 minutes!`
        : `You have "${taskItem.task.content}" scheduled in about 1 hour.`;

    // Show notification if browser supports it
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        // console.log(`Showing notification for task "${taskItem.task.content}"`);
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        // We need to ask for permission
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(notificationTitle, {
              body: notificationBody,
              icon: "/favicon.ico",
            });
          }
        });
      }
    } else {
      // console.log("Notifications not supported in this browser");
    }
  };

  const openChatbot = async (force = false) => {
    return new Promise((resolve) => {
      try {
        // console.log("Attempting to open chatbot...");

        // Set chatbot state in localStorage
        localStorage.setItem("chatbotState", "true");

        // Use both direct method invocation and event dispatching
        const chatbotOpenEvent = new CustomEvent("openChatbot", {
          detail: { force },
        });
        window.dispatchEvent(chatbotOpenEvent);

        // Also try to directly access any global chatbot open function
        if (window.openChatbot && typeof window.openChatbot === "function") {
          window.openChatbot();
        }

        // console.log("Chatbot open signals sent");

        // Give a moment for the chatbot to open before resolving
        setTimeout(resolve, 300);
      } catch (error) {
        console.error("Error opening chatbot:", error);
        resolve(); // Resolve anyway to continue with other operations
      }
    });
  };

  const addReminderMessage = async (taskItem) => {
    if (!currentUser || !currentUser._id) {
      // console.log("Cannot add reminder message: user not available");
      return;
    }

    const { reminderType } = taskItem;

    try {
      // console.log(
      //   `Adding reminder message for task "${taskItem.task.content}"`
      // );

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

      // Add reminder message to chat history
      const newChatHistory = [
        ...currentChatHistory,
        { user_message: "", ai_message: botMessage },
      ];

      // Update chat history in database
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
      refetchUser(currentUser._id);

      // console.log("Reminder message added to chat history successfully");

      // Force a refresh of the chat UI if possible
      if (
        window.refreshChatMessages &&
        typeof window.refreshChatMessages === "function"
      ) {
        window.refreshChatMessages();
      }
    } catch (error) {
      console.error("Error adding reminder message:", error);
    }
  };

  // Expose the trigger function to the window object so it can be called from anywhere
  useEffect(() => {
    if (!window.checkTaskReminders) {
      window.checkTaskReminders = triggerCheck;
    }

    return () => {
      if (window.checkTaskReminders === triggerCheck) {
        delete window.checkTaskReminders;
      }
    };
  }, []);

  // Load any saved reminders from localStorage
  useEffect(() => {
    if (!currentUser) return;

    try {
      const savedReminders = localStorage.getItem(
        `${currentUser._id}_sentReminders`
      );
      if (savedReminders) {
        const parsed = JSON.parse(savedReminders);

        // Convert to Set for current session tracking
        Object.keys(parsed).forEach((key) => {
          sessionReminders.current.add(key);
        });

        // Clean up old reminders (older than 24 hours)
        const now = Date.now();
        const updated = {};
        let hasChanges = false;

        Object.entries(parsed).forEach(([key, timestamp]) => {
          if (typeof timestamp === "boolean" || now - timestamp < 86400000) {
            updated[key] = typeof timestamp === "boolean" ? now : timestamp;

            if (typeof timestamp === "boolean") {
              hasChanges = true;
            }
          } else {
            hasChanges = true;
            // Don't include old reminders in the updated object
          }
        });

        if (hasChanges) {
          localStorage.setItem(
            `${currentUser._id}_sentReminders`,
            JSON.stringify(updated)
          );
        }
      }
    } catch (error) {
      console.error("Error loading saved reminders:", error);
    }
  }, [currentUser]);

  return null;
};
