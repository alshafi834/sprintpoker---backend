const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ msg: "Server is up and running" });
});

module.exports = router;
