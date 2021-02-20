let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SettlementSchema = new Schema({
    bookingId: String,
    bookingNo: String,
    talukaId: String,
    districtId: String,
    divId: String,
    sectionId: String,
    subSectionId: String,
    modelId: String,
    model: String,
    productId: String,
    variant: String,
    incentivePaid: Boolean,
    incentiveAmt: Number,
    userId:String,
    userType:Number,
    createdBy: String,
    updatedBy: String,
    assignedUserName: String,
    completedDate : String,
    fullName: String,
    status: Number,
    bookingDate: String
}, { timestamps: true });

mongoose.model('Settlement', SettlementSchema);