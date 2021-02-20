let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let DivisionSchema = new Schema({
    value: String,
    parentId: String,
    divId: String,
    type: Number,
    status: String,
    selected: Boolean,
    createdBy: String,
    updatedBy: String,
    cashSetting : Object,
    seqNo : Number
}, { timestamps: true });

mongoose.model('Division', DivisionSchema);