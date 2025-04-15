import React from 'react';
import "../css/modal.css"

export const TaskDetailsModal = ({ isOpen, onClose, taskDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{taskDetails.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {taskDetails.start && (
            <p>
              <strong>Start:</strong> {new Date(taskDetails.start).toLocaleString()}
            </p>
          )}
          {taskDetails.end && (
            <p>
              <strong>End:</strong> {new Date(taskDetails.end).toLocaleString()}
            </p>
          )}
          {taskDetails.details && (
            <div className="task-description">
              <strong>Description:</strong>
              <p>{taskDetails.details}</p>
            </div>
          )}
          <p>
            <strong>Status:</strong> {taskDetails.done ? 'Completed' : 'Pending'}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};