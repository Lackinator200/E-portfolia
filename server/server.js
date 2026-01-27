const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const groupRoutes = require("./routes/group.routes");
const websocket = require("./websocket");

const app = express();

app.use(cors());
app.use(express.json());

// serve client static files
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.send("Server is running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);

// start http server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// attach websocket server (shares same http server)
websocket.attach(server);

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running on http://localhost:${PORT}`);
});
