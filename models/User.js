const mongoose = require("mongoose");

const UserData = mongoose.Schema({
   username: {
    type: String,
    required: true
   },
   customerid: {
    type: Number,
    unique: true
   },
   fullname: {
    type: String,
    required: true
   },
   email: {
    type: String,
    required: true
   },
   phonenum: {
    type: Number,
    required: true
   },
   password: {
    type: String,
    required: true
   },
   dob: {
    type: Date,
    required: true
   },
   address: {
    type: String,
    required: true
   },
   accounts: []
});

module.exports = mongoose.model('Userdata', UserData);