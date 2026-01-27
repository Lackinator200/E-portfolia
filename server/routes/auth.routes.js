// server/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { signToken } = require("../auth");
const db = require("../db");

// simple login for demo: accept a username
router.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "username required" });

  // try to find user, otherwise create a simple MEMBER user (demo)
  let user = db.getUserByName(username);
  if (!user) {
    const data = db.readDB();
    const newId = data.users.length + 1;
    const perms = ["chat","portfolio"];
    user = { id: newId, name: username, role: "MEMBER", perms };
    data.users.push(user);
    data.groups["group_alpha"].members.push(newId);
    db.writeDB(data);
  }

  const token = signToken({ id: user.id, name: user.name, role: user.role, perms: user.perms });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

module.exports = router;
