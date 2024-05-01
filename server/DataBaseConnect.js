const mongoose = require("mongoose");
require("dotenv").config();
const dataBaseLink = process.env.MONGO_URI;

// Creating Mongoose schemas and models outside the connectDB function
const Schema = mongoose.Schema;

const BT = '\x1b[36m%s\x1b[0m';

// Schema for courses data
const coursesSchema = new Schema({
  id: Number,
  nameTitle: String,
  classSchedule: String,
  classroomNumber: Number,
  maximumCapacity: Number,
  courseTeacher: String,
  creditHours: Number,
  tuitionCost: String,
  classDescription: String,
  registeredUsers: Array,
});

const CoursesDB = mongoose.model("course", coursesSchema);

// Schema for users data
const userSchema = new Schema({
  email: String,
  username: String,
  hash: String,
  firstName: String,
  lastName: String,
  telephone: String,
  address: String,
  createDate: String,
  isAdmin: Boolean,
});

const UserDB = mongoose.model("user", userSchema);

function connectDB() {
  mongoose.connect(dataBaseLink, {}).then(() => {
    console.log("MongoDB is connected");
  });
}

module.exports = { connectDB, CoursesDB, UserDB, BT};
