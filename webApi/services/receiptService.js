/**
 * Class Name: receiptService
 * Author: Shreyash Wankhade
 * Purpose: Service class to handle HTTP requests related to receipts.
 */

//#region Imports
const receiptBl = require("../businessLogic/receiptBl");
//#endregion

//#region Public Functions
function getQuotation(req, res) {
    const callback = result => {
        res.type('pdf');
        result.pipe(res);
        return res.status(200);
    };
    receiptBl.getQuotation(req,callback);
}

function getBookingReceipt(req, res) {
    const callback = result => {
        res.type('pdf');
        result.pipe(res);
        return res.status(200);
    };
    receiptBl.getBookingReceipt(req,callback);
}

function getPaymentReceipt(req, res) {
    const callback = result => {
        res.type('pdf');
        result.pipe(res);
        return res.status(200);
    };
    receiptBl.getPaymentReceipt(req,callback);
}

async function getTokenById(req, res) {
    let blResponse = await receiptBl.getTokenById(req);
    return res.status(200).json(blResponse);
}
//#endregion

//#region Private Functions

//#endregion

//#region Exports
module.exports.getQuotation = getQuotation;
module.exports.getBookingReceipt = getBookingReceipt;
module.exports.getPaymentReceipt = getPaymentReceipt;
module.exports.getTokenById = getTokenById;
//#endregion