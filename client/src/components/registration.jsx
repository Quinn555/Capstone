import "./registration.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./images/fullLogo.png";

function Registration() {
  //formats the form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    hash: "",
    firstName: "",
    lastName: "",
    telephone: "",
    address: "",
    createDate: "Today",
    isAdmin: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();


  //css animation
  function backgroundComponent() {
    const formDiv = document.querySelectorAll(".formBoxReg");
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

  //helps save the stuff from the form
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  //handles submitted form
  function handleSubmit(event) {
    event.preventDefault();

    fetch("/api/submit-user", {
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
          //if right sends to main page
          backgroundComponent();
          localStorage.setItem("Token", data.token);
          setTimeout(() => {
            navigate("/verified/user-profile");
          }, [700]);
        }
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="registerDiv">
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
        <form onSubmit={handleSubmit} className="formBoxReg">
          {errorMessage && <p className="redText">{errorMessage}!</p>}
          <div className="lilGuyContainerReg">
            <img className="lilGuyReg" src={logo} alt="ENROLLEASE Logo" />
          </div>
          <div className="formStructureReg">
            <div className="topHeader">
              <h2>Register</h2>
            </div>
            <div className="inputReq">
              <div className="rowOfInputs">
                <div className="userInputReq">
                  <p>First Name</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-signature"></i>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="userInputReq">
                  <p>Last Name</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-signature"></i>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="userInputReq">
                  <p>Username</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-user"></i>
                    <input
                      type="text"
                      name="username"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="userInputReq">
                  <p>Email</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="rowOfInputs">
                <div className="userInputReq">
                  <p>Password</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      type="text"
                      name="hash"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="userInputReq">
                  <p>Phone Number</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-phone"></i>
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="userInputReq">
                  <p>Address</p>
                  <div className="inputFormatingReg">
                    <i className="fa-solid fa-house"></i>
                    <input
                      type="text"
                      name="address"
                      placeholder="Type Here"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {isChecked ? (
                  <div className="userInputReq">
                    <p>Admin Password</p>
                    <div className="inputFormatingReg">
                      <div className="flexFront">
                        <input
                          type="checkbox"
                          name="admin"
                          checked={isChecked}
                          onChange={() => setIsChecked(!isChecked)}
                        />
                      </div>
                      <input
                        type="text"
                        name="isAdmin"
                        id="adminPassword"
                        placeholder="Type Here"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="adminCheck">
                    <p>Are You An Admin?</p>
                    <input
                      type="checkbox"
                      name="admin"
                      onChange={() => setIsChecked(!isChecked)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="navButtonsStructure">
            <div className="navButtons">
              <div className="login">
                <h5 className="smallText">Already Have An Acount?</h5>
                <Link className="loginLink" to="/login">
                  Login
                </Link>
              </div>
              <input
                type="submit"
                className="signUpButton"
                value="Sign Up"
                onClick={() => handleSubmit()}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
