let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SchemeSchema = new Schema({
    model:String,
    modelId:String,
    divId: String,
    divName: String,
    sectionId: String,
    sectionName: String,
    subSectionId: String,
    subSectionName: String,
    userType:Number,
    incentiveDetails:Array,
    status: String,
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

mongoose.model('Scheme', SchemeSchema);