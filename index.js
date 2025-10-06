const express = require("express");
const app = express();
const path = require("path");
const port = 2563;
const { Server } = require("socket.io");
const cors = require("cors");
const http = require("http");

const allowedOrigins = [
  "https://real-chat-application-frontend.vercel.app",
  "http://localhost:5173"
];

// ✅ Apply CORS for REST APIs
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // ✅ allow only frontend origin
    methods: ["GET", "POST"],
  },
});

// serve frontend files
app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", (socket) => {
  socket.on("new-user-join", (name) => {
    console.log("new user --", name);
    users[socket.id] = name;

    socket.broadcast.emit("user-join", name);
    socket.broadcast.emit("notification", { type: "join", text: `${name} joined the chat` });
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", { message: message, name: users[socket.id] });
    socket.broadcast.emit("notification", { type: "message", text: `${users[socket.id]} sent: ${message}` });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      socket.broadcast.emit("left", `${users[socket.id]} left the chat`);
      socket.broadcast.emit("notification", { type: "leave", text: `${users[socket.id]} left the chat` });
      delete users[socket.id];
    }
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Radhe radhe" });
});

// ✅ FIXED: use server.listen instead of app.listen
server.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
