/**
 * Class Name: bookingBl
 * Author: Piyush Thacker
 * Purpose: Business logic class for bookings.
 */

//#region Imports
let Booking = require('mongoose').model('Booking');
let Product = require('mongoose').model('Product');
let Division = require('mongoose').model('Division');
let ProductModel = require('mongoose').model('productModel');
let UserAssignedSectionSchema = require('mongoose').model('UserAssignedSection');
let UserMapping = require('mongoose').model('UserMapping');
let Customer = require('mongoose').model('Customer');
let CustomerResponse = require('mongoose').model('CustomerResponse');

let Payment = require('mongoose').model('Payment');
const GlobalSettings = require('../models/globalSettings.model');
let Moment = require('moment');
mongoose = require('mongoose');
const common = require('../common');
const {config} = require('../config');
const {smsService} = require('../services');
const User = require('../models/user.model');
const receiptBl = require("../businessLogic/receiptBl");


//#endregion

//#region Public Functions

/**
 * Gets booking list
 * @param req
 * @param role
 * @returns {{p: string}}
 */
async function getBookings(req, role) {
    let user = req.user;
    let status = req.query.type; // 0:All Bookings, 1:Pending, 2:In-Process, 3:Completed, 4:In-Process&&Completed&&Cancel, 5:Disabled, 6:Cancel, 10:Deleted
    let searchText = req.query.searchText;
    let month = req.query.month;
    let page = parseInt(req.query.currentPage);
    let pageSize = 10;

    let query = {};

    if (status === "Fresh call") {
        query['status'] = {$nin:["Reschedule call","Call lost"]};
        query["insuranceDate"] = {
            $gte: Moment().add(2, "month").startOf('day').valueOf(),
            $lte: Moment().add(2, "month").endOf('day').valueOf()
        };
    }

    if (status === "Reschedule call") {
        query['status'] = status;
        query["rescheduleDate"] = {$gte: Moment().startOf('day'), $lte: Moment().endOf('day')};
    }

    if (status === "Overdue call") {
        console.log(Moment().add(2, "month").startOf('day').valueOf())

        query["insuranceDate"] = {$lt: Moment().add(2, "month").startOf('day').valueOf()};
    }

    if(status === "Call lost"){
        query['status'] = status;

    }


    let searchValue;
    if (searchText && searchText !== "") {
        searchText = searchText.replace(/[/.*+?^${}()|[\]\\-]/g, '\\$&');
        searchValue = '/' + searchText + '/i';
        if (!query["$or"]) {
            query["$or"] = [];
            query["$or"].push({"customerDetails.firstName": eval(searchValue)});
            query["$or"].push({"customerDetails.middleName": eval(searchValue)});
            query["$or"].push({"customerDetails.lastName": eval(searchValue)});
            query["$or"].push({"customerDetails.phoneNo": eval(searchValue)});
            query["$or"].push({"customerDetails.email": eval(searchValue)});
            query["$or"].push({"addressDetails.taluka": eval(searchValue)});
            query["$or"].push({"vehicleDetails.productName": eval(searchValue)});
            query["$or"].push({bookingNo: eval(searchValue)});
            query["$or"].push({assignedUserName: eval(searchValue)});
        } else {
            query["$and"] = [{
                $or: [
                    {"customerDetails.firstName": eval(searchValue)},
                    {"customerDetails.middleName": eval(searchValue)},
                    {"customerDetails.lastName": eval(searchValue)},
                    {"customerDetails.phoneNo": eval(searchValue)},
                    {"customerDetails.email": eval(searchValue)},
                    {"addressDetails.taluka": eval(searchValue)},
                    {"vehicleDetails.productName": eval(searchValue)},
                    {bookingNo: eval(searchValue)},
                    {assignedUserName: eval(searchValue)}
                ]
            }];
        }
    }

    let selectQuery = {
        updatedAt: 0
    };

    console.log(query)
    let recordsTotal = await Booking.count(query);
    let skipRecords = (page - 1) * pageSize;
    let bookingList = await Booking.find(query).select(selectQuery).sort({updatedAt: -1, assignedUserName: 1})
        .skip(page === 1 ? 0 : skipRecords).limit(pageSize);

    return {recordsTotal: recordsTotal, records: bookingList};
}

/**
 * Adds a new booking
 * @param req
 * @returns {{p: string}}
 */
