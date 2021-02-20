let mongoose = require('mongoose');

let uploadedExcel = new mongoose.Schema({
    status: String,
    filename: String,
    progress: Number,
    totalRecords: Number
}, { timestamps: true });

mongoose.model('UploadedExcel', uploadedExcel);
