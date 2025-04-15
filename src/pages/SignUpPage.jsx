import React from "react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const SignUpPage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const nav = useNavigate();
  const { createUser, errorMessage } = useContext(AuthContext);
  const { loginUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createUser(userData);
    loginUser(userData);
  };

  return (
    <div className="container">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h3 className="text-center">Create Account</h3>
          <div className="input-container">
            <input
              id="username"
              type="text"
              name="username"
              placeholder=" "
              value={userData.username}
              onChange={handleChange}
              required
            />
            <label htmlFor="username" className="label">
              First Name
            </label>
            <div className="underline"></div>
          </div>
          <div className="input-container">
            <input
              id="email"
              type="email"
              name="email"
              placeholder=" "
              value={userData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="underline"></div>
          </div>
          <div className="input-container">
            <input
              id="password"
              type="password"
              name="password"
              placeholder=" "
              value={userData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="underline"></div>
          </div>
          <button className="btn btn-success" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};
