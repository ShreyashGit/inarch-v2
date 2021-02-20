let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TemplateSchema = new Schema({
    divId: String,
    divName: String,
    headerTitle: String,
    documentType: String,
    terms: Array,
    logoImg: String,
    bookingWatermarkTxt: String,
    cancelWatermarkTxt: String,
    address: String,
    receiptHeight: Number,
    receiptWidth: Number,
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

mongoose.model('Template', TemplateSchema);