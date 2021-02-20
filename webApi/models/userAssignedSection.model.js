let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserAssignedSectionSchema = new Schema({
    value: String,
    userId: String,
    type: String
}, {timestamps: true});

mongoose.model('UserAssignedSection', UserAssignedSectionSchema);