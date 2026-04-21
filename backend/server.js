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
const eventRequestRoutes = require("./routes/eventRequestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as necessary for production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Socket.io Real-time Logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("send_message", (message) => {
    socket.to(message.conversationId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

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
  });

app.use("/api/users", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/labhall/auth", labHallAuthRoutes);
app.use("/api/labhall/rooms", labHallRoomRoutes);
app.use("/api/labhall/bookings", labHallBookingRoutes);
app.use("/api/labhall/issues", require("./routes/labhallsystem_IssueRoutes"));
app.use("/api/events", eventRoutes);
app.use("/api/event-requests", eventRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/onexam", require("./routes/OnExam_Routes"));
app.use("/api/lostfound", require("./routes/lost&found_Routes"));
app.use("/api/kuppi", require("./routes/OnKuppi_Routes"));

app.get("/", (req, res) => {
  res.send("University API Running");
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