async function addBooking(req) {
    let booking = req.body.data;

    let alreadyHasWithSameRegNo = await Booking.findOne({regNo: booking.regNo});

    if (alreadyHasWithSameRegNo !== null) {
        return {
            "booking": alreadyHasWithSameRegNo,
            "error": `Customer already exists for this registration no= (${booking.regNo}).`
        };
    }

    let bookingModel = new Booking();
    bookingModel.addressLine = booking.addressLine;
    bookingModel.addressLine2 = booking.addressLine2;
    bookingModel.area = booking.area;
    bookingModel.assignedUserId = //Todo;
        bookingModel.chassis = booking.chassis;
    // bookingModel.createdAt = //Todo;
    bookingModel.dateOfBirth = await formatDateToEpoch(booking.dateOfBirth); // todo;
    bookingModel.email = booking.email;
    bookingModel.engine = booking.engine;
    bookingModel.firstName = booking.firstName;
    bookingModel.gender = booking.gender;
    bookingModel.grossPremium = booking.grossPremium;
    bookingModel.idv = booking.idv;
    bookingModel.insuranceCompany = booking.insuranceCompany;
    bookingModel.insuranceDate = await formatDateToEpoch(booking.insuranceDate); //Todo
    bookingModel.lastName = booking.lastName;
    bookingModel.make = booking.make;
    bookingModel.makeYear = booking.makeYear;
    bookingModel.middleName = booking.middleName || "";
    bookingModel.model = booking.model;
    bookingModel.netPremium = booking.netPremium;
    bookingModel.phoneNo = booking.phoneNo;
    bookingModel.phoneNo2 = booking.phoneNo2;
    bookingModel.phoneNo3 = booking.phoneNo3;
    bookingModel.regAddressLine = booking.regAddressLine;
    bookingModel.regAddressLine2 = booking.regAddressLine2;
    bookingModel.regArea = booking.regArea;
    bookingModel.regCity = booking.regCity;
    bookingModel.city = booking.city;
    bookingModel.regNo = booking.regNo;
    bookingModel.regState = booking.regState;
    bookingModel.rescheduleDate = await formatDateToEpoch(booking.rescheduleDate); //todo
    bookingModel.source = booking.source;
    bookingModel.sourceName = booking.sourceName;
    bookingModel.state = booking.state;
    bookingModel.status = booking.status;

    await bookingModel.save();
    return {records: [bookingModel.toJSON()]};
}

/**
 * Updates an existing booking
 * @param req
 * @returns {{p: string}}
 */
async function updateBooking(req) {
    let _id = req.body._id;
    let booking = req.body.data;
    booking.dateOfBirth = await formatDateToEpoch(booking.dateOfBirth);
    booking.insuranceDate = await formatDateToEpoch(booking.insuranceDate);
    booking.rescheduleDate = await formatDateToEpoch(booking.rescheduleDate);
    let response = await Booking.findOneAndUpdate({_id: _id}, {$set: booking}, {new: true});
    return {records: [response.toBSON()]};
}

async function cancelBooking(req) {
    let bookingId = req.body.bookingId;
    let response = await Booking.update({_id: bookingId}, {
        $set: {
            status: 6,
            cancalationRemark: req.body.cancalationRemark,
            cancalationDate: Moment().valueOf(),
            // updatedBy: req.user._id //TODO auth
        }
    });
    return {records: [response]};
}

async function getBookingById(id, req) {

    let booking = await Booking.findOne({_id: id}).select({updatedAt: 0});

    return {recordsTotal: 1, records: [booking]};
}

async function updateFinance(req) {
    let bookingId = req.body._id;
    let booking = req.body.data;
    booking.updatedBy = req.user._id;
    let paymentDetails = await booking.paymentDetails.filter(x => x.status === "SUCCESS");
    if (booking.financeApproved && paymentDetails.length === 0) {
        booking.status = 2;
        booking.bookingNo = "B" + booking.bookingNo;
        if (!booking.bookingDate) booking.bookingDate = Moment().valueOf();
    }
    delete booking.paymentDetails;
    await Booking.findOneAndUpdate({_id: bookingId}, {$set: booking}, {new: true});
    // if (booking.financeApproved && paymentDetails.length === 0) await sendSmsToFinExc(booking, booking.financeDetails.financeAmount, "Finance");

    return getBookingById(bookingId, req)
}

