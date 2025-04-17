import React from "react";
import "../css/modal.css";
import { FormName } from "./FormName";
import { FormEmail } from "./FormEmail";
import { FormPassword } from "./FormPassword";

export const ProfilFormModal = ({ isOpen, onClose, toUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update {toUpdate}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {toUpdate === "username" && (
            <FormName property={toUpdate} onClose={onClose} />
          )}
          {toUpdate === "email" && (
            <FormEmail property={toUpdate} onClose={onClose} />
          )}
          {toUpdate === "password" && (
            <FormPassword property={toUpdate} onClose={onClose} />
          )}
        </div>
        <div className="modal-footer">
          {/* <button className="btn btn-primary" onClick={onClose}>
            Close
          </button> */}
        </div>
      </div>
    </div>
  );
};
