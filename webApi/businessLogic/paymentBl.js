/**
 * Class Name: paymentBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for payment.
 */

//#region Imports
const axios = require('axios').default;
let Payment = require('mongoose').model('Payment');
let Booking = require('mongoose').model('Booking');
var jsSHA = require("jssha");
const User = require('../models/user.model');
let Division = require('mongoose').model('Division');
const GlobalSettings = require('../models/globalSettings.model');
let Financier = require('mongoose').model('Financier');
const receiptBl = require("../businessLogic/receiptBl");
const {smsService, payuMoneyService} = require('../services');
mongoose = require('mongoose');
let Moment = require('moment');

//#endregion

//#region Public Functions

async function addPayment(req) {
    let data = await formatPaymentData(req.body);

    return await savePayment(data, req);

}

async function createHashCode(req) {
    let paymentDetails = req.body;
    let data = {};
    data.mode = "Online",
        data.amount = paymentDetails.amount,
        data.conventionalCharges = paymentDetails.conventionalCharges,
        data.transactionId = "",
        data.bookingId = paymentDetails.bookingId,
        data.providerResponse = {},
        data.status = "Initiated".toUpperCase(),
        data.bankRef = "",
        data.refNo = "",
        data.paymentPartner = "PaymentGateway";

    let response = await createNewPayment(data, req);
    let paymentId = response._id;

    let paymentSetting = await getPaymentSetting(paymentDetails.bookingId);

    paymentDetails.MerchantKey = paymentSetting.MerchantKey;
    paymentDetails.MerchantSalt = paymentSetting.MerchantSalt;
    paymentDetails.txnid = paymentId;

    if (!paymentDetails.amount || !paymentDetails.productinfo
        || !paymentDetails.firstname || !paymentDetails.email || !paymentDetails.MerchantKey || !paymentDetails.MerchantSalt || !paymentDetails.txnid) {
        throw new Error("Mandatory fields missing");
    } else {

        let hashString = paymentDetails.MerchantKey // Merchant Key
            + '|' + paymentDetails.txnid
            + '|' + paymentDetails.amount + '|' + paymentDetails.productinfo + '|'
            + paymentDetails.firstname + '|' + paymentDetails.email + '|'
            + '||||||||||'
            + paymentDetails.MerchantSalt; // Your salt value
        let sha = new jsSHA('SHA-512', "TEXT");
        sha.update(hashString);
        let hash = sha.getHash("HEX");
        return {'hash': hash, 'key': paymentDetails.MerchantKey, 'txnid': paymentDetails.txnid}
    }
}

async function addPaymentResponse(req) {

    let data = await payuMoneyService.formatResponse(req.body);

    let paymentSetting = await getPaymentSetting(data.bookingId);

    let hashString = paymentSetting.MerchantSalt // Merchant Key
        + '|' + req.body.status
        + '||||||||||'
        + '|' + req.body.email + '|'
        + req.body.firstname + '|'
        + req.body.productinfo + '|'
        + req.body.amount + '|'
        + req.body.txnid + '|'
        + paymentSetting.MerchantKey

    let sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString);

    let hash = sha.getHash("HEX");

    if (hash === data.hash) {
        return await savePayment(data, req, data.refNo);
    } else {
        if (data.hash) {
            data.status = "Suspicious".toUpperCase();
            await updatePayment(data, req, data.refNo);
            await Booking.update({_id: data.bookingId}, {$set: {status: 5}});
            return;
        }

        if (data.status.toUpperCase() === "CANCEL") {
            data.amount = req.body.amt;
            return await updatePayment(data, req, req.body.updateId);
        }
    }
}

