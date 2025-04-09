import React from "react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const LoginPage = () => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  // const nav = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  function handleLogin(e) {
    e.preventDefault();
    console.log(userData);
    loginUser(userData);
  }

  return (
    <>
      <div className="form-container">
        <h3 className="text-center">Login</h3>
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              onChange={handleChange}
            />
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="underline"></div>
          </div>
          <div className="input-container">
            <input
              type="password"
              id="password"
              name="password"
              placeholder=" "
              onChange={handleChange}
            />
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="underline"></div>
          </div>
          <button type="submit" className="btn btn-success">
            Sign In
          </button>
        </form>
      </div>
    </>
  );
};
