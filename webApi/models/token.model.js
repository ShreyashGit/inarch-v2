let mongoose = require('mongoose');

let tokenSchema = new mongoose.Schema({
    token:String,
    refId:String
}, { timestamps: true });

mongoose.model('Token', tokenSchema);
