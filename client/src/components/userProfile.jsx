import React, { useState, useEffect } from "react";
import "./userProfile.css";

function UserProfilePage() {
  const [user, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [tuitionCost, setTuitionCost] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [userSchedule, setUserSchedule] = useState(null);
  const [clicked, setClicked] = useState(false);
  const token = localStorage.getItem("Token");


  //Need to finish this
  //FIX ME!!!
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    telephone: "",
    address: "",
  });

  useEffect(() => {
    // Fetch user profile data
    if (token) {
      const fetchData = async () => {
        try {
          const response = await fetch("/api/verified/user-profile", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error fetching user profile data");
          }

          const data = await response.json();
          setUserData(data);
          setIsAdmin(data.isAdmin);
          fetchCourses(data.email);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, []);

  useEffect(() => {
    // Fetch admin data
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

  const fetchCourses = async (userEmail) => {
    try {
      const response = await fetch("/api/verified/courses/get-courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Error fetching courses", response.statusText);
        return;
      }

      const data = await response.json();
      const courses = data.filter((course) =>
        course.registeredUsers.includes(userEmail)
      );
      setRegisteredUser(courses);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  function addTuitionCost(tuitionCosts) {
    if (!tuitionCosts || tuitionCosts.length === 0) {
      return 0;
    }

    const sum =
      "$" +
      tuitionCosts.reduce(
        (accumulator, currentValue) =>
          Number(accumulator) + Number(currentValue)
      );
    return sum;
  }

  function addCreditHours(creditHours) {
    if (!creditHours || creditHours.length === 0) {
      return 0;
    }

    const sum = creditHours.reduce(
      (accumulator, currentValue) => Number(accumulator) + Number(currentValue)
    );
    return sum;
  }

  function createCalendar(scheduleForCourse) {
    if (!scheduleForCourse || scheduleForCourse.length === 0) {
      return 0;
    }
    return scheduleForCourse;
  }

  useEffect(() => {
    const tuitionForCourse =
      registeredUser &&
      registeredUser.map((course) => course.tuitionCost.split("$")[1]);
    const sumForTuition = addTuitionCost(tuitionForCourse);
    setTuitionCost(sumForTuition);

    const creditHoursForCourse =
      registeredUser && registeredUser.map((course) => course.creditHours);
    const sumForCreditHours = addCreditHours(creditHoursForCourse);
    setCreditHours(sumForCreditHours);

    const scheduleForCourse =
      registeredUser && registeredUser.map((course) => course.classSchedule);
    const fullSchedule = createCalendar(scheduleForCourse);
    setUserSchedule(fullSchedule);
  }, [registeredUser]);

  return (
    <div className="containerDiv">
      {user ? (
        <div className="widthFull">
          <div className="full">
            <div className="welcome">
              <div>
                <h2>Welcome To</h2>
                <h1>ENROLLEASE</h1>
              </div>
              <h2>
                {isAdmin ? <>Admin </> : <>Student </>}
                {user.firstName} {user.lastName}
              </h2>
            </div>
            {registeredUser?.length > 0 ? (
              <div className="enroledClasses">
                <h3>Enrolled Courses:</h3>
                <div className="registeredCourse">
                  {registeredUser.map((course, index) => (
                    <div className="registeredCourseTag" key={index}>
                      <h2>{course.nameTitle}</h2>
                      <p>Description: {course.classDescription}</p>
                      <p>Schedule: {course.classSchedule}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!isAdmin && (
                  <p>
                    It looks like you aren't registered for any courses yet!
                  </p>
                )}
              </>
            )}
          </div>
          <div className="fistBox">
            {clicked ? (
              <div className="userInfo">
                <form className="innerInfo" onSubmit={() => addNewInfo()}>
                  <button
                    className="saveButton"
                    onClick={() => setClicked(!clicked)}
                  >
                    Save
                  </button>
                  <p>
                    Email:
                    <input type="text" defaultValue={user.email} />
                  </p>
                  <p>
                    Username:
                    <input type="text" defaultValue={user.username} />
                  </p>
                  <p>
                    First Name:
                    <input type="text" defaultValue={user.firstName} />
                  </p>
                  <p>
                    Last Name:
                    <input type="text" defaultValue={user.lastName} />
                  </p>
                  <p>
                    Phone Number:
                    <input type="text" defaultValue={user.telephone} />
                  </p>
                  <p>
                    Address:
                    <input type="text" defaultValue={user.address} />
                  </p>
                </form>
              </div>
            ) : (
              <div className="userInfo">
                <div className="innerInfo">
                  <button
                    className="saveButton"
                    onClick={() => setClicked(!clicked)}
                  >
                    Edit Account Information
                  </button>
                  <h1>{user.username}</h1>
                  <p>Email: {user.email}</p>
                  <p>
                    Name: {user.firstName} {user.lastName}
                  </p>
                  <p>Phone Number: {user.telephone}</p>
                  {user && !user.isAdmin ? (
                    <p>Role: Student</p>
                  ) : (
                    <p>Role: Admin</p>
                  )}
                  <p>Address: {user.address}</p>
                  <p>Account Created: {user.createDate}</p>
                </div>
              </div>
            )}

            <div className="userInfo">
              {!isAdmin && (
                <>
                  {tuitionCost && (
                    <div className="tuition">Tuition Cost: {tuitionCost}</div>
                  )}
                  {creditHours && (
                    <div className="credit">Credit Hours: {creditHours}</div>
                  )}
                  <div className="calendar">
                    {userSchedule &&
                      userSchedule.map((schedule, index) => (
                        <p key={index}>{schedule}</p>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
    </div>
  );
}

export default UserProfilePage;
