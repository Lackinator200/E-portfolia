const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

if (user.role !== "LEADER") {
  return res.status(403).send("No permission");
}
