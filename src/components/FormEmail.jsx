import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';


export const FormEmail = ({ onClose, property }) => {
  const { currentUser, refetchUser ,updateUser} = useContext(AuthContext);
  const [email, setEmail] = useState(currentUser.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToUpdate = {
       [property]: email 
      };
    const response = await updateUser(property, dataToUpdate )
    
      
    
      
      if (response) {
        await refetchUser(currentUser._id);
        toast.success("Email Update")
        onClose();
      }
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-container">
        
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
         placeholder=" "
        />
        <label htmlFor="email" className="label">New Email</label>
        <div className="unerline"></div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn" onClick={onClose}>
          Annuler
        </button>
        <button type="submit" className="btn btn-success" >
          update
        </button>
      </div>
    </form>
  );
};