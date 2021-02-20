let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CustomerSchema = new Schema({
        firstName: {
            type: String,
            required: false,
            trim: true
        },
        middleName: {
            type: String,
            required: false,
            trim: true
        },
        lastName: {
            type: String,
            required: false,
            trim: true
        },
        dateOfBirth: {
            type: String,
            required: false,
            trim: true
        },
        phoneNo: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: false,
            trim: true
        },
        gender: {
            type: String,
            required: false,
            trim: true
        },
        addressLine: {
            type: String,
            required: false,
            trim: true
        },
        city: {
            type: String,
            required: false,
            trim: true
        },
        district: {
            type: String,
            required: false,
            trim: true
        },
    districtId: {
        type: String,
        required: false,
        trim: true
    },
        talukaId: {
            type: String,
            required: false,
            trim: true
        },
        taluka: {
            type: String,
            required: false,
            trim: true
        },
        villageCode: {
            type: String,
            required: false,
            trim: true
        },
        village: {
            type: String,
            required: false,
            trim: true
        },
        state: {
            type: String,
            required: false,
            trim: true
        },
        pincode: {
            type: String,
            required: false,
            trim: true
        },
        createdBy: String,
        updatedBy: String
}, {timestamps: true});

mongoose.model('Customer', CustomerSchema);