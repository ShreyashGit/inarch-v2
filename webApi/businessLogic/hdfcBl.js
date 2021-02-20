
/**
 * Class Name: hdfcBl
 * Author: Shreyash Wankhade
 * Purpose: Business logic class for file Hdfc Payments.
 */

//#region Imports
const axios = require('axios').default;
mongoose = require('mongoose');
var crypto = require('crypto');
const bookingBl = require("../businessLogic/bookingBl");
const paymentBl = require("../businessLogic/paymentBl");
let PaymentSetting = require('mongoose').model('PaymentSetting');
const {config} = require('../config');
let Payment = require('mongoose').model('Payment');
let Booking = require('mongoose').model('Booking');
const qs = require('querystring');
const CronJob = require('cron').CronJob;
const Moment = require('moment');
//#endregion

//#region Public Functions

async function initiateTransaction(req) {
    let bookingId = req.body.bookingId;
    let amount = req.body.amount;
    let conventionalCharges = req.body.conventionalCharges;
    let auth = req.body.auth;
    let book = await bookingBl.getBookingById(bookingId, req);
    let booking = book.records[0];

    let hdfcCredentials = await PaymentSetting.findOne({
        divId: booking.divId,
        platform: config.HDFC_SETTINGS,
        paymentProvider: "hdfc"
    });

    let postUrl = hdfcCredentials.url;

    let data = {};
    data.mode = "Online",
        data.amount = amount,
        data.conventionalCharges = conventionalCharges,
        data.transactionId = "",
        data.bookingId = bookingId,
        data.providerResponse = {},
        data.status = "Initiated".toUpperCase(),
        data.bankRef = "",
        data.refNo = "",
        data.paymentPartner = "Hdfc";

    let response = await paymentBl.createNewPayment(data, req);
    let paymentId = response._id;

    let hashUrl = `merchant_id=${hdfcCredentials.merchantId}&order_id=${paymentId}&currency=INR&amount=${amount}&redirect_url=${hdfcCredentials.responseUrl}&cancel_url=${hdfcCredentials.responseUrl}&language=EN&billing_te=${booking.customerDetails.phoneNo}&billing_email=${booking.customerDetails.email}&merchant_param1=${bookingId}&merchant_param2=${paymentId}&merchant_param3=${auth}`;

    let body = '',
        workingKey = hdfcCredentials.workingKey,
        accessCode = hdfcCredentials.accessCode,
        encRequest = '',
        formbody = '';
    body += hashUrl.toString();
    encRequest = await encrypt(body, workingKey);

    formbody = '<form id="nonseamless" method="post" name="redirect" action="'+postUrl+'"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';


    return formbody;
}

async function endTransaction(req) {
    let data = await formatResHdfcData(req.body.data);

    let payment = await Payment.findOne({_id : data.refNo});
    let booking = await Booking.findOne({_id:payment.bookingId}).select({divId:1});
    data.bookingId = payment.bookingId;
    let hdfcCredentials = await PaymentSetting.findOne({
        divId: booking.divId,
        platform: config.HDFC_SETTINGS,
        paymentProvider: "hdfc"
    });

    let resTampered = false;
    if(!req.body.refreshStatus) resTampered = await checkResponseTampering(hdfcCredentials, data);

    if((parseFloat(payment.amount) !== parseFloat(data.amount)) || (payment._id.toString() !== data.refNo) || resTampered){
        data.status = "Suspicious".toUpperCase();
        await paymentBl.updatePayment(data, req, data.refNo);
        await Booking.update({_id: payment.bookingId}, {$set: {status: 5}});
        return hdfcCredentials.successUrl+payment.bookingId+ "?status="+10+"&amt="+data.amount+"&orderNo="+data.refNo;
    }
        await paymentBl.savePayment(data, req, data.refNo);
        return hdfcCredentials.successUrl+payment.bookingId+ "?status="+data.statusCode+"&amt="+data.amount+"&orderNo="+data.refNo;
}
// #endregion

//#region Private Functions

async function formatResHdfcData (obj,hash){
    let data = {};
    let status = "";
    let statusCode = -1;
    if(obj.order_status === "Success" || obj.order_status === "Shipped") {
        status = "SUCCESS";
        statusCode = 0;
    }
    if(obj.order_status === "Failure" || obj.order_status === "Unsuccessful") {
        status = "FAILED";
        statusCode = 1;
    }
    if(obj.order_status === "Aborted"){
        status = "CANCEL";
        statusCode = 2;
    }
    if(obj.order_status === "Initiated" || obj.order_status === "Awaited"){
        status = "IN-PROCESS";
        statusCode = 9;
    }

    data.mode = "Online";
    data.amount = obj.amount ? obj.amount : obj.order_amt;
    data.transactionId = obj.tracking_id ? obj.tracking_id.toString() : obj.reference_no ? obj.reference_no.toString() : "";
    data.providerResponse = obj;
    data.status = status;
    data.bankRef = obj.bank_ref_no ? obj.bank_ref_no.toString(): obj.order_bank_ref_no ? obj.order_bank_ref_no.toString() : null ;
    data.refNo = obj.order_id ? obj.order_id : obj.order_no;
    data.statusCode = statusCode;
    return data;
}

