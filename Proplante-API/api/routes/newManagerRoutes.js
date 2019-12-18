const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/ownersModels");
const managerCollection = require("../models/managersModels");
const landCollection = require("../models/landsModels");
const plantCollection = require("../models/plantsModels");
const operationCollection = require("../models/operationCycleModels");

router.post("/:ownerid", (req, res, next) => {
  var owner_id = req.params.ownerid;

  dataCollection
    .findOne({ _id: owner_id })
    .exec()
    .then(docs => {
      managerCollection
        .findOne({ owner_id: owner_id })
        .exec()
        .then(docs => {
          if (docs == "" || docs == null) {
           
          } else {
            updateNewManager(docs);
          }
        })
        .catch(err => {
          res.status(500).send(err);
        });
    })
    .catch(err => {
      res.status(500).send(err);
    });

  function updateNewManager(docs) {
    var owner_id = docs.owner_id;
    var managers = docs.managers;
    var newCode = generateCode();
    var contactObj = { address: "", phone: "" };
    var managerObj = {
      id: newCode,
      name: "",
      image: "",
      contact_info: contactObj
    };
    managers.push(managerObj);

    managerCollection.findOneAndUpdate(
      { owner_id: docs.owner_id },
      {
        $set: {
          owner_id: owner_id,
          managers: managers
        }
      },
      function(err, docs) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(201).send({manager_code: newCode});
        }
      }
    );
  }
});

function generateCode() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
