let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CustomerResponseSchema = new Schema({
    response: String,
    bookingId: String
}, { timestamps: true });

mongoose.model('CustomerResponse', CustomerResponseSchema);