async  function getCashPayments(req){
    let searchText = req.query.searchText;
    let page = parseInt(req.query.currentPage);
    let pageSize = 10;
    let bookingQuery = {};
    let paymentQuery = {
        mode:"Cash",
        status:"Initiated".toUpperCase()
    };
    let booking = {};

    let searchValue;
    if (searchText && searchText !== "") {
        searchText = searchText.replace(/[/.*+?^${}()|[\]\\-]/g, '\\$&');
        searchValue = '/' + searchText + '/i';
        bookingQuery["$or"] = [];
        bookingQuery["$or"].push({bookingNo: eval(searchValue)});

        booking = await Booking.findOne(bookingQuery).select({bookingNo: 1})
        if(!booking)   return {recordsTotal: 0, records: []};
    }

    if (booking && booking._id) {
        paymentQuery['bookingId'] = booking._id;
    }

    let recordsTotal = await Payment.count(paymentQuery);
    let skipRecords = (page - 1) * pageSize;
    let cashPaymentList = await Payment.find(paymentQuery).select({providerResponse: 0}).sort({updatedAt: -1})
        .skip(page === 1 ? 0 : skipRecords).limit(pageSize);

    if(cashPaymentList.length !== 0){
        let bookingIds = [...new Set(cashPaymentList.map(x => x.bookingId))];
        let record = await Booking.find({_id:{$in:bookingIds}}).select({bookingNo: 1, customerDetails:1, divId: 1});
        let divIds = [...new Set(record.map(x => x.divId))];
        let divisions = await Division.find({_id: {$in: divIds}}).select({value: 1});

        for(let x of cashPaymentList){
            let book = await record.find(item => item._id.toString() === x.bookingId);
            x.bookingNo = book.bookingNo;
            x.customerName = book.customerDetails.firstName+" "+book.customerDetails.middleName+" "+book.customerDetails.lastName;
            x.divName = await divisions.find(j => j._id.toString() === book.divId).value;
        }
        return {recordsTotal: recordsTotal, records: cashPaymentList};
    }

    return {recordsTotal: 0, records: []};

}

async function getPaymentById(id){
    let payments = await Payment.find({_id: id}).select({updatedAt: 0});
    let booking = await Booking.findOne({_id:payments[0].bookingId}).select({bookingNo: 1, customerDetails:1, divId: 1});
    let division = await Division.findOne({_id: booking.divId}).select({value: 1});
    payments[0].bookingNo = booking.bookingNo;
    payments[0].customerName = booking.customerDetails.firstName+" "+booking.customerDetails.middleName+" "+booking.customerDetails.lastName;;
    payments[0].divName = division.value;

    return {recordsTotal: payments.length, records: payments};
}

async function updateCashPaymentStatus(req){
    data= req.body;
    data.updateStatus = true;

    return await savePayment(data, req);
}

async function refreshPayments(req) {
    let bookingId = req.body.bookingId;

    if (!bookingId) throw new Error("Booking Id is required");

    let paymentQuery = {
        bookingId: bookingId,
        status: "Initiated".toUpperCase(),
        mode: "Online",
        paymentPartner: "PaymentGateway"
    };

    let failedPaymentList = await Payment.find(paymentQuery).sort({updatedAt: -1, assignedUserName: 1})

    if (failedPaymentList.length === 0) throw new Error("All Payments are updated");

    let paymentSetting = await getPaymentSetting(bookingId);

    for (let x = 0; x < failedPaymentList.length; x++) {

        let url = paymentSetting.responseUrl + `?merchantKey=${paymentSetting.MerchantKey}&merchantTransactionIds=${failedPaymentList[x]._id}`;
        let response = await axios.post(url, {}, {
            headers: {
                Authorization: paymentSetting.AuthHeader
            }
        });

        if(response.data.status === -1) throw new Error(response.data.message);
        response.data.result[0].postBackParam.bookingId = bookingId;
        let data = await payuMoneyService.formatResponse(response.data.result[0].postBackParam);
        await savePayment(data, req, data.refNo);
    }

    return {Success: true}
}

