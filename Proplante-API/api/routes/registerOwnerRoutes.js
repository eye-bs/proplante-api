const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/ownersModels");
const managerCollection = require("../models/managersModels");
const landCollection = require("../models/landsModels");
const plantCollection = require("../models/plantsModels");


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
var landsData = new landCollection({
  _id: new mongoose.Types.ObjectId(),
  owner_id: _id,
  lands: []
});
var plantData = new plantCollection({
  _id: new mongoose.Types.ObjectId(),
  owner_id: _id,
  plants: []
});

// query
  dataCollection
    .find({ email: req.body.email })
    .exec()
    .then(docs => {
      if (docs == "" || docs == null) {
        ownerData
          .save()
          .then(result => {
            res.status(201).send(result);
            managerData.save();
            landsData.save();
            plantData.save();
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        res.status(400).send({ success: false, message: "email is exists" });
      }
    })
    .catch(err => {
      res.json({ message: err });
    });
});

module.exports = router;