async function encrypt (plainText, workingKey) {
    var m = crypto.createHash('md5');
    m.update(workingKey);
    var key = m.digest();
    var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var encoded = cipher.update(plainText,'utf8','hex');
    encoded += cipher.final('hex');
    return encoded;
}

async function decrypt (encText, workingKey) {
    var m = crypto.createHash('md5');
    m.update(workingKey);
    var key = m.digest();
    var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(encText,'hex','utf8');
    decoded += decipher.final('utf8');
    return decoded;
}

async  function checkResponseTampering(hdfcCredentials, originalResponseData){

    let hashObj = {
        order_no: originalResponseData.refNo
    };

    let encRequest = await encrypt(JSON.stringify(hashObj), hdfcCredentials.workingKey);

    let postUrl = "https://logintest.ccavenue.com/apis/servlet/DoWebTrans";
    if (config.HDFC_SETTINGS === "Production") postUrl = "https://login.ccavenue.com/apis/servlet/DoWebTrans";
    // if (config.HDFC_SETTINGS === "Production") postUrl = "https://login.ccavenue.com/apis/servlet/DoWebTrans";

    let response = await axios.post(`${postUrl}?enc_request=${encRequest}&access_code=${hdfcCredentials.accessCode}&command=orderStatusTracker&request_type=JSON&response_type=JSON`);
    let resObj = await qs.parse(response.data);
    if (resObj.status !== "0") return true;
    let decRequest = await decrypt(resObj.enc_response, hdfcCredentials.workingKey);

    let dataForVerification = await formatResHdfcData(JSON.parse(decRequest).Order_Status_Result);

    if((parseFloat(originalResponseData.amount) !== parseFloat(dataForVerification.amount))
        || originalResponseData.refNo !== dataForVerification.refNo
        || originalResponseData.status !== dataForVerification.status
        || originalResponseData.transactionId !== dataForVerification.transactionId
    ) return true;

    return false;
}

async function hdfcPaymentRefresh() {
    let payments = await Payment.find({
        status: "Initiated".toUpperCase(),
        mode: "Online",
        paymentPartner: "Hdfc",
        createdAt: {$lte: Moment().subtract(10, "m").toISOString().valueOf()}
    });

    let bookingIds = [...new Set(payments.map(x => x.bookingId.toString()))];
    let bookings = await Booking.find({_id: {$in: bookingIds}}).select({divId: 1, bookingNo: 1, customerId:1});

    let divIds = [...new Set(bookings.map((x => x.divId)))];
    let hdfcPaymentSettings = await PaymentSetting.find({
        divId: {$in: divIds},
        platform: config.HDFC_SETTINGS,
        paymentProvider: "hdfc"
    });

    for (let payment of payments) {
        let book = bookings.find(x => x._id.toString() === payment.bookingId);
        let paySetting = hdfcPaymentSettings.find(x => x.divId === book.divId);
        let hashObj = {
            order_no: payment._id.toString()
        };

        let encRequest = await encrypt(JSON.stringify(hashObj), paySetting.workingKey);

        let postUrl = "https://logintest.ccavenue.com/apis/servlet/DoWebTrans";
        if (config.HDFC_SETTINGS === "Production") postUrl = "https://login.ccavenue.com/apis/servlet/DoWebTrans";
        // if (config.HDFC_SETTINGS === "Production") postUrl = "https://login.ccavenue.com/apis/servlet/DoWebTrans";

        let response = await axios.post(`${postUrl}?enc_request=${encRequest}&access_code=${paySetting.accessCode}&command=orderStatusTracker&request_type=JSON&response_type=JSON`);
        let resObj = await qs.parse(response.data);
        if (resObj.status !== "0") continue;

        let decRequest = await decrypt(resObj.enc_response, paySetting.workingKey);
        let req={
            body: {
                data : JSON.parse(decRequest).Order_Status_Result,
                refreshStatus : true
            },
            user : {
                _id: book.customerId
            }
        };
        console.log("Hdfc response : ", req);
        await endTransaction (req)
    }
}

let refreshPaymentStatus = new CronJob({
    cronTime: "00 */10 * * * *",
    onTick: async function() {
        console.log("CRONJOB : Checking paymemt status..");
        await hdfcPaymentRefresh();
    },
    start: false,
    timeZone: "Asia/Kolkata"
});
refreshPaymentStatus.start();

//#endregion

//#region Exports
module.exports.initiateTransaction = initiateTransaction;
module.exports.endTransaction = endTransaction;
module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;

//#endregion