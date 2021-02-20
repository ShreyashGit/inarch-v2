let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ProductModelSchema = new Schema({
    status: String,
    makeName: String
}, { timestamps: true });

mongoose.model('productModel', ProductModelSchema);