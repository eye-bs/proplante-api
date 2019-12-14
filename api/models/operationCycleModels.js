var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var operationCycleSchema = new Schema({
  _id: String,
  land_id: String,
  logs: [{
    plant_id: String,
    start_date: Date,
    end_date: Date,
    expected_product: Number,
    real_product: Number,
    performance: Number,
    activities:[{
      activity_id: String,
      tasks: String,
      status: String,
      type: String,
      start_date: Date,
      end_date: Date,
      notes: String,
      images: [String],
      manager_id: String
    }]
  }]
});

module.exports = mongoose.model('operation' , operationCycleSchema);