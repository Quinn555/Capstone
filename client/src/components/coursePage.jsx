import React from "react";
import "./coursePage.css";
import { useEffect, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

function Courses() {
  const token = localStorage.getItem("Token");
  const [createCourse, setCreateCourse] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseName, setCoursesByName] = useState(null);
  const [usersName, setUsersByName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState({});
  const [badNames, setNames] = useState([]);
  const [user, setUser] = useState(null);
  const [registerMode, setRegisterMode] = useState({});
  const [searchRegisterMode, setSearchRegisterMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [nameTitleState, setNameTitle] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };

  //css animation
  function courseCreationStuff() {
    setCreateCourse(!createCourse);
    const openingDiv = document.querySelectorAll(".addCourse");
    if (createCourse) {
      openingDiv.forEach((open) => {
        open.style.width = "0";
        open.style.height = "0";
      });
    } else {
      openingDiv.forEach((open) => {
        open.style.width = "75%";
        open.style.height = "30%";
      });
    }
  }

  //formats the form data
  const [formData, setFormData] = useState({
    nameTitle: null,
    classDescription: null,
    classSchedule: null,
    classroomNumber: null,
    maximumCapacity: null,
    courseTeacher: null,
    creditHours: null,
    tuitionCost: null,
  });

  //helps save the stuff from the form
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }
  //change text
  function camelCaseToNormal(text) {
    // Replace camel case with space-separated words
    if (isAdmin) {
      if (text !== "nameTitle") {
        return (
          text
            // Insert a space before all caps
            .replace(/([A-Z])/g, " $1")
            // Capitalize the first character of each word
            .replace(/^./, function (str) {
              return str.toUpperCase();
            }) + ":"
        );
      }
    } else {
      if (text !== "registeredUsers") {
        if (text !== "nameTitle") {
          return (
            text
              // Insert a space before all caps
              .replace(/([A-Z])/g, " $1")
              // Capitalize the first character of each word
              .replace(/^./, function (str) {
                return str.toUpperCase();
              }) + ":"
          );
        }
      }
    }
  }
  //grabs the course information
  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/verified/courses/get-courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle non-successful response (e.g., 401 Unauthorized)
        console.error("Error fetching courses", response.statusText);
        return;
      }

      const data = await response.json();
      setCourses(data);

      //sets all names that can not be used again
      setNames(data.map((courses) => courses.nameTitle));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  //eventually fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);
  //Checks to see if you are an Admin
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
          setUser(data.email);
          //setUser(data)
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, [isAdmin]);
  //fethcs the users info for registering a user to that course
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/verified/users/get-users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle non-successful response (e.g., 401 Unauthorized)
        console.error("Error fetching courses", response.statusText);
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  //handles submitted form
  function handleSubmit(event) {
    event.preventDefault();

    fetch("/api/verified/courses/submit-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.errorMessage) {
          setErrorMessage(data.errorMessage);
        } else {
          setErrorMessage(null);
          courseCreationStuff();
          fetchCourses();
        }
      })
      .catch((err) => console.log(err));
  }

  function handleSearch(event) {
    if (courses) {
      const searchValue = event.target.value.toLowerCase();
      const filteredCourses = courses.filter((course) => {
        const nameTitle = course.nameTitle.toLowerCase();
        return nameTitle.includes(searchValue);
      });
      setCoursesByName(filteredCourses);
    }
  }
  function handleSearchUser(event) {
    if (users) {
      console.log(usersName);
      const searchValue = event.target.value.toLowerCase();
      const filteredUsers = users.filter((user) => {
        const email = user.email.toLowerCase();
        return email.includes(searchValue);
      });
      setUsersByName(filteredUsers);
    }
  }
  //handles premade fake courses
  function handleSubmitFake(event) {
    event.preventDefault();

    fetch("/api/verified/courses/fake-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errorMessage) {
          setErrorMessage(data.errorMessage);
        } else {
          setErrorMessage(null);
          courseCreationStuff();
          fetchCourses();
        }
      })
      .catch((err) => console.log(err));
  }
  //function to handle the edit
  function handleEdit(nameTitle) {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [nameTitle]: !prevEditMode[nameTitle],
    }));
  }

  //function Edit Save
  function handleEditSave(event, nameTitle) {
    const closestParagraph = event.target
      .closest(".courseTag")
      .querySelectorAll("input[type='text'], input[type='number'], textarea[type='text']");

    const updatedData = {};
    closestParagraph.forEach((input) => {
      updatedData[input.name] = input.value;
    });
    if (nameTitle === updatedData.nameTitle) {
      saveNewData(updatedData, nameTitle);
    } else {
      if (!badNames.includes(updatedData.nameTitle)) {
        saveNewData(updatedData, nameTitle);
      } else {
        console.log("it the same");
      }
    }
  }

  function saveNewData(updatedData, nameTitle) {
    confirmAlert({
      title: "Confirm New Info",
      message: "Are you sure you want to update this information?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch("/api/verified/courses/edit-course", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ updatedData, title: nameTitle }),
            })
              .then((res) => res.json())
              .then((data) => {
                fetchCourses();
              })
              .catch((error) => {
                console.log(error);
              });
            handleEdit(nameTitle);
          },
        },
        {
          label: "Cancel",
        },
      ],
    });
  }

  //function to delete
  function handleDelete(event) {
    const closestParagraph = event.target
      .closest(".courseTag")
      .querySelectorAll("p")[1].innerHTML;
    confirmAlert({
      title: "Confirm Course Deletion",
      message: `Are you sure you want to delete ${closestParagraph}`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch("/api/verified/courses/delete-course", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ nameTitle: closestParagraph }),
            })
              .then((res) => res.json())
              .then(() => {
                fetchCourses();
              })
              .catch((error) => {
                console.log(error);
              });
          },
        },
        {
          label: "Cancel",
        },
      ],
    });
  }
  //function to get out of registering
  function closeUserContainer() {
    if (isAdmin) {
      setSearchRegisterMode(false);
      setRegisterMode((prevEditMode) => ({
        ...prevEditMode,
        [nameTitleState]: !prevEditMode[nameTitleState],
      }));
      setNameTitle(null);
    }
    setSearchRegisterMode(false);
    setNameTitle(null);
  }

  async function handleRegisterUser(e) {
    e.preventDefault();
    const userEmail = e.target
      .closest(".userSearchResults")
      .querySelector("p").innerHTML;
    fetch("/api/verified/users/admin-course-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nameTitle: nameTitleState, user: userEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        fetchCourses();
        if (data.errorMessage) {
          Command: toastr["error"](
            `${userEmail} are already registered to ${nameTitleState}`,
            "Error"
          );
        } else {
          Command: toastr["success"](
            `${userEmail} were successfully registered to ${nameTitleState}`,
            "Success"
          );
        }
      })
      .catch((error) => console.log(error));
  }

  function handleRegister(event) {
    event.preventDefault();
    const nameTitle = event.target
      .closest(".courseTag")
      .querySelectorAll("p")[1].innerHTML;
    setNameTitle(nameTitle);
    if (isAdmin) {
      setSearchRegisterMode(true);
      setRegisterMode((prevEditMode) => ({
        ...prevEditMode,
        [nameTitle]: !prevEditMode[nameTitle],
      }));
    } else {
      fetch("/api/verified/users/course-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nameTitle: nameTitle }),
      })
        .then((res) => res.json())
        .then((data) => {
          setNameTitle(null);
          setSearchRegisterMode(false);
          fetchCourses();
          if (data.errorMessage) {
            Command: toastr["error"](
              `You are already registered to ${nameTitle}`,
              "Error"
            );
          } else {
            Command: toastr["success"](
              `You were successfully registered to ${nameTitle}`,
              "Success"
            );
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  function handleRemoveUser(event) {
    event.preventDefault();
    const userEmail = event.target
      .closest(".userSearchResults")
      .querySelector("p").innerHTML;

    confirmAlert({
      title: "Confirm Course Removal",
      message: `Are you sure you want to unregister ${userEmail} for this course?`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            console.log("handleRemove");
            fetch("/api/verified/users/admin-course-remove", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                nameTitle: nameTitleState,
                user: userEmail,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log(data);
                fetchCourses();
                if (data.errorMessage) {
                  Command: toastr["error"](
                    `${userEmail} is not already registered to ${nameTitleState}`,
                    "Error"
                  );
                } else {
                  Command: toastr["success"](
                    `${userEmail} were successfully removed from ${nameTitleState}`,
                    "Success"
                  );
                }
              })
              .catch((error) => console.log(error));
          },
        },
        {
          label: "Cancel",
        },
      ],
    });
  }

  function handleRemove(event) {
    event.preventDefault();
    const nameTitle = event.target
      .closest(".courseTag")
      .querySelectorAll("p")[1].innerHTML;

    confirmAlert({
      title: "Confirm Course Removal",
      message: "Are you sure you want to unregister for this course?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            // Logic to delete the course
            fetch("/api/verified/users/remove-course", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ nameTitle: nameTitle }),
            })
              .then((res) => res.json())
              .then((data) => {
                setNameTitle(null);
                fetchCourses();
                if (data.errorMessage) {
                  Command: toastr["error"](
                    `You not are already registered to ${nameTitle}`,
                    "Error"
                  );
                } else {
                  Command: toastr["success"](
                    `You were successfully removed from ${nameTitle}`,
                    "Success"
                  );
                }
              })
              .catch((error) => {
                console.log(error);
              });
          },
        },
        {
          label: "Cancel",
        },
      ],
    });
  }
  const usersCourses = courses.filter(
    (course) => course.registeredUsers && course.registeredUsers.includes(user)
  );
  const isValidUser = user && usersCourses && usersCourses.length > 0;
  const checkNameTitle = courses.find(
    (course) => course.nameTitle === nameTitleState
  );
  // /api/submit-course
  return (
    <div className="containerDiv">
      {isAdmin ? (
        <>
          {searchRegisterMode ? (
            <></>
          ) : (
            <div className="addAnotherButton">
              {createCourse ? (
                <></>
              ) : isAdmin ? (
                <input
                  type="button"
                  id="createOpenButton"
                  value="Create Course"
                  onClick={() => courseCreationStuff()}
                />
              ) : (
                <></>
              )}
            </div>
          )}
        </>
      ) : (
        <></>
      )}
      {/* Only Shown If You Are Admin */}
      {createCourse ? (
        <div className="addCourse">
          {errorMessage && <p>{errorMessage}</p>}
          <form className="CreateCourseForm">
            <input
              type="text"
              name="nameTitle"
              className="nameTitleForm"
              placeholder="Course Title"
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="classSchedule"
              className="classScheduleForm"
              placeholder="Course Schedule"
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="classroomNumber"
              className="classroomNumberForm"
              placeholder="Room Number"
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="maximumCapacity"
              className="maximumCapacityForm"
              placeholder="Max Capacity"
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="courseTeacher"
              className="courseTeacherForm"
              placeholder="Course Teacher"
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="creditHours"
              className="creditHoursForm"
              placeholder="Credit Hours"
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="tuitionCost"
              className="tuitionCostForm"
              placeholder="Tuition Cost"
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="classDescription"
              className="classDescriptionForm"
              placeholder="Course Description"
              onChange={handleInputChange}
              required
            />
            <div className="createButtons">
              <input
                type="button"
                id="cancelButtonForm"
                value="Cancel"
                onClick={() => courseCreationStuff()}
              />
              <input
                type="button"
                id="saveButtonForm"
                value="Save"
                onClick={handleSubmit}
              />
              {process.env.NODE_ENV !== "production" ? (
                <>
                  <input
                    type="button"
                    id="saveButtonForm"
                    value="Make Fake Course"
                    onClick={handleSubmitFake}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="addCourse"></div>
      )}
      <div className="searchBar">
        <h2 className="searchBarHeader">Search for Course</h2>
        <input
          id="searchBarDiv"
          type="text"
          placeholder="Type Course Title Here"
          onChange={handleSearch}
        />
      </div>
      {searchRegisterMode ? (
        <div className="usersContainer">
          <div className="searchBar">
            <h2 className="searchBarHeader">Search User To Register</h2>
            <input
              id="searchBarDiv"
              type="text"
              placeholder="Type User Email Here"
              onChange={handleSearchUser}
            />
          </div>
          <>
            {nameTitleState && (
              <div className="courseTag">
                <p >{nameTitleState}</p>
                {courses
                  .filter((course) => course.nameTitle === nameTitleState)
                  .map((courseArray, index) => (
                    <React.Fragment key={courseArray.nameTitle}>
                      <p key={index}>c</p>
                    </React.Fragment>
                  ))}
              </div>
            )}
            {console.log(usersName, users)}
            {(usersName || users).map((userItem, index) => (
              <div className="userSearchResults" key={index}>
                {userItem.isAdmin ? (
                  <></>
                ) : (
                  <>
                    <h3>{userItem.username}</h3>
                    <p>{userItem.email}</p>
                    {courses &&
                    checkNameTitle &&
                    checkNameTitle.registeredUsers.includes(userItem.email) ? (
                      <button onClick={(e) => handleRemoveUser(e)}>-</button>
                    ) : (
                      <button onClick={(e) => handleRegisterUser(e)}>+</button>
                    )}
                  </>
                )}
              </div>
            ))}
            <input
              type="button"
              id="userContainerButton"
              name="doneButton"
              value="Done"
              onClick={() => closeUserContainer()}
            ></input>
          </>
        </div>
      ) : (
        <></>
      )}

      <div className="allCourses">
        {courses && (
          <div className="courseContainer">
            {(courseName || courses).map((courseArray, index) => (
              <div className="courseTag" key={courseArray.nameTitle}>
                {/* Only Shown If You Are Admin */}
                {isAdmin ? (
                  <div className="buttons">
                    {editMode[courseArray.nameTitle] ? (
                      <>
                        <input
                          type="button"
                          id="editButton"
                          name="cancelButton"
                          value="Cancel"
                          onClick={() => handleEdit(courseArray.nameTitle)}
                        ></input>

                        <input
                          type="button"
                          id="deleteButton"
                          name="saveButton"
                          value="Save"
                          onClick={(e) =>
                            handleEditSave(e, courseArray.nameTitle)
                          }
                        ></input>
                      </>
                    ) : (
                      <>
                        <input
                          type="button"
                          id="editButton"
                          name="editButton"
                          value="Edit"
                          onClick={() => handleEdit(courseArray.nameTitle)}
                        ></input>
                        <input
                          type="button"
                          id="editButton"
                          name="registButton"
                          value="Register"
                          onClick={(event) => handleRegister(event)}
                        ></input>
                        <input
                          type="button"
                          id="deleteButton"
                          name="deleteButton"
                          value="Delete"
                          onClick={handleDelete}
                        ></input>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {isValidUser &&
                    usersCourses.some(
                      (course) => course.nameTitle === courseArray.nameTitle
                    ) ? (
                      <div className="buttons">
                        <input
                          type="button"
                          id="registerButton"
                          name="registButton"
                          value="Remove"
                          onClick={(event) => handleRemove(event)}
                        ></input>
                      </div>
                    ) : (
                      <div className="buttons">
                        <input
                          type="button"
                          id="registerButton"
                          name="registButton"
                          value="Register"
                          onClick={(event) => handleRegister(event)}
                        ></input>
                      </div>
                    )}
                  </>
                )}
                {Object.entries(courseArray)
                  .filter(([key, value], index) => index !== 0 && index !== 10)
                  .map(([key, value]) => (
                    <React.Fragment key={key}>
                      {editMode[courseArray.nameTitle] ? (
                        <>
                          {key !== "classDescription" ? (
                            <div className={key}>
                              <p>{camelCaseToNormal(key)}</p>
                              <input
                                type={
                                  typeof value === "number" ? "number" : "text"
                                }
                                name={key}
                                className={key}
                                defaultValue={value}
                              />
                            </div>
                          ) : (
                            <div className={key}>
                              <p>{camelCaseToNormal(key)}</p>
                              <textarea
                                type="text"
                                name={key}
                                className={key}
                                defaultValue={value}
                              ></textarea>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className={key}>
                            <p>{camelCaseToNormal(key)}</p>
                            {typeof value === "object" && isAdmin ? (
                              <>
                                {value.map((account, index) => (
                                  <div className={'registeredUsersEmails'} index={index} key={index}>
                                    {account.split(',').map((usersEmails, userIndex) => (
                                      <p key={userIndex} >{usersEmails}</p>
                                    ))}
                                  </div>
                                ))}
                              </>
                            ) : (
                              <>
                                {typeof value !== "object" ? (
                                  <>
                                    <p>{value}</p>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </React.Fragment>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
