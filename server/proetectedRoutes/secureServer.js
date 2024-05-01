const express = require("express");
const SecureRouter = express.Router();
const logger = require("../logger");
require("dotenv").config();

//color the log for convenience is BT
const { BT } = require("../DataBaseConnect");

const { expressjwt } = require("express-jwt");
const { readDataBase } = require("../dataBaseFunctions");

const userServerRouter = require("./userServer");
const courseServerRouter = require("./courseServer");

const secret = process.env.JWT_SECRET;

SecureRouter.use("/users", userServerRouter);
SecureRouter.use("/courses", courseServerRouter);

//admin profile page
SecureRouter.get(
  "/admin",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  (req, res) => {
    logger.info("request made to /api/verified/admin");
    const email = req.auth.email;
    const userInfoPromise = readDataBase(email);
    userInfoPromise.then((data) => {
      const user = data.find((user) => user.email === email);
      res.json(user);
      logger.info(user, "user found");
    });
  }
);

//get isAdmin and log it
SecureRouter.get(
  "/get-admin",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  (req, res) => {
    logger.info("request made to /api/verified/get-admin");
    const isAdmin = req.auth.isAdmin;
    const email = req.auth.email;
    res.json({ isAdmin: isAdmin, email: email });
  }
);
//get token and log it
SecureRouter.get("/get-token", (req, res) => {
  if (req.auth) {
    // If the token is valid, respond with 'true'
    console.log(req.auth);
    res.json({ tokenStatus: "true" });
  } else {
    // If req.auth does not exist, respond with 'false'
    res.json({ tokenStatus: "false" });
  }
});

//main profile page
SecureRouter.get(
  "/user-profile",
  expressjwt({ secret: secret, algorithms: ["HS256"] }),
  (req, res) => {
    logger.info("request made to /api/verfied/user-profile");
    const email = req.auth.email;
    const userInfoPromise = readDataBase(email);
    userInfoPromise.then((data) => {
      const user = data.find((user) => user.email === email);
      res.json(user);
      logger.info("user found");
    });
  }
);

module.exports = SecureRouter;
