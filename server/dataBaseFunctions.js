const { UserDB, CoursesDB } = require('./DataBaseConnect');
// Function to read database for User info
async function readDataBase(email) {
    try {
      const users = await UserDB.find({ email: `${email}` });
      return users;
    } catch (error) {
      throw error;
    }
  }
// Function to read database for Course info
async function readCoursesData(nameTitle) {
    try {
      const courses = await CoursesDB.find({ nameTitle: `${nameTitle}` });
      return courses;
    } catch (error) {
      throw error;
    }
  }
// Function to grab and show database for Course info
async function showCoursesData() {
try {
    const courses = await CoursesDB.find({});
    return courses;
} catch (error) {
    throw error;
}
}
// Function to grab and show database for User info
async function showUsersData() {
try {
    const courses = await UserDB.find({});
    return courses;
} catch (error) {
    throw error;
}
}
module.exports = { readDataBase, readCoursesData, showCoursesData, showUsersData }