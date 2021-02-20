//#region Imports
const receiptService = require("../services/receiptService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/quotationReceipt")
        .get(auth,receiptService.getQuotation);
    app.route("/bookingReceipt")
        .get(auth,receiptService.getBookingReceipt);
    app.route("/paymentReceipt")
        .get(auth,receiptService.getPaymentReceipt);
    app.route("/downloadCallback")
        .get( receiptService.getTokenById);
};
//#endregion