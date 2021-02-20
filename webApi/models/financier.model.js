let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FinancierSchema = new Schema({
    documentNo:String,
    agencyName: String,
    financerName: String,
    phoneNumber: String,
    emailId: String,
    address: String,
    documentCharges: Number,
    processingCharges: Number,
    irr: Number,
    discount: Number,
    talukaId: String,
    talukaName: String,
    emiDetails:  Array,
    status: String,
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

mongoose.model('Financier', FinancierSchema);