const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const paymentSchema = new Schema({
    mode: {
        type: String,
        required: false,
    },
    refNo: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
    transactionId: {
        type: String,
        required: false
    },
    bookingId: {
        type: String,
        required: false
    },
    conventionalCharges: Number,
    reciptNo : String,
    status: String,
    bankRef: String,
    paymentPartner: String,
    providerResponse: Object,
    customerName: String,
    divName: String,
    rollBackRemark: String,
    createdBy: String,
    bookingNo: String,
    updatedBy: String
}, { timestamps: true });

paymentSchema.index({ updatedAt: -1});

mongoose.model('Payment', paymentSchema);