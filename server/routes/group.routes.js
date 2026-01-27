// server/routes/group.routes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware, requirePerm } = require("../auth");

// get members of a group
router.get("/:groupId/members", authMiddleware, (req, res) => {
  const group = db.getGroup(req.params.groupId);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const members = group.members.map(id => db.getUserById(id)).filter(Boolean);
  res.json({ members });
});

// save layout (leader permission needed)
router.post("/:groupId/layout", authMiddleware, requirePerm("layout"), (req, res) => {
  const groupId = req.params.groupId;
  db.saveGroup(groupId, { layout: req.body.layout });
  res.json({ ok: true });
});

// get layout
router.get("/:groupId/layout", authMiddleware, (req, res) => {
  const group = db.getGroup(req.params.groupId);
  res.json({ layout: group.layout || {} });
});

// calendar endpoints
router.get("/:groupId/calendar", authMiddleware, (req, res) => {
  const group = db.getGroup(req.params.groupId);
  res.json({ calendar: group.calendar || {} });
});

router.post("/:groupId/calendar", authMiddleware, requirePerm("calendar"), (req, res) => {
  const { dayKey, text } = req.body;
  db.addCalendarEvent(req.params.groupId, dayKey, { text, user: req.user.name, time: Date.now() });
  res.json({ ok: true });
});

// portfolio endpoints
router.get("/:groupId/portfolio", authMiddleware, (req, res) => {
  const group = db.getGroup(req.params.groupId);
  res.json({ portfolio: group.portfolio || [] });
});

router.post("/:groupId/portfolio", authMiddleware, (req, res) => {
  // expects { user, imgDataUrl, desc, time }
  db.addPortfolioPost(req.params.groupId, req.body.post);
  res.json({ ok: true });
});

module.exports = router;
