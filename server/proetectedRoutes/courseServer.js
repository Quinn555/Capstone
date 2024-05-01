const express = require("express");
const courseServer = express.Router();
require("dotenv").config();
const logger = require("../logger");
const { readCoursesData, showCoursesData } = require("../dataBaseFunctions");
//color the log for convenience is BT
const { CoursesDB, BT } = require("../DataBaseConnect");

//get courses and display them
courseServer.get("/get-courses", (req, res) => {
  logger.info("request made to /api/verified/courses/get-courses");
  const courses = showCoursesData();
  courses
    .then((data) => {
      res.send(data);
      logger.info("data sent");
    })
    .catch((error) => {
      console.error(error);
      logger.warn("error", error);
    });
});

//creates a new course
courseServer.post("/submit-course", async (req, res) => {
  logger.info("request made to /api/verified/courses/submit-course");
  const {
    id,
    nameTitle,
    classSchedule,
    classroomNumber,
    maximumCapacity,
    courseTeacher,
    creditHours,
    tuitionCost,
    classDescription,
  } = req.body;
  const newCourse = new CoursesDB({
    id,
    nameTitle,
    classSchedule,
    classroomNumber,
    maximumCapacity,
    courseTeacher,
    creditHours,
    tuitionCost,
    classDescription,
  });

  try {
    // Check for duplicate course name before saving
    const existingUsers = await readCoursesData(nameTitle);

    if (existingUsers.length > 0) {
      // Duplicate course name found, handle the error
      logger.warn("Course Name Already Exists");
      res.status(400).json({ errorMessage: "Course Name Already Exists" });
      return;
    }
  } catch (error) {
    logger.warn("Course Creation Error");
    res.status(400).json({ errorMessage: "Course Creation Error" });
    console.error(error);
    return;
  }
  //saves to dataBase
  newCourse
    .save()
    .then(() => {
      logger.info("new course");
      res.json({ success: true });
    })
    .catch((error) => {
      logger.warn("Error saving data");
      res.status(500).json({ errorMessage: "Error saving data" });
      console.error(error);
    });
});

