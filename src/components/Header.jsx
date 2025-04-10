import React from "react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export const Header = () => {
  const { isLoggedIn, handleLogout } = useContext(AuthContext);
  return (
    <>
      <header>
        <h1 className="title-app">NextChapter</h1>
        <div className="auth">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-auth">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-auth">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </header>
    </>
  );
};
