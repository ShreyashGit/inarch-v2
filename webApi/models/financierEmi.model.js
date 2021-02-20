let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FinancierEmiSchema = new Schema({
    min: {
        type: Number,
        required: false
    },
    max: {
        type: Number,
        required: false
    },
    loanTenure: {
        type: Number,
        required: false
    },
    roi: {
        type: Number,
        required: false
    },
    emipm: {
        type: Number,
        required: false
    },
    financerId: {
        type: String,
        required: false
    },
    status: String,
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

mongoose.model('FinancierEmi', FinancierEmiSchema);