const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ownerCollection = require("../models/ownersModels");
const managerCollection = require("../models/managersModels");
const landCollection = require("../models/landsModels");
const plantCollection = require("../models/plantsModels");
const operationCollection = require("../models/operationCycleModels");

// start new cycle
router.post("/start/:landid", (req, res, next) => {
  var land_id = req.params.landid;
  var plantName = req.body.plant;
  var expected = req.body.expected;

  operationCollection.findOne({ land_id: land_id })
  .exec()
  .then(docs => {
    if (docs == null || docs == "") {
      res.status(404).send("land not found");
    } else {
      newOperationCycle(docs);
    }
  })
  .catch(err => {
    res.json({ message: err });
  });
function newOperationCycle(docs){
  var d = new Date();
  var tzo = - d.getTimezoneOffset() / 60;
  tzo = (tzo + '').padStart(2, '0');
  d = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  var tsp = d.toISOString();
  tsp = tsp.replace('Z', `+${tzo}:00`);

  var logs = docs.logs;
  var operationObj = {
    plant_name: plantName,
    start_date: tsp,
    end_date: null, 
    expected_product: expected,
    real_product: null,
    performance: null,
    activities: []
  }
  logs.push(operationObj);

  operationCollection.findOneAndUpdate(
    { land_id: land_id },
    {
      $set: {
        land_id: land_id,
        logs: logs
      }
    },
    function(err, docs) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(201).send(operationObj);
      }
    }
  );
}
});

// Create emerrgency activity 
router.post("/new/activity/:landid", (req, res, next)=>{
  var land_id = req.params.landid;

  operationCollection.findOne({ land_id: land_id})
  .exec()
  .then(docs =>{
    newEmergencyActivity(docs);

  })
  .catch(err => {
    res.status(500).send(err.message);
  });
function newEmergencyActivity(docs){
  var logs = docs.logs;
  var currentCycle;
  if(logs.length != 0){
    currentCycle = logs[logs.length - 1].activities
  }else {
    res.status(400).send("this plant is not have activity");
  }

  var activityModel = {
    activity_id: null,
    task: req.body.task,
    status: req.body.status, 
    type: "emergency",
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    notes: req.body.notes,
    images: req.body.images,
    manager_id: req.body.manager_id
  };
  currentCycle.push(activityModel);
  logs.activities = currentCycle;
  operationCollection.findByIdAndUpdate({ land_id: land_id},
    {$set: {
      land_id: land_id,
      logs: logs
    }},
    function(err,doc){
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(201).send(activityModel);
      }
    });
}
});
module.exports = router;
