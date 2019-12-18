const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ownerCollection = require("../models/ownersModels");
const managerCollection = require("../models/managersModels");
const landCollection = require("../models/landsModels");
const plantCollection = require("../models/plantsModels");
const operationCollection = require("../models/operationCycleModels");

// new plant
router.post("/:ownerid", (req, res, next) => {
  var owner_id = req.params.ownerid;
  var plant_id = new mongoose.Types.ObjectId();
  var name = req.body.name;
  var cover_image = req.body.cover_image;

  var plantObj = {
    _id: plant_id,
    name: name,
    cover_image: cover_image,
    activities: []
  };

  plantCollection.findOne({owner_id: owner_id ,"plants.name": name} ,
  { "plants.$": 1 },
  function(err, item) {
    if (item == null) {
      newPlant();
    } else {
      res.status(400).send("this plant is exists");
    }
  });

  function newPlant(){
    plantCollection.findOneAndUpdate(
      { owner_id: owner_id },
      {
        $push: {
          plants: plantObj
        }
      },
      function(err, docs) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (docs == null) {
            res.status(404).send("user not found");
          } else {
            res.status(201).send(plantObj);
          }
        }
      }
    );
  }
});
// get plant
router.get("/:ownerid", (req, res, next) => {
  var owner_id = req.params.ownerid;
  var plantName = req.query.name || "all";
  if (plantName == "all") {
    plantCollection
      .findOne({ owner_id: owner_id }, function(err, item) {
        res.status(200).send(item.plants);
      })
      .catch(err => {
        res.json({ message: err.message });
      });
  } else {
    plantCollection
      .findOne(
        { owner_id: owner_id, "plants.name": plantName },
        { "plants.$": 1 },
        function(err, item) {
          if (item == null) {
            res.status(404).send("plant not found");
          } else {
            res.status(200).send(item.plants[0]);
          }
        }
      )
      .catch(err => {
        res.json({ message: err.message });
      });
  }
});

// new activity
router.post("/new/activity/:plantid", async (req, res) => {
  var plant_id = req.params.plantid;
});

module.exports = router;
