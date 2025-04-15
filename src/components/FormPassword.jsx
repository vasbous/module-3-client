import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';


export const FormPassword = ({ onClose, property }) => {
  const { currentUser, refetchUser ,updateUser} = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmePassword, setConfirmePassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(confirmePassword !== newPassword){
        toast.error("new password need to match with confirme password")
    }else{
        const dataToUpdate = {
       oldPassword: oldPassword ,
       newPassword: newPassword
      };
    const response = await updateUser(property, dataToUpdate )
    
      if (response) {
        await refetchUser(currentUser._id);
        toast.success("Password Update")
        onClose();
      }
    }
    
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-container">
        
        <input
          type="password"
          id="oldPassword"
          placeholder=" "
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <label htmlFor="oldPassword" className="label">Old Password</label>
        <div className="underline"></div>
      </div>
      
      <div className="input-container">
        
        <input
          type="password"
          id="newPassword"
          placeholder=" "
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label htmlFor="newPassword" className="label">New Password</label>
        <div className="underline"></div>
      </div>

      <div className="input-container">
        
        <input
          type="password"
          id="confirmePassword"
          placeholder=" "
          value={confirmePassword}
          onChange={(e) => setConfirmePassword(e.target.value)}
          required
        />
        <label htmlFor="confirmePassword" className="label">Confirme new Password</label>
        <div className="underline"></div>
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