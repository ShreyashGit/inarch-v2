/**
 * Class Name: productImportBl
 * Purpose: Business logic class for Reports.
 */

//#region Imports
const Division = require('mongoose').model('Division');
let Payment = require('mongoose').model('Payment');
let Booking = require('mongoose').model('Booking');
let  Settlement = require('mongoose').model('Settlement');
let ProductModel = require('mongoose').model('productModel');
let Product = require('mongoose').model('Product');
const User = require('../models/user.model');
mongoose = require('mongoose');
const xlsx = require('xlsx');
const {moment} = require("../common");

//#endregion

//#region Public Functions
async function exportPaymentReport(req, res){
    let divId = req.query.divId;
    let sectionId = req.query.sectionId;
    let subSectionId = req.query.subSectionId;
    let modelId = req.query.modelId;
    let from = req.query.from;
    let to = req.query.to;
    let mode = req.query.mode;
    let startDate = new Date(from);
    let endDate = new Date(to);
    endDate.setHours(23,59,59,999);

    let paymentQuery ={
        "mode" : mode === "Both" ? {$in: ["Online","Cash"]} : mode,
        "createdAt" : {$gte: startDate, $lt: endDate}
    };

    let sheetData = [];
    let records = await Payment.find(paymentQuery).select({providerResponse:0});
    let bookingIds = [...new Set(records.map(x => x.bookingId.toString()))];

    let bookingQuery = {
        divId:divId,
        _id : {$in: bookingIds}
    };

    if(sectionId){
        bookingQuery['sectionId'] = sectionId;
    }

    if(subSectionId){
        bookingQuery['subSectionId'] = subSectionId;
    }

    if(modelId){
        bookingQuery['modelId'] = modelId;
    }

    let bookingList = await Booking.find(bookingQuery);

    let ids =  [...new Set(bookingList.map(x => x._id.toString()))];
    paymentQuery['bookingId'] = {$in: ids};
    let payments = await Payment.find(paymentQuery).select({providerResponse:0});

    let modelIds =  [...new Set(bookingList.map(x => x.modelId))];
    let models =  await ProductModel.find({_id: {$in: modelIds}}).select({model:1});

    for (let payment of payments) {
        let booking = bookingList.find(x => x._id.toString() === payment.bookingId);
        let division = await  Division.findOne({_id:booking.divId}).select({value: 1});
        let model = await models.find( x=> x._id.toString() ===  booking.modelId );

        let user = await User.findOne({_id: payment.updatedBy ? payment.updatedBy : payment.createdBy}).select({fullName:1});

        let obj = {
            "Division": division.value,
            "Model" : model.model,
            "variant" : booking.vehicleDetails.variant,
            "Mode" : payment.mode,
            "Recipt-No" : payment.reciptNo,
            "Amount" : payment.amount,
            "Transaction-Id" : payment.transactionId,
            "Booking-No" : booking.bookingNo,
            "Status" : payment.status,
            "Bank-Ref-No" : payment.bankRef,
            "Ref-No" : payment.refNo,
            "Customer-Name" : booking.customerDetails.firstName+" "+booking.customerDetails.middleName+" "+booking.customerDetails.lastName,
            "Received-By" : user ? user.fullName : "",
            "Received-Date" :  moment(payment.createdAt).format("DD/MM/YYYY")
        };
        sheetData.push(obj)
    }
    let sheet = xlsx.utils.json_to_sheet(sheetData, {
        header: ["Division", "Model", "variant", "Mode", "Recipt-No", "Amount", "Transaction-Id", "Booking-No", "Status", "Bank-Ref-No", "Customer-Name", "Received-By", "Received-Date"]
    });

    let workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, sheet, "PAYMENT LIST");

    res.send(workbook);
}

async function exportSettlementReport(req, res){
    let divId = req.query.divId;
    let sectionId = req.query.sectionId;
    let subSectionId = req.query.subSectionId;
    let modelId = req.query.modelId;
    let from = req.query.from;
    let to = req.query.to;
    let mode = req.query.mode;
    let startDate = new Date(from);
    let endDate = new Date(to);
    endDate.setHours(23,59,59,999);
    let query ={
        "updatedAt" : {$gte: startDate, $lt: endDate},
        "divId" : divId
    };
    if(mode !== "Both")query['incentivePaid'] = mode === "Paid";

    if(sectionId){
        query['sectionId'] = sectionId;
    }

    if(subSectionId){
        query['subSectionId'] = subSectionId;
    }

    if(modelId){
        query['modelId'] = modelId;
    }

    let sheetData = [];
    let settlements = await Settlement.find(query);
    let division = await  Division.findOne({_id:divId}).select({value: 1});
    let ids = [...new Set(settlements.map(x => x.userId))];
    let users = await User.find({_id: {$in: ids}}).select({fullName:1});

    for (let settlement of settlements) {
        let user = await users.find( x=> x._id.toString() ===  settlement.userId );

        let obj = {
            "Division": division.value,
            "Booking-No" : settlement.bookingNo,
            "Model" : settlement.model ? settlement.model : "",
            "Variant" : settlement.variant ? settlement.variant : "",
            "User-Name" : user ? user.fullName : "",
            "User-Type" : getUseNameByType(settlement.userType),
            "Incentive-Amount" : settlement.incentiveAmt,
            "Status" : settlement.incentivePaid ? "Paid" : "Not Paid",
            "Incentive-Request-Date" : moment(settlement.createdAt).format("DD/MM/YYYY"),
            "Incentive-Paid-Date" :  settlement.incentivePaid ? moment(settlement.updateAt).format("DD/MM/YYYY") : ""
        };
        sheetData.push(obj)
    }
    let sheet = xlsx.utils.json_to_sheet(sheetData, {
        header: ["Division", "Booking-No", "Model", "Variant", "User-Name", "User-Type", "Incentive-Amount","Status","Incentive-Request-Date","Incentive-Paid-Date"]
    });

    let workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, sheet, "SETTLEMENT LIST");

    res.send(workbook);
}

