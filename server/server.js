const express = require("express");
const path = require("path");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const logger = require("./logger");
const { readDataBase } = require("./dataBaseFunctions");

const bcrypt = require("bcrypt");
const secureServer = require("./proetectedRoutes/secureServer");
const PORT = process.env.PORT || 3001;
const secret = process.env.JWT_SECRET;
const { UserDB, connectDB } = require("./DataBaseConnect");

const app = express();
app.use(express.json());

const authenticate = expressjwt({ secret: secret, algorithms: ["HS256"] });
const salt = bcrypt.genSaltSync(12);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/dist")));
app.use(express.urlencoded({ extended: true }));
app.use("/api/verified", authenticate, secureServer);

//connect to database
connectDB();

//Submitting User info to Data Base
app.post("/api/submit-user", async (req, res) => {
  logger.info("request made to /api/submit-user");
  const {
    email,
    username,
    hash,
    firstName,
    lastName,
    telephone,
    address,
    createDate,
    isAdmin,
  } = req.body;
  
  try {
    // Check for duplicate email before saving
    const existingUsers = await readDataBase(email);

    if (existingUsers.length > 0) {
      // Duplicate email found, handle the error
      logger.warn("Email is already in use");
      res.status(400).json({ errorMessage: "Email is already in use" });
      return;
    }
    let admin = false;
    if (isAdmin != "") {
      if (isAdmin === process.env.ADMIN_PASSWORD) {
        admin = true;
      } else {
        logger.warn("Admin password is incorrect");
        res.status(400).json({ errorMessage: "Admin password is incorrect" });
        return;
      }
    }

    const newUser = new UserDB({
      email,
      username,
      hash: bcrypt.hashSync(hash, salt),
      firstName,
      lastName,
      telephone,
      address,
      createDate,
      isAdmin: admin,
      courses: []
    });

    //gives token after form is filled for registration
    await newUser.save();
    const token = jwt.sign({ email: email, isAdmin: isAdmin }, secret, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    res.json({ token: token, isAdmin: isAdmin });
    logger.info("User was created and saved");
  } catch (error) {
    logger.warn(error);
    console.error(error);

    if (
      error instanceof Error &&
      error.name === "MongoError" &&
      error.code === 11000
    ) {
      // Handle duplicate key error (email in use)
      logger.warn("Email is already in use");
      res.status(400).json({ errorMessage: "Email is already in use" });
    } else {
      // Handle other errors
      logger.warn("Error saving user");
      res.status(500).json({ errorMessage: "Error saving user" });
    }
  }
});

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  logger.info("request made to /api");
});

//jwt signing token
app.post("/api/login", (req, res) => {
  logger.info("request made to /api/login");
  const { email, hash } = req.body;
  const userInfoPromise = readDataBase(email);

  // Check if any of the required fields are empty
  if (email === "" || hash === "") {
      logger.warn("One or more required fields are empty");
      return res
        .status(400)
        .json({ errorMessage: "One or more required fields are empty" });
  }

  userInfoPromise
    .then((data) => {
      const user = data.find((user) => user.email === email);
        if (user) {
          const hashBcrypted = bcrypt.compareSync(hash, user.hash);
          if (hashBcrypted) {
            const token = jwt.sign(
              { email: user.email, isAdmin: user.isAdmin },
              secret,
              {
                algorithm: "HS256",
                expiresIn: "1h",
              }
            );
            res.json({ token: token, isAdmin: user.isAdmin });
            logger.info("user logged in, and token is signed");
          } else {
            logger.warn("Password or Email is Incorrect");
            res
              .status(500)
              .json({ errorMessage: "Password or Email is Incorrect" });
          }
        } else {
          logger.warn("Password or Email is Incorrect");
          res
            .status(401)
            .json({ errorMessage: "Password or Email is Incorrect" });
        }
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ errorMessage: "Error Retrieving User Information" });
    });
});

app.listen(PORT, () => {
  logger.info(`Server listening on ${PORT}`);
  console.log(`Server listening on ${PORT}`);
});
