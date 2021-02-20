/**
 * Class Name: hdfcService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to hdfc Payments.
 */

//#region Imports
const hdfcBl = require("../businessLogic/hdfcBl");
const Auth = require("../middleware/auth");
const qs = require('querystring');
const {config} = require('../config');
let PaymentSetting = require('mongoose').model('PaymentSetting');
let Booking = require('mongoose').model('Booking');
let Payment = require('mongoose').model('Payment');

//#endregion

//#region Public Functions
async function initiateTransaction(req, response) {
    //Payment Auth
    await doPaymentAuth(req, response);
    //Payment Auth End

    let blResponse = await hdfcBl.initiateTransaction(req, response);
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(blResponse);
    response.end();
}

async function endTransaction(req, res) {
    let hash = req.body.encResp;
    let payment = await Payment.findOne({_id:req.body.orderNo}).select({bookingId:1});
    let booking = await Booking.findOne({_id:payment.bookingId}).select({divId:1});

    let hdfcCredentials = await PaymentSetting.findOne({
        divId: booking.divId,
        platform: config.HDFC_SETTINGS,
        paymentProvider: "hdfc"
    });

    let decoded = await hdfcBl.decrypt(hash,hdfcCredentials.workingKey);
    let obj = await qs.parse(decoded);
    req.body.auth = obj.merchant_param3;
    req.body.data = obj;
    req.body.divId = booking.divId;
    req.body.bookingId = booking._id.toString();

    //Payment Auth
    await doPaymentAuth(req, res);
    //Payment Auth End

    let blResponse = await hdfcBl.endTransaction(req);
    res.redirect(blResponse)
}


//#endregion

//#region Private Functions
async function doPaymentAuth(req, response){
    let result = await Auth.authPayment(req);
    if(!result.success){
        console.log({errorMsg : result.errorMsg, error : true });
        response.status(200).send({errorMsg : result.errorMsg, error : true} );
        return;
    }
}

//#endregion

//#region Exports
module.exports.initiateTransaction = initiateTransaction;
module.exports.endTransaction = endTransaction;

//#endregion