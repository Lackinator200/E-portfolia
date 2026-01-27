const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../db");

const SECRET = "school-secret";

// SIGNUP
router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (findUserByEmail(email)) {
    return res.status(400).json({ error: "Email exists" });
  }

  createUser({
    username,
    email,
    password,   // plaintext is OK for school
    role: "MEMBER"
  });

  res.sendStatus(201);
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const token = jwt.sign({
    username: user.username,
    role: user.role
  }, SECRET);

  res.json({ token });
});

module.exports = router;
