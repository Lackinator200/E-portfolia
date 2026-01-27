// server/db.js
const fs = require("fs");
const path = require("path");
const DB_FILE = path.join(__dirname, "data.json");

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const init = {
      users: [
        // default users for demo
        { id: 1, name: "Waseem", role: "LEADER", perms: ["layout","calendar","chat","portfolio"] },
        { id: 2, name: "Alex", role: "MEMBER", perms: ["chat","portfolio"] }
      ],
      groups: {
        // groupAlpha as example
        "group_alpha": {
          members: [1,2],
          layout: {},
          calendar: {},
          portfolio: [],
          chat: {}
        }
      },
      messages: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// user helpers
function getUserByName(name) {
  const db = readDB();
  return db.users.find(u => u.name === name);
}

function getUserById(id) {
  const db = readDB();
  return db.users.find(u => u.id === id);
}

function getGroup(id) {
  const db = readDB();
  return db.groups[id];
}

function saveGroup(id, data) {
  const db = readDB();
  db.groups[id] = Object.assign(db.groups[id] || {}, data);
  writeDB(db);
}

function addPortfolioPost(groupId, post) {
  const db = readDB();
  db.groups[groupId].portfolio.unshift(post);
  writeDB(db);
}

function addCalendarEvent(groupId, dayKey, event) {
  const db = readDB();
  db.groups[groupId].calendar[dayKey] = db.groups[groupId].calendar[dayKey] || [];
  db.groups[groupId].calendar[dayKey].push(event);
  writeDB(db);
}

module.exports = {
  readDB, writeDB,
  getUserByName, getUserById,
  getGroup, saveGroup, addPortfolioPost, addCalendarEvent
};

const users = [];

function addUser(user) {
  users.push(user);
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

module.exports = { addUser, findUserByEmail };