async function ExcAmount(req) {
    let bookingId = req.body._id;
    let booking = req.body.data;
    // booking.updatedBy = req.user._id;
    let paymentDetails = await booking.paymentDetails.filter(x => x.status === "SUCCESS");
    if (booking.exchangeApproved && paymentDetails.length === 0) {
        booking.status = 2;
        booking.bookingNo = "B" + booking.bookingNo;
        if (!booking.bookingDate) booking.bookingDate = Moment().valueOf();
    }
    delete booking.paymentDetails;
    await Booking.findOneAndUpdate({_id: bookingId}, {$set: booking}, {new: true});
    // if (booking.exchangeApproved && paymentDetails.length === 0) await sendSmsToFinExc(booking, booking.excAmount, "Exchange");

    return getBookingById(bookingId, req)
}

/**
 * Deletes a booking
 * @param req
 * @returns {{p: string}}
 */
async function deleteBooking(req) {
    let {bookingId} = req.body;
    await Booking.findOneAndUpdate({_id: bookingId}, {$set: {status: 10}});
    return {Success: true};
}

async function getCustomerResponse(req, res) {
    let page = parseInt(req.query.currentPage);
    let bookingId = req.query.bookingId
    let pageSize = 10;

    let query = {bookingId: bookingId};
    console.log(req.query.currentPage)
    let recordsTotal = await CustomerResponse.count(query);
    let skipRecords = (page - 1) * pageSize;
    let bookingList = await CustomerResponse.find(query).sort({updatedAt: -1, assignedUserName: 1})
        .skip(page === 1 ? 0 : skipRecords).limit(pageSize);

    return {recordsTotal: recordsTotal, records: bookingList};
}

async function postCustomerResponse(req, res) {
    let data = req.body;

    let customerResponseModel = new CustomerResponse();
    customerResponseModel.response = data.response;
    customerResponseModel.bookingId = data.bookingId;

    await customerResponseModel.save();
    return {records: [customerResponseModel.toJSON()]};
}


// #endregion

//#region Private Functions
function getBookingSource(type) {
    let source = "MAC Vehicles";
    if (type === 1) source = "Area Manager";
    if (type === 2) source = "Gramin Mitra";
    if (type === 4) source = "Sales Executive";
    if (type === 5) source = "Sales Manager";
    if (type === 8) source = "Sub Dealer";
    if (type === 9) source = "Branch Delivery Outlet";
    if (type === 10) source = "Customer";

    return source;
}

async function resolveDivisionAndModel(booking) {
    let divisions = await Division.find({_id: {$in: [booking.divId, booking.sectionId, booking.subSectionId]}}).select({value: 1});
    booking.divName = divisions.find(x => x._id.toString() === booking.divId).value;
    booking.sectionName = divisions.find(x => x._id.toString() === booking.sectionId).value;
    booking.subSectionName = divisions.find(x => x._id.toString() === booking.subSectionId).value;

    let productModel = await ProductModel.find({_id: booking.modelId}).select({model: 1});
    booking.model = productModel[0].model;
    return booking
}

async function sendSmsToFinExc(booking, amount, type) {
    await smsService.sendBookingFormFinExcSmsToCustomer(booking.customerDetails.phoneNo, amount, booking.bookingNo, booking.customerDetails.firstName, booking._id, type);

    // If booking has agent assigned send SMS
    if (booking.assignedUserId) {
        let user = await User.findOne({_id: booking.assignedUserId, status: "Active"}).select({
            updatedAt: 0,
            updatedBy: 0,
            password: 0,
            tokens: 0
        });
        if (user && user._id) {
            let agentName = user.firstName ? user.firstName : user.fullName;
            await smsService.sendBookingFormFinExcSmsToAgent(user.phoneNo, amount, booking.bookingNo, agentName, booking._id, type);
        }
    }
}

async function formatDateToEpoch(stringDate) {
    if (!stringDate) return 0;
    if (typeof stringDate === "string") {
        return Moment(stringDate, "YYYY-MM-DD").valueOf();
    } else {
        return stringDate;
    }
}

//#endregion

//#region Exports
module.exports.getBookings = getBookings;
module.exports.addBooking = addBooking;
module.exports.updateBooking = updateBooking;
module.exports.deleteBooking = deleteBooking;
module.exports.getBookingById = getBookingById;
module.exports.cancelBooking = cancelBooking;
module.exports.updateFinance = updateFinance;
module.exports.ExcAmount = ExcAmount;
module.exports.getCustomerResponse = getCustomerResponse;
module.exports.postCustomerResponse = postCustomerResponse;
//#endregion
