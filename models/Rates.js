const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const RatesSchema = new Schema({
  title: String,
  slug: String,
});

mongoose.model('Rates', RatesSchema);
