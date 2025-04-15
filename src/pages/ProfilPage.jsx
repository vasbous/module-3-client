import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import dayjs from "dayjs";
import "../css/profil.css"

export const ProfilPage = () => {
  const { currentUser, refetchUser, updateUserPlan } = useContext(AuthContext);
  const {theme, setTheme } = useContext(ThemeContext);
  const handleChange = (e) => {
    setTheme(e.target.value);
  };
  return (
    <div className="container">
      <div className="profil-container">
        <section className="text-profil">
          <h3 className="text-center">Hi</h3>
          <p>
            Your name is{" "}
            <button className="btn btn-info">{currentUser.username}</button>.
            You were born on... You created your account on{" "}
            {dayjs(currentUser.createdAt).format("DD-MM-YYYY")} with the email{" "}
            <button className="btn btn-info">{currentUser.email}</button>Your
            password <button className="btn btn-info">"*************"</button>is
            really strong, no one can find it. Your goal:{" "}
            <button className="btn btn-info">
              {currentUser.goal_details.selectedGoal}
            </button>
          </p>
        </section>
        <section>
          <h3 className="text-center">Change your Theme</h3>
          <form>
            <label>
              <input
                type="radio"
                name="theme"
                value="default-theme"
                checked={theme === "default-theme"}
                onChange={handleChange}
              />
              default theme
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="dark-theme"
                checked={theme === "dark-theme"}
                onChange={handleChange}
              />
              Dark theme
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="lavanda-theme"
                checked={theme === "lavanda-theme"}
                onChange={handleChange}
              />
              lavanda theme
            </label>
          </form>
        </section>
      </div>
    </div>
  );
};
