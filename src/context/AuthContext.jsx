import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthContextWrapper = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const nav = useNavigate();
  const [errorMessage, setErrorMessage] = useState();

  //first grab the token from LS and verify it
  const authenticateUser = async () => {
    const tokenFromLocalStorage = localStorage.getItem("authToken");
    if (!tokenFromLocalStorage) {
      setCurrentUser(null);
      setIsLoading(false);
      setIsLoggedIn(false);
    } else {
      try {
        const responseFromVerifyRoute = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify`,
          {
            headers: {
              authorization: `Bearer ${tokenFromLocalStorage}`,
            },
          }
        );

        const currentUserData = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/${
            responseFromVerifyRoute.data.payload._id
          }`
        );

        setCurrentUser(currentUserData.data);
        setIsLoading(false);
        setIsLoggedIn(true);
      } catch (error) {
        console.log(error);
        setCurrentUser(null);
        setIsLoading(false);
        setIsLoggedIn(false);
      }
    }
  };

  //make a useEffect so anytime the page reloads, we verigy the token again
  useEffect(() => {
    authenticateUser();
  }, []);

  //logout the user by deleting the token from the LS
  async function handleLogout() {
    localStorage.removeItem("authToken");
    await authenticateUser();
    nav("/");
  }

  async function loginUser(data) {
    try {
      const connexion = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        data
      );

      console.log("user was logged in", connexion.data);
      localStorage.setItem("authToken", connexion.data.authToken);
      await authenticateUser();
      nav("/dashboard");
    } catch (err) {
      console.log(err);
      setErrorMessage(err.response.data.errorMessage);
    }
  }

  async function createUser(data) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        localStorage.setItem("authToken", response.data.token);
        await authenticateUser();
        nav("/dashboard");
      } else {
        setErrorMessage(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  }

  const refetchUser = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/${id}`);
    setCurrentUser(res.data);
  };

  // update user plan
  async function updateUserPlan(newPlan) {
    try {
      const userUpdate = await axios.patch(
        `${import.meta.env.VITE_API_URL}/user/update/plan/${currentUser._id}`,
        { plan: newPlan }
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        isLoggedIn,
        authenticateUser,
        handleLogout,
        loginUser,
        createUser,
        errorMessage,
        refetchUser,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextWrapper };
