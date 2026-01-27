// server/websocket.js
const WebSocket = require("ws");
const { verifyToken } = require("./auth");
const db = require("./db");

function attach(server) {
  const wss = new WebSocket.Server({ server });

  // room map: groupId -> Set of ws
  const rooms = new Map();

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => ws.isAlive = true);

    ws.on("message", (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch (e) { return; }

      // join message: { type: "join", token, group }
      if (data.type === "join") {
        const user = verifyToken(data.token);
        if (!user) { ws.send(JSON.stringify({ type: "error", msg: "Invalid token" })); return; }
        ws.user = user;
        ws.group = data.group;
        if (!rooms.has(data.group)) rooms.set(data.group, new Set());
        rooms.get(data.group).add(ws);
        ws.send(JSON.stringify({ type: "joined", user: user.name }));
        return;
      }

      // chat message: { type: "chat", text, target }
      if (data.type === "chat") {
        const rec = { type: "chat", user: ws.user.name, text: data.text, time: Date.now() };
        // broadcast to group
        const set = rooms.get(ws.group);
        if (set) {
          for (const client of set) {
            if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(rec));
          }
        }
      }
    });

    ws.on("close", () => {
      if (ws.group && rooms.has(ws.group)) {
        rooms.get(ws.group).delete(ws);
      }
    });
  });

  // heartbeat to close dead clients
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
}

module.exports = { attach };
