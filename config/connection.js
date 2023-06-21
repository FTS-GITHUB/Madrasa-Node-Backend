const mongoose = require("mongoose");
const RolesModel = require("../model/role")

require("dotenv").config();



let MONGO_URL = process.env.NODE_ENV == "development" ? process.env.MONGO_DEV_URL : process.env.NODE_ENV == "production" ? process.env.MONGO_PROD_URL : process.env.MONGO_LOCAL_URL

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Database connected")
    const findStudentRole = await RolesModel.findOne({ name: "student" })
    const findTeacherRole = await RolesModel.findOne({ name: "teacher" })
    if (!findStudentRole) {
      let addStudentRole = await RolesModel.create({
        name: "student",
        routes: [
          {
            key: "/transactions",
            permissions: ["view"]
          }
        ],
        notDeleteAble: true
      })
    }
    if (!findTeacherRole) {
      let addTeacherRole = await RolesModel.create({
        name: "teacher",
        routes: [
          {
            key: "/blogs",
            permissions: ["view", "create", "edit", "delete"]
          },
          {
            key: "/books",
            permissions: ["view", "create", "edit", "delete"]
          },
          {
            key: "/meetings",
            permissions: ["view", "create", "edit", "delete"]
          },
          {
            key: "/transactions",
            permissions: ["view", "create", "edit", "delete"]
          },
        ],
        notDeleteAble: true
      })
    }
    // mongoose.set("debug", true)
  })
  .catch((err) => console.log("Database connection error", err));