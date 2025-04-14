import React from "react";
import "../css/HomePage.css";
import { Link } from "react-router-dom";
import question from "../assets/questionne.png";
import road from "../assets/chemin.png";
import plan from "../assets/plan.webp";
import task from "../assets/task.webp";
import non from "../assets/non.webp";
import chat from "../assets/chat.png";

export const HomePage = () => {
  return (
    <div className="container-homePage">
      <section className="before-section">
        <div className="first-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
      <section className="first-section">
        <h2 className="title-home">Need to change</h2>
        <div className="img-home-page">
          <img src={question} alt="Human Question" />
        </div>
        <h2 className="title-home">Change your life step by step</h2>
        <div className="second-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,500 L 0,187 C 76.52540500736379,154.67304860088365 153.05081001472757,122.34609720176732 202,137 C 250.94918998527243,151.65390279823268 272.3221649484536,213.28865979381445 326,213 C 379.6778350515464,212.71134020618555 465.66053019145795,150.49926362297492 540,156 C 614.339469808542,161.50073637702508 677.0357142857143,234.71428571428572 740,228 C 802.9642857142857,221.28571428571428 866.1966126656849,134.64359351988216 920,143 C 973.8033873343151,151.35640648011784 1018.1778350515463,254.71134020618558 1075,280 C 1131.8221649484537,305.2886597938144 1201.0920471281297,252.51104565537557 1264,224 C 1326.9079528718703,195.48895434462443 1383.4539764359351,191.2444771723122 1440,187 L 1440,500 L 0,500 Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
      <section className="second-section">
        <h2 className="title-home">Whatever your needs</h2>
        <div className="img-home-page">
          <img src={road} alt="which direction you want to take" />
        </div>
        <div className="title-button-home">
          <h2 className="title-home">
            Choose the change you want to make in your life
          </h2>
          <div className="text-center">
            <Link className="btn">Change your life</Link>
          </div>
        </div>
        <div className="third-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,500 L 0,187 C 75,203.53589743589743 150,220.07179487179485 222,240 C 294,259.92820512820515 363,283.24871794871797 445,266 C 527,248.75128205128206 622,190.93333333333334 717,191 C 812,191.06666666666666 907,249.01794871794874 987,260 C 1067,270.98205128205126 1132,234.99487179487178 1205,215 C 1278,195.00512820512822 1359,191.00256410256412 1440,187 L 1440,500 L 0,500 Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
      <section className="third-section">
        <h2 className="title-home">
          We create an action plan to help you reach your goal
        </h2>
        <div className="img-home-page">
          <img src={plan} alt="plan and task" />
        </div>
        <div className="fourth-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,500 L 0,187 C 76.52540500736379,154.67304860088365 153.05081001472757,122.34609720176732 202,137 C 250.94918998527243,151.65390279823268 272.3221649484536,213.28865979381445 326,213 C 379.6778350515464,212.71134020618555 465.66053019145795,150.49926362297492 540,156 C 614.339469808542,161.50073637702508 677.0357142857143,234.71428571428572 740,228 C 802.9642857142857,221.28571428571428 866.1966126656849,134.64359351988216 920,143 C 973.8033873343151,151.35640648011784 1018.1778350515463,254.71134020618558 1075,280 C 1131.8221649484537,305.2886597938144 1201.0920471281297,252.51104565537557 1264,224 C 1326.9079528718703,195.48895434462443 1383.4539764359351,191.2444771723122 1440,187 L 1440,500 L 0,500 Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
      <section className="fourth-section">
        <div className="img-home-page">
          <img src={task} alt="create task" />
        </div>
        <div className="title-button-home">
          <h2 className="title-home">Simple, self-paced tasks</h2>
          <div className="text-center">
            <Link className="btn">Create your task</Link>
          </div>
        </div>
        <div className="five-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,500 L 0,187 C 75,203.53589743589743 150,220.07179487179485 222,240 C 294,259.92820512820515 363,283.24871794871797 445,266 C 527,248.75128205128206 622,190.93333333333334 717,191 C 812,191.06666666666666 907,249.01794871794874 987,260 C 1067,270.98205128205126 1132,234.99487179487178 1205,215 C 1278,195.00512820512822 1359,191.00256410256412 1440,187 L 1440,500 L 0,500 Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
      <section className="five-section">
        <h2 className="title-home">
          Questions? Tasks you don't want to or can't do?{" "}
        </h2>
        <div className="img-home-page">
          <img src={non} alt="avatar" />
        </div>
        <div className="six-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,500 L 0,187 C 76.52540500736379,154.67304860088365 153.05081001472757,122.34609720176732 202,137 C 250.94918998527243,151.65390279823268 272.3221649484536,213.28865979381445 326,213 C 379.6778350515464,212.71134020618555 465.66053019145795,150.49926362297492 540,156 C 614.339469808542,161.50073637702508 677.0357142857143,234.71428571428572 740,228 C 802.9642857142857,221.28571428571428 866.1966126656849,134.64359351988216 920,143 C 973.8033873343151,151.35640648011784 1018.1778350515463,254.71134020618558 1075,280 C 1131.8221649484537,305.2886597938144 1201.0920471281297,252.51104565537557 1264,224 C 1326.9079528718703,195.48895434462443 1383.4539764359351,191.2444771723122 1440,187 L 1440,500 L 0,500 Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
      <section className="six-section">
        <div className="img-home-page">
          <img src={chat} alt="little robot" />
        </div>
        <div className="title-button-home">
          <h2 className="title-home">
            Our chat, with its powerful ia,will answer all your questions.
          </h2>
          <div className="text-center">
            <Link className="btn">Open Chat</Link>
          </div>
        </div>
        <div className="seven-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,500 L 0,187 C 75,203.53589743589743 150,220.07179487179485 222,240 C 294,259.92820512820515 363,283.24871794871797 445,266 C 527,248.75128205128206 622,190.93333333333334 717,191 C 812,191.06666666666666 907,249.01794871794874 987,260 C 1067,270.98205128205126 1132,234.99487179487178 1205,215 C 1278,195.00512820512822 1359,191.00256410256412 1440,187 L 1440,500 L 0,500 Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>
    </div>
  );
};