async function rollBackPayments(req){
   let {paymentId} = req.body;
   let {bookingId} = req.body;
   let {remark} = req.body;

    let paymentDetails = await Payment.find({bookingId: bookingId, status: "SUCCESS"}).sort({updatedAt: 1});

    if(!paymentDetails)throw new Error("paymentDetails not found");
    let booking = await Booking.findOne({_id:bookingId});

    let payDetails = await paymentDetails.find(x => x._id.toString() === paymentId);
    booking.balanceAmount = booking.balanceAmount + payDetails.amount;
    booking.updatedBy = req.user._id;

    if(paymentDetails.length === 1){
           booking.status = 1;
           booking.bookingNo = booking.bookingNo.substring(1);
           booking.bookingAmount = 0;
    }

    if (paymentDetails[0]._id.toString() === paymentId && paymentDetails.length > 1) {
        booking.bookingAmount = paymentDetails[1].amount;
    }

    await Booking.findOneAndUpdate({_id: bookingId}, {$set: booking});

    await Payment.findOneAndUpdate({_id: paymentId}, {$set: {status: "ROLLBACK", rollBackRemark: remark, updatedBy: req.user._id}});
    return {Success: true};
}
// #endregion

//#region Private Functions

async function savePayment(data, req, payId = "") {
    let bookingId = data.bookingId;
    let amount = data.amount;
    let booking = await Booking.findOne({_id: bookingId});

    let custName = booking.customerDetails.firstName + " " + booking.customerDetails.lastName;
    let custNumber = booking.customerDetails.phoneNo;

     let response = payId || data.updateStatus ? await updatePayment(data, req, payId) : await createNewPayment(data, req);

    let paymentId = response._id;
    let paymentStatus = response.status;
    response.providerResponse = {};
    if(paymentStatus !== "SUCCESS")  return {response};

    let paymentDetails = await Payment.find({bookingId: bookingId, status: "SUCCESS"}).select({providerResponse: 0});

    let actualPaymentList = await receiptBl.getActualPaymentList(paymentDetails);
    booking.balanceAmount = await receiptBl.getBalanceAmount(booking, actualPaymentList);
    booking.save();

    // If payment is successfully and it is first payment for booking then status:In-Process/bookingAmt is set and SMS with booking/payment form is sent
    if (paymentDetails.length === 1) {

        booking.status = 2;
        booking.bookingAmount = amount;
        booking.bookingNo = "B"+booking.bookingNo;
        if(!booking.bookingDate) booking.bookingDate = Moment().valueOf();
        booking.updatedBy = req.user._id;
        await Booking.update({_id: bookingId}, {$set: booking});

        await smsService.sendBookingFormSmsToCustomer(booking.customerDetails.phoneNo, amount, booking.bookingNo, custName, bookingId, paymentId);

        // If booking has agent assigned send SMS
        if (booking.assignedUserId) {
            let user = await getUserData(booking.assignedUserId);
            if (user && user._id) {
                let agentName = user.firstName ? user.firstName : user.fullName ;
                await smsService.sendBookingFormSmsToAgent(user.phoneNo, amount, booking.bookingNo, agentName, bookingId, paymentId);
            }
        }

        // If finance is selected send SMS to financer in round-robine
        if (booking.financeDetails && booking.financeDetails.financerId) {
            await sendSmsToFinancers(booking, custName, custNumber);
        }

    }

    // Sends only payment form
    else {
        await smsService.sendPaymentReceiptSmsToCustomer(booking.customerDetails.phoneNo, amount, booking.bookingNo, custName, paymentId);

        // If booking has agent assigned send SMS
        if (booking.assignedUserId) {
            let user = await getUserData(booking.assignedUserId);
            if (user && user._id) {
                let agentName = user.firstName;
                await smsService.sendPaymentReceiptSmsToAgent(user.phoneNo, amount, booking.bookingNo, agentName, paymentId);
            }
        }

    }

    return {response}
}

async function createNewPayment(data, req) {

    let reciptNo = await GlobalSettings.getNextReceiptSequenceNo();
    let paymentModel = new Payment();
    paymentModel.mode = data.mode;
    paymentModel.reciptNo = reciptNo;
    paymentModel.amount = data.amount;
    paymentModel.transactionId = data.transactionId;
    paymentModel.bookingId = data.bookingId;
    paymentModel.status = data.status.toUpperCase();
    paymentModel.bankRef = data.bankRef;
    paymentModel.refNo = data.refNo;
    paymentModel.providerResponse = data.providerResponse;
    paymentModel.paymentPartner = data.paymentPartner;
    paymentModel.createdBy = req.user._id;
    if(data.conventionalCharges !== null){
        paymentModel.conventionalCharges = data.conventionalCharges;
    }
    return await paymentModel.save();
}

