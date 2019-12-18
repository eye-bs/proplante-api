var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var operationCycleSchema = new Schema({
  _id: String,
  owner_id: String,
  land_id: String,
  logs: [{
    plant_name: String,
    start_date: String,
    end_date: String,
    expected_product: Number,
    real_product: Number,
    performance: Number,
    activities:[{
      activity_id: String,
      tasks: String,
      status: String,
      type: String,
      start_date: String,
      end_date: String,
      notes: String,
      images: [String],
      manager_id: String
    }]
  }]
});

module.exports = mongoose.model('operation' , operationCycleSchema);