async function exportBookingReport(req, res){
    let divId = req.query.divId;
    let sectionId = req.query.sectionId;
    let subSectionId = req.query.subSectionId;
    let modelId = req.query.modelId;
    let from = req.query.from;
    let to = req.query.to;
    let mode = req.query.mode;
    let startDate = new Date(from);
    let endDate = new Date(to);
    endDate.setHours(23,59,59,999);
    let query ={
        "divId": divId,
        "status" : mode === "0" ? {$in: [1, 2, 3, 5, 6]}: Number(mode),
        "updatedAt" : {$gte: startDate, $lt: endDate}
    };

    if(sectionId){
        query['sectionId'] = sectionId;
    }

    if(subSectionId){
        query['subSectionId'] = subSectionId;
    }

    if(modelId){
        query['modelId'] = modelId;
    }


    let sheetData = [];
    let bookings = await Booking.find(query);

    let division = await  Division.findOne({_id:divId}).select({value: 1});
    let ids = [...new Set(bookings.map(x => x.assignedUserId))];
    let users = await User.find({_id: {$in: ids}}).select({fullName:1});
    let modelIds =  [...new Set(bookings.map(x => x.modelId))];
    let models =  await ProductModel.find({_id: {$in: modelIds}}).select({model:1});

    for (let booking of bookings) {
        let user = await users.find( x=> x._id.toString() ===  booking.assignedUserId );
        let model = await models.find( x=> x._id.toString() ===  booking.modelId );

        let obj = {
            "Division": division.value,
            "Model" : model.model,
            "variant" : booking.vehicleDetails.variant,
            "Color" : booking.vehicleDetails.selectedColor.colorName,
            "Fuel-Type" : booking.vehicleDetails.type.toUpperCase(),
            "Booking-No/Quotation-No" : booking.bookingNo,
            "Customer-Name" : booking.customerDetails.firstName+" "+ booking.customerDetails.middleName+" "+ booking.customerDetails.lastName,
            "Contact-No" : booking.customerDetails.phoneNo,
            "Taluka" : booking.addressDetails.taluka ,
            "District" : booking.addressDetails.district,
            "Balance-Amount" : booking.balanceAmount ,
            "Source" : booking.source,
            "Agent/Customer" :  user ? user.fullName : "",
            "Status" : getBookingStates(booking.status),
            "Quotation-Date" : moment(booking.createdAt).format("DD/MM/YYYY"),
            "Booking-Date" : booking.bookingDate ? moment(parseInt(booking.bookingDate)).format("DD/MM/YYYY") : "",
            "Cancelled-Date" : booking.cancalationDate ? moment(parseInt(booking.cancalationDate)).format("DD/MM/YYYY") : "",
            "Cancellation-Reason" : booking.cancalationRemark ? booking.cancalationRemark : ""
        };
        sheetData.push(obj)
    }
    let sheet = xlsx.utils.json_to_sheet(sheetData, {
        header: ["Division", "Model", "variant", "Color", "Fuel-Type","Booking-No/Quotation-No", "Customer-Name", "Contact-No", "Taluka", "District", "Balance-Amount", "Source", "Agent/Customer", "Status", "Quotation-Date","Booking-Date","Cancelled-Date","Cancellation-Reason"]
    });

    let workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, sheet, "PAYMENT LIST");

    res.send(workbook);
}
//#endregion

//#region Private Function
function getUseNameByType(type) {
    let name = "MAC Vehicles";
    if (type === 1) name = "Area Manager";
    if (type === 2) name = "Gramin Mitra";
    if (type === 4) name = "Sales Executive";
    if (type === 5) name = "Sales Manager";
    if (type === 8) name = "Sub Dealer";
    if (type === 9) name = "Branch Delivery Outlet";
    if (type === 10) name = "Customer";

    return name;
}

function getBookingStates(type) {
    let status = "";
    if (type === 0) status = "All Bookings";
    if (type === 1) status = "Pending";
    if (type === 2) status = "In-Process";
    if (type === 3) status = "Completed";
    if (type === 6) status = "Cancelled";
    if (type === 5) status = "Invalid";
    return status;
}
//#endregion

//#region Exports
module.exports.exportPaymentReport = exportPaymentReport;
module.exports.exportSettlementReport = exportSettlementReport;
module.exports.exportBookingReport = exportBookingReport;
//#endregion