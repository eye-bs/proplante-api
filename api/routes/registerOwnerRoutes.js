const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/ownersModels");
const managerCollection = require("../models/managersModels");

router.post("/", (req, res, next) => {
  var _id = new mongoose.Types.ObjectId()
  var ownerData = new dataCollection({
    _id:_id,
    name: req.body.name,
    email: req.body.email
  });
  var managerData = new managerCollection({
    _id: new mongoose.Types.ObjectId(),
    owner_id: _id,
    managers: []
  });
  dataCollection
    .find({ email: req.body.email })
    .exec()
    .then(docs => {
      if (docs == "" || docs == null) {
        ownerData
          .save()
          .then(result => {
            res.status(200).send({ success: true });
            managerData.save()
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        res.status(400).send({ success: false, message: "data is exists" });
      }
    })
    .catch(err => {
      res.json({ message: err });
    });
});

module.exports = router;
