let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PaymentSettingSchema = new Schema({
    paymentProvider: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true,
    },
    url: String,
    responseUrl: String,
    MerchantKey:String,
    MerchantSalt: String,
    AuthHeader: String,
    workingKey: String,
    accessCode: String,
    merchantId: String,
    successUrl: String,
    failureUrl: String,
    divId: String,
    accName: String,
    bnkName: String,
    accNo: String,
    ifsc: String,
    branch: String,
    gstNo: String,
    divName:String
}, { timestamps: true });

mongoose.model('PaymentSetting', PaymentSettingSchema);