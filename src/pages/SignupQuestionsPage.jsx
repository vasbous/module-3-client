import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export const SignupQuestionsPage = () => {
  const { currentUser, refetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // States for tracking progress
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 for goal selection
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Debug state changes
  useEffect(() => {
    console.log("Current question index:", currentQuestionIndex);
    console.log("Questions array:", questions);
    console.log("Selected goal:", selectedGoal);
    console.log("Current answers:", answers);
  }, [currentQuestionIndex, questions, selectedGoal, answers]);

  // Fetch goals on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/goal`);
        setGoals(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setIsLoading(false);
      }
    };

    // Check if user has already started the signup process
    const checkUserProgress = async () => {
      if (currentUser && currentUser.goal_details) {
        const goalDetails = currentUser.goal_details;

        // Check if user has selected a goal
        if (goalDetails.selectedGoal) {
          setSelectedGoal(goalDetails.selectedGoal);

          // Set questions from saved goal details
          if (goalDetails.questions && goalDetails.questions.length > 0) {
            setQuestions(goalDetails.questions);

            // Find the first unanswered question
            let nextUnansweredIndex = -1;
            for (let i = 0; i < goalDetails.questions.length; i++) {
              if (!goalDetails.questions[i].user_answer) {
                nextUnansweredIndex = i;
                break;
              }
            }

            // Set current question index
            if (nextUnansweredIndex >= 0) {
              setCurrentQuestionIndex(nextUnansweredIndex);
            } else {
              // All questions answered, go to dashboard
              navigate("/create-plan");
            }

            // Restore saved answers
            const savedAnswers = {};
            goalDetails.questions.forEach((question) => {
              if (question.user_answer) {
                // If the question is multi-selection, convert comma-separated string back to array
                if (
                  question.type === "multiple" &&
                  typeof question.user_answer === "string"
                ) {
                  savedAnswers[question.title] =
                    question.user_answer.split(",");
                } else {
                  savedAnswers[question.title] = question.user_answer;
                }
              }
            });
            setAnswers(savedAnswers);
          } else {
            // No questions found, reset to goal selection
            setCurrentQuestionIndex(-1);
          }
        } else {
          // No goal selected yet
          setCurrentQuestionIndex(-1);
        }
      } else {
        // New signup process
        setCurrentQuestionIndex(-1);
      }
    };

    fetchGoals();
    setTimeout(() => {
      checkUserProgress();
    }, 500); // Small delay to ensure goals are fetched first
  }, [currentUser, navigate]);

  // Handler for goal selection
  const handleGoalSelection = (goalName) => {
    // If changing from a previously selected goal, clear all answers
    if (selectedGoal && selectedGoal !== goalName) {
      setAnswers({});
    }

    setSelectedGoal(goalName);
    const selectedGoalData = goals.find((goal) => goal.name === goalName);
    console.log("Selected goal data:", selectedGoalData);
    if (selectedGoalData) {
      console.log("Questions for goal:", selectedGoalData.questions);
      setQuestions(selectedGoalData.questions || []);
    }
  };

  // Handler for answer selection
  const handleAnswerSelection = (questionTitle, answer) => {
    setAnswers({
      ...answers,
      [questionTitle]: answer,
    });
  };

  // Handler for multi-select answers
  const handleMultiAnswerSelection = (questionTitle, answer) => {
    const currentAnswers = answers[questionTitle] || [];
    let updatedAnswers;

    if (currentAnswers.includes(answer)) {
      // Remove if already selected
      updatedAnswers = currentAnswers.filter((item) => item !== answer);
    } else {
      // Add if not selected
      updatedAnswers = [...currentAnswers, answer];
    }

    setAnswers({
      ...answers,
      [questionTitle]: updatedAnswers,
    });
  };

  // Save progress to user profile
  const saveProgress = async (newData) => {
    try {
      if (!currentUser) return;

      // Get existing goal_details or create new object
      let goalDetails = currentUser.goal_details || {};

      // If this is the first time saving (selecting a goal)
      if (newData.selectedGoal) {
        // Find the selected goal from our goals array
        const selectedGoalData = goals.find(
          (g) => g.name === newData.selectedGoal
        );

        // Create a new goal details structure that mirrors the goal structure
        // This will overwrite any previous goal details
        goalDetails = {
          selectedGoal: newData.selectedGoal,
          questions: selectedGoalData.questions.map((q) => ({
            ...q,
            user_answer: null, // Initialize with null answers
          })),
        };
      }
      // If we're saving a question answer
      else {
        // We're updating an answer to a specific question
        const [questionTitle] = Object.keys(newData);
        let answer = newData[questionTitle];

        // Update the specific question's user_answer
        if (goalDetails.questions) {
          goalDetails.questions = goalDetails.questions.map((q) => {
            if (q.title === questionTitle) {
              // Convert array to comma-separated string for multiple type questions
              if (q.type === "multiple" && Array.isArray(answer)) {
                answer = answer.join(",");
              }

              return {
                ...q,
                user_answer: answer,
              };
            }
            return q;
          });
        }
      }

      // Save to user profile
      await axios.patch(
        `${API_URL}/user/update/goal_details/${currentUser._id}`,
        { goal_details: goalDetails }
      );

      // Refresh user data
      await refetchUser(currentUser._id);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Navigate to next question
  const handleNext = async () => {
    // Goal selection step
    if (currentQuestionIndex === -1) {
      if (!selectedGoal) {
        alert("Please select a goal to continue");
        return;
      }

      // Save the selected goal
      await saveProgress({ selectedGoal });

      // Make sure questions are properly set before advancing
      const selectedGoalData = goals.find((goal) => goal.name === selectedGoal);
      if (selectedGoalData && selectedGoalData.questions) {
        // Force a small delay to ensure state updates properly
        setTimeout(() => {
          setCurrentQuestionIndex(0);
        }, 100);
      } else {
        console.error("Selected goal has no questions:", selectedGoal);
      }
      return;
    }

    // Question steps
    const currentQuestion = questions[currentQuestionIndex];
    if (!answers[currentQuestion.title]) {
      alert("Please answer the question to continue");
      return;
    }

    // For multiple selection questions, make sure at least one option is selected
    if (
      (currentQuestion.type === "multiple" ||
        currentQuestion.type === "multi-selection") &&
      (!answers[currentQuestion.title] ||
        answers[currentQuestion.title].length === 0)
    ) {
      alert("Please select at least one option to continue");
      return;
    }

    // Save progress for this question
    await saveProgress({
      [currentQuestion.title]: answers[currentQuestion.title],
    });

    // Check if this is the last question
    if (currentQuestionIndex >= questions.length - 1) {
      // Complete the signup process
      await completeSignup();
      navigate("/create-plan");
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionIndex === 0) {
      // Go back to goal selection
      setCurrentQuestionIndex(-1);
    }
  };

  // Mark signup as complete
  const completeSignup = async () => {
    try {
      if (!currentUser) return;

      await axios.patch(
        `${API_URL}/user/update/signupCompleted/${currentUser._id}`,
        { signupCompleted: true }
      );

      await refetchUser(currentUser._id);
    } catch (error) {
      console.error("Error completing signup:", error);
    }
  };

  // Render the progress tracker
  const renderProgressTracker = () => {
    if (currentQuestionIndex === -1) {
      return <div className="progress-tracker">Step 1: Select your goal</div>;
    }

    return (
      <div className="progress-tracker">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
    );
  };

  // Render goal selection
  const renderGoalSelection = () => {
    return (
      <div className="goal-selection-container">
        <h3 className="text-center">Select your primary goal</h3>
        <p className="goal-instruction">
          Choose the goal that best matches what you want to achieve:
        </p>

        <div className="goals-grid">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className={`goal-card ${
                selectedGoal === goal.name ? "selected" : ""
              }`}
              onClick={() => handleGoalSelection(goal.name)}
            >
              <h4>{goal.name}</h4>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a question based on its type
  const renderQuestion = (question) => {
    const { title, question: questionText, type, answer_choices } = question;

    return (
      <div className="question-container">
        <h3 className="text-center">{questionText}</h3>

        {/* Display prompt for multiple selection questions */}
        {(type === "multiple" || type === "multi-selection") && (
          <p className="multiple-selection-prompt">
            (You can pick more than one answer)
          </p>
        )}

        {type === "number" && (
          <div className="number-input-container">
            <input
              type="number"
              value={answers[title] || ""}
              onChange={(e) => handleAnswerSelection(title, e.target.value)}
              className="number-input"
            />
          </div>
        )}

        {type === "selection" && (
          <div className="options-container">
            {answer_choices.map((choice, index) => (
              <div
                key={index}
                className={`option-card ${
                  answers[title] === choice ? "selected" : ""
                }`}
                onClick={() => handleAnswerSelection(title, choice)}
              >
                <span>{choice}</span>
              </div>
            ))}
          </div>
        )}

        {(type === "multiple" || type === "multi-selection") && (
          <div className="options-container">
            {answer_choices.map((choice, index) => {
              const isSelected = (answers[title] || []).includes(choice);
              return (
                <div
                  key={index}
                  className={`option-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleMultiAnswerSelection(title, choice)}
                >
                  <span>{choice}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="signup-questions-container">
        {renderProgressTracker()}

        {currentQuestionIndex === -1 ? (
          renderGoalSelection()
        ) : questions &&
          questions.length > 0 &&
          questions[currentQuestionIndex] ? (
          renderQuestion(questions[currentQuestionIndex])
        ) : (
          <div>No questions available for this goal.</div>
        )}

        <div className="navigation-buttons">
          {currentQuestionIndex > -1 && (
            <button className="btn" onClick={handlePrevious}>
              Previous
            </button>
          )}

          <button className="btn btn-success" onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1
              ? "Complete"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};
