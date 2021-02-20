//#region Imports
const paymentService = require("../services/paymentService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/payments")
        .post(auth,paymentService.postPayment);

    app.route("/payment/hash")
        .post(auth,paymentService.createHashCode);

    app.route("/payment/response")
        .post(auth,paymentService.saveResponse);

    app.route("/payment/refresh")
        .post(auth,paymentService.refreshPayments);

    app.route("/cashPayments")
        .get(auth,paymentService.getCashPayments)
        .put(auth,paymentService.updateCashPaymentStatus);

    app.route("/rollbackPayment")
        .put(auth,paymentService.rollBackPayments);
};
//#endregion