//deletes course from data base
courseServer.post("/delete-course", async (req, res) => {
  logger.info("request made for /api/verified/courses/delete-course");
  try {
    const toDelete = req.body.nameTitle;
    logger.info(`delete ${toDelete}`);

    // Delete the course based on nameTitle
    const deleteResult = await CoursesDB.deleteOne({ nameTitle: toDelete });
    if (deleteResult.deletedCount === 0) {
      // No course was deleted, it may not exist
      logger.warn("Course not found");
      res.status(404).json({ errorMessage: "Course not found" });
      return;
    }

    // Course deleted successfully
    logger.info("Course deleted successfully");
    res.json({ success: "Course deleted successfully" });
  } catch (error) {
    logger.warn("Error deleting course:", error);
    console.error("Error deleting course:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

//edits users from data base
courseServer.post("/edit-course", async (req, res) => {
  logger.info("request made to /api/verified/courses/edit-course");
  try {
    const { updatedData, title } = req.body;

    // Extracting data from updatedData
    const {
      nameTitle,
      classSchedule,
      classroomNumber,
      maximumCapacity,
      courseTeacher,
      creditHours,
      tuitionCost,
      classDescription,
    } = updatedData;

    console.log(updatedData);

    if (Object.keys(updatedData).some((field) => field === "")) {
      res.status(400).json({ errorMessage: "Not defined" });
    }
    console.log(updatedData.some((field) => field === ""));


    // Edit the user based on email
    await CoursesDB.updateMany(
      { nameTitle: title },
      {
        $set: {
          nameTitle: nameTitle,
          classSchedule: classSchedule,
          classroomNumber: classroomNumber,
          maximumCapacity: maximumCapacity,
          courseTeacher: courseTeacher,
          creditHours: creditHours,
          tuitionCost: tuitionCost,
          classDescription: classDescription,
        },
      }
    );
    logger.info("Course Edited Successfully");
    res.json({ success: "Course Edited Successfully" });
  } catch (error) {
    logger.warn("Error editing Course:", error);
    console.error("Error editing Course:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

//create fake courses
courseServer.post("/fake-course", async (req, res) => {
  const courses = [
    {
      nameTitle: "Exploring the Art of Basket Weaving",
      classSchedule: "Mondays and Wednesdays, 10:00 AM - 12:00 PM",
      classroomNumber: "234",
      maximumCapacity: 20,
      courseTeacher: "Professor Willow",
      creditHours: 3,
      tuitionCost: 200,
      classDescription:
        "This course delves into the intricate techniques and cultural significance of basket weaving across different civilizations throughout history. Students will learn various weaving styles and create their own unique baskets using natural materials.",
    },
    {
      nameTitle: "Introduction to Underwater Basket Weaving",
      classSchedule: "Tuesdays and Thursdays, 1:00 PM - 3:00 PM",
      classroomNumber: "234",
      maximumCapacity: 15,
      courseTeacher: "Professor Aquarius",
      creditHours: 2,
      tuitionCost: 300,
      classDescription:
        "Dive into the depths of creativity with this unique course that combines scuba diving and basket weaving. Students will learn the fundamentals of crafting baskets underwater while exploring marine life and underwater ecosystems.",
    },
    {
      nameTitle: "The Science of Alien Linguistics",
      classSchedule: "Fridays, 9:00 AM - 12:00 PM",
      classroomNumber: "234",
      maximumCapacity: 25,
      courseTeacher: "Professor Xeno",
      creditHours: 4,
      tuitionCost: 500,
      classDescription:
        "Ever wondered how to communicate with extraterrestrial beings? This course explores the principles of alien languages and the methods used to decipher and interpret intergalactic communication. Students will engage in practical exercises and simulations.",
    },
    {
      nameTitle: "Unraveling the Mysteries of Time Travel",
      classSchedule: "Saturdays, 2:00 PM - 5:00 PM",
      classroomNumber: "234",
      maximumCapacity: 30,
      courseTeacher: "Professor Chronos",
      creditHours: 3,
      tuitionCost: 400,
      classDescription:
        "Embark on a journey through the fabric of time itself in this mind-bending course. From the theory of relativity to wormholes and paradoxes, students will explore the science and philosophy behind time travel and its potential implications.",
    },
    {
      nameTitle: "Hogwarts 101: Introduction to Wizardry",
      classSchedule: "Sundays, 10:00 AM - 1:00 PM",
      classroomNumber: "234",
      maximumCapacity: 40,
      courseTeacher: "Professor Merlin",
      creditHours: 3,
      tuitionCost: 600,
      classDescription:
        "Enter the enchanting world of magic and spells with this introductory course to wizardry. From potion brewing to spellcasting, students will learn the basics of harnessing magical energies and exploring the wonders of the wizarding world.",
    },
    {
      nameTitle: "The Art of Ninja Gardening",
      classSchedule: "Mondays and Wednesdays, 3:00 PM - 5:00 PM",
      classroomNumber: "234",
      maximumCapacity: 20,
      courseTeacher: "Sensei Sakura",
      creditHours: 2,
      tuitionCost: 250,
      classDescription:
        "Discover the stealthy techniques of gardening in this unconventional course. Students will learn how to cultivate and maintain gardens while mastering the ancient art of ninja stealth and agility.",
    },
    {
      nameTitle: "Advanced Quantum Cooking",
      classSchedule: "Tuesdays and Thursdays, 10:00 AM - 12:00 PM",
      classroomNumber: "234",
      maximumCapacity: 15,
      courseTeacher: "Chef Quark",
      creditHours: 3,
      tuitionCost: 350,
      classDescription:
        "Delve into the quantum realm of culinary arts where flavors defy conventional laws of physics. This course explores molecular gastronomy and experimental cooking techniques, pushing the boundaries of taste and perception.",
    },
    {
      nameTitle: "Galactic Yoga: Finding Inner Peace Across the Cosmos",
      classSchedule: "Fridays, 3:00 PM - 6:00 PM",
      classroomNumber: "234",
      maximumCapacity: 25,
      courseTeacher: "Yogi Orion",
      creditHours: 3,
      tuitionCost: 450,
      classDescription:
        "Connect with the universe and harmonize body and mind with this cosmic yoga journey. Students will explore various yoga practices infused with cosmic energy, allowing them to achieve balance and tranquility across the galaxies.",
    },
    {
      nameTitle: "Cryptozoology: Hunting for Mythical Creatures",
      classSchedule: "Saturdays, 10:00 AM - 1:00 PM",
      classroomNumber: "234",
      maximumCapacity: 30,
      courseTeacher: "Dr. Griffin",
      creditHours: 3,
      tuitionCost: 550,
      classDescription:
        "Venture into the realm of mythical beasts and legendary creatures in this thrilling course on cryptozoology. From Bigfoot to the Loch Ness Monster, students will study the folklore and evidence surrounding these elusive beings.",
    },
    {
      nameTitle: "Introduction to Extraterrestrial Horticulture",
      classSchedule: "Sundays, 2:00 PM - 5:00 PM",
      classroomNumber: "234",
      maximumCapacity: 35,
      courseTeacher: "Professor Cosmos",
      creditHours: 3,
      tuitionCost: 500,
      classDescription:
        "Explore the fascinating world of alien plants and gardening techniques from distant planets. This course examines the diversity of extraterrestrial flora and teaches students how to cultivate and care for otherworldly gardens.",
    },
  ];

  for (const course of courses) {
    try {
      // Check for duplicate course name before saving
      const existingCourse = await CoursesDB.findOne({
        nameTitle: course.nameTitle,
      });

      if (existingCourse) {
        // Duplicate course name found, handle the error
        logger.warn("Course Name Already Exists");
        return res
          .status(400)
          .json({ errorMessage: "Course Name Already Exists" });
      }

      const newCourse = new CoursesDB(course);

      // Save the new course to the database
      await newCourse.save();

      logger.info("New course created:", newCourse);
    } catch (error) {
      logger.error("Error creating course:", error);
      return res.status(500).json({ errorMessage: "Error creating course" });
    }
  }

  res.json({ success: true });
});

module.exports = courseServer;
