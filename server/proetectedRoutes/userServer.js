const express = require("express");
const userServer = express.Router();
const { expressjwt } = require("express-jwt");
const secret = process.env.JWT_SECRET;
require("dotenv").config();
const logger = require("../logger");
const {
  showUsersData,
  readDataBase,
  readCoursesData,
} = require("../dataBaseFunctions");
const { UserDB, CoursesDB } = require("../DataBaseConnect");
const { log } = require("winston");

//get users and display them
userServer.get("/get-users", (req, res) => {
  logger.info("request made to /api/verified/users/get-users");
  const users = showUsersData();
  users
    .then((data) => {
      res.send(data);
      logger.info("data sent");
    })
    .catch((error) => {
      console.error(error);
      logger.warn("error", error);
    });
});

//deletes users from data base
userServer.post("/delete-user", async (req, res) => {
  logger.info("request made to  /api/verified/users/delete-user");
  try {
    const toDelete = req.body.email;
    console.log(toDelete);
    // Delete the course based on nameTitle
    const deleteResult = await UserDB.deleteOne({ email: toDelete });
    console.log(deleteResult);
    if (deleteResult.deletedCount === 0) {
      // No course was deleted, it may not exist
      res.status(404).json({ errorMessage: "User not found" });
      return;
    }

    // Course deleted successfully
    res.json({ success: "User deleted successfully" });
  } catch (error) {
    logger.warn("Error deleting user:", error);
    console.error("Error deleting user:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

//edits users from data base
userServer.post("/edit-user", async (req, res) => {
  logger.info("request made to /api/verified/users/edit-user");
  try {
    const { updatedData, firstEmail } = req.body;

    // Extracting data from updatedData
    const {
      email,
      username,
      firstName,
      lastName,
      telephone,
      address,
      isAdmin,
      courses,
    } = updatedData;

    console.log(updatedData, email);

    // Edit the user based on email
    await UserDB.updateMany(
      { email: firstEmail },
      {
        $set: {
          email: email,
          username: username,
          firstName: firstName,
          lastName: lastName,
          telephone: telephone,
          address: address,
          isAdmin: isAdmin,
          courses: courses,
        },
      }
    );

    res.json({ success: "User Edited Successfully" });
  } catch (error) {
    logger.warn("Error editing user:", error);
    console.error("Error editing user:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});
//userInfo
userServer.get(
  "/user-info",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  async (req, res) => {
    try {
      const user = req.auth.email;
      // Find user info in database
      const userData = await readDataBase(user);
      console.log(user, userData[0]);
    } catch (err) {
      logger.warn("error", err);
    }
  }
);

userServer.post(
  "/admin-course-register",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  async (req, res) => {
    try {
      const user = req.body.user;
      const courseTitle = req.body.nameTitle;
      // Find user info in database
      const userData = await readDataBase(user);

      // Find courses data
      const coursesData = await readCoursesData(courseTitle);
      const userCourse = coursesData[0].registeredUsers;
      const existingUser = userCourse?.find(
        (registeredUser) => registeredUser === user
      );
      console.log(existingUser);
      if (existingUser) {
        console.error("User is already registered");
        res.status(500).json({ errorMessage: "User is already registered" });
      } else {
        await CoursesDB.updateMany(
          { nameTitle: courseTitle },
          { $push: { registeredUsers: user } }
        );
        res.json({ success: "it finished" });
        logger.info(`course was succesfully added to ${user}'s accout`);
      }
    } catch (error) {
      console.error("Error handling course registration:", error);
      res.status(500).json({ errorMessage: "Internal Server Error" });
    }
  }
);

userServer.post(
  "/course-register",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  async (req, res) => {
    try {
      const user = req.auth.email;
      const courseTitle = req.body.nameTitle;
      // Find user info in database
      const userData = await readDataBase(user);

      // Find courses data
      const coursesData = await readCoursesData(courseTitle);
      const userCourse = coursesData[0].registeredUsers;

      const existingUser = userCourse.find((user) => user == user);

      if (existingUser) {
        console.error("User is already registered");
        res.status(500).json({ errorMessage: "User is already registered" });
      } else {
        if (userData && userCourse) {
          await CoursesDB.updateMany(
            { nameTitle: courseTitle },
            { $push: { registeredUsers: user } }
          );
          res.json({ success: "it finished" });
          console.log("user added successfully to course:", user); // Log success message
          logger.info(`course was succesfully added to ${user}'s accout`);
        } else {
          console.error("Error handling course registration");
          res.status(500).json({ errorMessage: "Internal Server Error" });
        }
      }
    } catch (error) {
      console.error("Error handling course registration:", error);
      res.status(500).json({ errorMessage: "Internal Server Error" });
    }
  }
);

userServer.post(
  "/admin-course-remove",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  async (req, res) => {
    try {
      const user = req.body.user;
      const courseTitle = req.body.nameTitle;
      // Find user info in database
      const userData = await readDataBase(user);

      // Find courses data
      const coursesData = await readCoursesData(courseTitle);
      const userCourse = coursesData[0].registeredUsers;
      const existingUser = userCourse?.find(
        (registeredUser) => registeredUser === user
      );
      console.log(existingUser);
      if (!existingUser) {
        console.error("User is not already registered");
        res
          .status(500)
          .json({ errorMessage: "User is not already registered" });
      } else {
        await CoursesDB.updateMany(
          { nameTitle: courseTitle },
          { $pull: { registeredUsers: user } }
        );
        res.json({ success: "user removed" });
        logger.info(`course was succesfully added to ${user}'s accout`);
      }
    } catch (error) {
      console.error("Error handling course registration:", error);
      res.status(500).json({ errorMessage: "Internal Server Error" });
    }
  }
);

userServer.post(
  "/remove-course",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  async (req, res) => {
    try {
      const user = req.auth.email;
      const courseTitle = req.body.nameTitle;
      // Find user info in database
      const userData = await readDataBase(user);

      // Find courses data
      const coursesData = await readCoursesData(courseTitle);
      const userCourse = coursesData[0].registeredUsers;

      const existingUser = userCourse.find((user) => user == user);

      if (!existingUser) {
        console.error("User is not already registered");
        res.status(500).json({ errorMessage: "User is already registered" });
      } else {
        if (userData && userCourse) {
          await CoursesDB.updateMany(
            { nameTitle: courseTitle },
            { $pull: { registeredUsers: user } }
          );
          res.json({ success: "it finished" });
          console.log("user added successfully removed from course:", user); // Log success message
          logger.info(`course was succesfully removed from ${user}'s accout`);
        } else {
          console.error("Error handling course registration");
          res.status(500).json({ errorMessage: "Internal Server Error" });
        }
      }
    } catch (error) {
      console.error("Error handling course registration:", error);
      res.status(500).json({ errorMessage: "Internal Server Error" });
    }
  }
);


module.exports = userServer;
