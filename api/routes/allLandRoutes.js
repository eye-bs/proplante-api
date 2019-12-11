const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/dataModels");

router.get("/:id", (req, res, next) => {
  if (req.params.id == "approved") {
    dataCollection
      .find({ approved: true })
      .exec()
      .then(docs => {
        res.status(200).json(docs);
      })
      .catch(err => {
        res.status(500).send({
          error: err
        });
      });
  }else if (req.params.id == "notapprove") {
    dataCollection
      .find({ approved: false })
      .exec()
      .then(docs => {
        res.status(200).json(docs);
      })
      .catch(err => {
        res.status(500).send({
          error: err
        });
      });
  }
   else if (req.params.id == "q") {
    var province = req.query.province;
    var district = req.query.district;
    var locality = req.query.locality;
    var min = req.query.minsize || 0;
    var max = req.query.maxsize || 0;

    dataCollection
      .find({ approved: true })
      .exec()
      .then(docs => {
        if (locality != undefined) {
          res.status(200).json(localityQuery(docs, district,locality, min, max));
        } else if (district != undefined) {
          res.status(200).json(districtQuery(docs, province,district, min, max));
        } else if (province != undefined) {
          res.status(200).json(provinceQuery(docs, province, min, max));
        } 
        else {
          res.status(200).json(areaRangeQuery(docs, min, max));
        }
      })
      .catch(err => {
        res.status(500).send({
          error: err
        });
      });
  } else {
    dataCollection
      .findOne({ _id: req.params.id })
      .exec()
      .then(docs => {
        if (docs == null) {
          res.status(404).send("land not found");
        } else {
          res.status(200).json(docs);
        }
      })
      .catch(err => {
        res.status(500).send({
          error: err
        });
      });
  }
});


router.delete("/:id", (req, res, next) =>{
  if (req.params.id != undefined) {
    dataCollection
      .findOne({_id: req.params.id})
      .exec()
      .then(docs => {
        if (docs == null) {
          res.status(404).send("this land is not found");
        } else {
          deleteUsers();
        }
      })
      .catch(err => {
        res.status(500).send({
          error: err
        });
      });
  }
  function deleteUsers() {
    dataCollection.deleteOne({ _id: req.params.id }, function(err, docs) {
      if (err) {
        res.status(500).json({
          message: err.message
        });
      } else {
        res.status(200).json({ message: "land deleted!" });
      }
    });
  }
});

function provinceQuery(docs, lev_1, min, max) {
  var newDocs = [];
  if (lev_1 != "ทั้งหมด") {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].address.lev_1 == lev_1) {
        if (min != 0 && max != 0) {
          if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
            newDocs.push(docs[i]);
          }
        } else {
          newDocs.push(docs[i]);
        }
      }
    }
  } else {
    for (let i = 0; i < docs.length; i++) {
      if (min != 0 && max != 0) {
        if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
          newDocs.push(docs[i]);
        }
      } else {
        newDocs.push(docs[i]);
      }
    }
  }

  return newDocs;
}

function districtQuery(docs, lev_1, lev_2, min, max) {
  var newDocs = [];
  if (lev_2 != "ทั้งหมด") {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].address.lev_2 == lev_2) {
        if (min != 0 && max != 0) {
          if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
            newDocs.push(docs[i]);
          }
        } else {
          newDocs.push(docs[i]);
        }
      }
    }
  } else {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].address.lev_1 == lev_1) {
        if (min != 0 && max != 0) {
          if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
            newDocs.push(docs[i]);
          }
        } else {
          newDocs.push(docs[i]);
        }
      }
    }
  }
  return newDocs;
}

function localityQuery(docs, lev_2, locality, min, max) {
  var newDocs = [];
  if (locality != "ทั้งหมด") {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].address.locality == locality) {
        if (min != 0 && max != 0) {
          if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
            newDocs.push(docs[i]);
          }
        } else {
          newDocs.push(docs[i]);
        }
      }
    }
  } else {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].address.lev_2 == lev_2) {
        if (min != 0 && max != 0) {
          if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
            newDocs.push(docs[i]);
          }
        } else {
          newDocs.push(docs[i]);
        }
      }
    }
  }

  return newDocs;
}

function areaRangeQuery(docs, min, max) {
  var newDocs = [];
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].area.map_area >= min && docs[i].area.map_area <= max) {
      newDocs.push(docs[i]);
    }
  }
  return newDocs;
}

module.exports = router;
