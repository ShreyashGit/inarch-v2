/**
 * Class Name: smsService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle requests related to SMS.
 */

//#region Imports
const {request, logger} = require('../common');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
let Token = require('mongoose').model('Token');
const {config} = require('../config');
//#endregion

//#region Public Functions
async function sendOtpSms(phone, otp) {
    let otpMsg = `${otp} is your SECRET One Time Password(OTP) for login. Do not share it with anyone.`;
    await sendSms(phone, otpMsg);
}

async function sendPaymentReceiptSmsToCustomer(phone, amount, bookingNo, custName, paymentId) {
    let paymentUrl = await cereteUrl("paymentReceipt", paymentId);
    let msg = `Dear ${custName} thank you for the payment of Rs.${amount} (Booking number : ${bookingNo} ) . To download payment receipt, click ${paymentUrl}`;
    await sendSms(phone, msg);
}

async function sendPaymentReceiptSmsToAgent(phone, amount, bookingNo, agentName, paymentId) {
    let paymentUrl = await cereteUrl("paymentReceipt", paymentId);
    let msg = `Dear ${agentName} thank you for the payment of Rs.${amount} towards (Booking number : ${bookingNo} ). To download payment receipt, click ${paymentUrl}`;
    await sendSms(phone, msg);
}

async function sendBookingFormSmsToCustomer(phone, amount, bookingNo, custName, bookingId, paymentId) {
    let paymentUrl = await cereteUrl("paymentReceipt", paymentId);
    let bookingUrl = await cereteUrl("bookingReceipt", bookingId);
    let msg = `Thank You ${custName}. Booking amount of Rs.${amount} received, your Booking number is ${bookingNo}. Our executive will contact you shortly for further booking procedure. To download payment receipt, click ${paymentUrl}. To download booking form, click ${bookingUrl} .`;
    await sendSms(phone, msg);
}

async function sendBookingFormSmsToAgent(phone, amount, bookingNo, agentName, bookingId, paymentId) {
    let paymentUrl = await cereteUrl("paymentReceipt", paymentId);
    let bookingUrl = await cereteUrl("bookingReceipt", bookingId);
    let msg = `Thank You ${agentName}. Booking amount of Rs.${amount} received towards (Booking number : ${bookingNo} ). To download payment receipt, click ${paymentUrl}. To download booking form, click ${bookingUrl} .`;
    await sendSms(phone, msg);
}

async function sendSmsToFinancer(phone, custName, custNumber, financeAmount, bookingId, financerName) {
    let msg = `Hello ${financerName}. Finance Amount amount of Rs.${financeAmount} is required by ${custName} towards (Booking number : ${bookingId} ). You can contact customer at ${custNumber} . For further details you may contact dealer .`;
    await sendSms(phone, msg);
}

async function sendBookingFormFinExcSmsToCustomer(phone, amount, bookingNo, custName, bookingId, type) {
    let bookingUrl = await cereteUrl("bookingReceipt", bookingId);
    let msg = `Thank You ${custName}. ${type} amount of Rs.${amount} approved, your Booking number is ${bookingNo}. Our executive will contact you shortly for further booking procedure. To download booking form, click ${bookingUrl} .`;
    await sendSms(phone, msg);
}

async function sendBookingFormFinExcSmsToAgent(phone, amount, bookingNo, agentName, bookingId, type) {
    let bookingUrl = await cereteUrl("bookingReceipt", bookingId);
    let msg = `Thank You ${agentName}. ${type} amount of Rs.${amount} approved towards (Booking number : ${bookingNo} ).To download booking form, click ${bookingUrl} .`;
    await sendSms(phone, msg);
}

//#endregion

//#region Private Functions
async function sendSms(phone, msg) {
    let url= `https://easygosms.in/api/url_api.php?api_key=L3rWtFTQDY2xO1wk&pass=efI7ODAPRm&senderid=MACYVT&message=${msg}&dest_mobileno=${phone}&mtype=TXT`;

    if (config.SEND_SMS === 1) await request.get(url);
    else logger.verbose("PhoneNo = " + phone + " and msg = " + msg);

}

async function cereteUrl(api, id) {
    const token = await generateDownloadToken(api, id);
    shortId = shortid.generate();

    let tokenModel = new Token();
    tokenModel.token = token;
    tokenModel.refId = shortId;
    await tokenModel.save();

    return config.BOOKING_APP_URL+"download/"+ shortId
}

async function generateDownloadToken(api, id) {
    let data = {
        userId: config.DOWNLOAD_UID,
        downloadId: id,
        apiUrl: api
    };
    return await jwt.sign(data, process.env.JWT_KEY, {expiresIn: "7d"})
}
//#endregion

//#region Exports
module.exports.sendOtpSms = sendOtpSms;
module.exports.sendPaymentReceiptSmsToCustomer = sendPaymentReceiptSmsToCustomer;
module.exports.sendPaymentReceiptSmsToAgent = sendPaymentReceiptSmsToAgent;
module.exports.sendBookingFormSmsToCustomer = sendBookingFormSmsToCustomer;
module.exports.sendBookingFormSmsToAgent = sendBookingFormSmsToAgent;
module.exports.sendSmsToFinancer = sendSmsToFinancer;
module.exports.sendBookingFormFinExcSmsToCustomer = sendBookingFormFinExcSmsToCustomer;
module.exports.sendBookingFormFinExcSmsToAgent = sendBookingFormFinExcSmsToAgent;

//#endregion