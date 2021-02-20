let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BookingSchema = new Schema({
    addressLine: {
        type: String,
        trim: true
    },
    addressLine2:{
        type: String,
        trim: true
    },
    area: {
        type: String,
        trim: true
    },
    assignedUserId: {
        type: String,
        trim: true
    },
    assignedUserName: {
        type: String,
        trim: true
    },
    chassis: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Number,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    engine: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    grossPremium: {
        type: Number,
        trim: true
    },
    idv: {
        type: String,
        trim: true
    },
    insuranceCompany: {
        type: String,
        trim: true
    },
    insuranceDate: {
        type: Number,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    make: {
        type: String,
        trim: true
    },
    makeYear: {
        type: Number,
        trim: true
    },
    middleName: {
        type: String,
        trim: true
    },
    model:{
        type: String,
        trim: true
    },
    netPremium: {
        type: Number,
        trim: true
    },
    phoneNo: {
        type: String,
        trim: true
    },
    phoneNo2: {
        type: String,
        trim: true
    },
    phoneNo3:  {
        type: String,
        trim: true
    },
    regAddressLine:  {
        type: String,
        trim: true
    },
    regAddressLine2:  {
        type: String,
        trim: true
    },
    regArea:  {
        type: String,
        trim: true
    },
    regCity: {
        type: String,
        trim: true
    },
    regNo: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    regState:  {
        type: String,
        trim: true
    },
    rescheduleDate:  {
        type: Number,
        trim: true
    },
    source:  {
        type: String,
        trim: true
    },
    sourceName:  {
        type: String,
        trim: true
    },
    state:  {
        type: String,
        trim: true
    },
    status:  {
        type: String,
        trim: true
    }

}, { timestamps: true });

BookingSchema.index({ updatedAt: -1, assignedUserName: 1});

mongoose.model('Booking', BookingSchema);