/**
 * Class Name: paymentService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to paymentService.
 */

//#region Imports
const paymentBl = require("../businessLogic/paymentBl");
//#endregion

//#region Public Functions
async function postPayment(req, res)  {
    let blResponse = await paymentBl.addPayment(req);
    return res.status(200).json(blResponse);
}

async function createHashCode(req, res)  {
    let blResponse = await paymentBl.createHashCode(req);
    return res.status(200).json(blResponse);
}

async function saveResponse(req, res)  {
    let blResponse = await paymentBl.addPaymentResponse(req);
    return res.status(200).json(blResponse);
}

async function getCashPayments(req, res)  {
    let _id = req.query._id;
    let blResponse;

    if (_id) {
        blResponse = await paymentBl.getPaymentById(_id);
    }
    else{
        blResponse = await paymentBl.getCashPayments(req);
    }
    return res.status(200).json(blResponse);
}

async function updateCashPaymentStatus(req, res)  {
    let blResponse = await paymentBl.updateCashPaymentStatus(req);
    return res.status(200).json(blResponse);
}

async function refreshPayments(req, res)  {
    let blResponse = await paymentBl.refreshPayments(req);
    return res.status(200).json(blResponse);
}

async function rollBackPayments(req, res)  {
    let blResponse = await paymentBl.rollBackPayments(req);
    return res.status(200).json(blResponse);
}
//#endregion

//#region Private Functions
//#endregion

//#region Exports
module.exports.postPayment = postPayment;
module.exports.createHashCode = createHashCode;
module.exports.saveResponse = saveResponse;
module.exports.getCashPayments = getCashPayments;
module.exports.updateCashPaymentStatus = updateCashPaymentStatus;
module.exports.refreshPayments = refreshPayments;
module.exports.rollBackPayments = rollBackPayments;
//#endregion