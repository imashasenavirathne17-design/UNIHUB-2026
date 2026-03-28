const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

// Fix for MongoDB DNS issues on some networks
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const skillRoutes = require("./routes/skillRoutes");
const labHallAuthRoutes = require("./routes/labhallsystem_AuthRoutes");
const labHallRoomRoutes = require("./routes/labhallsystem_RoomRoutes");
const labHallBookingRoutes = require("./routes/labhallsystem_BookingRoutes");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

const { startExpiryJob } = require("./jobs/expiryJob");
const { startReminderJob } = require("./jobs/reminderJob");
const { startBoostJob } = require("./jobs/boostJob");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    startExpiryJob();
    startReminderJob();
    startBoostJob();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("Please check your internet connection and MongoDB Atlas IP whitelist.");
  });

app.use("/api/users", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/labhall/auth", labHallAuthRoutes);
app.use("/api/labhall/rooms", labHallRoomRoutes);
app.use("/api/labhall/bookings", labHallBookingRoutes);
app.use("/api/labhall/issues", require("./routes/labhallsystem_IssueRoutes"));
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("University API Running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
