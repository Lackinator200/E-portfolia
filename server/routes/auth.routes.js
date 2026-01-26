router.post("/login", (req, res) => {
  const { username } = req.body;

  // TEMP fake user (for school project)
  const user = {
    name: username,
    role: "LEADER"
  };

  const token = jwt.sign(user, SECRET);
  res.json({ token });
});
