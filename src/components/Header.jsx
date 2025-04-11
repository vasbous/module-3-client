import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export const Header = () => {
  const { isLoggedIn, handleLogout } = useContext(AuthContext);
  return (
    <>
      <header>
        <Link to="/dashboard"><h1 className="title-app">NextChapter</h1></Link>
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
