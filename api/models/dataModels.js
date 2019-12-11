var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var myLandSchema = new Schema({
    _id: String,
    land_name: String,
    owner: String,
    area: {
        map_area:{type :Number},
        size: {type :String},
        type: {type :String},
        wide_face: {type :Number}
    },
    address: {
        full: {type :String},
        locality: {type :String},
        lev_2:{type :String},
        lev_1:{type :String}
    },
    price: {
        square_yard: {type :Number},
        rai: {type :Number},
        all: {type :Number}
    },
    land_for: String,
    details: String,
    sea_level: Number,
    transfer_terms: String,
    img_link: [{type :String}],
    public_utilities: {
        building: Boolean,
        water: Boolean,
        electric : Boolean
    },
    location: [{ 
        pointer: Number,
        lat: Number,
        lng: Number
    }],
    approved: Boolean
});

module.exports = mongoose.model('lands' , myLandSchema);