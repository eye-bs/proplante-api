const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/ownersModels");

router.get("/", (req, res, next) => {
  var responseObject = {
    status: true,
    data: { text: "hello" }
}
res.json(responseObject);
});

module.exports = router;
