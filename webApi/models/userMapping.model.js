let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserMappingSchema = new Schema({
    divId: String,
    userId: String,
    sectionId: String,
    subSectionId: String,
    status: String,
    createdBy: String,
    updatedBy: String,
    subSectionName: String,
    sectionName: String,
    divName: String,
    taluka: String,
    talukaId: String
}, { timestamps: true });

mongoose.model('UserMapping', UserMappingSchema);