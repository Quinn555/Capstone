import React from "react";
import "./navBar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function NavBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const token = localStorage.getItem("Token") ?? null;

  //css Animation
  function backgroundComponent() {
    const appCss = document.querySelectorAll(".App");
    appCss.forEach((app) => {
      app.style.backgroundColor = "rgba(0, 0, 0, 0)";
    });
  }
  function handlehiddenNav() {
    if (window.innerWidth > 1100) { 
      hiddenNav()
    } else {
      smallHiddenNav()
    }
  }
  function hiddenNav() {
    setIsHidden(!isHidden);
    const mainNav = document.querySelectorAll("nav");
    const mainDiv = document.querySelectorAll(".containerDiv");
    if (!isHidden) {
      mainDiv.forEach((main) => {
        main.style.width = "100%";
      });
    } else {
      mainNav.forEach((nav) => {
        nav.style.position = "relative";
      });
      mainDiv.forEach((main) => {
        main.style.width = "93%";
      });
    }
  }
  function smallHiddenNav() {
    setIsHidden(!isHidden);
    const mainNav = document.querySelectorAll("nav");
    const mainDiv = document.querySelectorAll(".containerDiv");
      mainNav.forEach((nav) => {
        nav.style.position = "relative";
      });
      mainDiv.forEach((main) => {
        main.style.top = 'auto';
      });
  }

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const response = await fetch("/api/verified/get-admin", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error fetching admin data");
          }

          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, [isAdmin]);

  //deletes local storage Token
  function handlelogout() {
    backgroundComponent();
    localStorage.removeItem("Token");
  }

  return (
    <div className={isHidden ? "hidden" : "navBar"}>
      {isHidden ? (
        <button
          className="logoContainerBig"
          onClick={() => handlehiddenNav()}
        ></button>
      ) : (
        <>
          {isAdmin ? (
            <div className="navListItems">
              <>
                <Link to="/verified/user-profile">
                  <div className="links">
                    <h4>Profile</h4>
                    <i className="fa-solid fa-house"></i>
                  </div>
                </Link>
                <Link to="/verified/users">
                  <div className="links">
                    <h4>Users</h4>
                    <i className="fa-solid fa-user"></i>
                  </div>
                </Link>
                <Link to="/verified/courses">
                  <div className="links">
                    <h4>Courses</h4>
                    <i className="fa-solid fa-book"></i>
                  </div>
                </Link>
                <Link to="/login" onClick={handlelogout}>
                  <div className="links">
                    <h4>Logout</h4>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                </Link>
              </>
            </div>
          ) : (
            <>
              <div className="navListItems">
                <Link to="/verified/user-profile">
                  <div className="links">
                    <h4>Profile</h4>
                    <i className="fa-solid fa-house"></i>
                  </div>
                </Link>
                <Link to="/verified/courses">
                  <div className="links">
                    <h4>Courses</h4>
                    <i className="fa-solid fa-book"></i>
                  </div>
                </Link>
                <Link to="/login" onClick={handlelogout}>
                  <div className="links">
                    <h4>Logout</h4>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                </Link>
              </div>
            </>
          )}
          <button
            className="logoContainer"
            onClick={() => handlehiddenNav()}
          ></button>
        </>
      )}
    </div>
  );
}

export default NavBar;
