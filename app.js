const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv/config");

const app = express();

const user = require("./routes/user");
const account = require("./routes/account");
const transact = require("./routes/transact");
const schedule = require("./scheduledFunc/scheduledFuncs");

app.get("/", (req, res) => {
    res.status(200).send("Server Started");
})

// Middelware to parse the body
app.use(bodyParser.json());

// Routes
app.use("/user", user);
app.use("/account", account);
app.use("/transact", transact);

const PORT = 5000;

// Database connection
mongoose.connect(process.env.DB_CONNECTION, () => {
    console.log("Connected to DB");
})

// Scheduled task for interest and fees payment
schedule.initScheduledFunc();

app.listen(PORT, () => console.log("Started"));


module.exports = app;