async function  updatePayment(data, req, payId) {

    if (data.updateStatus) return Payment.findOneAndUpdate({_id: data._id}, {
            $set: {'providerResponse' :{},
                'status': data.status.toUpperCase(),
                'updatedBy': req.user._id
            }
        }, {new: true}
    );

    return await Payment.findOneAndUpdate({_id: payId}, {
        $set: {
            'mode': data.mode,
            'amount': data.amount,
            'transactionId': data.transactionId,
            'bookingId': data.bookingId,
            'status': data.status.toUpperCase(),
            'bankRef': data.bankRef,
            'refNo': data.refNo,
            'providerResponse': data.providerResponse,
            'updatedBy': req.user._id
        }
    }, {new: true})
}

async function getUserData(userId) {
    return User.findOne({_id: userId, status: "Active"}).select({
        updatedAt: 0,
        updatedBy: 0,
        password: 0,
        tokens: 0
    });
}

async function getFinancierList(userId) {
    return Financier.find({status: "Active"}).select({
        financerName: 1,
        phoneNumber: 1
    });
}

async function sendSmsToFinancers(booking, custName, custNumber) {
    let financeList = await getFinancierList();
    let financerDetail = await financeList.find(x => x._id.toString() === booking.financeDetails.financerId.toString());

    if (financerDetail && financerDetail._id) {
        await smsService.sendSmsToFinancer(financerDetail.phoneNumber, custName, custNumber, booking.financeDetails.financeAmount, booking.bookingNo, financerDetail.financerName);
    }

    let globalSettings = await GlobalSettings.findOne({}).select({lastSentFinancerId: 1});
    let index;

    if (globalSettings && globalSettings.lastSentFinancerId) index = financeList.findIndex(x => x._id.toString() === globalSettings.lastSentFinancerId.toString());
    else index = financeList.findIndex(x => x._id.toString() === booking.financeDetails.financerId.toString());

    let nextFinancerDetail = financeList[index + 1];

    await smsService.sendSmsToFinancer(nextFinancerDetail.phoneNumber, custName, custNumber, booking.financeDetails.financeAmount, booking.bookingNo, nextFinancerDetail.financerName);
    await GlobalSettings.findOneAndUpdate({}, {$set: {lastSentFinancerId: nextFinancerDetail._id}}, {new: true});
}

async function formatPaymentData(response) {
    let data = {};
        data.mode = response.paymentMode,
        data.amount = response.amount,
        data.transactionId = "Self",
        data.bookingId = response.bookingId,
        data.providerResponse = response.providerResponse ? response.providerResponse : {} ,
        data.status = (response.paymentMode === "Cash") ? "Initiated".toUpperCase() : "SUCCESS".toUpperCase(),
        data.bankRef = "Self",
        data.refNo = response.refNo;
     data.paymentPartner = "user";

    return data;
}

async function getPaymentSetting(bookingId) {
    let booking = await Booking.findOne({bookingNo:bookingId}).select({divId:1});

    return await PaymentSetting.findOne({
        divId: booking.divId,
        platform: config.PAYU_SETTINGS,
        paymentProvider: "payU"
    })
}

//#endregion

//#region Exports
module.exports.addPayment = addPayment;
module.exports.createHashCode = createHashCode;
module.exports.addPaymentResponse = addPaymentResponse;
module.exports.getCashPayments = getCashPayments;
module.exports.getPaymentById = getPaymentById;
module.exports.updateCashPaymentStatus = updateCashPaymentStatus;
module.exports.refreshPayments = refreshPayments;
module.exports.createNewPayment = createNewPayment;
module.exports.savePayment = savePayment;
module.exports.updatePayment = updatePayment;
module.exports.rollBackPayments = rollBackPayments;
//#endregion