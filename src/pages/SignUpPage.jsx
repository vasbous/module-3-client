import React from "react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const SignUpPage = () => {
  // create a object with all required user property and set all with the value empty string
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });
// hook 2 function from AuthContext
  const { createUser,loginUser } = useContext(AuthContext);
 
// create a function to setUserData change after user write something inside form
// e.target.name = property inside userData (username, email, password)
// e.target.value refer to the text write inside this input
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser(userData);
    await loginUser(userData);
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
