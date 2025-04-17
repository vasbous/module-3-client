import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import dayjs from "dayjs";
import "../css/profil.css";
import { ProfilFormModal } from "../components/ProfilFormModal";
import toast, { Toaster } from "react-hot-toast";
import { ProfilePicUploader } from "../components/ProfilePicUploader";

// Import default avatar - adjust path as needed
import defaultAvatar from "../assets/default-avatar.png";
// Import chatbot images - adjust paths as needed
import chatbot1Image from "../assets/chatbot1.png"; // You'll need to add these images
import chatbot2Image from "../assets/chatbot2.png"; // You'll need to add these images

export const ProfilPage = () => {
  const { currentUser, refetchUser, updateUser, deleteProfilePic } =
    useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [property, setProperty] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(
    (currentUser.progression / (currentUser.level + 1)) * 100
  );
  const [chatbotToggle, setChatbotToggle] = useState(
    currentUser.chatbotPreference === "chatbot2" ? true : false
  );
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--progress-percentage",
      `${progressPercentage}%`
    );
  }, [progressPercentage]);

  function closeModal() {
    setIsModalOpen(false);
    setProperty("");
  }

  function closeUploader() {
    setIsUploaderOpen(false);
  }

  const handleChange = (e) => {
    setTheme(e.target.value);
    toast.success(`Theme selected ${e.target.value}`);
  };

  function openModalWithProperty(propertyName) {
    setProperty(propertyName);
    setIsModalOpen(true);
  }

  const handleChatbotToggle = async () => {
    const newPreference = chatbotToggle ? "chatbot1" : "chatbot2";
    setChatbotToggle(!chatbotToggle);
    try {
      await updateUser("chatbotPreference", {
        chatbotPreference: newPreference,
      });
      await refetchUser(currentUser._id);
      toast.success(
        `Chatbot preference updated to ${
          chatbotToggle ? "Chatbot 1" : "Chatbot 2"
        }`
      );
    } catch (error) {
      toast.error("Failed to update chatbot preference");
      setChatbotToggle(chatbotToggle); // Revert toggle if update fails
    }
  };

  const handleDeleteProfilePic = async () => {
    if (currentUser.profilepic === "defaultpic") {
      toast.error("You're already using the default profile picture");
      return;
    }
    if (confirm("Are you sure you want to remove your profile picture?")) {
      await deleteProfilePic(currentUser._id);
      await refetchUser(currentUser._id); // Make sure to refresh user data
      toast.success("Profile picture removed");
    }
  };

  // Function to open the uploader modal
  const openUploader = () => {
    setIsUploaderOpen(true);
  };

  return (
    <div className="container">
      <div className="profil-container">
        {/* Profile Picture Section */}
        <section className="profile-pic-section">
          <div className="profile-pic-container">
            <div className="profile-pic-wrapper">
              <img
                src={
                  currentUser.profilepic === "defaultpic"
                    ? defaultAvatar || "../assets/default-avatar.png" // Try both options
                    : currentUser.profilepic
                }
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <div className="profile-pic-buttons">
              <button
                className="btn btn-primary profile-pic-btn"
                onClick={openUploader}
              >
                Change Picture
              </button>
              {currentUser.profilepic !== "defaultpic" && (
                <button
                  className="btn btn-danger profile-pic-btn"
                  onClick={handleDeleteProfilePic}
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>

          {/* Chatbot Toggle Section - Updated */}
          <div className="chatbot-toggle-section">
            <div className="chatbot-toggle-container">
              <div
                className={`chatbot-option ${!chatbotToggle ? "active" : ""}`}
              >
                <span className="chatbot-label">Chatbot 1</span>
                <div className="chatbot-image-container">
                  <img
                    src={chatbot1Image || "/assets/chatbot1.png"}
                    alt="Chatbot 1"
                    className="chatbot-image"
                  />
                </div>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={chatbotToggle}
                  onChange={handleChatbotToggle}
                />
                <span className="slider round"></span>
              </label>

              <div
                className={`chatbot-option ${chatbotToggle ? "active" : ""}`}
              >
                <span className="chatbot-label">Chatbot 2</span>
                <div className="chatbot-image-container">
                  <img
                    src={chatbot2Image || "/assets/chatbot2.png"}
                    alt="Chatbot 2"
                    className="chatbot-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-profil">
          <h3 className="text-center">Hi</h3>
          <p>
            Your name is{" "}
            <button
              className="btn btn-info"
              onClick={() => openModalWithProperty("username")}
            >
              {currentUser.username}
            </button>
            . You were born on... You created your account on{" "}
            {dayjs(currentUser.createdAt).format("DD-MM-YYYY")} with the email{" "}
            <button
              className="btn btn-info"
              onClick={() => openModalWithProperty("email")}
            >
              {currentUser.email}
            </button>
            Your password{" "}
            <button
              className="btn btn-info"
              onClick={() => openModalWithProperty("password")}
            >
              "************"
            </button>
            is really strong, no one can find it. Your goal:{" "}
            <button className="btn btn-info">
              {currentUser.goal_details.selectedGoal}
            </button>
          </p>
        </section>

        <section>
          <h3 className="text-center">Change your Theme</h3>
          <form className="theme-selector">
            <label className="theme-option">
              <div className="theme-preview">
                <div className="color-square default-primary"></div>
                <div className="color-square default-secondary"></div>
                <div className="color-square default-accent"></div>
              </div>
              <div className="radio-container">
                <input
                  type="radio"
                  name="theme"
                  value="default-theme"
                  checked={theme === "default-theme"}
                  onChange={handleChange}
                />
                <span className="theme-name">Default theme</span>
              </div>
            </label>
            <label className="theme-option">
              <div className="theme-preview">
                <div className="color-square dark-primary"></div>
                <div className="color-square dark-secondary"></div>
                <div className="color-square dark-accent"></div>
              </div>
              <div className="radio-container">
                <input
                  type="radio"
                  name="theme"
                  value="dark-theme"
                  checked={theme === "dark-theme"}
                  onChange={handleChange}
                />
                <span className="theme-name">Dark theme</span>
              </div>
            </label>
            <label className="theme-option">
              <div className="theme-preview">
                <div className="color-square lavanda-primary"></div>
                <div className="color-square lavanda-secondary"></div>
                <div className="color-square lavanda-accent"></div>
              </div>
              <div className="radio-container">
                <input
                  type="radio"
                  name="theme"
                  value="lavanda-theme"
                  checked={theme === "lavanda-theme"}
                  onChange={handleChange}
                />
                <span className="theme-name">Lavanda theme</span>
              </div>
            </label>
          </form>
        </section>

        <section className="score-container-profil">
          <div className="circular-level-container">
            <div className="circular-level-progress">
              <div className="circular-level-inner">
                <span className="lvl-number">{currentUser.level}</span>
                <h3 className="text-center">LVL</h3>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Profile form modal */}
      <ProfilFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        toUpdate={property}
      />

      {/* Profile picture uploader modal */}
      <ProfilePicUploader
        isOpen={isUploaderOpen}
        onClose={closeUploader}
        userId={currentUser._id}
      />
    </div>
  );
};
