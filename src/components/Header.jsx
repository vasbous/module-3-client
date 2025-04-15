import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useContext , useState, useEffect, useRef} from "react";
import { AuthContext } from "../context/AuthContext";
import "../css/header.css"


export const Header = () => {
  const { isLoggedIn, handleLogout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

   function toggleDropdown(state) {
    setShowDropdown(!state);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    // call handleClickOutside if u clic somewhere
    document.addEventListener("mousedown", handleClickOutside);
    // clean useEffect before re-Use it
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <>
      <header>
        <Link to="/"><h1 className="title-app">NextChapter</h1></Link>
        <div className="auth">
          {isLoggedIn ? (
           <div
           className="dropdown" ref={dropdownRef}
         >
           <i
             className="fa-solid fa-circle-user user-icon"
             onClick={() => toggleDropdown(showDropdown)}
           ></i>
           {showDropdown && (
             <ul className={`dropdown-menu ${showDropdown ? "show" : "hide"}`}>
              <NavLink to="/profil"><li>
                  Profil
               </li></NavLink>
               <NavLink to="/dashboard"><li>
                 Dashboard
               </li></NavLink>
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
