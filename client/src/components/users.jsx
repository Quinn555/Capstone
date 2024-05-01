import React from "react";
import "./users.css";
import { useEffect, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function UserPage() {
  const token = localStorage.getItem("Token");
  const [createUser, setCreateUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [theUserName, setUsersByName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [editMode, setEditMode] = useState({});
  const [badEmails, setEmails] = useState([]);
  const [studentView, setStudentView] = useState(true);
  const [adminView, setAdminView] = useState(false);

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
    isAdmin: "",
  });

  //finish later
  //css animation

  //helps save the stuff from the form
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  //grabs the user information
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

      //sets all emails that can not be used again
      setEmails(data.map((user) => user.email));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  //eventually fetch courses
  useEffect(() => {
    fetchUsers();
  }, []);

  function camelCaseToNormal(text) {
    // Replace camel case with space-separated words
    if (text !== "email") {
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
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, [isAdmin]);

  //handles submitted form
  function handleSubmit(event) {
    setIsChecked(false);
    event.preventDefault();

    fetch("/api/submit-user", {
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
          setCreateUser(!createUser);
          fetchUsers();
        }
      })
      .catch((err) => console.log(err));
  }

  //function to give a pic if not given
  function renderInitials(user) {
    const userInitials =
      user.firstName.split("")[0] + user.lastName.split("")[0];
    return (
      <>
        <div className="userPicContainer">
          <div className="userPic">
            <div className="userInitials">{userInitials && userInitials}</div>
          </div>
        </div>
      </>
    );
  }

  //Search a user by email
  function handleSearchUser(event) {
    const searchValue = event.target.value.toLowerCase();
    if (searchValue.trim() !== "") {
      const filteredEmails = users.filter((user) => {
        const userEmail = user.email.toLowerCase();
        return userEmail.includes(searchValue);
      });
      setUsersByName(filteredEmails);
    } else {
      setUsersByName(null);
    }
  }
  //search a admin by email
  function handleSearchAdmin(event) {
    const searchValue = event.target.value.toLowerCase();
    if (searchValue.trim() !== "") {
      const filteredEmails = users.filter((user) => {
        const userEmail = user.email.toLowerCase();
        return userEmail.includes(searchValue);
      });
      setUsersByName(filteredEmails);
    } else {
      setUsersByName(null);
    }
  }

  //function to handle the edit
  function handleEdit(email) {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [email]: !prevEditMode[email],
    }));
  }

  //function Edit Save
  function handleEditSave(event, email) {
    const closestParagraph = event.target
      .closest(".userTag")
      .querySelectorAll("input[type='text'], input[type='number']");

    const updatedData = {};
    closestParagraph.forEach((input) => {
      updatedData[input.name] = input.value;
    });

    if (email === updatedData.email) {
      saveNewData(updatedData, email);
    } else {
      if (!badEmails.includes(updatedData.email)) {
        saveNewData(updatedData, email);
      } else {
        console.log("bad");
      }
    }
  }

  function saveNewData(updatedData, email) {
    confirmAlert({
      title: "Confirm New Info",
      message: "Are you sure you want to update this data?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch("/api/verified/users/edit-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ updatedData, firstEmail: email }),
            })
              .then((res) => res.json())
              .then(() => {
                fetchUsers();
              })
              .catch((error) => console.error(error));
            handleEdit(email);
          },
        },
        {
          label: "Cancel",
        },
      ],
    });
  }
  //handle delete
  function handleDelete(event) {
    const closestParagraph = event.target
      .closest(".courseTag")
      .querySelectorAll("p");
    const email = closestParagraph[0].innerHTML;
    console.log(email);
    confirmAlert({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${email}?`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch("/api/verified/users/delete-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ email: email }),
            })
              .then((res) => res.json())
              .then(() => {
                fetchUsers();
              })
              .catch((error) => console.error(error));
          },
        },
        {
          label: "Cancel",
        },
      ],
    });
  }

  function handleView(type) {
    if (type === "student") {
      setStudentView(true);
      setCreateUser(false);
      setAdminView(false);
    } else {
      setStudentView(false);
      setCreateUser(false);
      setAdminView(true);
    }
  }

  return (
    <div className="containerDiv">
      {isAdmin ? (
        <>
          <div className="buttonViews">
            <input
              type="button"
              id="studentView"
              value="Students"
              onClick={() => handleView("student")}
            />
            <input
              type="button"
              id="adminView"
              value="Admin"
              onClick={() => handleView("admin")}
            />
          </div>
          {adminView ? (
            <>
              <h1>Admins</h1>
              {createUser ? (
                <div className="addUser">
                  <form className="CreateCourseForm" onSubmit={handleSubmit}>
                    {errorMessage && <p>{errorMessage}</p>}
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="hash"
                      placeholder="Password"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Phone Number"
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="admin">Are You an Admin?</label>
                    <input
                      type="checkbox"
                      name="admin"
                      onChange={() => setIsChecked(!isChecked)}
                    />
                    <div className="createButtons">
                      <input
                        type="submit"
                        id="saveButtonForm"
                        value="Create User"
                      />
                      <input
                        type="button"
                        id="cancelButtonForm"
                        value="Cancle"
                        onClick={() => setCreateUser(!createUser)}
                      />
                    </div>
                    {isChecked && (
                      <div>
                        <label htmlFor="isAdmin">
                          Enter Password For Admin Account Registration
                        </label>
                        <input
                          type="text"
                          name="isAdmin"
                          id="adminPassword"
                          placeholder="Enter Admin Password"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <div className="addAnotherButton">
                  <input
                    type="button"
                    id="createOpenButton"
                    value="Create An Admin"
                    onClick={() => setCreateUser(!createUser)}
                  />
                </div>
              )}
              <div className="searchBar">
                <h2 className="searchBarHeader">Search For an Admin</h2>
                <input
                  id="searchBarDiv"
                  type="text"
                  placeholder="Type Admin Email Here"
                  onChange={handleSearchAdmin}
                />
              </div>
              <div className="allUsers">
                {users && (
                  <div className="userContainer">
                    {(theUserName || users).map((courseArray) =>
                      courseArray.isAdmin ? (
                        <React.Fragment key={courseArray.email}>
                          <div className="userTag" key={courseArray.email}>
                            <div className="icons">
                              {editMode[courseArray.email] ? (
                                <>
                                  <i
                                    className="fa-solid fa-xmark"
                                    id="cancelIcon"
                                    name="cancelIcon"
                                    value="Cancel"
                                    onClick={() =>
                                      handleEdit(courseArray.email)
                                    }
                                  ></i>
                                  <i
                                    className="fa-solid fa-check"
                                    id="saveIcon"
                                    name="saveIcon"
                                    value="Save"
                                    onClick={(e) =>
                                      handleEditSave(e, courseArray.email)
                                    }
                                  ></i>
                                </>
                              ) : (
                                <>
                                  <i
                                    className="fa-solid fa-pen"
                                    id="editIcon"
                                    name="editIcon"
                                    value="Edit"
                                    onClick={() =>
                                      handleEdit(courseArray.email)
                                    }
                                  ></i>
                                  <i
                                    className="fa-solid fa-trash-can"
                                    id="deleteIcon"
                                    name="deleteIcon"
                                    value="delete"
                                    onClick={handleDelete}
                                  ></i>
                                </>
                              )}
                            </div>
                            {renderInitials(courseArray)}
                            {Object.entries(courseArray)
                              .filter(
                                ([key, value], index) =>
                                  index !== 0 && index !== 3 && index !== 10
                              )
                              .map(([key, value]) => (
                                <React.Fragment key={key}>
                                  {editMode[courseArray.email] ? (
                                    <div className={key} key={key}>
                                      <p>{camelCaseToNormal(key)}</p>
                                      <input
                                        type={
                                          typeof value === "number"
                                            ? "number"
                                            : "text"
                                        }
                                        name={key}
                                        defaultValue={value}
                                      />
                                    </div>
                                  ) : (
                                    <div className={key} key={key}>
                                      <p>{camelCaseToNormal(key)}</p>
                                      <p>{value}</p>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
                        </React.Fragment>
                      ) : (
                        <React.Fragment
                          key={courseArray.email}
                        ></React.Fragment>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h1>Students</h1>
              {createUser ? (
                <div className="addUser">
                  {errorMessage && <p>{errorMessage}</p>}
                  <form className="CreateCourseForm" onSubmit={handleSubmit}>
                    {errorMessage && <p>{errorMessage}</p>}
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="hash"
                      placeholder="Password"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Phone Number"
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      onChange={handleInputChange}
                    />

                    <div className="createButtons">
                      <input
                        type="submit"
                        id="saveButtonForm"
                        value="Create User"
                      />
                      <input
                        type="button"
                        id="cancelButtonForm"
                        value="Cancle"
                        onClick={() => setCreateUser(!createUser)}
                      />
                    </div>
                  </form>
                </div>
              ) : (
                <div className="addAnotherButton">
                  <input
                    type="button"
                    id="createOpenButton"
                    value="Create A User"
                    onClick={() => setCreateUser(!createUser)}
                  />
                </div>
              )}
              <div className="searchBar">
                <h2 className="searchBarHeader">Search For User</h2>
                <input
                  id="searchBarDiv"
                  type="text"
                  placeholder="Type Course Title Here"
                  onChange={handleSearchUser}
                />
              </div>
              <div className="allUsers">
                {users && (
                  <div className="userContainer">
                    {(theUserName || users).map((courseArray) =>
                      courseArray.isAdmin ? (
                        <React.Fragment
                          key={courseArray.email}
                        ></React.Fragment>
                      ) : (
                        <React.Fragment key={courseArray.email}>
                          <div className="userTag" key={courseArray.email}>
                            <div className="icons">
                              {editMode[courseArray.email] ? (
                                <>
                                  <i
                                    className="fa-solid fa-xmark"
                                    id="cancelIcon"
                                    name="cancelIcon"
                                    value="Cancel"
                                    onClick={() =>
                                      handleEdit(courseArray.email)
                                    }
                                  ></i>
                                  <i
                                    className="fa-solid fa-check"
                                    id="saveIcon"
                                    name="saveIcon"
                                    value="Save"
                                    onClick={(e) =>
                                      handleEditSave(e, courseArray.email)
                                    }
                                  ></i>
                                </>
                              ) : (
                                <>
                                  <i
                                    className="fa-solid fa-pen"
                                    id="editIcon"
                                    name="editIcon"
                                    value="Edit"
                                    onClick={() =>
                                      handleEdit(courseArray.email)
                                    }
                                  ></i>
                                  <i
                                    className="fa-solid fa-trash-can"
                                    id="deleteIcon"
                                    name="deleteIcon"
                                    value="delete"
                                    onClick={handleDelete}
                                  ></i>
                                </>
                              )}
                            </div>
                            {renderInitials(courseArray)}
                            {Object.entries(courseArray)
                              .filter(
                                ([key, value], index) =>
                                  index !== 0 && index !== 3 && index !== 10
                              )
                              .map(([key, value]) => (
                                <React.Fragment key={key}>
                                  {editMode[courseArray.email] ? (
                                    <div className={key} key={key}>
                                      <p>{camelCaseToNormal(key)}</p>
                                      <input
                                        type={
                                          typeof value === "number"
                                            ? "number"
                                            : "text"
                                        }
                                        name={key}
                                        defaultValue={value}
                                      />
                                    </div>
                                  ) : (
                                    <div className={key} key={key}>
                                      <p>{camelCaseToNormal(key)}</p>
                                      <p>{value}</p>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
                        </React.Fragment>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default UserPage;
