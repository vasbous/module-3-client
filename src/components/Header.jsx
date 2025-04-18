import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import "../css/header.css";

export const Header = () => {
  const { isLoggedIn, handleLogout, currentUser } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  function toggleDropdown(state) {
    setShowDropdown(!state);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`main-header ${scrolled ? "scrolled" : ""}`}>
        <Link to="/">
          <h1 className="title-app">NextChapter</h1>
        </Link>
        <div className="auth">
          {isLoggedIn ? (
            <div className="dropdown" ref={dropdownRef}>
              {currentUser?.profilepic !== "defaultpic" ? (
                <div
                  className="pic-icon"
                  onClick={() => toggleDropdown(showDropdown)}
                >
                  <img
                    src={currentUser.profilepic}
                    alt="profil pic"
                    className="profile-pic"
                  />
                </div>
              ) : (
                <i
                  className="fa-solid fa-circle-user user-icon"
                  onClick={() => toggleDropdown(showDropdown)}
                ></i>
              )}

              {showDropdown && (
                <ul
                  className={`dropdown-menu ${showDropdown ? "show" : "hide"}`}
                >
                  <NavLink to="/profil">
                    <li>Profil</li>
                  </NavLink>
                  <NavLink to="/dashboard">
                    <li>Dashboard</li>
                  </NavLink>
                  <li onClick={handleLogout}>Logout</li>
                </ul>
              )}
            </div>
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
