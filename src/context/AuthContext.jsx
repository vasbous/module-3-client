import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "../config/config";

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
          `${API_URL}/auth/verify`,
          {
            headers: {
              authorization: `Bearer ${tokenFromLocalStorage}`,
            },
          }
        );
        const currentUserData = await axios.get(
          `${API_URL}/user/${responseFromVerifyRoute.data.payload._id}`
        );
        setCurrentUser(currentUserData.data);
        setIsLoading(false);
        setIsLoggedIn(true);
      } catch (error) {
        setCurrentUser(null);
        setIsLoading(false);
        setIsLoggedIn(false);
        localStorage.removeItem("authToken"); // Clear invalid token
      }
    }
  };

  //make a useEffect so anytime the page reloads, we verify the token again
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
      const connexion = await axios.post(`${API_URL}/auth/login`, data);
      localStorage.setItem("authToken", connexion.data.authToken);

      // Get the token from localStorage to verify
      const tokenFromLocalStorage = localStorage.getItem("authToken");
      if (tokenFromLocalStorage) {
        try {
          const responseFromVerifyRoute = await axios.get(
            `${API_URL}/auth/verify`,
            {
              headers: {
                authorization: `Bearer ${tokenFromLocalStorage}`,
              },
            }
          );
          const currentUserData = await axios.get(
            `${API_URL}/user/${responseFromVerifyRoute.data.payload._id}`
          );

          // Update the state
          setCurrentUser(currentUserData.data);
          setIsLoading(false);
          setIsLoggedIn(true);

          // Use the direct data for navigation decision
          if (currentUserData.data.signupCompleted) {
            nav("/dashboard");
          } else {
            nav("/signup-questions");
          }
        } catch (error) {
          setCurrentUser(null);
          setIsLoading(false);
          setIsLoggedIn(false);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  }

  async function createUser(data) {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
     
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  }

  // Updated updateUser function with proper error handling
  const updateUser = async (property, data) => {
    try {
      const response = await axios.patch(
        `${API_URL}/user/update/${property}/${currentUser._id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Updated refetchUser function with proper error handling
  const refetchUser = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error refetching user:", error);
      return null;
    }
  };

  // Updated uploadProfilePic function
  const uploadProfilePic = async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", imageFile);

      const response = await axios.post(
        `${API_URL}/user/profilepic/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update current user with new profile pic
      setCurrentUser((prev) => ({
        ...prev,
        profilepic: response.data.profilepic,
      }));

      return response.data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  // New function to delete profile picture
  const deleteProfilePic = async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/user/profilepic/${userId}`
      );
      // Update current user to default profile pic
      setCurrentUser((prev) => ({
        ...prev,
        profilepic: "defaultpic",
      }));

      return response.data;
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      throw error;
    }
  };

  // update user plan
  async function updateUserPlan(newPlan) {
    try {
      const userUpdate = await axios.patch(
        `${API_URL}/user/update/plan/${currentUser._id}`,
        { plan: newPlan }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  }

  // update lvl and progression
  async function lvlProgression() {
    let lvl = currentUser.level;
    let progression = currentUser.progression;
    let up = false;
    progression += 1;
    if (progression > lvl) {
      progression = 0;
      lvl += 1;
      up = true;
      try {
        await axios.patch(`${API_URL}/user/update/level/${currentUser._id}`, {
          level: lvl,
        });
        toast.success(" + LVL UP + ");
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    }
    try {
      await axios.patch(
        `${API_URL}/user/update/progression/${currentUser._id}`,
        { progression: progression }
      );
      refetchUser(currentUser._id);
      if (up) {
        // confetti here
        return true;
      }
      return false;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
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
        updateUser,
        lvlProgression,
        uploadProfilePic,
        deleteProfilePic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextWrapper };
