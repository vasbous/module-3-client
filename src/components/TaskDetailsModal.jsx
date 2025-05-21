import { useContext, useEffect, useRef } from "react";
import "../css/modal.css";
import { TaskContext } from "../context/TaskContext";
import { AuthContext } from "../context/AuthContext";

export const TaskDetailsModal = ({ isOpen, onClose, taskDetails }) => {
  const { currentUser, refetchUser } = useContext(AuthContext);
  const { changeTaskPlan } = useContext(TaskContext);
  const modalRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Add event listener when the modal is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function newTask() {
    const data = {
      oldTaskId: taskDetails.taskId,
      category: currentUser.goal_details.selectedGoal,
      startDate: taskDetails.start,
    };
    await changeTaskPlan(data);
    await refetchUser(currentUser._id);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>{taskDetails.title}</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-date">
            {taskDetails.start && (
              <p>{new Date(taskDetails.start).toLocaleString()}</p>
            )}
            {taskDetails.end && (
              <p>{new Date(taskDetails.end).toLocaleString()}</p>
            )}
          </div>
          {taskDetails.details && (
            <div className="task-description">
              <p>{taskDetails.details}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!taskDetails.done && (
            <button 
              className="btn btn-primary" 
              onClick={newTask}
              style={{ width: '100%' }}
            >
              Change this task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
