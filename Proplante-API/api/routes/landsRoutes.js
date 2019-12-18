const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ownerCollection = require("../models/ownersModels");
const managerCollection = require("../models/managersModels");
const landCollection = require("../models/landsModels");
const plantCollection = require("../models/plantsModels");
const operationCollection = require("../models/operationCycleModels");

// show all lands
router.get("/:ownerid", (req, res, next) => {
  var owner_id = req.params.ownerid;
  var province = req.query.province || "all";
  var district = req.query.district || "all";
  var landname = req.query.landname || "all";
  var plant = req.query.plant || "all";
  var queryLands = [];

  var conditions = {};
  if (province != "all" && district != "all") {
    conditions = {
      $and: [
        { $eq: ["$$land.province", province] },
        { $eq: ["$$land.district", district] }
      ]
    };
  } else if (province != "all" && district == "all") {
    conditions = { $eq: ["$$land.province", province] };
  }
  if (landname != "all") {
    conditions = { $eq: ["$$land.name", landname] };
  }
  if (plant != "all") {
    queryLands = [];
  }

  landCollection
    .aggregate([
      { $match: { $and: [{ owner_id: owner_id }] } },
      {
        $project: {
          lands: {
            $filter: {
              input: "$lands",
              as: "land",
              cond: conditions
            }
          },
          _id: 0
        }
      }
    ])
    .exec()
    .then(docs => {
      if (docs[0].lands.length == 0) {
        res.status(400).send("data not found");
      } else {
        var resultData = docs;
        var landsDataArr = resultData[0].lands;
        for (let i = 0; i < landsDataArr.length; i++) {
          var landId = {
            land_id: landsDataArr[i]._id
          };
          queryLands.push(landId);
        }
        if (plant != "all") {
          queryPlant(resultData);
        } else {
          progressPerland(resultData);
        }
        // res.status(200).send(queryPlants);
      }
    })
    .catch(err => {
      res.json({ message: err.message });
    });

  function queryPlant(resultData) {
    operationCollection
      .aggregate([
        { $match: { $or: queryLands } },
        {
          $project: {
            land_id: "$land_id",
            logs: {
              $filter: {
                input: "$logs",
                as: "log",
                cond: {
                  $and: [
                    { $eq: ["$$log.plant_name", plant] },
                    { $eq: ["$$log.real_product", null] }
                  ]
                }
              }
            },
            _id: 0
          }
        }
      ])
      .exec()
      .then(docs => {
        if (docs == null) {
          res.status(400).send("data not found");
        } else {
          var landIdArr = [];
          for (let i = 0; i < docs.length; i++) {
            if (docs[i].logs.length != 0) {
              landIdArr.push(docs[i].land_id);
            }
          }
          var resultPlants = [];
          if (landIdArr.length != 0) {
            for (let i = 0; i < landIdArr.length; i++) {
              for (let j = 0; j < resultData[0].lands.length; j++) {
                if (resultData[0].lands[j]._id == landIdArr[i]) {
                  resultPlants.push(resultData[0].lands[j]);
                }
              }
            }
          } else {
            resultPlants = resultData;
          }
          var schemaLands = [{ lands: resultPlants }];
          progressPerland(schemaLands);
        }
      })
      .catch(err => {
        res.json({ message: err.message });
      });
  }

  function progressPerland(landsData) {
    var progressData = [];
    var landsDataArr = landsData[0].lands;

    operationCollection.find(
      {
        $or: queryLands
      },
      function(err, docs) {
        if (err) {
          res.status(500).send(err.message);
        } else {
          if (docs != null) {
            for (let i = 0; i < landsDataArr.length; i++) {
              var logs = docs[i].logs;
              var activities =
                logs.length == 0 ? 0 : logs[logs.length - 1].activities || 0;
              var done = 0;
              for (let k = 0; k < activities.length; k++) {
                if (activities[k].status == "เสร็จแล้ว") {
                  done++;
                }
              }
              var data = {
                land_id: landsDataArr[i]._id,
                progress: (done / 100) * activities.length || 0
              };
              progressData.push(data);
              if (i == landsDataArr.length - 1) {
                var result = {
                  lands: landsData[0].lands,
                  progress: progressData
                };
                res.status(200).send(result);
              }
            }
          } else {
            res.status(404).send("data not found");
          }
        }
      }
    );
  }
});

// new land
router.post("/:ownerid", (req, res, next) => {
  var land_id = new mongoose.Types.ObjectId();
  var owner_id = req.params.ownerid;
  var land_name = req.body.name;
  var operationData = new operationCollection({
    _id: new mongoose.Types.ObjectId(),
    land_id: land_id,
    logs: []
  });
  var newLandObj = {
    _id: land_id,
    name: req.body.name,
    active_status: false,
    province: req.body.province,
    district: req.body.district,
    area: req.body.area,
    points: req.body.points
  };

  landCollection.findOne(
    {
      owner_id: owner_id,
      "lands.name": land_name
    },
    {
      "lands.$": 1
    },
    function(err, item) {
      if (item == null) {
        newLand();
      } else {
        res.status(400).send("this land is exists");
      }
    }
  );

  function newLand() {
    landCollection.findOneAndUpdate(
      {
        owner_id: owner_id
      },
      {
        $push: {
          lands: newLandObj
        }
      },
      function(err, docs) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (docs == null) {
            res.status(404).send("user not found");
          } else {
            operationData.save();
            res.status(201).send(newLandObj);
          }
        }
      }
    );
  }
});

router.get("/filter/:ownerid", (req, res, next) => {
  var owner_id = req.params.ownerid;
  landCollection
    .aggregate([
      { $match: { $and: [{ owner_id: owner_id }] } },
      {
        $project: {
          land_id: "$lands._id",
          povince: "$lands.province",
          district: "$lands.district",
          land_name: "$lands.name",
          _id: 0
        }
      }
    ])
    .exec()
    .then(docs => {
      if (docs == "" || docs == null) {
        res.status(404).send("lands not found");
      } else {
        filterPlantName(docs);
      }
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    });

  function filterPlantName(landQuery) {
    var landId = landQuery[0].land_id;
    landIdArr = [];
    for (let i = 0; i < landId.length; i++) {
      var landObj = {
        land_id: landId[i]
      };
      landIdArr.push(landObj);
    }

    operationCollection
      .aggregate([
        {
          $match: { $or: landIdArr }
        },
        {
          $project: {
            plant: {
              $filter: {
                input: "$logs",
                as: "log",
                cond: {
                  $eq: ["$$log.real_product", null]
                }
              }
            },
            _id: 0
          }
        },
        {
          $project: {
            plant: {
              $cond: {
                if: { $eq: [[], "$plant"] },
                then: "$$REMOVE",
                else: "$plant.plant_name"
              }
            },
            _id: 0
          }
        }
      ])
      .exec()
      .then(docs => {
        if (docs == "" || docs == null) {
          res.status(404).send("lands not found");
        } else {
          var plantArr = [];
          for (let i = 0; i < docs.length; i++) {
            if (docs[i].plant == undefined) {
              continue;
            }
            var plant_name = docs[i].plant;
            for (let j = 0; j < plant_name.length; j++) {
              plantArr.push(plant_name[j]);
            }
          }
          var plantObj = {plant : plantArr};
          var newFilter = Object.assign({}, landQuery[0], plantObj);
           res.status(200).send(newFilter);
        }
      })
      .catch(err => {
        res.status(500).json({ message: err.message });
      });
  }
});

module.exports = router;
