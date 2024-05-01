import "./login.css";
import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./images/fullLogo.png";

function Login() {
  //formats the saved data
  const [formData, setFormData] = useState({
    email: "",
    hash: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  function backgroundComponent() {
    const formDiv = document.querySelectorAll(".formBox");
    const circles = document.querySelectorAll(".circles");
    const appCss = document.querySelectorAll(".App");
    circles.forEach((cir) => {
      cir.style.zIndex = "-1";
    });
    formDiv.forEach((form) => {
      form.style.transition = "all cubic-bezier(0.3, 0.7, 1.0, 0.1) 0.6s"
      form.style.width = "94%";
      form.style.height = "140%";
    });

    setTimeout(() => {
      appCss.forEach((app) => {
        app.style.backgroundColor = "rgba(245, 245, 245)";
      });
    }, 600);
  }


  useEffect(() => {
    function randomSize(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function randomDelay(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function randomDuration(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const circles = document.querySelectorAll(".circles li");
    const positions = [];

    // Generate unique positions within the allowed range
    for (let i = 10; i <= 90; i += 10) {
      positions.push(i);
    }

    // Shuffle the positions array to randomize the positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    circles.forEach((circle, index) => {
      const size = randomSize(20, 500);
      const position = positions[index % positions.length];

      const delay = randomDelay(0, 20);
      const duration = randomDuration(11, 45);

      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      circle.style.left = `${position}%`;
      circle.style.animationDelay = `${delay}s`;
      circle.style.animationDuration = `${duration}s`;
    });

    function backgroundColor() {
      const appCss = document.querySelectorAll(".App");
      appCss.forEach((app) => {
        app.style.backgroundColor = "rgba(0, 0, 0, 0)";
      });
    }
    backgroundColor()
  }, []);

  //handles submit
  function handleSubmit(event) {
    event.preventDefault();
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errorMessage) {
          setErrorMessage(data.errorMessage);
        } else {
          backgroundComponent();

          localStorage.setItem("Token", data.token);
          const isAdmin = data.isAdmin;
          setTimeout(() => {
            navigate("/verified/user-profile");
          }, [700]);
        }
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="loginDiv">
      <div className="formContainer">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <form action="login" method="post" className="formBox">
          {errorMessage && <p className="redText">{errorMessage}!</p>}
          <div className="lilGuyContainer">
            <img className="lilGuy" src={logo} alt="ENROLLEASE Logo" />
          </div>
          <div className="formStructure">
            <div className="topHeader">
              <h2>Login</h2>
            </div>
            <div className="formRequirements">
              <div className="userInput">
                <p>Email</p>
                <div className="inputFormating">
                  <i className="fa-solid fa-user"></i>
                  <input
                    type="text"
                    id="email"
                    placeholder="Type Email Here"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="userInput">
                <p>Password</p>
                <div className="inputFormating">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="text"
                    id="password"
                    placeholder="Type Password Here"
                    onChange={(e) =>
                      setFormData({ ...formData, hash: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="navLoginSignUp">
            <input
              type="submit"
              className="loginButton"
              value={"Login"}
              onClick={handleSubmit}
            />
            <div className="signUp">
              <h5 className="smallText">Or Sign Up</h5>
              <Link className="registerLink" to="/register">
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
