let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let LookupSchema = new Schema({
    tableName: String,
    valueName: String,
    order: Number,
    parentId: String,
    status: String,
    code: String,
    createdBy: String,
    updatedBy: String
}, { timestamps: true });

mongoose.model('Lookup', LookupSchema);