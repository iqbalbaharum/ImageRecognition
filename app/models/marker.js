'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MarkerSchema = new Schema({

  image: String,
  action: String,
  CreatedAt: {
    type: Date,
    default: Date.Now
  }
});

module.exports = mongoose.model('Marker', MarkerSchema);
