const mongoose = require("mongoose");
require("dotenv").config();

let MONGO_URL = process.env.NODE_ENV == "development" ? process.env.MONGO_DEV_URL : process.env.NODE_ENV == "production" ? process.env.MONGO_PROD_URL : process.env.MONGO_LOCAL_URL

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected")
    mongoose.set("debug", true)
  })
  .catch((err) => console.log("Database connection error", err));