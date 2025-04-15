import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';

export const FormName = ({ onClose, property }) => {
  const { currentUser, refetchUser ,updateUser, } = useContext(AuthContext);
  const [username, setUsername] = useState(currentUser.username);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToUpdate = {
       [property]: username  
      };
    const response = await updateUser(property, dataToUpdate )
    
      
      if (response) {
        await refetchUser(currentUser._id);
        toast.success("Username Update")
        onClose();
      }
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-container">
        
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength="3"
        />
        <label htmlFor="username" className="label">New Username</label>
        <div className="unerline"></div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn btn-info" onClick={onClose}>
          Annuler
        </button>
        <button type="submit" className="btn btn-success" >
          update
        </button>
      </div>
    </form>
  );
};