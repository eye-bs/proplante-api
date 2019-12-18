const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/ownersModels");

router.post('/', (req, res, next) => {
  dataCollection.findOne({email: req.body.email})
  .exec()
  .then(docs => {
    if(docs == "" || docs == null){
        res.status(404).send({message:"user not found"})
    }else{
      res.status(200).json(docs)
    }
  }).catch(err =>{
    res.json({message:err});
  });
});

module.exports = router;
