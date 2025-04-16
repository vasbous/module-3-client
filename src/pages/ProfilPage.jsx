import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import dayjs from "dayjs";
import "../css/profil.css";
import { ProfilFormModal } from "../components/ProfilFormModal";
import toast, { Toaster } from "react-hot-toast";

export const ProfilPage = () => {
  const { currentUser, refetchUser, updateUserPlan } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [property, setProperty] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(
    (currentUser.progression / (currentUser.level + 1)) * 100
  );

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
  const handleChange = (e) => {
    setTheme(e.target.value);
    toast.success(`Theme selected ${e.target.value}`);
  };

  function openModalWithProperty(propertyName) {
    setProperty(propertyName);
    setIsModalOpen(true);
  }
  return (
    <div className="container">
      <div className="profil-container">
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
              "*************"
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
      <ProfilFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        toUpdate={property}
      />
    </div>
  );
};
