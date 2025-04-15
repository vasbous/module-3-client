// import React from "react";
import "../css/modal.css";
import { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import { AuthContext } from "../context/AuthContext";

export const TaskDetailsModal = ({ isOpen, onClose, taskDetails }) => {
  if (!isOpen) return null;
  const {currentUser, refetchUser} = useContext(AuthContext)
  const {changeTaskPlan} = useContext(TaskContext)
  console.log(taskDetails.taskId)
  async function newTask() {
    const data = {
       oldTaskId : taskDetails.taskId,
       category: currentUser.goal_details.selectedGoal,
       startDate : taskDetails.start,
    }
    await changeTaskPlan(data);
    await refetchUser(currentUser._id)
    onClose();
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{taskDetails.title}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-date">
            {taskDetails.start && (
              <p>
                {new Date(taskDetails.start).toLocaleString()}
              </p>
            )}
            {taskDetails.end && (
              <p>
                {new Date(taskDetails.end).toLocaleString()}
              </p>
            )}
          </div>
          {taskDetails.details && (
            <div className="task-description">
              <p>{taskDetails.details}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={newTask}>
            Change this task
          </button>
        </div>
      </div>
    </div>
  );
};
